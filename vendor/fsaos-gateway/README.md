# @fsaos/gateway

The FSAOS Gateway SDK — reverse-engineered from the deployed production bundle into clean, maintainable TypeScript source.

## What This Is

This is the **source code** for the 51 KB IIFE bundle that powers every FSAOS page today. Previously, only the minified bundle existed on R2 with no source repo. This package reconstructs the full TypeScript source with proper types, JSDoc comments, and a reproducible build pipeline.

## Architecture

The SDK is loaded as a `<script>` tag by the dispatch worker and exposes `window.__FSAOS_GATEWAY__` as a global. Components access it through the `require()` shim in `dom-mount.js`.

```
CDN Scripts (loaded before gateway.js):
  1. supabase-js@2        → window.supabase
  2. react@18 + react-dom → window.React / window.ReactDOM

Gateway SDK:
  3. gateway.js           → window.__FSAOS_GATEWAY__

Mount Runtime:
  4. dom-mount.js         → require() shim + mount()
  5. Component IIFE       → window.__FSAOS_COMPONENT__
  6. __FSAOS_MOUNT__()    → renders the component
```

## Exports (38 total)

### Error
- `EnforcementDeniedError` — Error class for enforcement denials (rules, access, entitlement)

### Session Management
- `initSession()` — Initialize domain-scoped session via `GET /d/{hostname}/init`
- `clearSession()` — Clear cached session
- `getSessionEntry()` — Get current session entry (or null)
- `getAccessToken()` — Get current auth token (waits for first auth event)
- `setCachedToken()` — Manually set auth token (for embed tokens)

### Gateway Call
- `gatewayCall(method, params)` — Core RPC dispatcher: `POST /d/{hostname}`

### Shared Instances
- `supabase` — Shared Supabase client instance
- `queryClient` — Shared TanStack QueryClient instance

### Query Key Factory
- `vfsKeys` — Deterministic query keys for all VFS data

### VFS Operations (pure async functions)
- `normalizeItem(raw)` — Normalize raw gateway response to `VFSItem`
- `fetchVfsItem(path)` — Fetch a single item
- `fetchVfsChildren(path)` — Fetch children (also warms item cache)
- `fetchTypeDefinitions(scopeId?)` — Fetch type definitions as `Map<string, TypeDefinition>`
- `fetchEdgesForItem(itemId)` — Fetch edges (incoming + outgoing)
- `fetchVfsTree(path, depth?, types?, limit?)` — Fetch recursive tree
- `fetchMemberFocus(scopeId, types?, limit?)` — Fetch member-focus items

### Cache Invalidation
- `invalidateChildren(path)` — Invalidate children query
- `invalidateItem(path)` — Invalidate item query
- `invalidatePathAndParent(path)` — Invalidate item + parent children
- `invalidateSubtree(path)` — Invalidate all queries containing path prefix
- `invalidateAllVfs()` — Nuclear: invalidate all VFS queries
- `invalidateTypes(scopeId?)` — Invalidate type definitions

### Realtime
- `initVfsRealtime(scopeId)` — Subscribe to Supabase Realtime for VFS changes
- `disposeVfsRealtime()` — Tear down realtime channel

### React Hooks (TanStack Query)

**Read hooks:**

| Hook | Description |
|------|-------------|
| `useItem(path)` | Single item by path |
| `useList(path)` | Children of a path |
| `useTree(path, depth?)` | Recursive tree |
| `useSearch(query, types?)` | Search items |
| `useEdges(itemId)` | Edges for an item |
| `useTypes(scopeId?)` | All type definitions |
| `useType(typeKey, scopeId?)` | Single type definition |

**Mutation hooks:**

| Hook | Description |
|------|-------------|
| `useCreate()` | Create item (invalidates parent children) |
| `useUpdate()` | Update item (invalidates item + parent) |
| `useDelete()` | Delete item (removes from cache + invalidates parent) |
| `useMove()` | Move item (invalidates old parent, new parent, item) |
| `useLink()` | Create edge (invalidates edges for both endpoints) |
| `useMutation(method, opts?)` | Generic mutation for any gateway method |

## Source Files

```
src/
  types.ts          — All type definitions (VFSItem, TypeDefinition, VFSEdge, etc.)
  config.ts         — Reads __FSAOS_CONFIG__, creates Supabase client
  enforcement.ts    — EnforcementDeniedError class
  session.ts        — Auth token lifecycle, domain session init
  client.ts         — gatewayCall() — the core RPC dispatcher
  query-client.ts   — TanStack QueryClient with VFS-tuned defaults
  vfs-keys.ts       — Query key factory
  vfs.ts            — VFS fetch functions + cache invalidation helpers
  hooks.ts          — All React hooks (useQuery/useMutation wrappers)
  realtime.ts       — Supabase Realtime subscriptions + debounced invalidation
  index.ts          — Barrel export (38 symbols)
```

## Build

```bash
npm install
node build.mjs          # dist/gateway.js (minified IIFE, ~51 KB)
node build.mjs --dev    # dist/gateway.dev.js (readable, ~128 KB)
```

The build produces:
- `dist/gateway.js` — Minified IIFE assigned to `window.__FSAOS_GATEWAY__`
- `dist/gateway.dev.js` — Unminified for debugging
- `dist/*.d.ts` — TypeScript declarations (11 files)
- `dist/*.js.map` — Source maps

## Dependencies

**Bundled inline** (part of the IIFE):
- `@tanstack/react-query` v5 — Query/mutation cache, deduplication, background refetch

**External globals** (loaded via CDN `<script>` before this bundle):
- `react` — via `window.React`
- `@supabase/supabase-js` — via `window.supabase.createClient`

## Zero Kernel

This SDK has **zero** references to "kernel" in source, bundle, or type declarations. All naming uses gateway terminology.
