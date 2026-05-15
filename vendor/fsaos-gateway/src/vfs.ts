/**
 * @fsaos/gateway — VFS Operations
 *
 * Pure async functions that call the gateway and return normalized VFS data.
 * These are the building blocks used by the React hooks — they can also be
 * called directly for non-React use cases.
 */

import { gatewayCall } from './client';
import { queryClient } from './query-client';
import { vfsKeys } from './vfs-keys';
import type {
  VFSItem,
  VFSEdge,
  TypeDefinition,
  OpenEnvelope,
  OpenOptions,
} from './types';

// ── Helpers ─────────────────────────────────────────────────────────────────

function nowISO(): string {
  return new Date().toISOString();
}

function randomId(): string {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Normalize a raw gateway item response into a clean VFSItem.
 * Handles the various shapes the gateway can return (flat fields, nested
 * content.type_data, etc.).
 */
export function normalizeItem(raw: any): VFSItem {
  const path = raw.path || raw.item_path || '';
  const segments = path.split('/');
  segments.pop();
  const parentPath = segments.join('/');

  const typeData = raw.type_data || {};

  if (typeData.allowed_parent_types && !typeData.accepts) {
    typeData.accepts = typeData.allowed_parent_types;
  }
  delete typeData.allowed_parent_types;

  return {
    id: raw.id || raw.item_id || '',
    name: raw.name || raw.item_name || '',
    item_type: raw.item_type || 'unknown',
    path,
    parent_path: parentPath,
    is_active: raw.is_active !== false,
    has_children: raw.has_children ?? false,
    created_at: raw.created_at || nowISO(),
    updated_at: raw.updated_at || nowISO(),
    visibility: raw.visibility,
    type_data: typeData,
    scope_item_id: raw.scope_item_id,
    fractal_id: raw.fractal_id,
    parent_instance_id: raw.parent_instance_id,
    owner_principal_id: raw.owner_principal_id,
    created_by_principal_id: raw.created_by_principal_id,
    parent_id: raw.parent_id,
  };
}

function extractItems(response: any): VFSItem[] {
  return (response.content?.items || response.items || []).map(normalizeItem);
}

// ── Fetch Functions ─────────────────────────────────────────────────────────

export async function fetchVfsItemById(id: string): Promise<VFSItem | null> {
  try {
    const response = await gatewayCall('read', { id });
    if (response.item_name || response.item_path) {
      const item = normalizeItem(response);
      if (item.path) {
        queryClient.setQueryData(vfsKeys.item(item.path), item);
      }
      return item;
    }
    const item = response.item;
    if (item) {
      const normalized = normalizeItem(item);
      if (normalized.path) {
        queryClient.setQueryData(vfsKeys.item(normalized.path), normalized);
      }
      return normalized;
    }
    return null;
  } catch {
    return null;
  }
}

export async function fetchVfsItem(path: string): Promise<VFSItem | null> {
  try {
    const response = await gatewayCall('read', { path });
    if (response.item_name || response.item_path) {
      return normalizeItem(response);
    }
    const item = response.item;
    return item ? normalizeItem(item) : null;
  } catch {
    return null;
  }
}

export async function fetchVfsChildren(path: string): Promise<VFSItem[]> {
  try {
    const response = await gatewayCall('list', { path, limit: 200 });
    const items = extractItems(response);
    for (const item of items) {
      queryClient.setQueryData(vfsKeys.item(item.path), item);
    }
    return items;
  } catch (err) {
    console.error(`[gateway] Failed to fetch children of ${path}:`, err);
    return [];
  }
}

/**
 * Paginated directory listing. Returns a page of children at `path`
 * with the given `limit` and `offset`. Used by `useInfiniteChildren`.
 */
export async function fetchVfsChildrenPage(
  path: string,
  limit: number,
  offset: number,
): Promise<{ items: VFSItem[]; total_hint: number }> {
  try {
    const response = await gatewayCall('list', { path, limit, offset });
    const items = extractItems(response);
    for (const item of items) {
      queryClient.setQueryData(vfsKeys.item(item.path), item);
    }
    return { items, total_hint: (response as any).total ?? response.content?.total ?? items.length };
  } catch (err) {
    console.error(`[gateway] Failed to fetch children page of ${path}:`, err);
    return { items: [], total_hint: 0 };
  }
}

export async function fetchTypeDefinitions(
  scopeId?: string,
): Promise<Map<string, TypeDefinition>> {
  const params = scopeId ? { scope_id: scopeId } : {};
  const response = await gatewayCall('types-list', params);
  const rawItems = response.content?.items || response.items || [];

  const types = new Map<string, TypeDefinition>();
  for (const raw of rawItems) {
    const name = raw.name;
    const td = raw.type_data;
    if (!name || !td) continue;

    types.set(name, {
      type_key: name,
      display_name: td.display_name || name,
      display_name_plural: td.display_name_plural || name + 's',
      icon: td.icon || 'File',
      color: td.color || 'gray',
      description: td.description || '',
      input_schema: td.input_schema || {},
      system_schema: td.system_schema || {},
      json_schema: td.input_schema || td.json_schema || {},
      default_data: td.default_data || {},
      field_defaults: td.field_defaults || {},
      renderer_config: td.renderer_config || {},
      is_system: td.is_system ?? false,
      is_active: td.is_active ?? true,
      is_container: td.is_container ?? false,
      is_scope: td.is_scope ?? false,
      render_mode: td.render_mode || 'none',
      placement_mode: td.placement_mode,
      direct_parent_types: td.direct_parent_types,
      allowed_parent_types: td.allowed_parent_types,
      governed_create: td.governed_create,
      create_method: td.create_method,
      dedup: td.dedup,
      edges: td.edges,
      events: td.events,
    });
  }

  return types;
}

export async function fetchEdgesForItem(itemId: string): Promise<VFSEdge[]> {
  try {
    const response = await gatewayCall('edges', { item_id: itemId });
    const outgoing = response.outgoing || [];
    const incoming = response.incoming || [];
    const edges: VFSEdge[] = [];

    for (const edge of outgoing) {
      edges.push({
        id: edge.edge_id || randomId(),
        source_item_id: itemId,
        target_item_id: edge.target_id || '',
        edge_type: edge.edge_type || '',
        weight: edge.weight ?? 1,
        context: edge.context || {},
        is_active: true,
        is_bidirectional: edge.is_bidirectional,
      });
    }

    for (const edge of incoming) {
      edges.push({
        id: edge.edge_id || randomId(),
        source_item_id: edge.source_id || '',
        target_item_id: itemId,
        edge_type: edge.edge_type || '',
        weight: edge.weight ?? 1,
        context: edge.context || {},
        is_active: true,
        is_bidirectional: edge.is_bidirectional,
      });
    }

    return edges;
  } catch (err) {
    console.warn(`[gateway] Failed to fetch edges for ${itemId}:`, err);
    return [];
  }
}

export async function fetchVfsTree(
  path: string,
  maxDepth: number = 1,
  itemTypes?: string[],
  limit?: number,
): Promise<VFSItem[]> {
  try {
    const params: Record<string, unknown> = {
      path,
      max_depth: maxDepth > 0 ? maxDepth : 999,
    };
    if (itemTypes?.length) params.item_types = itemTypes;
    if (limit) params.limit = limit;

    const response = await gatewayCall('tree', params);
    const items = extractItems(response);
    for (const item of items) {
      queryClient.setQueryData(vfsKeys.item(item.path), item);
    }
    return items;
  } catch (err) {
    console.error(`[gateway] Failed to fetch tree at ${path}:`, err);
    return [];
  }
}

export async function fetchRecentActivity(
  scopePath: string,
  limit: number = 50,
  offset: number = 0,
): Promise<any[]> {
  try {
    const response = await gatewayCall('recent-activity', {
      scope_path: scopePath,
      limit,
      offset,
    });
    return response.content?.items || response.items || response.entries || [];
  } catch (err) {
    console.error(`[gateway] Failed to fetch recent activity for ${scopePath}:`, err);
    return [];
  }
}

export async function fetchItemHistory(
  itemId: string,
  limit: number = 50,
  offset: number = 0,
): Promise<any> {
  try {
    const response = await gatewayCall('item-history', {
      item_id: itemId,
      limit,
      offset,
    });
    return {
      versions: response.content?.items || response.versions || [],
      total: response.total ?? 0,
    };
  } catch (err) {
    console.error(`[gateway] Failed to fetch item history for ${itemId}:`, err);
    return { versions: [], total: 0 };
  }
}

export async function fetchMemberFocus(
  scopeId: string,
  itemTypes?: string[],
  limit?: number,
): Promise<VFSItem[]> {
  try {
    const params: Record<string, unknown> = { scope_id: scopeId };
    if (itemTypes?.length) params.item_types = itemTypes;
    if (limit) params.limit = limit;

    const response = await gatewayCall('member-focus', params);
    const items = extractItems(response);
    for (const item of items) {
      queryClient.setQueryData(vfsKeys.item(item.path), item);
    }
    return items;
  } catch (err) {
    console.error(`[gateway] Failed to fetch member focus for scope ${scopeId}:`, err);
    return [];
  }
}
// ── Open Envelope ──────────────────────────────────────────────────────────
/**
 * Fetch the kernel's open envelope for an item.
 *
 * This is the primary way to open an item — it invokes the kernel's `open`
 * syscall which runs the CCM resolution pipeline and returns:
 * - Item identity (id, path, name, type)
 * - Render directives (which component to mount, with what props)
 * - Compatible components list (for "Open With" UX)
 * - Content extraction (for AI/programmatic consumers)
 *
 * The gateway processes `read_url_instructions` before returning, so
 * storage-backed items arrive with `render.props.url` already populated.
 *
 * Most consumers should use the `useOpen` hook instead. This function
 * exists for non-React contexts (Fractals, scripts, imperative code).
 *
 * @param path     VFS path of the item to open.
 * @param options  Optional mode, strategy, and arguments.
 */
export async function fetchOpenEnvelope(
  path: string,
  options?: OpenOptions,
): Promise<OpenEnvelope> {
  const params: Record<string, unknown> = { path };
  if (options?.mode) params.mode = options.mode;
  if (options?.strategy) params.strategy = options.strategy;
  if (options?.arguments) params.arguments = options.arguments;
  const response = await gatewayCall('open', params);
  // Pass through the kernel response — it IS the envelope.
  // The gateway has already processed read_url_instructions and stripped
  // internal fields. The kernel is the source of truth for the shape.
  const r = response as unknown as OpenEnvelope;
  return {
    item_id:                r.item_id,
    item_path:              r.item_path,
    item_name:              r.item_name,
    item_type:              r.item_type,
    render:                 r.render,
    compatible_components:  r.compatible_components ?? [],
    content:                r.content,
    metadata:               r.metadata,
    instructions:           r.instructions,
  };
}

// ── Items Query ──────────────────────────────────────────────────────────────

/** Filters for useItems / fetchItems. */
export interface ItemsFilter {
  /** Item type to query (required). */
  type: string;
  /** Scope path boundary. Defaults to session scope. */
  scope?: string;
  /** Direct parent_id filter. */
  parent_id?: string;
  /** Name ILIKE filter (partial match). */
  name?: string;
  /** Tag containment filter. */
  tag?: string;
  /** type_data field filters. Keys are field names, values are exact match. */
  fields?: Record<string, string | number | boolean>;
  /** Sort field. Default: 'updated_at'. */
  sort_by?: string;
  /** Sort direction. Default: 'desc'. */
  sort_dir?: 'asc' | 'desc';
  /** Max items to return. Default: 50. */
  limit?: number;
  /** Offset for pagination. Default: 0. */
  offset?: number;
}

/**
 * Fetch items by type with structured filters.
 * Calls kernel_query (gateway 'search' method) with the extended filter support.
 */
export async function fetchItems(filter: ItemsFilter): Promise<{
  items: VFSItem[];
  total_hint?: number;
}> {
  const params: Record<string, unknown> = {
    item_type: filter.type,
  };

  if (filter.scope) {
    params.scope_path = filter.scope;
  }

  // Build the filters object for kernel_query
  const filters: Record<string, unknown> = {};
  if (filter.name) filters.name = filter.name;
  if (filter.tag) filters.tag = filter.tag;
  if (filter.parent_id) filters.parent_id = filter.parent_id;
  if (filter.sort_by) filters.sort_by = filter.sort_by;
  if (filter.sort_dir) filters.sort_dir = filter.sort_dir;
  if (filter.offset != null) filters.offset = filter.offset;

  // Map field.* filters
  if (filter.fields) {
    for (const [key, value] of Object.entries(filter.fields)) {
      filters[`field.${key}`] = String(value);
    }
  }

  if (Object.keys(filters).length > 0) {
    params.filters = filters;
  }

  if (filter.limit != null) {
    params.limit = filter.limit;
  }

  try {
    const response = await gatewayCall('search', params);
    const items = extractItems(response);
    // Cache individual items
    for (const item of items) {
      queryClient.setQueryData(vfsKeys.item(item.path), item);
    }
    return { items, total_hint: (response as any).total ?? response.content?.total ?? items.length };
  } catch (err) {
    console.error(`[gateway] Failed to fetch items of type ${filter.type}:`, err);
    return { items: [], total_hint: 0 };
  }
}

// ── Channel Messages ───────────────────────────────────────────────────────

/** A parsed channel message with computed thread metadata from the kernel. */
export interface ChannelMessage {
  id: string;
  path: string;
  content: string;
  created_at: string;
  role: 'user' | 'assistant' | 'system';
  seq: number;
  principal_id?: string;
  reply_count: number;
  parent_message_id?: string;
  intent_card?: Record<string, unknown>;
  thread_summary?: Array<Record<string, unknown>>;
}

/**
 * Parse raw kernel message items into typed ChannelMessage objects.
 * Filters to item_type === 'message' and sorts by seq.
 */
function parseChannelMessages(rawItems: Array<Record<string, unknown>>): ChannelMessage[] {
  return rawItems
    .filter(i => (i.item_type as string) === 'message')
    .map(i => {
      const td = (i.type_data as Record<string, unknown>) || {};
      let role: 'user' | 'assistant' | 'system' = 'user';
      if (td.role === 'assistant') role = 'assistant';
      else if (td.role === 'system') role = 'system';
      const metadata = (td.metadata as Record<string, unknown>) || {};
      return {
        id:                (i.id as string) || '',
        path:              (i.path as string) || '',
        content:           (td.message as string) || (td.content as string) || '',
        created_at:        (i.created_at as string) || '',
        role,
        seq:               (td.seq as number) || 0,
        principal_id:      td.principal_id as string | undefined,
        reply_count:       (td.reply_count as number) || 0,
        parent_message_id: td.parent_message_id as string | undefined,
        intent_card:       metadata.intent_card as Record<string, unknown> | undefined,
        thread_summary:    Array.isArray(td.thread_summary) && td.thread_summary.length > 0
                             ? td.thread_summary as Array<Record<string, unknown>>
                             : undefined,
      };
    })
    .sort((a, b) => a.seq - b.seq);
}

/**
 * Fetch channel messages via the kernel's `get-channel-messages` method.
 *
 * Unlike `fetchVfsChildren` (which returns raw VFS items without computed
 * fields), this calls the kernel method that computes `reply_count` and
 * `thread_summary` on each message — the metadata needed for thread UX.
 *
 * @param channelPath   VFS path of the channel
 * @param parentMessageId  If set, returns thread replies for that parent.
 *                         If omitted, returns top-level messages.
 */
export async function fetchChannelMessages(
  channelPath: string,
  parentMessageId?: string,
): Promise<ChannelMessage[]> {
  try {
    const params: Record<string, unknown> = { channel_path: channelPath };
    if (parentMessageId) params.parent_message_id = parentMessageId;

    const response = await gatewayCall('get-channel-messages', params);
    const raw = response as Record<string, unknown>;
    const items = (raw.messages as Array<Record<string, unknown>>)
      || (raw.content as Record<string, unknown>)?.items as Array<Record<string, unknown>>
      || (raw.items as Array<Record<string, unknown>>)
      || [];
    return parseChannelMessages(items);
  } catch (err) {
    console.error(
      `[gateway] Failed to fetch channel messages for ${channelPath}:`,
      err,
    );
    return [];
  }
}

// ── Paginated Channel Messages ──────────────────────────────────────────────

/** Response shape from fetchChannelMessagesPage. */
export interface ChannelMessagesPage {
  messages: ChannelMessage[];
  /** Mode returned by kernel: 'top_level' or 'thread'. */
  mode: 'top_level' | 'thread';
}

/**
 * Fetch a single page of channel messages with cursor-based pagination.
 *
 * Calls `get-channel-messages` which dispatches to `kernel_get_channel_messages_v2`.
 * The kernel supports:
 *   - `limit` (default 50, max 200)
 *   - `before_seq` — fetch messages with seq < value (for backward/older pagination)
 *   - `after_seq` — fetch messages with seq > value (for forward/newer pagination)
 *
 * @param channelPath       VFS path of the channel
 * @param parentMessageId   If set, fetches thread replies (uses after_seq for forward paging)
 * @param limit             Number of messages per page (default 50)
 * @param before_seq        Cursor for backward pagination (top-level: load older)
 * @param after_seq         Cursor for forward pagination (thread: load newer)
 */
export async function fetchChannelMessagesPage(
  channelPath: string,
  options?: {
    parentMessageId?: string;
    limit?: number;
    before_seq?: number;
    after_seq?: number;
  },
): Promise<ChannelMessagesPage> {
  try {
    const params: Record<string, unknown> = { channel_path: channelPath };
    if (options?.parentMessageId) params.parent_message_id = options.parentMessageId;
    if (options?.limit) params.limit = options.limit;
    if (options?.before_seq != null) params.before_seq = options.before_seq;
    if (options?.after_seq != null) params.after_seq = options.after_seq;

    const response = await gatewayCall('get-channel-messages', params);
    const raw = response as Record<string, unknown>;
    const items = (raw.messages as Array<Record<string, unknown>>) || [];
    return {
      messages: parseChannelMessages(items),
      mode: (raw.mode as 'top_level' | 'thread') || 'top_level',
    };
  } catch (err) {
    console.error(
      `[gateway] Failed to fetch channel messages page for ${channelPath}:`,
      err,
    );
    return { messages: [], mode: 'top_level' };
  }
}

// ── Cache Invalidation ──────────────────────────────────────────────────────

export function invalidateChildren(path: string): void {
  queryClient.invalidateQueries({ queryKey: vfsKeys.children(path) });
}

export function invalidateItem(path: string): void {
  queryClient.invalidateQueries({ queryKey: vfsKeys.item(path) });
}

export function invalidatePathAndParent(path: string, fallbackParent?: string): void {
  invalidateItem(path);
  invalidateChildren(path);
  const segments = path.split('/');
  segments.pop();
  const parentPath = segments.join('/') || fallbackParent;
  if (parentPath) {
    invalidateChildren(parentPath);
  }
}

export function invalidateSubtree(path: string): void {
  const prefix = path + '/';
  queryClient.invalidateQueries({
    predicate: (query) => {
      const key = query.queryKey;
      if (key[0] !== 'vfs') return false;
      return key.some(
        (segment) =>
          typeof segment === 'string' && (segment === path || segment.startsWith(prefix)),
      );
    },
  });
}

export function invalidateAllVfs(): void {
  queryClient.invalidateQueries({ queryKey: vfsKeys.all() });
}

export function invalidateTypes(scopeId?: string): void {
  queryClient.invalidateQueries({ queryKey: vfsKeys.types(scopeId) });
}

/**
 * Invalidate cached channel messages.
 * If channelPath is provided, invalidates that channel's messages.
 * If not, invalidates all channel-messages queries.
 */
export function invalidateChannelMessages(channelPath?: string, parentMessageId?: string): void {
  if (channelPath) {
    queryClient.invalidateQueries({ queryKey: vfsKeys.channelMessages(channelPath, parentMessageId) });
  } else {
    queryClient.invalidateQueries({ queryKey: vfsKeys.allChannelMessages() });
  }
}

/**
 * Invalidate cached open envelopes.
 * If path is provided, invalidates that path's envelope (all strategies).
 * If not, invalidates all open-envelope queries.
 */
export function invalidateOpenEnvelope(path?: string, strategy?: string): void {
  if (path && strategy) {
    queryClient.invalidateQueries({ queryKey: vfsKeys.openEnvelope(path, strategy) });
  } else if (path) {
    queryClient.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey;
        // Key structure: ['vfs', scopeKey, 'open', path, strategy]
        return key[0] === 'vfs' && key[2] === 'open' && key[3] === path;
      },
    });
  } else {
    queryClient.invalidateQueries({ queryKey: vfsKeys.allOpenEnvelopes() });
  }
}
