/**
 * @fsaos/gateway — VFS Realtime
 *
 * Subscribes to Supabase Realtime broadcast events on a per-scope channel.
 * When VFS items are inserted, updated, or deleted, the corresponding
 * TanStack Query caches are invalidated with debouncing to avoid storms.
 *
 * Lifecycle:
 *   1. initVfsRealtime(scopeId) — subscribe to the scope's broadcast channel
 *   2. Auth state changes automatically re-auth or re-subscribe the channel
 *   3. disposeVfsRealtime() — tear down the channel and auth listener
 */

import { supabase } from './config';
import { registerCleanup } from './session';
import { queryClient } from './query-client';
import { vfsKeys } from './vfs-keys';
import { normalizeItem } from './vfs';

// ── State ───────────────────────────────────────────────────────────────────

let channel: any = null;
const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();
let authSubscription: any = null;
let activeScopeId: string | null = null;
const DEBOUNCE_MS = 250;

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Subscribe to VFS realtime events for a scope.
 * If the user is not yet authenticated, subscription is deferred until
 * the next SIGNED_IN or INITIAL_SESSION auth event.
 */
export async function initVfsRealtime(scopeId: string): Promise<void> {
  activeScopeId = scopeId;
  setupAuthListener();

  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    await subscribeToChannel(scopeId, session.access_token);
  } else {
    console.log('[VFS Realtime] Deferring subscription — waiting for auth session');
  }
}

/**
 * Tear down the realtime channel and auth listener.
 */
export function disposeVfsRealtime(): void {
  teardownChannel();
  if (authSubscription) {
    authSubscription.unsubscribe();
    authSubscription = null;
  }
  activeScopeId = null;
}

// Register with the SDK-wide cleanup registry so signOut() tears down realtime.
registerCleanup(disposeVfsRealtime);

// ── Auth Listener ───────────────────────────────────────────────────────────

function setupAuthListener(): void {
  if (authSubscription) {
    authSubscription.unsubscribe();
    authSubscription = null;
  }

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event: string, session: any) => {
      if (!activeScopeId) return;

      if (event === 'SIGNED_OUT') {
        console.log('[VFS Realtime] Auth signed out — tearing down channel');
        teardownChannel();
        return;
      }

      if (session?.access_token) {
        const token = session.access_token;
        const scopeId = activeScopeId;

        if (event === 'TOKEN_REFRESHED' && channel) {
          console.log('[VFS Realtime] Token refreshed — scheduling channel re-auth');
          setTimeout(() => {
            supabase.realtime.setAuth(token).catch((err: any) => {
              console.warn('[VFS Realtime] Failed to re-auth channel:', err);
            });
          }, 0);
        } else if (!channel && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
          console.log(`[VFS Realtime] Auth ready (${event}) — scheduling subscription`);
          setTimeout(() => {
            subscribeToChannel(scopeId, token).catch((err: any) => {
              console.warn('[VFS Realtime] Deferred subscription failed:', err);
            });
          }, 0);
        }
      }
    },
  );

  authSubscription = subscription;
}

// ── Channel Management ──────────────────────────────────────────────────────

async function subscribeToChannel(scopeId: string, token: string): Promise<void> {
  teardownChannel();

  const channelName = `vfs:${scopeId}`;
  await supabase.realtime.setAuth(token);

  channel = supabase
    .channel(channelName, { config: { private: true } })
    .on('broadcast', { event: 'INSERT' }, (payload: any) => handleEvent(payload, 'INSERT'))
    .on('broadcast', { event: 'UPDATE' }, (payload: any) => handleEvent(payload, 'UPDATE'))
    .on('broadcast', { event: 'DELETE' }, (payload: any) => handleEvent(payload, 'DELETE'))
    .subscribe((status: string, err?: any) => {
      if (status === 'SUBSCRIBED') {
        console.log(`[VFS Realtime] Subscribed to ${channelName}`);
      } else if (status === 'CHANNEL_ERROR') {
        const reason = err ? String(err) : '(auth/RLS — will resubscribe on next auth event)';
        console.warn(`[VFS Realtime] Channel error on ${channelName}: ${reason}`);
        teardownChannel();
      } else if (status === 'TIMED_OUT') {
        console.warn(`[VFS Realtime] Subscription timed out for ${channelName}`);
        teardownChannel();
      }
    });
}

function teardownChannel(): void {
  if (channel) {
    supabase.removeChannel(channel);
    channel = null;
  }
  debounceTimers.forEach((timer) => clearTimeout(timer));
  debounceTimers.clear();
}

// ── Event Handling ──────────────────────────────────────────────────────────

function handleEvent(raw: any, eventType: 'INSERT' | 'UPDATE' | 'DELETE'): void {
  const payload = raw?.payload || raw;
  const record = payload?.record || payload?.new || payload;
  const oldRecord = payload?.old_record || payload?.old;
  const path = record?.path || oldRecord?.path;

  if (!path) return;

  const segments = path.split('/');
  segments.pop();
  const parentPath = segments.join('/') || '/root';

  const existing = debounceTimers.get(parentPath);
  if (existing) clearTimeout(existing);

  const timer = setTimeout(() => {
    debounceTimers.delete(parentPath);
    applyInvalidation(eventType, path, record, parentPath);
  }, DEBOUNCE_MS);

  debounceTimers.set(parentPath, timer);
}

function applyInvalidation(
  eventType: 'INSERT' | 'UPDATE' | 'DELETE',
  path: string,
  record: any,
  parentPath: string,
): void {
  if (eventType === 'DELETE') {
    queryClient.removeQueries({ queryKey: vfsKeys.item(path) });
    queryClient.removeQueries({ queryKey: vfsKeys.children(path) });
    queryClient.removeQueries({ queryKey: vfsKeys.tree(path) });
  } else {
    const normalized = normalizeItem(record);
    queryClient.setQueryData(vfsKeys.item(path), normalized);
  }

  queryClient.invalidateQueries({ queryKey: vfsKeys.children(parentPath) });

  queryClient.invalidateQueries({
    predicate: (query) => {
      const key = query.queryKey;
      // Key structure: ['vfs', scopeKey, 'tree', path, depth]
      if (key[0] !== 'vfs' || key[2] !== 'tree') return false;
      const treePath = key[3] as string;
      return path.startsWith(treePath + '/') || path === treePath;
    },
  });
}
