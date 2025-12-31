/**
 * Column helper factory functions
 *
 * These helpers provide a clean, type-safe API for defining table columns.
 * They reduce boilerplate and enforce conventions while maintaining flexibility
 * through the `col.custom` escape hatch.
 *
 * @packageDocumentation
 */

import type { ReactNode } from 'react';
import type {
  TextColumnDef,
  DateColumnDef,
  BooleanColumnDef,
  ActionsColumnDef,
  CustomColumnDef,
  ActionDef,
} from './types';

// ============================================================================
// HELPER OPTIONS
// ============================================================================

interface TextOptions {
  /** Optional custom header label */
  header?: string;
  /** Enable sorting for this column */
  sortable?: boolean;
  /** Optional formatter function */
  format?: (value: unknown) => string;
}

interface DateOptions {
  /** Optional custom header label */
  header?: string;
  /** Enable sorting for this column */
  sortable?: boolean;
  /** Optional date formatter function */
  format?: (value: Date | string | number) => string;
}

interface BooleanOptions {
  /** Optional custom header label */
  header?: string;
  /** Enable sorting for this column */
  sortable?: boolean;
  /** Optional boolean formatter function */
  format?: (value: boolean) => string;
}

// ============================================================================
// COLUMN HELPER FUNCTIONS
// ============================================================================

/**
 * Create a text column definition.
 *
 * @example
 * ```ts
 * col.text('name')
 * col.text('email', { header: 'Email Address', sortable: true })
 * col.text('status', { format: (val) => val.toUpperCase() })
 * ```
 */
function text<T>(
  field: keyof T & string,
  options?: TextOptions
): TextColumnDef<T> {
  return {
    id: field,
    kind: 'text',
    field,
    header: options?.header,
    sortable: options?.sortable ?? false,
    format: options?.format,
  };
}

/**
 * Create a date column definition.
 *
 * @example
 * ```ts
 * col.date('createdAt')
 * col.date('updatedAt', { header: 'Last Modified', sortable: true })
 * col.date('birthday', {
 *   format: (date) => new Date(date).toLocaleDateString()
 * })
 * ```
 */
function date<T>(
  field: keyof T & string,
  options?: DateOptions
): DateColumnDef<T> {
  return {
    id: field,
    kind: 'date',
    field,
    header: options?.header,
    sortable: options?.sortable ?? false,
    format: options?.format,
  };
}

/**
 * Create a boolean column definition.
 *
 * @example
 * ```ts
 * col.boolean('active')
 * col.boolean('isPublished', { header: 'Published', sortable: true })
 * col.boolean('enabled', {
 *   format: (val) => val ? 'Yes' : 'No'
 * })
 * ```
 */
function boolean<T>(
  field: keyof T & string,
  options?: BooleanOptions
): BooleanColumnDef<T> {
  return {
    id: field,
    kind: 'boolean',
    field,
    header: options?.header,
    sortable: options?.sortable ?? false,
    format: options?.format,
  };
}

/**
 * Create an actions column definition.
 *
 * The actions column displays a set of actions (buttons/links) that can be
 * performed on each row.
 *
 * @example
 * ```ts
 * col.actions([
 *   { id: 'edit', label: 'Edit', onClick: (row) => editUser(row) },
 *   { id: 'delete', label: 'Delete', confirm: true, onClick: (row) => deleteUser(row) }
 * ])
 * ```
 */
function actions<T>(actions: ActionDef<T>[]): ActionsColumnDef<T> {
  return {
    id: 'actions',
    kind: 'actions',
    actions,
  };
}

/**
 * Create a custom column definition with full rendering control.
 *
 * This is the escape hatch for any column that doesn't fit the standard types.
 * Use this for badges, avatars, complex formatting, or any custom UI.
 *
 * @example
 * ```ts
 * col.custom('avatar', (row) => (
 *   <img src={row.avatar} alt={row.name} />
 * ))
 *
 * col.custom('price', (row) => (
 *   <Money amount={row.price} currency={row.currency} />
 * ))
 *
 * col.custom('status', (row) => (
 *   <Badge color={row.status === 'active' ? 'green' : 'gray'}>
 *     {row.status}
 *   </Badge>
 * ))
 * ```
 */
function custom<T>(
  field: keyof T & string,
  render: (row: T) => ReactNode
): CustomColumnDef<T> {
  return {
    id: field,
    kind: 'custom',
    field,
    render,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Column helper factory object.
 *
 * Provides convenient helper functions for creating column definitions.
 *
 * @example
 * ```tsx
 * import { col } from '@rowakit/table';
 *
 * const columns = [
 *   col.text('name', { sortable: true }),
 *   col.date('createdAt'),
 *   col.boolean('active'),
 *   col.actions([
 *     { id: 'edit', label: 'Edit', onClick: (row) => {} }
 *   ]),
 *   col.custom('badge', (row) => <Badge>{row.status}</Badge>)
 * ];
 * ```
 */
export const col = {
  text,
  date,
  boolean,
  actions,
  custom,
} as const;
