/**
 * @fsaos/gateway — Edge Runtime
 *
 * This module provides the edge-specific runtime features:
 *   1. Imperative VFS functions (readItem, listChildren, createItem, etc.)
 *   2. callTool, pushChanges, getAssetUrl
 *   3. Auth facade (signIn, signOut, etc.)
 *   4. require() shim mapping bare specifiers to window globals
 *   5. __FSAOS_MOUNT__ mount logic (reads __FSAOS_COMPONENT__, wraps in
 *      QueryClientProvider, creates React root)
 *
 * This module is imported by the main index.ts and its exports become part
 * of window.__FSAOS_GATEWAY__. The build script's footer code then sets up
 * the require shim and mount logic using these exports.
 */

import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { gatewayCall } from './client';
import { queryClient } from './query-client';
import { normalizeItem } from './vfs';
import { supabase } from './config';
import { resetAllSdkState } from './session';
import { subscribeToPath, disconnectSSE } from './sse';

// ── Imperative VFS Functions ───────────────────────────────────────────────
// These mirror the old runtime's direct function calls.
// They use the SDK's gatewayCall under the hood.

export function readItem(path: string) {
  return gatewayCall('read', { path });
}

export function listChildren(path: string, options?: Record<string, unknown>) {
  return gatewayCall('list', { path, ...options });
}

export function createItem(params: Record<string, unknown>) {
  return gatewayCall('create', params);
}

export function updateItem(params: Record<string, unknown>) {
  return gatewayCall('update', params);
}

export function pushChanges(params: Record<string, unknown>) {
  return gatewayCall('create', params); // create is the generic push
}

export function callTool(toolName: string, params?: Record<string, unknown>) {
  const config = (typeof window !== 'undefined' && (window as any).__FSAOS_CONFIG__) || {};
  const scopePath = config.scopePath || '';
  return gatewayCall('tools/call', {
    name: toolName,
    instance_path: scopePath,
    ...(params || {}),
  });
}

export function signal(targetId: string, eventName: string, payload?: Record<string, unknown>) {
  return gatewayCall('signal', { target_id: targetId, event_name: eventName, payload: payload || {} });
}

export function getAssetUrl(path: string): string {
  const config = (typeof window !== 'undefined' && (window as any).__FSAOS_CONFIG__) || {};
  return (config.edgeBaseUrl || '') + path;
}

// ── Auth Facade ────────────────────────────────────────────────────────────
// Imperative auth functions for non-React code.

export const auth = {
  signIn: (opts: any) => {
    if (opts.provider) {
      return supabase.auth.signInWithOAuth({
        provider: opts.provider,
        options: { redirectTo: opts.redirectTo || window.location.href },
      });
    }
    return supabase.auth.signInWithPassword({
      email: opts.email,
      password: opts.password,
    });
  },
  signUp: (opts: any) => {
    return supabase.auth.signUp({
      email: opts.email,
      password: opts.password,
      options: { data: opts.metadata || {} },
    });
  },
  signOut: async () => {
    await supabase.auth.signOut();
    resetAllSdkState();
    queryClient.clear();
  },
  getSession: () => supabase.auth.getSession().then((r: any) => r.data.session),
  getUser: () => supabase.auth.getUser().then((r: any) => r.data.user),
  onAuthStateChange: (callback: (data: any) => void) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: string, session: any) => {
        callback({ event, session, user: session?.user ?? null });
      },
    );
    return () => subscription?.unsubscribe();
  },
  resetPassword: (email: string) => supabase.auth.resetPasswordForEmail(email),
  signInWithMagicLink: (email: string, redirectTo?: string) => {
    return supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo || window.location.href },
    });
  },
};

// Re-export SSE
export { subscribeToPath, disconnectSSE };

// ── Mount Logic ────────────────────────────────────────────────────────────

/**
 * Mount the root component into #root.
 * Reads window.__FSAOS_COMPONENT__, wraps in QueryClientProvider,
 * and renders via React 18+ createRoot.
 */
export function mount(): void {
  const rootEl = document.getElementById('root');
  if (!rootEl) return;

  try {
    const comp = (window as any).__FSAOS_COMPONENT__;
    if (!comp) {
      rootEl.innerHTML =
        '<div style="padding:2rem;color:#ef4444;font-family:system-ui">' +
        '<h2>Component Error</h2><pre>No component found. The bundle may have failed to load.</pre></div>';
      return;
    }

    const RootComponent = comp.default || comp;

    // For view mode, pass the item data as props
    const itemData = (window as any).__FSAOS_ITEM_DATA__ || null;
    const props = itemData ? { item: itemData, ...itemData } : {};

    const root = createRoot(rootEl);
    root.render(
      createElement(QueryClientProvider, { client: queryClient },
        createElement(RootComponent, props),
      ),
    );
  } catch (err: any) {
    console.error('[FSAOS] Failed to mount root component:', err);
    rootEl.innerHTML =
      '<div style="padding:2rem;color:#ef4444;font-family:system-ui">' +
      '<h2>Component Error</h2><pre>' + (err.message || err) + '</pre></div>';
  }
}

/**
 * Set up the require() shim and window globals.
 * Called by the build script's footer after the IIFE assigns window.__FSAOS_GATEWAY__.
 */
export function setupRequireShim(): void {
  const R = (window as any).React;
  const RD = (window as any).ReactDOM;
  const gateway = (window as any).__FSAOS_GATEWAY__;
  const ui = (window as any).__FSAOS_UI__;

  if (!gateway) {
    console.error('[FSAOS] Cannot set up require shim: __FSAOS_GATEWAY__ not found');
    return;
  }

  const modules: Record<string, any> = {
    'react': R,
    'react-dom': RD,
    'react-dom/client': RD,
    'react/jsx-runtime': {
      jsx: R?.createElement,
      jsxs: R?.createElement,
      Fragment: R?.Fragment,
    },
    '@fsaos/react': gateway,
    '@fsaos/gateway': gateway,
    '@fsaos/ui': ui || {},
  };

  (window as any).require = function fsaosRequire(name: string) {
    if (modules[name]) return modules[name];
    throw new Error('[FSAOS] Module not found: ' + name);
  };

  // Set __FSAOS_MOUNT__
  (window as any).__FSAOS_MOUNT__ = gateway.mount;
}
