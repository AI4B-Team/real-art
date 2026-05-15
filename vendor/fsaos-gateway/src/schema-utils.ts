/**
 * @fsaos/gateway — Schema Interpretation Utilities
 *
 * Derives UI capabilities (filterable fields, sortable fields, table columns,
 * form fields) from a type definition's input_schema and system_schema.
 *
 * The type definition IS the contract. These utilities read it and return
 * structured metadata that UI components use to render generically.
 */

import type { TypeDefinition } from './types';

// ── Types ──────────────────────────────────────────────────────────────────

/** A field descriptor derived from the type's JSON Schema. */
export interface FieldDescriptor {
  /** Field key (property name in type_data). */
  key: string;
  /** Human-readable label derived from schema title or key. */
  label: string;
  /** JSON Schema type (string, number, integer, boolean, array, object). */
  type: string;
  /** Description from schema. */
  description?: string;
  /** Enum values if constrained. */
  enum_values?: string[];
  /** Default value from default_data or field_defaults. */
  default_value?: any;
  /** Whether this field is user-editable (from input_schema) or system-managed. */
  editable: boolean;
  /** Whether this field can be used as a filter. */
  filterable: boolean;
  /** Whether this field can be sorted on. */
  sortable: boolean;
  /** Suggested filter widget type. */
  filter_widget: 'select' | 'text' | 'toggle' | 'range' | 'date' | 'none';
}

/** Complete schema interpretation result for a type. */
export interface TypeSchema {
  /** All fields (input + system), ordered as declared. */
  fields: FieldDescriptor[];
  /** Fields suitable for table columns (non-object, non-array). */
  columns: FieldDescriptor[];
  /** Fields that can be filtered on. */
  filterable: FieldDescriptor[];
  /** Fields that can be sorted on. */
  sortable: FieldDescriptor[];
  /** Fields for creation/edit forms (input_schema only). */
  form_fields: FieldDescriptor[];
  /** Fields that are system-managed (read-only display). */
  system_fields: FieldDescriptor[];
}

// ── Utilities ──────────────────────────────────────────────────────────────

/**
 * Convert a JSON Schema property key to a human-readable label.
 * "display_name" → "Display Name", "is_dm" → "Is DM"
 */
function keyToLabel(key: string): string {
  return key
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Determine the filter widget type for a field based on its JSON Schema.
 */
function inferFilterWidget(
  type: string,
  enumValues?: string[],
): FieldDescriptor['filter_widget'] {
  if (enumValues && enumValues.length > 0) return 'select';
  if (type === 'boolean') return 'toggle';
  if (type === 'integer' || type === 'number') return 'range';
  if (type === 'string') return 'text';
  return 'none';
}

/**
 * Determine if a field is filterable based on its type.
 * Objects and arrays are not directly filterable.
 */
function isFilterable(type: string, enumValues?: string[]): boolean {
  if (type === 'object' || type === 'array') return false;
  return true;
}

/**
 * Determine if a field is sortable.
 * Strings, numbers, integers, and booleans are sortable.
 */
function isSortable(type: string): boolean {
  return ['string', 'number', 'integer', 'boolean'].includes(type);
}

/**
 * Determine if a field is suitable as a table column.
 * Objects and arrays are not good table columns.
 */
function isColumnSuitable(type: string): boolean {
  return type !== 'object' && type !== 'array';
}

/**
 * Extract field descriptors from a JSON Schema properties object.
 */
function extractFields(
  schema: Record<string, any>,
  editable: boolean,
  defaults: Record<string, any>,
  fieldDefaults: Record<string, any>,
): FieldDescriptor[] {
  const properties = schema?.properties;
  if (!properties || typeof properties !== 'object') return [];

  const fields: FieldDescriptor[] = [];

  for (const [key, prop] of Object.entries(properties) as [string, any][]) {
    const type = prop.type || 'string';
    const enumValues = prop.enum;
    const filterable = isFilterable(type, enumValues);
    const sortable = isSortable(type);
    const filterWidget = inferFilterWidget(type, enumValues);

    fields.push({
      key,
      label: prop.title || keyToLabel(key),
      type,
      description: prop.description,
      enum_values: enumValues,
      default_value: defaults[key] ?? fieldDefaults[key] ?? prop.default,
      editable,
      filterable,
      sortable,
      filter_widget: filterWidget,
    });
  }

  return fields;
}

// ── Main API ───────────────────────────────────────────────────────────────

/**
 * Interpret a type definition's schemas and return structured field metadata.
 *
 * @example
 * const typeDef = useType('project');
 * const schema = interpretSchema(typeDef);
 * // schema.columns → fields to show in table
 * // schema.filterable → fields to offer as filters
 * // schema.form_fields → fields for create/edit form
 */
export function interpretSchema(typeDef: TypeDefinition): TypeSchema {
  const defaults = typeDef.default_data || {};
  const fieldDefaults = typeDef.field_defaults || {};

  const inputFields = extractFields(
    typeDef.input_schema,
    true,
    defaults,
    fieldDefaults,
  );

  const systemFields = extractFields(
    typeDef.system_schema,
    false,
    defaults,
    fieldDefaults,
  );

  const allFields = [...inputFields, ...systemFields];
  const columns = allFields.filter((f) => isColumnSuitable(f.type));
  const filterable = allFields.filter((f) => f.filterable);
  const sortable = allFields.filter((f) => f.sortable);

  return {
    fields: allFields,
    columns,
    filterable,
    sortable,
    form_fields: inputFields,
    system_fields: systemFields,
  };
}

/**
 * Get the default sort field for a type.
 * Returns 'updated_at' as the universal default (column on os_items).
 */
export function getDefaultSort(_typeDef: TypeDefinition): {
  field: string;
  direction: 'asc' | 'desc';
} {
  return { field: 'updated_at', direction: 'desc' };
}

/**
 * Get the creation form schema for a type — only editable fields
 * that don't have defaults (i.e., the user must provide them).
 */
export function getRequiredFormFields(typeDef: TypeDefinition): FieldDescriptor[] {
  const schema = interpretSchema(typeDef);
  const required = new Set(typeDef.input_schema?.required || []);
  return schema.form_fields.filter(
    (f) => required.has(f.key) || f.default_value === undefined,
  );
}
