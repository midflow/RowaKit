/**
 * @rowakit/table
 *
 * Opinionated, server-side-first table component for internal/business apps.
 *
 * @packageDocumentation
 */

// Core types
export type {
  // Fetcher types
  Fetcher,
  FetcherQuery,
  FetcherResult,
  // Column types
  ColumnDef,
  ColumnKind,
  BaseColumnDef,
  TextColumnDef,
  DateColumnDef,
  BooleanColumnDef,
  ActionsColumnDef,
  CustomColumnDef,
  // Action types
  ActionDef,
} from './types';

// Column helper factory
export { col } from './column-helpers';

// Components
export { SmartTable } from './components/SmartTable';
export type { SmartTableProps } from './components/SmartTable';

export const VERSION = '0.1.0';
