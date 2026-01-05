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
  FilterValue,
  Filters,
  // Column types
  ColumnDef,
  ColumnKind,
  BaseColumnDef,
  TextColumnDef,
  DateColumnDef,
  BooleanColumnDef,
  BadgeColumnDef,
  NumberColumnDef,
  ActionsColumnDef,
  CustomColumnDef,
  BadgeTone,
  // Action types
  ActionDef,
} from './types';

// Column helper factory
export { col } from './column-helpers';

// Components
export { RowaKitTable, SmartTable } from './components/SmartTable';
export type { SmartTableProps } from './components/SmartTable';

export const VERSION = '0.4.0';
