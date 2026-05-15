/**
 * @fsaos/gateway — VFS Query Key Factory
 *
 * Deterministic query key factory used by TanStack Query for all VFS data.
 * Every hook and cache invalidation function references these keys to ensure
 * consistent cache identity.
 *
 * SCOPE-KEYED CACHING:
 * All scope-dependent queries include the current scope path in their key.
 * This means switching accounts creates a new cache namespace automatically —
 * the old account's data stays warm for instant switch-back, while the new
 * account's data is fetched fresh (or served from its own warm cache).
 *
 * Queries that are NOT scope-dependent (memberships, item-by-id) use keys
 * without the scope prefix.
 */

import { getScope } from './session';

/**
 * Returns the current scope key for query namespacing.
 * Returns '__unscoped__' before scope is set (queries gated by useScopeReady
 * won't fire in this state, but the key must still be valid for React Query).
 */
function sk(): string {
  return getScope() ?? '__unscoped__';
}

export const vfsKeys = {
  /** Root key for all VFS queries (scope-aware). */
  all: () => ['vfs', sk()] as const,

  /** Single item by path (scope-aware — relative paths resolve per-scope). */
  item: (path: string) => ['vfs', sk(), 'item', path] as const,

  /** Single item by UUID (scope-independent — UUIDs are globally unique). */
  itemById: (id: string) => ['vfs', 'item-by-id', id] as const,

  /** Children of a path (scope-aware). */
  children: (path: string) => ['vfs', sk(), 'children', path] as const,

  /** All children queries for current scope (for broad invalidation). */
  allChildren: () => ['vfs', sk(), 'children'] as const,

  /** Type definitions for a scope (or default). */
  types: (scopeId?: string) => ['vfs', 'types', scopeId ?? 'default'] as const,

  /** Edges for an item (scope-independent — edges are by item UUID). */
  edges: (itemId: string) => ['vfs', 'edges', itemId] as const,

  /** Search results (scope-aware — search is scoped). */
  search: (query: string, types?: string[]) =>
    ['vfs', sk(), 'search', query, ...(types ?? [])] as const,

  /** Items query (type-based listing with filters, scope-aware). */
  items: (type: string, filters?: Record<string, unknown>) =>
    ['vfs', sk(), 'items', type, JSON.stringify(filters ?? {})] as const,

  /** All items queries for current scope (for broad invalidation). */
  allItems: () => ['vfs', sk(), 'items'] as const,

  /** Recursive tree at a path + depth (scope-aware). */
  tree: (path: string, depth?: number) =>
    ['vfs', sk(), 'tree', path, depth ?? 1] as const,

  /** Open envelope for a path (scope-aware). */
  openEnvelope: (path: string, strategy?: string) =>
    ['vfs', sk(), 'open', path, strategy ?? '__default__'] as const,

  /** All open-envelope queries for current scope (for broad invalidation). */
  allOpenEnvelopes: () => ['vfs', sk(), 'open'] as const,

  /** Member focus for a scope. */
  memberFocus: (scopeId: string) => ['vfs', 'member-focus', scopeId] as const,

  /** Fractal instances (scope-independent). */
  fractalInstances: () => ['vfs', 'fractal-instances'] as const,

  /** Recent activity (scope-aware). */
  recentActivity: (a: string, b: string, c: string) =>
    ['vfs', sk(), 'recent-activity', a, b, c] as const,

  /** Item history (scope-independent — by item UUID). */
  itemHistory: (a: string, b: string, c: string) =>
    ['vfs', 'item-history', a, b, c] as const,

  /** Channel messages (scope-aware — channels are scoped). */
  channelMessages: (channelPath: string, parentMessageId?: string) =>
    ['vfs', sk(), 'channel-messages', channelPath, parentMessageId ?? '__top__'] as const,

  /** All channel-messages queries for current scope (for broad invalidation). */
  allChannelMessages: () => ['vfs', sk(), 'channel-messages'] as const,

  /** Channels listing (scope-aware). */
  channels: (filter?: string) => ['vfs', sk(), 'channels', filter ?? 'all'] as const,

  /** All channels queries for current scope (for broad invalidation). */
  allChannels: () => ['vfs', sk(), 'channels'] as const,

  /** Notifications listing (scope-aware). */
  notifications: (filter?: string, limit?: number) =>
    ['vfs', sk(), 'notifications', filter ?? 'all', limit ?? 200] as const,

  /** All notification queries for current scope (for broad invalidation). */
  allNotifications: () => ['vfs', sk(), 'notifications'] as const,

  /** Unread counts (scope-aware). */
  unreadCounts: () => ['vfs', sk(), 'unread-counts'] as const,

  /** Membership graph for a principal (scope-independent). */
  memberships: (principalId: string) => ['memberships', principalId] as const,
};
