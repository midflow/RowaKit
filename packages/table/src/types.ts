/**
 * Core type definitions for RowaKit Table
 *
 * These types define the contracts for:
 * - Server-side data fetching (Fetcher)
 * - Column definitions (ColumnDef)
 * - Row actions (ActionDef)
 *
 * @packageDocumentation
 */

import type { ReactNode } from 'react';

// ============================================================================
// FETCHER TYPES
// ============================================================================

/**
 * Query parameters passed to the fetcher function.
 *
 * All pagination, sorting, and filtering state is passed through this query.
 */
export interface FetcherQuery {
  /** Current page number (1-based) */
  page: number;

  /** Number of items per page */
  pageSize: number;

  /** Optional sorting configuration */
  sort?: {
    /** Field name to sort by */
    field: string;
    /** Sort direction */
    direction: 'asc' | 'desc';
  };

  /** Optional filters (key-value pairs) */
  filters?: Record<string, unknown>;
}

/**
 * Result returned from the fetcher function.
 */
export interface FetcherResult<T> {
  /** Array of data items for the current page */
  items: T[];

  /** Total number of items across all pages */
  total: number;
}

/**
 * Server-side data fetcher function.
 *
 * This is the primary contract for loading table data. The fetcher receives
 * pagination, sorting, and filter state, and returns a page of results.
 *
 * @example
 * ```ts
 * const fetchUsers: Fetcher<User> = async (query) => {
 *   const response = await fetch(`/api/users?${new URLSearchParams({
 *     page: query.page.toString(),
 *     pageSize: query.pageSize.toString(),
 *     sort: query.sort ? `${query.sort.field}:${query.sort.direction}` : '',
 *   })}`);
 *   return response.json();
 * };
 * ```
 */
export type Fetcher<T> = (query: FetcherQuery) => Promise<FetcherResult<T>>;

// ============================================================================
// COLUMN TYPES
// ============================================================================

/**
 * Union of supported column kinds.
 *
 * These represent the built-in column types that can be created
 * via the `col.*` helper factory.
 */
export type ColumnKind = 'text' | 'date' | 'boolean' | 'actions' | 'custom';

/**
 * Base column definition properties shared across all column types.
 */
export interface BaseColumnDef<T> {
  /** Unique identifier for this column */
  id: string;

  /** Column kind (text, date, boolean, actions, custom) */
  kind: ColumnKind;

  /** Optional header label (defaults to id if not provided) */
  header?: string;

  /** Whether this column can be sorted (default: false) */
  sortable?: boolean;

  /** Optional field name to extract from row data (for sortable columns) */
  field?: keyof T & string;
}

/**
 * Text column definition.
 */
export interface TextColumnDef<T> extends BaseColumnDef<T> {
  kind: 'text';
  field: keyof T & string;
  format?: (value: unknown) => string;
}

/**
 * Date column definition.
 */
export interface DateColumnDef<T> extends BaseColumnDef<T> {
  kind: 'date';
  field: keyof T & string;
  format?: (value: Date | string | number) => string;
}

/**
 * Boolean column definition.
 */
export interface BooleanColumnDef<T> extends BaseColumnDef<T> {
  kind: 'boolean';
  field: keyof T & string;
  format?: (value: boolean) => string;
}

/**
 * Actions column definition.
 */
export interface ActionsColumnDef<T> extends BaseColumnDef<T> {
  kind: 'actions';
  actions: ActionDef<T>[];
}

/**
 * Custom column definition with render function.
 *
 * This is the escape hatch for any column that doesn't fit
 * the built-in types.
 */
export interface CustomColumnDef<T> extends BaseColumnDef<T> {
  kind: 'custom';
  field?: keyof T & string;
  render: (row: T) => ReactNode;
}

/**
 * Union type for all column definitions.
 */
export type ColumnDef<T> =
  | TextColumnDef<T>
  | DateColumnDef<T>
  | BooleanColumnDef<T>
  | ActionsColumnDef<T>
  | CustomColumnDef<T>;

// ============================================================================
// ACTION TYPES
// ============================================================================

/**
 * Row action definition.
 *
 * Actions appear in the actions column and can be clicked to perform
 * operations on individual rows.
 */
export interface ActionDef<T> {
  /** Unique identifier for this action */
  id: string;

  /** Label displayed to the user */
  label: string;

  /** Optional icon identifier or component */
  icon?: string | ReactNode;

  /** Whether to show confirmation dialog before executing (default: false) */
  confirm?: boolean;

  /** Callback invoked when action is clicked (after confirmation if required) */
  onClick: (row: T) => void | Promise<void>;

  /** Optional loading state during async operations */
  loading?: boolean;

  /** Optional disabled state */
  disabled?: boolean | ((row: T) => boolean);
}
