/**
 * @fsaos/gateway — React Hooks
 *
 * All hooks are thin wrappers around TanStack Query's useQuery/useMutation,
 * using the VFS fetch functions and the shared queryClient.
 *
 * Read hooks: useItem, useItemById, useList, useTree, useSearch, useEdges, useTypes, useType, useOpen
 * Convenience hooks: useChildren (alias for useList), useScope, useAuth, useTypeHelpers
 * Data hooks: useMemberFocus, useItemHistory, useRecentActivity, useChannelMessages
 * Component hooks: useAsset, useComponent, useTheme, usePermission, usePrincipal
 * Mutation hooks: useCreate, useUpdate, useDelete, useMove, useLink, useMutation
 * Realtime hooks: useEventStream, useRealtimeQuery
 */

import React, { useState, useEffect, useRef, useCallback, useMemo, createElement, useSyncExternalStore } from 'react';
import * as ReactDOM from 'react-dom';
import * as JsxRuntime from 'react/jsx-runtime';
import { useQuery, useInfiniteQuery, useMutation as useTanstackMutation, useQueryClient } from '@tanstack/react-query';
import { subscribeToEvents } from './sse';
import { gatewayCall } from './client';
import { vfsKeys } from './vfs-keys';
import { normalizeItem } from './vfs';
import {
  fetchVfsItem,
  fetchVfsItemById,
  fetchVfsChildren,
  fetchVfsChildrenPage,
  fetchVfsTree,
  fetchEdgesForItem,
  fetchTypeDefinitions,
  fetchItems,
  fetchMemberFocus,
  fetchRecentActivity,
  fetchItemHistory,
  fetchChannelMessages,
  fetchOpenEnvelope,
  fetchChannelMessagesPage,
} from './vfs';
import type { ItemsFilter, ChannelMessage, ChannelMessagesPage } from './vfs';
import { supabase } from './config';
import { initSession, setScope, getScope, getScopeVersion, subscribeScope, isScopeReady, resetAllSdkState, registerCleanup } from './session';
import { queryClient } from './query-client';
import type {
  VFSItem,
  VFSEdge,
  TypeDefinition,
  CreateParams,
  UpdateParams,
  DeleteParams,
  MoveParams,
  LinkParams,
  OpenEnvelope,
  OpenOptions,
} from './types';

// ── Scope Reactivity ──────────────────────────────────────────────────────────

/**
 * Internal hook that subscribes to scope changes via useSyncExternalStore.
 * Forces a re-render whenever setScope() is called, which causes all
 * vfsKeys.*() calls in the render tree to produce updated query keys
 * (because they internally call getScope()). This is the bridge between
 * the imperative scope module and React's render cycle.
 *
 * Returns the current scope version number (useful for debugging, but the
 * primary purpose is the subscription side-effect).
 */
function useScopeKey(): number {
  return useSyncExternalStore(subscribeScope, getScopeVersion, getScopeVersion);
}

/**
 * Returns whether scope has been established. Useful for gating UI that
 * depends on scope-aware data.
 */
export function useScopeReady(): boolean {
  // Subscribe to scope changes so we re-render when scope transitions null → set
  useScopeKey();
  return isScopeReady();
}

// ── Read Hooks ──────────────────────────────────────────────────────────────

/** Fetch a single VFS item by path. Disabled when path is falsy. */
export function useItem(path: string | undefined | null) {
  useScopeKey(); // re-render on scope change → query key updates
  return useQuery({
    queryKey: vfsKeys.item(path!),
    queryFn: () => fetchVfsItem(path!),
    enabled: !!path,
  });
}

/** Fetch a single VFS item by its UUID. Disabled when id is falsy. */
export function useItemById(id: string | undefined | null) {
  useScopeKey();
  return useQuery({
    queryKey: vfsKeys.itemById(id!),
    queryFn: () => fetchVfsItemById(id!),
    enabled: !!id,
  });
}

/** Fetch children of a VFS path. Disabled when path is falsy. */
export function useList(path: string | undefined | null) {
  useScopeKey();
  return useQuery({
    queryKey: vfsKeys.children(path!),
    queryFn: () => fetchVfsChildren(path!),
    enabled: !!path,
  });
}

/**
 * Fetch children of a VFS path. Returns { children, ...queryResult }.
 * Convenience wrapper around useList that renames `data` to `children`.
 */
export function useChildren(path: string | undefined | null) {
  const query = useList(path);
  return {
    ...query,
    children: query.data ?? [],
  };
}

/** Fetch a recursive tree starting at a path. */
export function useTree(path: string | undefined | null, depth: number = 1) {
  useScopeKey();
  return useQuery({
    queryKey: vfsKeys.tree(path!, depth),
    queryFn: () => fetchVfsTree(path!, depth),
    enabled: !!path,
  });
}

/** Search VFS items by query string, optionally filtered by item types. */
export function useSearch(query: string | undefined | null, itemTypes?: string[]) {
  useScopeKey();
  return useQuery({
    queryKey: vfsKeys.search(query!, itemTypes),
    queryFn: async () => {
      const params: Record<string, unknown> = { query: query! };
      if (itemTypes?.length) params.item_types = itemTypes;
      const response = await gatewayCall('search', params);
      return (response.content?.items || response.items || []).map(normalizeItem);
    },
    enabled: !!query && query.length > 0,
  });
}

/** Fetch items by type with structured filters. */
export function useItems(filter: ItemsFilter | null | undefined) {
  useScopeKey();
  const stableFilter = useMemo(() => filter, [JSON.stringify(filter)]);
  return useQuery({
    queryKey: vfsKeys.items(
      stableFilter?.type ?? '',
      stableFilter as unknown as Record<string, unknown> | undefined,
    ),
    queryFn: () => fetchItems(stableFilter!),
    enabled: !!stableFilter?.type,
    select: (result) => result.items,
  });
}

/** Infinite-scroll item fetching by type. */
export function useInfiniteItems(filter: ItemsFilter | null | undefined) {
  useScopeKey();
  const PAGE_SIZE = filter?.limit ?? 20;
  const stableFilter = useMemo(() => filter, [JSON.stringify(filter)]);

  const query = useInfiniteQuery({
    queryKey: ['vfs', getScope() ?? '__unscoped__', 'infinite-items', stableFilter?.type ?? '', JSON.stringify(stableFilter ?? {})],
    queryFn: async ({ pageParam = 0 }) => {
      return fetchItems({
        ...stableFilter!,
        limit: PAGE_SIZE,
        offset: pageParam as number,
      });
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (lastPage.items.length < PAGE_SIZE) return undefined;
      return (lastPageParam as number) + lastPage.items.length;
    },
    enabled: !!stableFilter?.type,
  });

  const allItems = useMemo(() => {
    if (!query.data?.pages) return [];
    const seen = new Set<string>();
    const flat: VFSItem[] = [];
    for (const page of query.data.pages) {
      for (const item of page.items) {
        if (item.id && !seen.has(item.id)) {
          seen.add(item.id);
          flat.push(item);
        }
      }
    }
    return flat;
  }, [query.data?.pages]);

  return {
    allItems,
    fetchNextPage: query.fetchNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isExhausted: !query.hasNextPage,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    totalHint: query.data?.pages?.[0]?.total_hint,
  };
}

/** Infinite-scroll directory listing (children of a path). */
export function useInfiniteChildren(path: string | undefined | null) {
  useScopeKey();
  const PAGE_SIZE = 20;

  const query = useInfiniteQuery({
    queryKey: ['vfs', getScope() ?? '__unscoped__', 'infinite-children', path ?? ''],
    queryFn: async ({ pageParam = 0 }) => {
      return fetchVfsChildrenPage(path!, PAGE_SIZE, pageParam as number);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (lastPage.items.length < PAGE_SIZE) return undefined;
      return (lastPageParam as number) + lastPage.items.length;
    },
    enabled: !!path,
  });

  const allItems = useMemo(() => {
    if (!query.data?.pages) return [];
    const seen = new Set<string>();
    const flat: VFSItem[] = [];
    for (const page of query.data.pages) {
      for (const item of page.items) {
        if (item.id && !seen.has(item.id)) {
          seen.add(item.id);
          flat.push(item);
        }
      }
    }
    return flat;
  }, [query.data?.pages]);

  return {
    allItems,
    fetchNextPage: query.fetchNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isExhausted: !query.hasNextPage,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    totalHint: query.data?.pages?.[0]?.total_hint,
  };
}

/** Fetch edges for an item by its ID. */
export function useEdges(itemId: string | undefined | null) {
  useScopeKey();
  return useQuery({
    queryKey: vfsKeys.edges(itemId!),
    queryFn: () => fetchEdgesForItem(itemId!),
    enabled: !!itemId,
  });
}

/** Fetch all type definitions for a scope. */
export function useTypes(scopeId?: string) {
  useScopeKey();
  return useQuery({
    queryKey: vfsKeys.types(scopeId),
    queryFn: () => fetchTypeDefinitions(scopeId),
  });
}

/** Fetch a single type definition by type_key. */
export function useType(typeKey: string, scopeId?: string) {
  const typesQuery = useTypes(scopeId);
  return {
    ...typesQuery,
    data: typesQuery.data?.get(typeKey) ?? undefined,
  };
}

// ── Open Hook ──────────────────────────────────────────────────────────────
/**
 * Open a VFS item — the primary hook for rendering any item.
 *
 * Calls the kernel's `open` syscall which runs the CCM resolution pipeline
 * and returns the full OpenEnvelope:
 * - Item identity (id, path, name, type)
 * - Render directives (view_component_id, props, url)
 * - Compatible components (for "Open With" menus)
 * - Content extraction (for AI/programmatic consumers)
 *
 * The gateway mints signed URLs for storage-backed items before returning,
 * so `render.props.url` is ready to use immediately.
 *
 * When `render.view_component_id` is null, no CCM opener is registered —
 * the client should fall back to a system action (item-detail/inspector).
 *
 * @example
 * // Default open — render mode, kernel resolves the component.
 * const { data: envelope, isLoading } = useOpen(path);
 * if (!envelope?.render?.view_component_id) {
 *   return <ItemDetailView />; // system action fallback
 * }
 * // Mount the resolved component...
 *
 * @example
 * // Open with content extraction for AI
 * const { data } = useOpen(path, { mode: 'extract' });
 * // data.content contains extracted text/structured data
 *
 * @example
 * // "Open With" menu — read compatible_components
 * const { data } = useOpen(path);
 * data?.compatible_components.map(c => c.display_name);
 */
export function useOpen(
  path: string | undefined | null,
  options?: OpenOptions,
) {
  useScopeKey();
  const stableArgs = useMemo(
    () => options?.arguments,
    [JSON.stringify(options?.arguments)],
  );
  const stableMode = options?.mode;
  const stableStrategy = options?.strategy;
  return useQuery({
    queryKey: vfsKeys.openEnvelope(path!, stableStrategy),
    queryFn: () => fetchOpenEnvelope(path!, {
      mode: stableMode,
      strategy: stableStrategy,
      arguments: stableArgs,
    }),
    enabled: !!path,
  });
}
// ── Type Helpers Hook ──────────────────────────────────────────────────────

const EDGE_TYPE_LABELS: Record<string, string> = {
  related_to: 'Related To',
  depends_on: 'Depends On',
  blocks: 'Blocks',
  parent_of: 'Parent Of',
  child_of: 'Child Of',
  references: 'References',
  implements: 'Implements',
  extends: 'Extends',
  contains: 'Contains',
  belongs_to: 'Belongs To',
  created_by: 'Created By',
  assigned_to: 'Assigned To',
  tagged_with: 'Tagged With',
  linked_to: 'Linked To',
};

export interface TypeHelpers {
  canHaveChildren: (item: VFSItem) => boolean;
  isScope: (item: VFSItem) => boolean;
  isScopeType: (typeKey: string) => boolean;
  isContainerType: (typeKey: string) => boolean;
  getTypeDefinition: (typeKey: string) => TypeDefinition | undefined;
  getTypeColor: (typeKey: string) => string;
  getTypeIcon: (typeKey: string) => string;
  getTypeDisplayName: (typeKey: string) => string;
  getKnownEdgeTypes: () => { key: string; label: string }[];
  getEdgeTypeLabel: (edgeType: string) => string;
  allTypes: Map<string, TypeDefinition>;
  loading: boolean;
}

/**
 * Convenience hook that derives type-system helper functions from useTypes().
 */
export function useTypeHelpers(scopeId?: string): TypeHelpers {
  const typesQuery = useTypes(scopeId);
  const types = typesQuery.data ?? new Map<string, TypeDefinition>();

  return useMemo(() => {
    const getTypeDefinition = (typeKey: string): TypeDefinition | undefined =>
      types.get(typeKey);

    const canHaveChildren = (item: VFSItem): boolean => {
      const td = types.get(item.item_type);
      return td?.is_container ?? false;
    };

    const isScope = (item: VFSItem): boolean => {
      const td = types.get(item.item_type);
      return td?.is_scope ?? false;
    };

    const isScopeType = (typeKey: string): boolean => {
      const td = types.get(typeKey);
      return td?.is_scope ?? false;
    };

    const isContainerType = (typeKey: string): boolean => {
      const td = types.get(typeKey);
      return td?.is_container ?? false;
    };

    const getTypeColor = (typeKey: string): string => {
      const td = types.get(typeKey);
      return td?.color ?? 'gray';
    };

    const getTypeIcon = (typeKey: string): string => {
      const td = types.get(typeKey);
      return td?.icon ?? 'File';
    };

    const getTypeDisplayName = (typeKey: string): string => {
      const td = types.get(typeKey);
      return td?.display_name ?? typeKey;
    };

    const getKnownEdgeTypes = () =>
      Object.entries(EDGE_TYPE_LABELS).map(([key, label]) => ({ key, label }));

    const getEdgeTypeLabel = (edgeType: string): string =>
      EDGE_TYPE_LABELS[edgeType] ?? edgeType.replace(/_/g, ' ');

    return {
      canHaveChildren,
      isScope,
      isScopeType,
      isContainerType,
      getTypeDefinition,
      getTypeColor,
      getTypeIcon,
      getTypeDisplayName,
      getKnownEdgeTypes,
      getEdgeTypeLabel,
      allTypes: types,
      loading: typesQuery.isLoading,
    };
  }, [types, typesQuery.isLoading]);
}

// ── Member Focus Hook ──────────────────────────────────────────────────────

/** Fetch items assigned/relevant to the current user within a scope. */
export function useMemberFocus(
  scopeId: string | undefined | null,
  itemTypes?: string[],
  limit?: number,
) {
  useScopeKey();
  return useQuery({
    queryKey: vfsKeys.memberFocus(scopeId!),
    queryFn: () => fetchMemberFocus(scopeId!, itemTypes, limit),
    enabled: !!scopeId,
  });
}

// ── Item History Hook ──────────────────────────────────────────────────────

/** Fetch the version history of a VFS item. */
export function useItemHistory(
  itemId: string | undefined | null,
  limit: number = 50,
  offset: number = 0,
) {
  return useQuery({
    queryKey: vfsKeys.itemHistory(itemId!, String(limit), String(offset)),
    queryFn: () => fetchItemHistory(itemId!, limit, offset),
    enabled: !!itemId,
  });
}

// ── Recent Activity Hook ──────────────────────────────────────────────────

/** Fetch recent activity (audit log) for a scope. */
export function useRecentActivity(
  scopePath: string | undefined | null,
  limit: number = 50,
  offset: number = 0,
) {
  useScopeKey();
  return useQuery({
    queryKey: vfsKeys.recentActivity(scopePath!, String(limit), String(offset)),
    queryFn: () => fetchRecentActivity(scopePath!, limit, offset),
    enabled: !!scopePath,
  });
}

// ── Scope Hook ──────────────────────────────────────────────────────────────

interface ScopeData {
  path: string;
  scope_id: string;
  fractal_id: string | null;
  instance_name: string | null;
  display_name: string | null;
  componentPath?: string;
  isEmbed?: boolean;
}

interface ScopeResult {
  data: ScopeData | null;
  loading: boolean;
  error: Error | null;
}

/** Returns the current scope session via initSession(). */
export function useScope(): ScopeResult {
  const [data, setData] = useState<ScopeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    initSession().then((entry) => {
      if (!cancelled) {
        const config = (typeof window !== 'undefined' && (window as any).__FSAOS_CONFIG__) || {};
        setData({
          path: entry.scope_path,
          scope_id: entry.scope_id,
          fractal_id: entry.fractal_id,
          instance_name: entry.instance_name,
          display_name: entry.display_name,
          componentPath: config.componentPath || '',
          isEmbed: !!config.embedToken,
        });
        setLoading(false);
      }
    }).catch((err) => {
      if (!cancelled) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  return { data, loading, error };
}

// ── Accounts Hook ──────────────────────────────────────────────────────────

export interface AccountInfo {
  accountId: string;
  path: string;
  name: string;
  role: string;
  typeData: Record<string, unknown>;
  joinedAt: string;
  // Stage 4.2 additions — all optional / nullable for backward compat
  via?: 'direct' | 'cascade';
  placement?: 'switcher_entry' | 'mount_only';
  subordinateTo?: string | null;
  cascadeAnchorId?: string | null;
  isAccount?: boolean;
  isSpace?: boolean;
  isOwner?: boolean;
  billingResponsible?: boolean;
  grantedVia?: 'self_provisioned' | 'invitation' | 'purchase' | 'seat_assignment' | null;
  grantedUnderAccountId?: string | null;
  personalSpaceId?: string | null;
  personalSpacePath?: string | null;
}

interface AccountsState {
  /** Switcher-eligible accounts — billing-responsible accounts the user can operate AS. */
  accounts: AccountInfo[];
  /** Full membership list including mounts, spaces, cascade entries. Used for sidebar mount tree. */
  allMemberships: AccountInfo[];
  /** Currently active billing-responsible account (auto-selected if single, or after switchAccount). */
  currentAccount: AccountInfo | null;
  /** The currently mounted scope path (may differ from currentAccount.path when navigating subaccounts). */
  mountedScope: string | null;
  /** Switch the billing-responsible account context. Only for switcher entries. */
  switchAccount: (accountPath: string) => void;
  /** Mount a scope within the current billing context (e.g., navigate into a subaccount). Does NOT change currentAccount. */
  mountScope: (scopePath: string) => void;
  loading: boolean;
  error: Error | null;
}

/** Returns the user's account memberships and provides account switching. */
export function useAccounts(): AccountsState {
  const { user } = useAuth();
  const [currentAccount, setCurrentAccount] = useState<AccountInfo | null>(null);
  const [mountedPath, setMountedPath] = useState<string | null>(null);
  const autoSelectedRef = useRef(false);

  const query = useQuery({
    queryKey: vfsKeys.memberships(user?.id ?? 'anonymous'),
    queryFn: async () => {
      const result = await gatewayCall('list-memberships', {}) as any;
      const memberships = result.memberships || [];
      return memberships.map((m: any) => ({
        accountId: m.account_id,
        path: m.account_path,
        name: m.account_name,
        role: m.role || 'member',
        typeData: m.account_type_data || {},
        joinedAt: m.joined_at,
        via: m.via,
        placement: m.placement,
        subordinateTo: m.subordinate_to ?? null,
        cascadeAnchorId: m.cascade_anchor_id ?? null,
        isAccount: m.is_account ?? undefined,
        isSpace: m.is_space ?? undefined,
        isOwner: m.is_owner ?? undefined,
        billingResponsible: m.billing_responsible ?? undefined,
        grantedVia: m.granted_via ?? null,
        grantedUnderAccountId: m.granted_under_account_id ?? null,
        personalSpaceId: m.personal_space_id ?? null,
        personalSpacePath: m.personal_space_path ?? null,
      })) as AccountInfo[];
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2,
  });

  const allMemberships = query.data ?? [];

  // Switcher entries: billing-responsible accounts the principal can operate AS.
  // Spec rule: "terminus_account_id == account_id AND is_account = true"
  // The kernel encodes this as placement === 'switcher_entry'.
  // A principal may have multiple billing-responsible accounts (personal + org).
  const switcherAccounts = useMemo(() => {
    return allMemberships.filter((a) => {
      if (a.placement !== undefined) {
        return a.placement === 'switcher_entry' && a.isAccount === true;
      }
      // Legacy fallback: if placement is not set, treat all entries as switcher candidates
      return true;
    });
  }, [allMemberships]);

  useEffect(() => {
    if (!user?.id) {
      autoSelectedRef.current = false;
      setCurrentAccount(null);
      setMountedPath(null);
      return;
    }
    if (autoSelectedRef.current) return;
    if (switcherAccounts.length === 0) return;

    if (switcherAccounts.length === 1) {
      // Single billing-responsible account — auto-select
      setCurrentAccount(switcherAccounts[0]);
      setScope(switcherAccounts[0].path);
      autoSelectedRef.current = true;
    } else if (switcherAccounts.length > 1) {
      // Multiple billing-responsible accounts — require explicit selection.
      // Do NOT auto-select; scope remains unset until user picks.
      autoSelectedRef.current = true;
    }
  }, [user?.id, switcherAccounts]);

  const switchAccount = useCallback((accountPath: string) => {
    // Switch the billing-responsible account context.
    // Only switcher entries (billing-responsible accounts) are valid targets.
    const account = switcherAccounts.find((a) => a.path === accountPath);
    if (account) {
      setCurrentAccount(account);
      setScope(account.path);
      // Clear any mounted subaccount/space — switching account resets the mount
      setMountedPath(null);
    }
  }, [switcherAccounts]);

  const mountScope = useCallback((scopePath: string) => {
    // Mount a different scope within the current billing context.
    // This is purely UI state — like mounting an external drive in macOS.
    // It does NOT change _scope_path sent to the kernel. The kernel boundary
    // stays at the switcher account path (the billing context).
    // The mounted path tells the UI which volume/space to show as active.
    setMountedPath(scopePath);
  }, []);

  return {
    accounts: switcherAccounts,
    allMemberships,
    currentAccount,
    mountedScope: mountedPath,
    switchAccount,
    mountScope,
    loading: query.isLoading,
    error: query.error as Error | null,
  };
}

// ── Auth Hook ───────────────────────────────────────────────────────────────

interface AuthState {
  user: any | null;
  session: any | null;
  loading: boolean;
  signIn: (params: { email?: string; password?: string; provider?: string; redirectTo?: string }) => Promise<any>;
  signUp: (params: { email: string; password: string; metadata?: Record<string, any> }) => Promise<any>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signInWithMagicLink: (email: string, redirectTo?: string) => Promise<void>;
}

/** Reactive auth hook backed by Supabase auth. */
export function useAuth(): AuthState {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data, error }: any) => {
      if (error) {
        // Stale/invalid refresh token — clear persisted session so the app
        // falls through to the login page instead of showing a blank screen.
        console.warn('[useAuth] getSession error, clearing stale session:', error.message);
        supabase.auth.signOut().catch(() => {});
        setSession(null);
        setUser(null);
        setLoading(false);
        return;
      }
      setSession(data?.session ?? null);
      setUser(data?.session?.user ?? null);
      setLoading(false);
    }).catch((err: any) => {
      console.warn('[useAuth] getSession threw, clearing stale session:', err?.message);
      supabase.auth.signOut().catch(() => {});
      setSession(null);
      setUser(null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: string, newSession: any) => {
        // If Supabase fires TOKEN_REFRESHED with null session, the refresh
        // failed — treat as sign-out to avoid a stuck blank screen.
        if (event === 'TOKEN_REFRESHED' && !newSession) {
          console.warn('[useAuth] TOKEN_REFRESHED with null session — signing out');
          supabase.auth.signOut().catch(() => {});
          setSession(null);
          setUser(null);
          setLoading(false);
          return;
        }
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setLoading(false);
      },
    );
    subscriptionRef.current = subscription;

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (params: {
    email?: string;
    password?: string;
    provider?: string;
    redirectTo?: string;
  }) => {
    if (params.provider) {
      return supabase.auth.signInWithOAuth({
        provider: params.provider as any,
        options: params.redirectTo ? { redirectTo: params.redirectTo } : { redirectTo: window.location.href },
      });
    }
    return supabase.auth.signInWithPassword({
      email: params.email!,
      password: params.password!,
    });
  }, []);

  const signUp = useCallback(async (params: { email: string; password: string; metadata?: Record<string, any> }) => {
    return supabase.auth.signUp({
      email: params.email,
      password: params.password,
      options: { data: params.metadata || {} },
    });
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    resetAllSdkState();
    queryClient.clear();
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }, []);

  const signInWithMagicLink = useCallback(async (email: string, redirectTo?: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: redirectTo ? { emailRedirectTo: redirectTo } : { emailRedirectTo: window.location.href },
    });
    if (error) throw error;
  }, []);

  return { user, session, loading, signIn, signUp, signOut, resetPassword, signInWithMagicLink };
}

// ── Asset Hook ─────────────────────────────────────────────────────────────

interface AssetData {
  url: string;
  id?: string;
  name?: string;
  mimeType?: string;
  width?: number;
  height?: number;
  sizeBytes?: number;
}

/** Resolve an asset by UUID or path. */
export function useAsset(idOrPath: string | undefined | null) {
  const [data, setData] = useState<AssetData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!idOrPath) {
      setData(null);
      setLoading(false);
      return;
    }

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrPath);

    if (isUUID) {
      setLoading(true);
      gatewayCall('resolve-asset', { asset_id: idOrPath })
        .then((result: any) => {
          if (result.success && result.public_url) {
            setData({
              url: result.public_url,
              id: result.asset_id,
              name: result.name,
              mimeType: result.mime_type,
              width: result.width,
              height: result.height,
              sizeBytes: result.size_bytes,
            });
          } else {
            setError(new Error(result.error || 'Asset not found'));
          }
          setLoading(false);
        })
        .catch((e: any) => {
          setError(e instanceof Error ? e : new Error(String(e)));
          setLoading(false);
        });
    } else {
      const config = (typeof window !== 'undefined' && (window as any).__FSAOS_CONFIG__) || {};
      const edgeBaseUrl = config.edgeBaseUrl || '';
      setData({ url: edgeBaseUrl + idOrPath });
      setLoading(false);
    }
  }, [idOrPath]);

  return { data, loading, error };
}

// ── Component Hook ─────────────────────────────────────────────────────────

const componentCache: Record<string, any> = {};
const componentCssCache: Record<string, HTMLStyleElement> = {};

registerCleanup(() => {
  for (const key of Object.keys(componentCache)) {
    delete componentCache[key];
  }
});

let _sdkExports: Record<string, unknown> | null = null;

/**
 * Called by index.ts at module init to register the full SDK export map.
 * @internal
 */
export function __registerSdkExports(exports: Record<string, unknown>): void {
  _sdkExports = exports;
  if (typeof window !== 'undefined' && !(window as any).__FSAOS_GATEWAY__) {
    (window as any).__FSAOS_GATEWAY__ = exports;
  }
}

function sdkRequireShim(name: string): unknown {
  switch (name) {
    case 'react':
      return (typeof window !== 'undefined' && (window as any).React) || React;
    case 'react-dom':
    case 'react-dom/client':
      return (typeof window !== 'undefined' && (window as any).ReactDOM) || ReactDOM;
    case 'react/jsx-runtime':
    case 'react/jsx-dev-runtime':
      return (typeof window !== 'undefined' && (window as any).React)
        ? { jsx: (window as any).React.createElement, jsxs: (window as any).React.createElement, Fragment: (window as any).React.Fragment }
        : JsxRuntime;
    case '@fsaos/gateway':
    case '@fsaos/react':
      return (typeof window !== 'undefined' && (window as any).__FSAOS_GATEWAY__) || _sdkExports || {};
    case '@fsaos/ui':
      return (typeof window !== 'undefined' && (window as any).__FSAOS_UI__) || {};
    case '@fsaos/theme':
      return {};
    default:
      console.warn(`[useComponent] Unknown module requested: ${name}`);
      return {};
  }
}

function scopeComponentCss(cssText: string, scopeClass: string): string {
  return cssText.replace(
    /^(\s*)(:root|body)(\s*[{,])/gm,
    (_match, ws, _sel, rest) => `${ws}.${scopeClass}${rest}`,
  );
}

async function loadComponentCss(cssUrl: string, scopeId?: string): Promise<void> {
  if (componentCssCache[cssUrl]) return;

  try {
    const response = await fetch(cssUrl);
    if (!response.ok) return;

    let cssText = await response.text();
    if (!cssText.trim()) return;
    if (cssText.includes('No CSS bundle for this component')) return;

    if (scopeId && !cssText.includes(`.fsaos-c-${scopeId}`)) {
      cssText = scopeComponentCss(cssText, `fsaos-c-${scopeId}`);
    }

    const style = document.createElement('style');
    style.setAttribute('data-fsaos-component-css', cssUrl);
    if (scopeId) style.setAttribute('data-fsaos-component-id', scopeId);
    style.textContent = cssText;
    document.head.appendChild(style);
    componentCssCache[cssUrl] = style;
  } catch {
    // ignore
  }
}

function evaluateBundle(jsCode: string): any {
  let registered: any = null;
  const previousRegister = (window as any).__FSAOS_REGISTER__;
  (window as any).__FSAOS_REGISTER__ = (component: any) => {
    registered = component;
  };

  try {
    const wrappedCode = [
      'var require = arguments[0];',
      jsCode,
      'return window.__FSAOS_COMPONENT__;',
    ].join('\n');

    const fn = new Function(wrappedCode);
    const fromIife = fn(sdkRequireShim);

    const exported = registered ?? fromIife;
    if (!exported) return null;

    return (exported as any).default || exported;
  } finally {
    if (previousRegister !== undefined) {
      (window as any).__FSAOS_REGISTER__ = previousRegister;
    } else {
      delete (window as any).__FSAOS_REGISTER__;
    }
  }
}

/** Dynamically load a component from the edge. */
export function useComponent(path: string | undefined | null) {
  const [Component, setComponent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!path) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    const config = (typeof window !== 'undefined' && (window as any).__FSAOS_CONFIG__) || {};
    const edgeBaseUrl = config.edgeBaseUrl || '';

    (async () => {
      try {
        let version = 1;
        let cacheKey = path + '@v1';
        let bundleUrl = edgeBaseUrl + path + '/__bundle.js';

        try {
          const metaResponse = await fetch(edgeBaseUrl + path + '/__meta', { cache: 'no-store' });
          if (metaResponse.ok) {
            const meta = await metaResponse.json();
            version = meta.version || 1;
            cacheKey = path + '@v' + version;
            bundleUrl = edgeBaseUrl + path + '/__bundle.v' + version + '.js';
          }
        } catch {
          bundleUrl = edgeBaseUrl + path + '/__bundle.js?v=' + Date.now();
        }

        if (cancelled) return;

        if (componentCache[cacheKey]) {
          setComponent(() => componentCache[cacheKey]);
          setLoading(false);
          return;
        }

        const jsResponse = await fetch(bundleUrl);
        if (!jsResponse.ok) {
          throw new Error(
            `Failed to fetch bundle: ${jsResponse.status} ${jsResponse.statusText} (${bundleUrl})`,
          );
        }
        const jsCode = await jsResponse.text();

        if (cancelled) return;

        const cssUrl = bundleUrl.replace(/__bundle(\.v\d+)?\.js(\?.*)?$/, '__bundle$1.css');
        loadComponentCss(cssUrl).catch(() => {});

        const resolved = evaluateBundle(jsCode);

        if (!resolved) {
          throw new Error(
            'Bundle did not export a component. ' +
            'Expected window.__FSAOS_COMPONENT__ (FSAOS build) or a __FSAOS_REGISTER__(Component) call.',
          );
        }

        if (typeof resolved !== 'function') {
          throw new Error(`Bundle export is not a React component (got ${typeof resolved})`);
        }

        componentCache[cacheKey] = resolved;

        if (!cancelled) {
          setComponent(() => resolved);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [path]);

  return { Component, loading, error };
}

// ── Theme Hook ─────────────────────────────────────────────────────────────

const THEME_PROPERTIES = [
  '--color-primary', '--color-secondary', '--color-background',
  '--color-surface', '--color-text', '--color-text-secondary',
  '--color-border', '--color-accent', '--color-success',
  '--color-warning', '--color-error',
  '--font-family-heading', '--font-family-body',
  '--border-radius', '--spacing-unit',
];

/** Read CSS custom properties from the document root. */
export function useTheme() {
  const themeData = useMemo(() => {
    if (typeof document === 'undefined') return { tokens: {} };
    const vars: Record<string, string> = {};
    const style = getComputedStyle(document.documentElement);
    THEME_PROPERTIES.forEach((p) => {
      vars[p] = style.getPropertyValue(p).trim();
    });
    return { tokens: vars };
  }, []);
  return { data: themeData, loading: false, error: null };
}

// ── Permission Hook ────────────────────────────────────────────────────────

/** Check permission for an action on a path. */
export function usePermission(_action?: string, _path?: string) {
  return { data: { allowed: true }, loading: false, error: null };
}

/** Check multiple permissions at once. */
export function usePermissions(_path?: string, actions?: string[]) {
  const perms: Record<string, boolean> = {};
  (actions || []).forEach((a) => { perms[a] = true; });
  return { data: perms, loading: false, error: null };
}

// ── Principal Hook ─────────────────────────────────────────────────────────

export interface PrincipalData {
  id: string;
  principalId: string | null;
  email?: string;
  role: string;
  authenticated: boolean;
  metadata?: Record<string, any>;
}

let _principalIdCache: { authUserId: string; principalId: string | null } | null = null;
let _principalIdPromise: Promise<string | null> | null = null;

registerCleanup(() => {
  _principalIdCache = null;
  _principalIdPromise = null;
});

/** Resolve current user's FSAOS os_principals.id from auth ID. */
export async function resolvePrincipalId(authUserId?: string): Promise<string | null> {
  let uid = authUserId;
  if (!uid) {
    const { data } = await supabase.auth.getSession();
    uid = data?.session?.user?.id;
  }
  if (!uid) return null;

  if (_principalIdCache && _principalIdCache.authUserId === uid) {
    return _principalIdCache.principalId;
  }

  if (_principalIdPromise) return _principalIdPromise;

  _principalIdPromise = (async () => {
    try {
      const { data, error } = await supabase
        .from('os_principals')
        .select('id')
        .eq('auth_user_id', uid!)
        .eq('principal_type', 'user')
        .maybeSingle();

      if (error) {
        console.warn('[SDK] Could not resolve principal_id:', error.message);
        return null;
      }

      const principalId = data?.id ?? null;
      _principalIdCache = { authUserId: uid!, principalId };
      return principalId;
    } finally {
      _principalIdPromise = null;
    }
  })();

  return _principalIdPromise;
}

/** Returns the current principal (user identity). */
export function usePrincipal() {
  const authResult = useAuth();
  const user = authResult.user;
  const [principalId, setPrincipalId] = useState<string | null>(
    (_principalIdCache?.authUserId === user?.id ? _principalIdCache?.principalId : null) ?? null,
  );
  const prevUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setPrincipalId(null);
      prevUserIdRef.current = null;
      return;
    }
    if (prevUserIdRef.current === user.id && principalId !== null) return;
    prevUserIdRef.current = user.id;

    resolvePrincipalId(user.id).then((id) => {
      setPrincipalId(id);
    });
  }, [user?.id]);

  if (authResult.loading) {
    return { data: null as PrincipalData | null, loading: true, error: null };
  }

  if (!user) {
    return {
      data: { id: 'anonymous', principalId: null, role: 'viewer', authenticated: false } as PrincipalData,
      loading: false,
      error: null,
    };
  }

  return {
    data: {
      id: user.id,
      principalId,
      email: user.email,
      role: user.role || user.app_metadata?.role || 'user',
      authenticated: true,
      metadata: user.user_metadata || {},
    } as PrincipalData,
    loading: false,
    error: null,
  };
}

// ── Tool Hook ──────────────────────────────────────────────────────────────

/** Stub: useTool — returns null tool data. */
export function useTool() {
  return { data: null, loading: false, error: null };
}

// ── ComponentRenderer ──────────────────────────────────────────────────────

/** <ComponentRenderer path="..." /> — runtime composition primitive. */
export function ComponentRenderer(props: { path: string; [key: string]: any }) {
  const { path, ...rest } = props;
  const result = useComponent(path);
  const Comp = result.Component;
  const { loading, error } = result;

  if (loading) return createElement('div', { className: 'fsaos-loading' }, '');
  if (error) return createElement('div', { className: 'fsaos-error' }, 'Failed to load component');
  if (!Comp) return null;
  return createElement(Comp, rest);
}

// ── KernelProvider ─────────────────────────────────────────────────────────

/** Passthrough wrapper for backward compatibility. */
export function KernelProvider(props: { children: any }) {
  return props.children;
}

// ── Channel Messages Hook ──────────────────────────────────────────────────

export interface ChannelMessagesOptions {
  channelPath: string | undefined | null;
  parentMessageId?: string;
  realtime?: boolean;
  enabled?: boolean;
}

/** Fetch channel messages via the kernel's `get-channel-messages` method. */
export function useChannelMessages(options: ChannelMessagesOptions) {
  const scopeKey = useScopeKey();
  const {
    channelPath,
    parentMessageId,
    realtime = true,
    enabled: userEnabled,
  } = options;

  const isEnabled = userEnabled !== undefined ? userEnabled && !!channelPath : !!channelPath;

  const stableKey = useMemo(
    () => vfsKeys.channelMessages(channelPath ?? '', parentMessageId),
    [channelPath, parentMessageId, scopeKey],
  );

  const qc = useQueryClient();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const query = useQuery({
    queryKey: stableKey,
    queryFn: () => fetchChannelMessages(channelPath!, parentMessageId),
    enabled: isEnabled,
  });

  useEffect(() => {
    if (!realtime || !isEnabled) return;

    const unsub = subscribeToEvents(
      'vfs_change',
      () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          qc.invalidateQueries({ queryKey: stableKey });
        }, 500);
      },
      (data: any) => {
        return (
          data.item_type === 'message' &&
          typeof data.path === 'string' &&
          data.path.startsWith(channelPath!)
        );
      },
    );

    return () => {
      unsub();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [realtime, isEnabled, channelPath, stableKey, qc]);

  const messages: ChannelMessage[] = query.data ?? [];

  return {
    messages,
    threads: useMemo(() => messages.filter(m => m.reply_count > 0), [messages]),
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}

// ── Infinite Channel Messages (cursor-based pagination) ────────────────────

/** Options for useInfiniteChannelMessages. */
export interface InfiniteChannelMessagesOptions {
  /** VFS path of the channel. Required. */
  channelPath: string | undefined | null;
  /**
   * If set, fetches thread replies (forward pagination with after_seq).
   * If omitted, fetches top-level messages (backward pagination with before_seq).
   */
  parentMessageId?: string;
  /** Messages per page. Default 50, max 200. */
  limit?: number;
  /** Enable SSE-driven auto-refresh. Default: true. */
  realtime?: boolean;
  /** Standard useQuery enabled flag. Default: true (when channelPath is truthy). */
  enabled?: boolean;
}

/**
 * Infinite-scroll hook for channel messages.
 *
 * - **Top-level mode** (no parentMessageId): backward pagination.
 *   Initial fetch returns the N most recent messages. `fetchPreviousPage`
 *   loads older messages using `before_seq` = lowest seq in current data.
 *
 * - **Thread mode** (parentMessageId set): forward pagination.
 *   Initial fetch returns the first N replies. `fetchNextPage` loads newer
 *   replies using `after_seq` = highest seq in current data.
 *
 * Returns a flat `messages` array (deduped, sorted by seq ASC) plus
 * pagination state for scroll-triggered loading.
 */
export function useInfiniteChannelMessages(options: InfiniteChannelMessagesOptions) {
  useScopeKey();
  const { channelPath, parentMessageId, limit = 50, realtime = true, enabled = true } = options;
  const isThread = !!parentMessageId;
  const queryEnabled = enabled && !!channelPath;

  const query = useInfiniteQuery({
    queryKey: [...vfsKeys.channelMessages(channelPath || '', parentMessageId), 'infinite', limit],
    queryFn: async ({ pageParam }) => {
      return fetchChannelMessagesPage(channelPath!, {
        parentMessageId,
        limit,
        before_seq: isThread ? undefined : (pageParam as number | undefined),
        after_seq: isThread ? (pageParam as number | undefined) : undefined,
      });
    },
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => {
      // Forward pagination (thread mode): cursor is max seq
      if (!isThread) return undefined;
      if (lastPage.messages.length < limit) return undefined;
      const maxSeq = lastPage.messages[lastPage.messages.length - 1]?.seq;
      return maxSeq;
    },
    getPreviousPageParam: (firstPage) => {
      // Backward pagination (top-level mode): cursor is min seq
      if (isThread) return undefined;
      if (firstPage.messages.length < limit) return undefined;
      const minSeq = firstPage.messages[0]?.seq;
      return minSeq;
    },
    enabled: queryEnabled,
  });

  // Flatten all pages into a single deduped, sorted array
  const messages = useMemo(() => {
    if (!query.data?.pages) return [] as ChannelMessage[];
    const seen = new Set<string>();
    const flat: ChannelMessage[] = [];
    for (const page of query.data.pages) {
      for (const msg of page.messages) {
        if (!seen.has(msg.id)) {
          seen.add(msg.id);
          flat.push(msg);
        }
      }
    }
    return flat.sort((a, b) => a.seq - b.seq);
  }, [query.data?.pages]);

  // SSE-driven auto-refresh: refetch latest page on vfs_change events
  useEffect(() => {
    if (!realtime || !channelPath || !queryEnabled) return;
    const unsub = subscribeToEvents(channelPath, (event) => {
      if (event.event_type === 'vfs_change') {
        query.refetch();
      }
    });
    return unsub;
  }, [realtime, channelPath, queryEnabled]);

  return {
    messages,
    threads: messages.filter(m => m.reply_count > 0),
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
    // Backward pagination (top-level: load older)
    hasPreviousPage: query.hasPreviousPage ?? false,
    fetchPreviousPage: query.fetchPreviousPage,
    isFetchingPreviousPage: query.isFetchingPreviousPage ?? false,
    // Forward pagination (thread: load newer)
    hasNextPage: query.hasNextPage ?? false,
    fetchNextPage: query.fetchNextPage,
    isFetchingNextPage: query.isFetchingNextPage ?? false,
  };
}

// ── Channel Convenience Hooks ──────────────────────────────────────────────

export interface Channel {
  id: string;
  path: string;
  name: string;
  displayName: string;
  aiMode: 'auto' | 'mention' | 'off';
  isPrivate: boolean;
  isDm: boolean;
  messageCount: number;
  updatedAt: string;
  chatScopePath: string;
  contextId: string;
  contextPath: string;
  contextType: string;
  contextName: string;
  contextDisplayName: string;
  contextPrincipalId?: string;
  accountId: string;
  accountPath: string;
  accountDisplayName: string;
  memberRole: string;
  memberPath: string;
  modePath: string;
  autoPilot: boolean;
}

function normalizeChannel(raw: Record<string, unknown>): Channel {
  const td = (raw.type_data as Record<string, unknown>) || {};
  return {
    id:                   (raw.channel_id as string) || '',
    path:                 (raw.channel_path as string) || '',
    name:                 (raw.channel_name as string) || '',
    displayName:          (raw.display_name as string) || (raw.channel_name as string) || '',
    aiMode:               ((raw.ai_mode as string) || 'mention') as 'auto' | 'mention' | 'off',
    isPrivate:            (raw.is_private as boolean) || false,
    isDm:                 (raw.is_dm as boolean) || false,
    messageCount:         (raw.message_count as number) || 0,
    updatedAt:            (raw.updated_at as string) || '',
    chatScopePath:        (raw.chat_scope_path as string) || '',
    contextId:            (raw.context_id as string) || '',
    contextPath:          (raw.context_path as string) || '',
    contextType:          (raw.context_type as string) || '',
    contextName:          (raw.context_name as string) || '',
    contextDisplayName:   (raw.context_display_name as string) || '',
    contextPrincipalId:   raw.context_principal_id as string | undefined,
    accountId:            (raw.account_id as string) || '',
    accountPath:          (raw.account_path as string) || '',
    accountDisplayName:   (raw.account_display_name as string) || '',
    memberRole:           (raw.member_role as string) || 'member',
    memberPath:           (raw.member_path as string) || '',
    modePath:             (raw.mode_path as string) || '',
    autoPilot:            (raw.auto_pilot as boolean) || (td.auto_pilot as boolean) || false,
  };
}

export interface ChannelsOptions {
  realtime?: boolean;
  enabled?: boolean;
}

/** Fetch all channels (DMs + public) via `list-channels`. */
export function useAllChannels(options: ChannelsOptions = {}) {
  const scopeKey = useScopeKey();
  const { realtime = true, enabled = true } = options;

  const qc = useQueryClient();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stableKey = useMemo(() => vfsKeys.channels('all'), [scopeKey]);

  const query = useQuery({
    queryKey: stableKey,
    queryFn: async () => {
      const result = await gatewayCall('list-channels', {}) as Record<string, unknown>;
      const raw = (result.channels as Array<Record<string, unknown>>) || [];
      return raw.map(normalizeChannel);
    },
    enabled,
  });

  useEffect(() => {
    if (!realtime || !enabled) return;

    const unsub = subscribeToEvents(
      'vfs_change',
      () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          qc.invalidateQueries({ queryKey: stableKey });
        }, 1000);
      },
      (data: any) => data.item_type === 'channel' || data.item_type === 'message',
    );

    const unsub2 = subscribeToEvents(
      'ccm_change',
      () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          qc.invalidateQueries({ queryKey: stableKey });
        }, 1000);
      },
      (data: any) => data.item_type === 'channel' || data.item_type === 'message',
    );

    return () => {
      unsub();
      unsub2();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [realtime, enabled, stableKey, qc]);

  const channels: Channel[] = query.data ?? [];

  return {
    channels,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}

/** Fetch public (non-DM) channels only. */
export function useChannels(options: ChannelsOptions = {}) {
  const result = useAllChannels(options);
  const filtered = useMemo(
    () => result.channels.filter(c => !c.isDm),
    [result.channels],
  );
  return { ...result, channels: filtered };
}

/** Fetch DM channels only. */
export function useDmChannels(options: ChannelsOptions = {}) {
  const result = useAllChannels(options);
  const filtered = useMemo(
    () => result.channels.filter(c => c.isDm),
    [result.channels],
  );
  return { ...result, channels: filtered };
}

// ── Notification Hooks ────────────────────────────────────────────────────

export interface Notification {
  type: 'mention' | 'reply' | string;
  message_id: string;
  channel_id: string;
  channel_path: string;
  is_unread: boolean;
}

export interface NotificationsOptions {
  filter?: 'unread' | 'all';
  limit?: number;
  realtime?: boolean;
  enabled?: boolean;
}

/** Fetch notifications via `get-notifications`. */
export function useNotifications(options: NotificationsOptions = {}) {
  const scopeKey = useScopeKey();
  const {
    filter = 'all',
    limit = 200,
    realtime = true,
    enabled = true,
  } = options;

  const qc = useQueryClient();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stableKey = useMemo(() => vfsKeys.notifications(filter, limit), [filter, limit, scopeKey]);

  const query = useQuery({
    queryKey: stableKey,
    queryFn: async () => {
      const params: Record<string, unknown> = { limit };
      if (filter === 'unread') params.filter = 'unread';
      const result = await gatewayCall('get-notifications', params) as Record<string, unknown>;
      return ((result.notifications as Notification[]) || []);
    },
    enabled,
  });

  useEffect(() => {
    if (!realtime || !enabled) return;

    const unsubs = ['vfs_change', 'ccm_change'].map(eventType =>
      subscribeToEvents(
        eventType,
        () => {
          if (debounceRef.current) clearTimeout(debounceRef.current);
          debounceRef.current = setTimeout(() => {
            qc.invalidateQueries({ queryKey: stableKey });
          }, 2000);
        },
        (data: any) => data.item_type === 'notification' || data.item_type === 'message',
      ),
    );

    return () => {
      unsubs.forEach(u => u());
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [realtime, enabled, stableKey, qc]);

  const notifications: Notification[] = query.data ?? [];

  return {
    notifications,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}

export interface UnreadCountsOptions {
  channels?: Channel[];
  realtime?: boolean;
  enabled?: boolean;
}

/** Aggregated unread counts per channel. */
export function useUnreadCounts(options: UnreadCountsOptions = {}) {
  const { channels: channelList, realtime = true, enabled = true } = options;

  const { notifications, isLoading, isFetching, error, refetch } = useNotifications({
    filter: 'unread',
    limit: 200,
    realtime,
    enabled,
  });

  const unreadByChannel = useMemo(() => {
    const counts = new Map<string, number>();
    for (const n of notifications) {
      if (n.is_unread && n.channel_id) {
        counts.set(n.channel_id, (counts.get(n.channel_id) || 0) + 1);
      }
    }
    return counts;
  }, [notifications]);

  const totalUnread = useMemo(() => {
    let total = 0;
    unreadByChannel.forEach(v => { total += v; });
    return total;
  }, [unreadByChannel]);

  const { dmUnread, channelUnread } = useMemo(() => {
    if (!channelList) return { dmUnread: 0, channelUnread: 0 };

    const dmIds = new Set(channelList.filter(c => c.isDm).map(c => c.id));
    let dm = 0;
    let ch = 0;
    unreadByChannel.forEach((count, channelId) => {
      if (dmIds.has(channelId)) dm += count;
      else ch += count;
    });
    return { dmUnread: dm, channelUnread: ch };
  }, [channelList, unreadByChannel]);

  return {
    unreadByChannel,
    totalUnread,
    dmUnread,
    channelUnread,
    isLoading,
    isFetching,
    error,
    refetch,
  };
}

// ── Mutation Hooks ──────────────────────────────────────────────────────────

/** Create a new VFS item. Invalidates parent's children on success. */
export function useCreate() {
  const qc = useQueryClient();
  return useTanstackMutation({
    mutationFn: (params: CreateParams) => gatewayCall('create', params),
    onSuccess: (_data: any, variables: CreateParams) => {
      const parentPath = variables.parent_path;
      if (parentPath) {
        qc.invalidateQueries({ queryKey: vfsKeys.children(parentPath) });
      }
    },
  });
}

/** Update an existing VFS item. */
export function useUpdate() {
  const qc = useQueryClient();
  return useTanstackMutation({
    mutationFn: (params: UpdateParams) => gatewayCall('update', params),
    onSuccess: (_data: any, variables: UpdateParams) => {
      const path = variables.path;
      if (path) {
        qc.invalidateQueries({ queryKey: vfsKeys.item(path) });
        const segments = path.split('/');
        segments.pop();
        const parentPath = segments.join('/');
        if (parentPath) {
          qc.invalidateQueries({ queryKey: vfsKeys.children(parentPath) });
        }
      }
    },
  });
}

/** Delete a VFS item. */
export function useDelete() {
  const qc = useQueryClient();
  return useTanstackMutation({
    mutationFn: (params: DeleteParams) => gatewayCall('delete', params),
    onSuccess: (_data: any, variables: DeleteParams) => {
      const path = variables.path;
      if (path) {
        qc.removeQueries({ queryKey: vfsKeys.item(path) });
        const segments = path.split('/');
        segments.pop();
        const parentPath = segments.join('/');
        if (parentPath) {
          qc.invalidateQueries({ queryKey: vfsKeys.children(parentPath) });
        }
      }
    },
  });
}

/** Move a VFS item. */
export function useMove() {
  const qc = useQueryClient();
  return useTanstackMutation({
    mutationFn: (params: MoveParams) => gatewayCall('move', params),
    onSuccess: (_data: any, variables: MoveParams) => {
      const path = variables.path;
      const newParentPath = variables.new_parent_path;
      if (path) {
        qc.invalidateQueries({ queryKey: vfsKeys.item(path) });
        const segments = path.split('/');
        segments.pop();
        const oldParentPath = segments.join('/');
        if (oldParentPath) {
          qc.invalidateQueries({ queryKey: vfsKeys.children(oldParentPath) });
        }
      }
      if (newParentPath) {
        qc.invalidateQueries({ queryKey: vfsKeys.children(newParentPath) });
      }
    },
  });
}

/** Create an edge between two items. Invalidates edges for both. */
export function useLink() {
  const qc = useQueryClient();
  return useTanstackMutation({
    mutationFn: (params: LinkParams) => gatewayCall('link', params),
    onSuccess: (_data: any, variables: LinkParams) => {
      const sourceId = variables.source_id;
      const targetId = variables.target_id;
      if (sourceId) {
        qc.invalidateQueries({ queryKey: vfsKeys.edges(sourceId) });
      }
      if (targetId) {
        qc.invalidateQueries({ queryKey: vfsKeys.edges(targetId) });
      }
    },
  });
}

// ── Generic Mutation Hook ──────────────────────────────────────────────────

/**
 * Generic mutation hook for arbitrary kernel methods.
 * For methods not covered by useCreate/useUpdate/useDelete/useMove/useLink.
 *
 * @example
 * const archiveTask = useMutation('archive-task');
 * await archiveTask.mutateAsync({ task_id: '...' });
 */
export function useMutation(method: string, options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  optimistic?: {
    queryKey: readonly unknown[];
    update: (old: any, params: Record<string, unknown>) => any;
  };
}) {
  const qc = useQueryClient();
  const { optimistic, ...rest } = options ?? {};
  return useTanstackMutation({
    mutationFn: (params: Record<string, unknown>) => gatewayCall(method, params),
    onMutate: optimistic ? async (params: Record<string, unknown>) => {
      await qc.cancelQueries({ queryKey: optimistic.queryKey as any });
      const previous = qc.getQueryData(optimistic.queryKey as any);
      qc.setQueryData(optimistic.queryKey as any, (old: any) => optimistic.update(old, params));
      return { previous };
    } : undefined,
    onError: (err: any, _vars: any, context: any) => {
      if (optimistic && context?.previous !== undefined) {
        qc.setQueryData(optimistic.queryKey as any, context.previous);
      }
      rest.onError?.(err);
    },
    onSuccess: rest.onSuccess,
    onSettled: optimistic ? () => {
      qc.invalidateQueries({ queryKey: optimistic.queryKey as any });
    } : undefined,
  });
}

// ── Event Stream Hook ──────────────────────────────────────────────────────

/**
 * Subscribe to SSE events of a given type.
 * Calls the handler whenever an event arrives, optionally filtered by predicate.
 *
 * @example
 * useEventStream('vfs_change', (event) => {
 *   console.log('VFS changed:', event);
 * });
 */
export function useEventStream(
  handlerOrEventType: string | ((data: any) => void),
  handlerOrOptions?: ((data: any) => void) | { eventType: string; filter?: (data: any) => boolean; enabled?: boolean },
  filter?: (data: any) => boolean,
) {
  // Normalize overloaded signatures:
  // 1. useEventStream(eventType, handler, filter?)         — positional (legacy)
  // 2. useEventStream(handler, { eventType, filter, enabled }) — options-object
  let eventType: string;
  let handler: (data: any) => void;
  let resolvedFilter: ((data: any) => boolean) | undefined;
  let enabled = true;

  if (typeof handlerOrEventType === 'string') {
    // Legacy positional API
    eventType = handlerOrEventType;
    handler = handlerOrOptions as (data: any) => void;
    resolvedFilter = filter;
  } else {
    // Options-object API
    handler = handlerOrEventType;
    const opts = handlerOrOptions as { eventType: string; filter?: (data: any) => boolean; enabled?: boolean };
    eventType = opts.eventType;
    resolvedFilter = opts.filter;
    enabled = opts.enabled ?? true;
  }

  const handlerRef = useRef(handler);
  const filterRef = useRef(resolvedFilter);
  useEffect(() => {
    handlerRef.current = handler;
    filterRef.current = resolvedFilter;
  }, [handler, resolvedFilter]);
  useEffect(() => {
    if (!enabled) return;
    const unsub = subscribeToEvents(
      eventType,
      (data: any) => handlerRef.current(data),
      filterRef.current ? (data: any) => filterRef.current!(data) : undefined,
    );
    return unsub;
  }, [eventType, enabled]);
}

// ── Realtime Query Hook ────────────────────────────────────────────────────

/**
 * A useQuery wrapper that auto-refetches on matching SSE events.
 *
 * @example
 * const { data } = useRealtimeQuery({
 *   queryKey: ['my-data'],
 *   queryFn: () => fetchMyData(),
 *   eventType: 'vfs_change',
 *   filter: (data) => data.path.startsWith('/root/foo'),
 * });
 */
export function useRealtimeQuery<T>(options: {
  queryKey: readonly unknown[];
  queryFn: () => Promise<T>;
  eventType: string | string[];
  filter?: (data: any) => boolean;
  enabled?: boolean;
  debounceMs?: number;
}) {
  const { queryKey, queryFn, eventType, filter, enabled = true, debounceMs = 500 } = options;
  const qc = useQueryClient();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const query = useQuery({
    queryKey: queryKey as any,
    queryFn,
    enabled,
  });

  useEffect(() => {
    if (!enabled) return;

    const unsub = subscribeToEvents(
      eventType,
      () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          qc.invalidateQueries({ queryKey: queryKey as any });
        }, debounceMs);
      },
      filter,
    );

    return () => {
      unsub();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [eventType, enabled, debounceMs, qc, JSON.stringify(queryKey)]);

  return query;
}
