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
  SortColumn,
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

// Export types
export type { Exporter, ExporterResult } from './types/export';

// Bulk actions
export type { BulkActionDef } from './components/BulkActionBar';

// Column helper factory
export { col } from './column-helpers';

// Components
export { RowaKitTable, SmartTable } from './components/SmartTable';
export type { SmartTableProps } from './components/SmartTable';

// Version injected at build time from package.json
declare const __ROWAKIT_TABLE_VERSION__: string | undefined;

export const VERSION = typeof __ROWAKIT_TABLE_VERSION__ !== 'undefined' 
  ? __ROWAKIT_TABLE_VERSION__ 
  : '0.6.0';
