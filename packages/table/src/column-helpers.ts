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
  BadgeColumnDef,
  NumberColumnDef,
  ActionsColumnDef,
  CustomColumnDef,
  ActionDef,
  BadgeTone,
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
  /** Column width in pixels */
  width?: number;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Enable text truncation with ellipsis */
  truncate?: boolean;
  /** Optional custom column ID (defaults to field name) */
  id?: string;
}

interface DateOptions {
  /** Optional custom header label */
  header?: string;
  /** Enable sorting for this column */
  sortable?: boolean;
  /** Optional date formatter function */
  format?: (value: Date | string | number) => string;
  /** Column width in pixels */
  width?: number;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Enable text truncation with ellipsis */
  truncate?: boolean;
}

interface BooleanOptions {
  /** Optional custom header label */
  header?: string;
  /** Enable sorting for this column */
  sortable?: boolean;
  /** Optional boolean formatter function */
  format?: (value: boolean) => string;
  /** Column width in pixels */
  width?: number;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Enable text truncation with ellipsis */
  truncate?: boolean;
}

interface BadgeOptions {
  /** Optional custom header label */
  header?: string;
  /** Enable sorting for this column */
  sortable?: boolean;
  /** Value-to-badge mapping */
  map?: Record<string, { label: string; tone: BadgeTone }>;
  /** Column width in pixels */
  width?: number;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Enable text truncation with ellipsis */
  truncate?: boolean;
}

interface NumberOptions<T = unknown> {
  /** Optional custom header label */
  header?: string;
  /** Enable sorting for this column */
  sortable?: boolean;
  /** Formatting options: Intl.NumberFormatOptions or custom formatter */
  format?: Intl.NumberFormatOptions | ((value: number, row: T) => string);
  /** Column width in pixels */
  width?: number;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Enable text truncation with ellipsis */
  truncate?: boolean;
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
    id: options?.id ?? field,
    kind: 'text',
    field,
    header: options?.header,
    sortable: options?.sortable ?? false,
    format: options?.format,
    width: options?.width,
    align: options?.align,
    truncate: options?.truncate,
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
    width: options?.width,
    align: options?.align,
    truncate: options?.truncate,
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
    width: options?.width,
    align: options?.align,
    truncate: options?.truncate,
  };
}

/**
 * Create a badge column definition for status/enum fields.
 *
 * @example
 * ```ts
 * col.badge('status')
 * col.badge('status', {
 *   map: {
 *     active: { label: 'Active', tone: 'success' },
 *     paused: { label: 'Paused', tone: 'warning' },
 *     disabled: { label: 'Disabled', tone: 'danger' }
 *   }
 * })
 * ```
 */
function badge<T>(
  field: keyof T & string,
  options?: BadgeOptions
): BadgeColumnDef<T> {
  return {
    id: field,
    kind: 'badge',
    field,
    header: options?.header,
    sortable: options?.sortable ?? false,
    map: options?.map,
    width: options?.width,
    align: options?.align,
    truncate: options?.truncate,
  };
}

/**
 * Create a number column definition.
 *
 * @example
 * ```ts
 * col.number('amount')
 * col.number('price', {
 *   format: { style: 'currency', currency: 'USD' }
 * })
 * col.number('count', {
 *   format: (val, row) => `${val} items`
 * })
 * ```
 */
function number<T>(
  field: keyof T & string,
  options?: NumberOptions<T>
): NumberColumnDef<T> {
  return {
    id: field,
    kind: 'number',
    field,
    header: options?.header,
    sortable: options?.sortable ?? false,
    format: options?.format,
    width: options?.width,
    align: options?.align,
    truncate: options?.truncate,
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
 * col.custom({
 *   id: 'avatar',
 *   header: 'User',
 *   render: (row) => <img src={row.avatar} alt={row.name} />
 * })
 *
 * col.custom({
 *   id: 'price',
 *   field: 'price',
 *   render: (row) => <Money amount={row.price} currency={row.currency} />
 * })
 *
 * col.custom({
 *   id: 'status',
 *   render: (row) => (
 *     <Badge color={row.status === 'active' ? 'green' : 'gray'}>
 *       {row.status}
 *     </Badge>
 *   )
 * })
 * ```
 */
function custom<T>(
  field: keyof T & string,
  render: (row: T) => ReactNode
): CustomColumnDef<T>;
function custom<T>(options: {
  /** Unique column identifier */
  id: string;
  /** Optional custom header label */
  header?: string;
  /** Optional field name for sorting/filtering */
  field?: keyof T & string;
  /** Render function for cell content */
  render: (row: T) => ReactNode;
}): CustomColumnDef<T>;
function custom<T>(
  arg1:
    | (keyof T & string)
    | {
        id: string;
        header?: string;
        field?: keyof T & string;
        render: (row: T) => ReactNode;
      },
  arg2?: (row: T) => ReactNode
): CustomColumnDef<T> {
  if (typeof arg1 === 'string') {
    if (typeof arg2 !== 'function') {
      throw new Error('col.custom(field, render): render must be a function');
    }

    return {
      id: arg1,
      kind: 'custom',
      field: arg1,
      render: arg2,
    };
  }

  return {
    id: arg1.id,
    kind: 'custom',
    header: arg1.header,
    field: arg1.field,
    render: arg1.render,
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
 *   col.custom({ id: 'badge', render: (row) => <Badge>{row.status}</Badge> })
 * ];
 * ```
 */
export const col = {
  text,
  date,
  boolean,
  badge,
  number,
  actions,
  custom,
} as const;
