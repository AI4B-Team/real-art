/**
 * @fsaos/gateway — Type Definitions
 *
 * All types used by the gateway SDK. These are inferred from the deployed
 * gateway.js bundle and the VFS data structures it operates on.
 */

// ── VFS Item ────────────────────────────────────────────────────────────────

/** A normalized VFS item as returned by all gateway read operations. */
export interface VFSItem {
  id: string;
  name: string;
  item_type: string;
  path: string;
  parent_path: string;
  is_active: boolean;
  has_children: boolean;
  created_at: string;
  updated_at: string;
  visibility?: string;
  type_data: Record<string, any>;
  scope_item_id?: string;
  fractal_id?: string;
  parent_instance_id?: string;
  owner_principal_id?: string;
  created_by_principal_id?: string;
  parent_id?: string;
}

// ── Type System ─────────────────────────────────────────────────────────────

/** A type definition from the os_item_types registry. */
export interface TypeDefinition {
  type_key: string;
  display_name: string;
  display_name_plural: string;
  icon: string;
  color: string;
  description: string;
  /** User-editable fields schema (JSON Schema). */
  input_schema: Record<string, any>;
  /** System-managed fields schema (JSON Schema). */
  system_schema: Record<string, any>;
  /** @deprecated Use input_schema/system_schema instead. */
  json_schema: Record<string, any>;
  default_data: Record<string, any>;
  field_defaults: Record<string, any>;
  renderer_config: Record<string, any>;
  is_system: boolean;
  is_active: boolean;
  is_container: boolean;
  is_scope: boolean;
  render_mode: string;
  placement_mode?: string;
  direct_parent_types?: string[];
  allowed_parent_types?: string[];
  governed_create?: boolean;
  create_method?: string;
  dedup?: Record<string, any>;
  edges?: any[];
  events?: Record<string, any>;
}

// ── Edges ───────────────────────────────────────────────────────────────────

/** A VFS edge (relationship between two items). */
export interface VFSEdge {
  id: string;
  source_item_id: string;
  target_item_id: string;
  edge_type: string;
  weight: number;
  context: Record<string, any>;
  is_active: boolean;
  is_bidirectional?: boolean;
}

// ── Session ─────────────────────────────────────────────────────────────────

/** The session entry returned by initSession (domain-scoped). */
export interface SessionEntry {
  scope_id: string;
  scope_path: string;
  instance_path: string;
  fractal_id: string | null;
  instance_name: string | null;
  display_name: string | null;
}

// ── Enforcement ─────────────────────────────────────────────────────────────

/** Raw error payload from the gateway when enforcement denies a request. */
export interface EnforcementPayload {
  success: false;
  error?: string;
  message?: string;
  denied_by?: string;
  error_type?: string;
  enforcement?: {
    rule_key?: string;
    display_name?: string;
  };
}

// ── Gateway Call ────────────────────────────────────────────────────────────

/** Parameters for a gateway RPC call. */
export type GatewayParams = Record<string, unknown>;

/** Raw response from the gateway (success path). */
export interface GatewayResponse {
  success?: boolean;
  content?: {
    items?: any[];
    type_data?: Record<string, any>;
    [key: string]: any;
  };
  items?: any[];
  item?: any;
  outgoing?: any[];
  incoming?: any[];
  [key: string]: any;
}

// ── Mutation Params ─────────────────────────────────────────────────────────

export interface CreateParams {
  parent_path: string;
  name?: string;
  item_type?: string;
  type_data?: Record<string, any>;
  [key: string]: unknown;
}

export interface UpdateParams {
  path: string;
  name?: string;
  type_data?: Record<string, any>;
  [key: string]: unknown;
}

export interface DeleteParams {
  path: string;
  [key: string]: unknown;
}

export interface MoveParams {
  path: string;
  new_parent_path: string;
  [key: string]: unknown;
}

export interface LinkParams {
  source_id: string;
  target_id: string;
  edge_type?: string;
  weight?: number;
  context?: Record<string, any>;
  [key: string]: unknown;
}

// ── Open Envelope ───────────────────────────────────────────────────────────
/**
 * A compatible component opener returned by the CCM resolution pipeline.
 *
 * Each entry represents a component that has registered an `opens` edge
 * targeting the item's type. The array is sorted by priority (highest first).
 * The first entry with `is_default: true` is the one the kernel selected as
 * the primary opener (reflected in `render.view_component_id`).
 */
export interface ComponentOpener {
  /** UUID of the component item in the VFS. */
  component_id: string;
  /** Short name of the component (e.g. "asset-viewer", "chat", "folder"). */
  name: string;
  /** VFS path of the component item. */
  path: string;
  /** Human-readable label for UI display (e.g. "Asset Viewer"). */
  display_name: string;
  /** Whether this is the default opener for the target type. */
  is_default: boolean;
  /** Priority weight (higher = preferred). */
  priority: number;
  /** UI framework the component is built with (e.g. "react"). */
  framework: string;
  /** Where the component runs: "client" (bundled) or "remote" (URL-loaded). */
  host: string;
  /** Remote bundle URL (null for client-hosted components). */
  url: string | null;
}
/**
 * The kernel's `open` syscall response — the unified envelope for rendering
 * and content extraction.
 *
 * This is the primary interface between the kernel and any client that wants
 * to display or process an item. The envelope carries:
 *
 * 1. **Item identity** — id, path, name, type (always present).
 * 2. **CCM render block** — which component should render this item, resolved
 *    via the Compatible Component Model (opens graph + entitlements).
 * 3. **Compatible components** — all registered openers for "Open With" UX.
 * 4. **Content** — extracted content for AI/programmatic consumers.
 * 5. **Metadata** — additional item metadata when requested.
 *
 * The gateway processes `read_url_instructions` before returning, so
 * storage-backed items arrive with `render.props.url` already populated.
 *
 * When `render.view_component_id` is null, no CCM opener is registered for
 * this item type — the client should fall back to a system action (e.g.
 * item-detail / inspector). This is a valid state, not an error.
 */
export interface OpenEnvelope {
  // ── Item Identity (always present) ──────────────────────────────────────
  /** UUID of the opened item. */
  item_id: string;
  /** Full VFS path of the opened item. */
  item_path: string;
  /** Display name of the opened item. */
  item_name: string;
  /** Type key of the opened item (e.g. "file", "channel", "task"). */
  item_type: string;

  // ── CCM Render Block ────────────────────────────────────────────────────
  /** Render directives from the CCM resolution pipeline. */
  render?: {
    /** Always "ccm" when the open pipeline runs. */
    render_mode: string;
    /** UUID of the resolved component (null = no CCM opener registered). */
    view_component_id: string | null;
    /** VFS path of the resolved component (null = no CCM opener registered). */
    view_component_path: string | null;
    /** UI framework (e.g. "react"). Null when no opener. */
    framework: string | null;
    /** Execution host: "client" or "remote". Null when no opener. */
    host: string | null;
    /** Remote bundle URL (populated by gateway for storage-backed items). */
    url: string | null;
    /** Render props passed to the component (label, path, url, mime, etc.). */
    props?: Record<string, unknown>;
  };

  // ── Compatible Components (for "Open With") ─────────────────────────────
  /** All registered openers for this item's type, sorted by priority desc. */
  compatible_components: ComponentOpener[];

  // ── Content Extraction ──────────────────────────────────────────────────
  /** Extracted content payload (type_data, inline text, structured data). */
  content?: Record<string, unknown>;

  // ── Metadata ────────────────────────────────────────────────────────────
  /** Additional item metadata when requested. */
  metadata?: Record<string, unknown>;

  /** @internal Raw instructions — usually already processed by the gateway. */
  instructions?: Array<Record<string, unknown>>;
}
/**
 * Options for the `open` syscall.
 *
 * Controls what the kernel returns in the envelope:
 * - `mode` determines whether to run the CCM render pipeline, content
 *   extraction, or both.
 * - `strategy` selects a non-default extraction strategy (e.g. "rows",
 *   "symbol", "heading" for files).
 * - `arguments` passes strategy-specific parameters.
 *
 * When omitted, defaults to `mode: "render"` for human callers.
 */
export interface OpenOptions {
  /**
   * What to include in the envelope.
   * - "render" — CCM resolution + render props (default for UI).
   * - "extract" — Content extraction only (for AI/scripts).
   * - "both" — Full envelope with render + content.
   */
  mode?: 'render' | 'extract' | 'both';
  /** Strategy name from the type's open_config.strategies list. */
  strategy?: string;
  /** Strategy-specific arguments (e.g. { start: 0, end: 100 } for `rows`). */
  arguments?: Record<string, unknown>;
}
