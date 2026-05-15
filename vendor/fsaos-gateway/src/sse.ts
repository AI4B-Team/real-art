/**
 * @fsaos/gateway — SSE Transport Layer
 *
 * Singleton EventSource connection to the gateway's /events endpoint.
 * Two dispatch mechanisms:
 *
 * 1. Path-based (original): subscribeToPath(path, callback)
 *    Dispatches on data.path match or '*' wildcard.
 *
 * 2. Type-based (new): subscribeToEvents(eventType, callback, filter?)
 *    Dispatches by SSE event type (token_stream, vfs_change, ccm_change)
 *    with an optional predicate filter on the parsed data.
 *
 * Both share the same singleton EventSource. The transport layer is an
 * implementation detail — when the backend moves to WebSocket, only this
 * file changes. All consumers (hooks, components) are unaffected.
 */

import { getAccessToken, registerCleanup } from './session';
import { GATEWAY_URL } from './config';

let eventSource: EventSource | null = null;
let connectionInFlight: Promise<void> | null = null;

// ── Path-based listeners (original) ────────────────────────────────────────

const pathListeners: Record<string, Array<(data: any) => void>> = {};

// ── Type-based listeners (new) ─────────────────────────────────────────────

interface TypedListener {
  eventType: string;
  callback: (data: any) => void;
  filter?: (data: any) => boolean;
}

const typedListeners: TypedListener[] = [];

// ── Connection management ──────────────────────────────────────────────────

function hasListeners(): boolean {
  const hasPath = Object.keys(pathListeners).some(
    (k) => pathListeners[k] && pathListeners[k].length > 0,
  );
  return hasPath || typedListeners.length > 0;
}

async function ensureConnection(): Promise<void> {
  if (eventSource) return;
  if (connectionInFlight) return connectionInFlight;

  connectionInFlight = (async () => {
    try {
      const config =
        (typeof window !== 'undefined' && (window as any).__FSAOS_CONFIG__) || {};
      const gatewayUrl = GATEWAY_URL;
      const scopePath = config.scopePath || '';
      const embedToken = config.embedToken || null;

      // Resolve the auth token: embed token takes priority, otherwise use
      // the Supabase session JWT. EventSource doesn't support custom headers,
      // so the token must be passed as a query parameter.
      let token = embedToken;
      if (!token) {
        token = await getAccessToken();
      }

      let sseUrl = gatewayUrl + '/events?scope=' + encodeURIComponent(scopePath);
      if (token) sseUrl += '&token=' + encodeURIComponent(token);

      eventSource = new EventSource(sseUrl);

      // Central dispatch for all SSE events
      const dispatch = (eventType: string, event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);

          // Path-based dispatch (original)
          if (data.path && pathListeners[data.path]) {
            pathListeners[data.path].forEach((cb) => cb(data));
          }
          if (pathListeners['*']) {
            pathListeners['*'].forEach((cb) => cb(data));
          }

          // Type-based dispatch (new)
          for (const entry of typedListeners) {
            if (entry.eventType !== '*' && entry.eventType !== eventType) continue;
            if (entry.filter && !entry.filter(data)) continue;
            entry.callback(data);
          }
        } catch (_e) {
          /* ignore parse errors */
        }
      };

      // Default message handler (unnamed events)
      eventSource.onmessage = (e) => dispatch('message', e);

      // Named event types from the gateway
      eventSource.addEventListener('token_stream', ((e: MessageEvent) =>
        dispatch('token_stream', e)) as EventListener);
      eventSource.addEventListener('vfs_change', ((e: MessageEvent) =>
        dispatch('vfs_change', e)) as EventListener);
      eventSource.addEventListener('ccm_change', ((e: MessageEvent) =>
        dispatch('ccm_change', e)) as EventListener);

      eventSource.onerror = () => {
        // EventSource spec auto-reconnects. If the connection is fully dead,
        // the browser will fire repeated errors — we rely on the spec behavior
        // rather than manual reconnect logic.
      };
    } catch (_e) {
      /* ignore connection errors */
    } finally {
      connectionInFlight = null;
    }
  })();

  return connectionInFlight;
}

function maybeDisconnect(): void {
  if (!hasListeners() && eventSource) {
    eventSource.close();
    eventSource = null;
  }
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Subscribe to SSE events for a specific VFS path.
 * Lazily connects to the gateway's /events endpoint on first subscription.
 * Returns an unsubscribe function.
 */
export function subscribeToPath(
  path: string,
  callback: (data: any) => void,
): () => void {
  if (!pathListeners[path]) {
    pathListeners[path] = [];
  }
  pathListeners[path].push(callback);

  ensureConnection();

  return () => {
    const listeners = pathListeners[path];
    if (listeners) {
      const idx = listeners.indexOf(callback);
      if (idx !== -1) listeners.splice(idx, 1);
      if (listeners.length === 0) delete pathListeners[path];
    }
    maybeDisconnect();
  };
}

/**
 * Subscribe to SSE events by type with optional filter predicate.
 * The EventSource singleton is shared — one connection, many consumers.
 *
 * @param eventType - "token_stream" | "vfs_change" | "ccm_change" | "*"
 * @param callback  - Called with parsed event data for each matching event
 * @param filter    - Optional predicate; only events passing the filter trigger the callback
 * @returns Unsubscribe function
 */
export function subscribeToEvents(
  eventType: string | string[],
  callback: (data: any) => void,
  filter?: (data: any) => boolean,
): () => void {
  const types = Array.isArray(eventType) ? eventType : [eventType];
  const entries: TypedListener[] = types.map(t => ({ eventType: t, callback, filter }));
  typedListeners.push(...entries);
  ensureConnection();
  return () => {
    for (const entry of entries) {
      const idx = typedListeners.indexOf(entry);
      if (idx !== -1) typedListeners.splice(idx, 1);
    }
    maybeDisconnect();
  };
}

/**
 * Disconnect the SSE event source and clear all listeners.
 */
export function disconnectSSE(): void {
  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }
  connectionInFlight = null;
  for (const key of Object.keys(pathListeners)) {
    delete pathListeners[key];
  }
  typedListeners.length = 0;
}

// Register with the SDK-wide cleanup registry so signOut() tears down SSE.
registerCleanup(disconnectSSE);
