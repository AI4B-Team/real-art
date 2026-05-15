/**
 * @fsaos/gateway — Barrel Export
 *
 * Single entry point for the SDK. Re-exports all symbols for the
 * deployed gateway.js bundle on R2.
 */

// Error
export { EnforcementDeniedError } from './enforcement';

// Session
export { initSession, clearSession, getSessionEntry, getAccessToken, setCachedToken, clearCachedToken, setScope, getScope, getScopeVersion, subscribeScope, awaitScopeReady, isScopeReady, resetAllSdkState, registerCleanup } from './session';

// Client
export { gatewayCall } from './client';

// Config — supabase client is internal, not part of the public API.
// Use useAuth(), gatewayCall(), and SDK hooks instead.

// Query Client
export { queryClient } from './query-client';

// QueryClientProvider (re-exported so runtime can wrap components)
export { QueryClientProvider } from '@tanstack/react-query';

// VFS Keys
export { vfsKeys } from './vfs-keys';

// VFS Operations
export {
  normalizeItem,
  fetchVfsItem,
  fetchVfsItemById,
  fetchVfsChildren,
  fetchVfsChildrenPage,
  fetchTypeDefinitions,
  fetchItems,
  fetchEdgesForItem,
  fetchVfsTree,
  fetchMemberFocus,
  fetchRecentActivity,
  fetchItemHistory,
  fetchChannelMessages,
  fetchChannelMessagesPage,
  fetchOpenEnvelope,
  invalidateChildren,
  invalidateItem,
  invalidatePathAndParent,
  invalidateSubtree,
  invalidateAllVfs,
  invalidateTypes,
  invalidateChannelMessages,
  invalidateOpenEnvelope,
} from './vfs';
export type { ItemsFilter, ChannelMessage, ChannelMessagesPage } from './vfs';

// Realtime (Supabase Realtime channel)
export { initVfsRealtime, disposeVfsRealtime } from './realtime';

// SSE (Server-Sent Events)
export { subscribeToPath, subscribeToEvents, disconnectSSE } from './sse';

// Runtime (imperative VFS functions, auth facade, mount, require shim)
export {
  readItem,
  listChildren,
  createItem,
  updateItem,
  pushChanges,
  callTool,
  signal,
  getAssetUrl,
  auth,
  mount,
  setupRequireShim,
} from './runtime';

// React Hooks
export {
  useItem,
  useItemById,
  useItems,
  useInfiniteItems,
  useInfiniteChildren,
  useList,
  useChildren,
  useTree,
  useSearch,
  useEdges,
  useTypes,
  useType,
  useOpen,
  useTypeHelpers,
  useMemberFocus,
  useItemHistory,
  useRecentActivity,
  useScope,
  useScopeReady,
  useAuth,
  useAsset,
  useComponent,
  useTheme,
  usePermission,
  usePermissions,
  usePrincipal,
  resolvePrincipalId,
  useAccounts,
  useTool,
  useCreate,
  useUpdate,
  useDelete,
  useMove,
  useLink,
  useMutation,
  useEventStream,
  useChannelMessages,
  useInfiniteChannelMessages,
  useAllChannels,
  useChannels,
  useDmChannels,
  useNotifications,
  useUnreadCounts,
  useRealtimeQuery,
  ComponentRenderer,
  KernelProvider,
} from './hooks';
export type {
  ChannelMessagesOptions,
  InfiniteChannelMessagesOptions,
  Channel,
  ChannelsOptions,
  Notification,
  NotificationsOptions,
  UnreadCountsOptions,
} from './hooks';

// Schema Interpretation Utilities
export { interpretSchema, getDefaultSort, getRequiredFormFields } from './schema-utils';
export type { FieldDescriptor, TypeSchema } from './schema-utils';

// File Upload (imperative + React hook)
export { uploadFile, useFileUpload } from './upload';
export type { FileRef, UploadOptions, UploadResult, UploadItem, UseFileUploadReturn } from './upload';

// Types (re-export for consumers)
export type {
  VFSItem,
  TypeDefinition,
  VFSEdge,
  SessionEntry,
  EnforcementPayload,
  GatewayParams,
  GatewayResponse,
  CreateParams,
  UpdateParams,
  DeleteParams,
  MoveParams,
  LinkParams,
  OpenEnvelope,
  OpenOptions,
  ComponentOpener,
} from './types';

export type { PrincipalData, AccountInfo, TypeHelpers } from './hooks';

// ── SDK Self-Registration ─────────────────────────────────────────────────────
// Register the complete export map so the require shim in useComponent() can
// return the full SDK when child components call require('@fsaos/gateway').
// This covers the npm/ESM context where window.__FSAOS_GATEWAY__ isn't set by
// a <script> tag. In the dispatch worker context, the gateway.js IIFE already
// sets the global, so __registerSdkExports() skips the window assignment.
import { __registerSdkExports } from './hooks';
import * as _self from './index';
__registerSdkExports(_self as unknown as Record<string, unknown>);
