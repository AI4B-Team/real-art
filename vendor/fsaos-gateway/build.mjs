/**
 * @fsaos/gateway — Build Script
 *
 * Produces two IIFE bundles:
 *
 *   1. dist/gateway.js → window.__FSAOS_GATEWAY__
 *      The unified SDK: hooks, auth, session, TanStack Query, imperative VFS
 *      functions, SSE, mount logic, and require() shim setup.
 *
 *   2. dist/ui.js → window.__FSAOS_UI__
 *      UI primitives: Page, Stack, Grid, Card, Badge, Spinner, Button, etc.
 *
 * Both bundles map React to window.React (loaded via CDN <script> before
 * these bundles). TanStack Query is bundled inline in gateway.js.
 * Supabase is accessed via window.supabase.createClient (CDN).
 *
 * Usage:
 *   node build.mjs         → dist/gateway.js + dist/ui.js (minified)
 *   node build.mjs --dev   → dist/gateway.dev.js + dist/ui.dev.js (readable)
 */

import { build } from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = process.argv.includes('--dev');

// Generate .d.ts files via tsc (non-fatal)
try {
  const { execSync } = await import('child_process');
  execSync('npx tsc --emitDeclarationOnly --declaration --declarationDir dist', {
    cwd: __dirname,
    stdio: 'inherit',
  });
  console.log('Type declarations generated');
} catch {
  console.warn('Type declaration generation failed (non-fatal)');
}

/**
 * esbuild plugin: Map external packages to window globals.
 *
 * Intercepts imports of React/ReactDOM and replaces them with direct
 * references to window globals, avoiding require() entirely.
 */
const globalExternalsPlugin = {
  name: 'global-externals',
  setup(build) {
    const globals = {
      'react': 'React',
      'react-dom': 'ReactDOM',
      'react-dom/client': 'ReactDOM',
      'react/jsx-runtime': '{ jsx: React.createElement, jsxs: React.createElement, Fragment: React.Fragment }',
      '@supabase/supabase-js': '{ createClient: window.supabase.createClient }',
    };

    for (const [pkg, globalExpr] of Object.entries(globals)) {
      const filter = new RegExp(`^${pkg.replace('/', '\\/')}$`);
      build.onResolve({ filter }, (args) => ({
        path: args.path,
        namespace: 'global-external',
      }));
    }

    build.onLoad({ filter: /.*/, namespace: 'global-external' }, (args) => {
      const globalExpr = globals[args.path];
      return {
        contents: `module.exports = ${globalExpr};`,
        loader: 'js',
      };
    });
  },
};

// ── Build 1: gateway.js ────────────────────────────────────────────────────

const gatewayOutFile = isDev ? 'dist/gateway.dev.js' : 'dist/gateway.js';

const gatewayResult = await build({
  entryPoints: [path.join(__dirname, 'src/index.ts')],
  bundle: true,
  format: 'iife',
  globalName: '__FSAOS_GATEWAY__',
  outfile: path.join(__dirname, gatewayOutFile),
  platform: 'browser',
  target: ['es2020'],
  plugins: [globalExternalsPlugin],
  minify: !isDev,
  sourcemap: true,
  treeShaking: true,
  metafile: true,
  define: {
    'process.env.NODE_ENV': isDev ? '"development"' : '"production"',
  },
  jsx: 'automatic',
  jsxImportSource: 'react',
  banner: {
    js: `/* @fsaos/gateway v2.0.0 — Unified FSAOS Edge Runtime${isDev ? ' (development)' : ''} — ${new Date().toISOString()} */`,
  },
  footer: {
    js: `
/* ── Auto-setup: require shim + mount + backward compat globals ── */
(function() {
  if (typeof window !== 'undefined' && window.__FSAOS_GATEWAY__) {
    window.__FSAOS_GATEWAY__.setupRequireShim();
  }
})();
`,
  },
});

const gatewayStats = fs.statSync(path.join(__dirname, gatewayOutFile));
console.log(`${gatewayOutFile} — ${(gatewayStats.size / 1024).toFixed(1)} KB`);

if (gatewayResult.metafile) {
  for (const [file, meta] of Object.entries(gatewayResult.metafile.outputs)) {
    if (meta.exports) {
      console.log(`Exports in ${file}: ${meta.exports.length}`);
    }
  }
}

// ── Build 2: ui.js ─────────────────────────────────────────────────────────

const uiOutFile = isDev ? 'dist/ui.dev.js' : 'dist/ui.js';

await build({
  entryPoints: [path.join(__dirname, 'src/ui.ts')],
  bundle: true,
  format: 'iife',
  globalName: '__FSAOS_UI__',
  outfile: path.join(__dirname, uiOutFile),
  platform: 'browser',
  target: ['es2020'],
  plugins: [globalExternalsPlugin],
  minify: !isDev,
  sourcemap: true,
  treeShaking: true,
  define: {
    'process.env.NODE_ENV': isDev ? '"development"' : '"production"',
  },
  jsx: 'automatic',
  jsxImportSource: 'react',
  banner: {
    js: `/* @fsaos/ui v2.0.0 — FSAOS UI Primitives${isDev ? ' (development)' : ''} — ${new Date().toISOString()} */`,
  },
});

const uiStats = fs.statSync(path.join(__dirname, uiOutFile));
console.log(`${uiOutFile} — ${(uiStats.size / 1024).toFixed(1)} KB`);

console.log('Build complete — both bundles ready');
