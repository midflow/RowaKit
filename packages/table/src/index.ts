/**
 * @rowakit/table
 *
 * React Table Toolkit for server-side data: Table + QueryToolbar + ActionBar.
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

// Query Toolbar
export { QueryToolbar } from './components/query-toolbar';
export type { QueryToolbarProps } from './components/query-toolbar';

// Action Bar
export { ActionBar } from './components/action-bar';
export type { ActionBarProps, ActionBarAction } from './components/action-bar';

// Version injected at build time from package.json
declare const __ROWAKIT_TABLE_VERSION__: string | undefined;

export const VERSION =
	typeof __ROWAKIT_TABLE_VERSION__ !== 'undefined' ? __ROWAKIT_TABLE_VERSION__ : '1.0.0';
