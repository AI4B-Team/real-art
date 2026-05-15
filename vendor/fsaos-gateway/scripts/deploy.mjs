#!/usr/bin/env node
/**
 * Deploy script — Upload built bundles to R2 and update the KV manifest.
 *
 * Prerequisites:
 *   - wrangler authenticated (`npx wrangler login`)
 *   - dist/gateway.js and dist/ui.js exist (run `node build.mjs` first)
 *
 * Usage:
 *   node scripts/deploy.mjs
 *   node scripts/deploy.mjs --bump   # Also bump the runtime version
 *
 * What it does:
 *   1. Uploads dist/gateway.js → R2 fsaos-assets/ui-boot/gateway.js
 *   2. Uploads dist/ui.js → R2 fsaos-assets/ui-boot/ui.js
 *   3. Writes the platform manifest to KV (ITEMS namespace, key: system:platform_manifest)
 *   4. Optionally bumps the runtime version in KV (key: system:runtime_version)
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const bump = process.argv.includes('--bump');

// ── Config ─────────────────────────────────────────────────────────────────

const R2_BUCKET = 'fsaos-assets';
const KV_NAMESPACE_ID = '99ff968b57194c789c5272ea0b345deb'; // ITEMS namespace

const ASSETS = [
  { localPath: 'dist/gateway.js', r2Key: 'ui-boot/gateway.js', contentType: 'application/javascript' },
  { localPath: 'dist/ui.js', r2Key: 'ui-boot/ui.js', contentType: 'application/javascript' },
];

const PLATFORM_MANIFEST = {
  assets: [
    { name: 'tailwind', r2_key: 'ui-boot/tailwind.css', version: 1, content_type: 'text/css', depth: 1 },
    { name: 'ui', r2_key: 'ui-boot/ui.js', version: 2, content_type: 'application/javascript', depth: 2 },
    { name: 'gateway', r2_key: 'ui-boot/gateway.js', version: 2, content_type: 'application/javascript', depth: 1 },
  ],
  updated_at: new Date().toISOString(),
};

// ── Upload to R2 ───────────────────────────────────────────────────────────

console.log('=== Uploading to R2 ===');
for (const asset of ASSETS) {
  const filePath = path.join(rootDir, asset.localPath);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }
  const size = (fs.statSync(filePath).size / 1024).toFixed(1);
  console.log(`Uploading ${asset.localPath} (${size} KB) → ${R2_BUCKET}/${asset.r2Key}`);
  execSync(
    `npx wrangler r2 object put ${R2_BUCKET}/${asset.r2Key} --file "${filePath}" --content-type "${asset.contentType}" --remote`,
    { cwd: rootDir, stdio: 'inherit' },
  );
}

// ── Update KV manifest ─────────────────────────────────────────────────────

console.log('\n=== Updating platform manifest in KV ===');
const manifestJson = JSON.stringify(PLATFORM_MANIFEST);
const tmpManifest = path.join(rootDir, '.tmp-manifest.json');
fs.writeFileSync(tmpManifest, manifestJson);
execSync(
  `npx wrangler kv key put "system:platform_manifest" --namespace-id="${KV_NAMESPACE_ID}" --path="${tmpManifest}" --remote`,
  { cwd: rootDir, stdio: 'inherit' },
);
fs.unlinkSync(tmpManifest);
console.log('Manifest written:', JSON.stringify(PLATFORM_MANIFEST.assets.map(a => a.name)));

// ── Bump runtime version ───────────────────────────────────────────────────

if (bump) {
  console.log('\n=== Bumping runtime version ===');
  // Read current version
  let currentVersion = '1';
  try {
    const result = execSync(
      `npx wrangler kv key get "system:runtime_version" --namespace-id="${KV_NAMESPACE_ID}" --remote`,
      { cwd: rootDir, encoding: 'utf8' },
    ).trim();
    currentVersion = result || '1';
  } catch {
    // Key doesn't exist yet
  }
  const newVersion = String(parseInt(currentVersion, 10) + 1);
  execSync(
    `npx wrangler kv key put "system:runtime_version" "${newVersion}" --namespace-id="${KV_NAMESPACE_ID}" --remote`,
    { cwd: rootDir, stdio: 'inherit' },
  );
  console.log(`Runtime version bumped: ${currentVersion} → ${newVersion}`);
}

console.log('\n✅ Deploy complete');
