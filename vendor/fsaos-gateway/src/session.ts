/**
 * @fsaos/gateway — Session Management
 *
 * Manages the auth token lifecycle, reactive scope state, and domain-scoped
 * session initialization.
 *
 * Token flow:
 *   1. Supabase auth fires onAuthStateChange → we cache the access_token
 *   2. A one-shot Promise (`tokenReady`) gates all gateway calls until the
 *      first auth event fires (or a 5 s timeout elapses)
 *   3. initSession() calls GET /d/{hostname}/init to resolve the domain's
 *      scope, fractal, and instance metadata
 *
 * Scope flow:
 *   1. useAccounts() fetches memberships → auto-selects or user picks an account
 *   2. setScope(accountPath) is called → sets the active scope path
 *   3. `scopeReady` promise resolves → all gated queries begin executing
 *   4. Scope subscribers are notified → React hooks re-render with new scope key
 *   5. On account switch, setScope(newPath) fires subscribers again →
 *      query keys change → React Query renders from new namespace (old cache stays warm)
 */

import { supabase, GATEWAY_URL } from './config';
import type { SessionEntry } from './types';

// ── Token cache ─────────────────────────────────────────────────────────────

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

/** One-shot gate: resolved after the first auth event (or 5 s timeout). */
let tokenReady: Promise<void>;
let resolveTokenReady: () => void;
let tokenResolved = false;

tokenReady = new Promise<void>((resolve) => {
  resolveTokenReady = resolve;
});

// Listen for Supabase auth state changes to keep the token fresh.
supabase.auth.onAuthStateChange((_event: string, session: any) => {
  if (session?.access_token) {
    cachedToken = session.access_token;
    tokenExpiresAt = session.expires_at ?? Math.floor(Date.now() / 1000) + 3600;
  } else {
    cachedToken = null;
    tokenExpiresAt = 0;
  }
  if (!tokenResolved) {
    tokenResolved = true;
    resolveTokenReady();
  }
});

// Safety timeout: if no auth event fires within 5 s, unblock callers anyway.
setTimeout(() => {
  if (!tokenResolved) {
    tokenResolved = true;
    resolveTokenReady();
  }
}, 5000);

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Manually set the cached access token.
 * Useful when the token is obtained out-of-band (e.g. embed token injection).
 */
export function setCachedToken(token: string, expiresAt?: number): void {
  cachedToken = token;
  tokenExpiresAt = expiresAt ?? Math.floor(Date.now() / 1000) + 3600;
}

/**
 * Clear the cached access token.
 * Called during sign-out to prevent stale tokens from leaking to the next session.
 */
export function clearCachedToken(): void {
  cachedToken = null;
  tokenExpiresAt = 0;
}

/**
 * Returns the current access token, waiting for the first auth event if needed.
 */
export async function getAccessToken(): Promise<string | null> {
  await tokenReady;
  return cachedToken;
}

// ── Scope (account-level) — Reactive ───────────────────────────────────────

let currentScopePath: string | null = null;

/**
 * Monotonically increasing version counter for scope changes.
 * Used by React hooks (via useSyncExternalStore) to detect scope transitions.
 */
let scopeVersion = 0;

/** Subscriber set for reactive scope updates. */
type ScopeListener = () => void;
const scopeListeners = new Set<ScopeListener>();

/**
 * One-shot gate: resolved when setScope() is first called.
 * All scope-dependent queries await this before executing.
 * Mirrors the tokenReady pattern.
 */
let scopeReady: Promise<void>;
let resolveScopeReady: () => void;
let scopeResolved = false;

scopeReady = new Promise<void>((resolve) => {
  resolveScopeReady = resolve;
});

/**
 * Set the active scope path (e.g. after account selection or account switch).
 *
 * Once set, every gatewayCall() automatically injects `_scope_path` into
 * the request params so kernel_auth can validate membership at the correct
 * account scope instead of falling back to the domain root.
 *
 * Setting scope also:
 * - Resolves the `scopeReady` gate (unblocking all scope-dependent queries)
 * - Increments the scope version counter
 * - Notifies all scope subscribers (triggering React hook re-renders)
 *
 * @param scopePath  The VFS path of the selected account/scope
 *                   (e.g. "/root/accounts/joel-rowland")
 */
export function setScope(scopePath: string): void {
  const changed = currentScopePath !== scopePath;
  currentScopePath = scopePath;

  // Resolve the one-shot gate on first scope set
  if (!scopeResolved) {
    scopeResolved = true;
    resolveScopeReady();
  }

  // Notify subscribers on any change (including first set)
  if (changed) {
    scopeVersion++;
    scopeListeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.warn('[SDK] Scope listener error:', e);
      }
    });
  }
}

/**
 * Returns the currently active scope path, or null if not yet set.
 */
export function getScope(): string | null {
  return currentScopePath;
}

/**
 * Returns the current scope version (monotonically increasing on each scope change).
 * Used by useSyncExternalStore in React hooks.
 */
export function getScopeVersion(): number {
  return scopeVersion;
}

/**
 * Subscribe to scope changes. Returns an unsubscribe function.
 * Compatible with React's useSyncExternalStore pattern.
 */
export function subscribeScope(listener: ScopeListener): () => void {
  scopeListeners.add(listener);
  return () => { scopeListeners.delete(listener); };
}

/**
 * Returns a promise that resolves when scope is first set.
 * Used by gatewayCall to gate scope-dependent requests.
 */
export function awaitScopeReady(): Promise<void> {
  return scopeReady;
}

/**
 * Returns whether scope has been set at least once.
 */
export function isScopeReady(): boolean {
  return scopeResolved;
}

// ── Session (domain-scoped) ─────────────────────────────────────────────────

let sessionEntry: SessionEntry | null = null;
let sessionPromise: Promise<SessionEntry> | null = null;

/**
 * Initialize the domain-scoped session by calling the gateway's /init endpoint.
 * Returns the cached session if already initialized.
 *
 * The gateway resolves the hostname → scope mapping and returns metadata about
 * the fractal instance, scope path, and display name.
 */
export async function initSession(): Promise<SessionEntry> {
  // Return cached session immediately
  if (sessionEntry) return sessionEntry;
  // Return in-flight promise to deduplicate concurrent calls
  if (sessionPromise) return sessionPromise;

  sessionPromise = (async () => {
    const hostname = getHostname();
    const token = await getAccessToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${GATEWAY_URL}/d/${hostname}/init`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Session init failed: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    const entry = json.entry || json;

    sessionEntry = {
      scope_id: entry.scope_id,
      scope_path: entry.scope_path,
      instance_path: entry.instance_path || '/root',
      fractal_id: entry.fractal_id || null,
      instance_name: entry.instance_name || null,
      display_name: entry.scope_display_name || entry.display_name || null,
    };

    return sessionEntry;
  })();

  return sessionPromise;
}

/**
 * Returns the current session entry, or null if not yet initialized.
 */
export function getSessionEntry(): SessionEntry | null {
  return sessionEntry;
}

/**
 * Clears the cached session, forcing a fresh /init call on next access.
 */
export function clearSession(): void {
  sessionEntry = null;
  sessionPromise = null;
  currentScopePath = null;
}

// ── Full SDK Reset ─────────────────────────────────────────────────────────
// Imported lazily to avoid circular dependencies. Each module provides its
// own cleanup function; resetAllSdkState orchestrates them all.

type CleanupFn = () => void;
const cleanupRegistry: CleanupFn[] = [];

/**
 * Register a cleanup function to be called during resetAllSdkState().
 * Modules call this at import time to register their own cache-clearing logic.
 */
export function registerCleanup(fn: CleanupFn): void {
  cleanupRegistry.push(fn);
}

/**
 * Reset ALL SDK module-level state.
 *
 * Called by signOut() to ensure no cached identity, session, scope, principal,
 * query data, SSE connections, or realtime channels leak between user sessions.
 *
 * This is the single source of truth for auth cleanup. After this call,
 * the SDK is in the same state as a fresh page load (minus the Supabase
 * onAuthStateChange listener, which will re-populate the token on next sign-in).
 */
export function resetAllSdkState(): void {
  // 1. Clear session + scope
  clearSession();

  // 2. Clear token cache
  clearCachedToken();

  // 3. Reset scope gate so next login must re-establish scope
  scopeResolved = false;
  scopeReady = new Promise<void>((resolve) => {
    resolveScopeReady = resolve;
  });
  scopeVersion++;
  // Notify subscribers that scope has been cleared
  scopeListeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.warn('[SDK] Scope listener error:', e);
    }
  });

  // 4. Run all registered module cleanups (SSE, realtime, principal, query, etc.)
  for (const fn of cleanupRegistry) {
    try {
      fn();
    } catch (e) {
      console.warn('[SDK] Cleanup function failed:', e);
    }
  }
}

/**
 * Returns the current hostname (used for domain-scoped dispatch).
 * Supports an explicit override via `window.__FSAOS_CONFIG__.hostname`
 * so dev environments (proxied URLs, tunnels) can specify the registered domain.
 */
export function getHostname(): string {
  if (typeof window !== 'undefined') {
    const cfg = (window as any).__FSAOS_CONFIG__;
    if (cfg?.hostname) return cfg.hostname;
    return window.location.hostname;
  }
  return 'localhost';
}
