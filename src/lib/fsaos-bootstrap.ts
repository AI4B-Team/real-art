/**
 * FSAOS Gateway bootstrap.
 *
 * The SDK reads `window.__FSAOS_CONFIG__` on import. Defaults baked into
 * the SDK point at the production gateway + Supabase project, so you only
 * need to override fields here for dev/staging or scope changes.
 *
 * This file MUST be imported before any `@fsaos/gateway` code runs.
 */

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
      hostname?: string;
    };
  }
}

if (typeof window !== "undefined" && !window.__FSAOS_CONFIG__) {
  window.__FSAOS_CONFIG__ = {
    // Override the hostname so the SDK doesn't try to resolve the Lovable
    // preview domain (which isn't registered as a VFS domain).
    // `fsaos.com` is the public root scope (/root) on the production gateway.
    hostname: "fsaos.com",
  };
}

export {};
