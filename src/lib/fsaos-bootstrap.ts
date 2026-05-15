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
    // Override here if you need non-default values, e.g.:
    // gatewayUrl: "https://fsaos-mcp-gw-rust.fly.dev",
    // hostname: "your-registered-vfs-domain.com",
    // scopePath: "/your/scope",
  };
}

export {};
