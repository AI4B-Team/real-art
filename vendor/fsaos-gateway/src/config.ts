/**
 * @fsaos/gateway — Configuration & Supabase Client
 *
 * Reads the per-page config injected by the dispatch worker into
 * window.__FSAOS_CONFIG__ and creates the shared Supabase client instance.
 *
 * Supabase is imported via standard ESM import. In the IIFE build,
 * esbuild's globalExternalsPlugin maps this to window.supabase (CDN global).
 * In a Vite/bundler context, it resolves to the npm @supabase/supabase-js package.
 */
import { createClient } from '@supabase/supabase-js';

declare global {
  interface Window {
    __FSAOS_CONFIG__?: {
      supabaseUrl?: string;
      supabaseAnonKey?: string;
      gatewayUrl?: string;
      scopePath?: string;
      embedToken?: string | null;
      edgeBaseUrl?: string;
      componentPath?: string;
      /** Override the hostname used for domain-scoped gateway dispatch.
       *  Useful in dev environments where window.location.hostname
       *  doesn't match the registered VFS domain. */
      hostname?: string;
    };
  }
}

const CONFIG = (typeof window !== 'undefined' && window.__FSAOS_CONFIG__) || {};

export const SUPABASE_URL =
  CONFIG.supabaseUrl || 'https://vahbmsslxuustnlvsrkg.supabase.co';

export const SUPABASE_ANON_KEY =
  CONFIG.supabaseAnonKey || 'sb_publishable_ZjosozAjfpZ4InMNElTr6Q_hHB-f5nc';

export const GATEWAY_URL =
  CONFIG.gatewayUrl || 'https://fsaos-mcp-gw-rust.fly.dev';

/**
 * Shared Supabase client instance.
 * Internal to the SDK — not part of the public API.
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
