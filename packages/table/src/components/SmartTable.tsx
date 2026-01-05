/**
 * RowaKit Table Component
 *
 * Core table rendering component that maps columns to table cells.
 * Handles all column types: text, date, boolean, actions, and custom.
 * Includes data fetching state machine with loading/error/empty states.
 *
 * @packageDocumentation
 */

import { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { Fetcher, ColumnDef, FetcherQuery, ActionDef, FilterValue, ActionsColumnDef } from '../types';

// ============================================================================
// COMPONENT PROPS
// ============================================================================

export interface SmartTableProps<T> {
  /** Server-side data fetcher function */
  fetcher: Fetcher<T>;

  /** Array of column definitions */
  columns: ColumnDef<T>[];

  /** Available page size options (default: [10, 20, 50]) */
  pageSizeOptions?: number[];

  /** Initial page size (default: 20) */
  defaultPageSize?: number;

  /** Function or field name to extract row key (default: uses 'id' field) */
  rowKey?: keyof T | ((row: T) => string | number);

  /** Optional CSS class name for the table container */
  className?: string;

  /** Enable filters (default: false) */
  enableFilters?: boolean;

  /** Stage C: Enable column resizing (default: false) */
  enableColumnResizing?: boolean;

  /** Stage C: Sync table state to URL query string (default: false) */
  syncToUrl?: boolean;

  /** Stage C: Enable saved views feature (default: false) */
  enableSavedViews?: boolean;
}

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

type FetchState = 'idle' | 'loading' | 'success' | 'empty' | 'error';

interface DataState<T> {
  state: FetchState;
  items: T[];
  total: number;
  error?: string;
}

/**
 * Confirmation state for actions that require confirmation.
 */
interface ConfirmState<T> {
  action: ActionDef<T>;
  row: T;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extract unique key from a row.
 */
function getRowKey<T>(row: T, rowKey?: keyof T | ((row: T) => string | number)): string | number {
  if (typeof rowKey === 'function') {
    return rowKey(row);
  }
  if (rowKey) {
    return String(row[rowKey]);
  }
  // Fallback to 'id' field if available
  if (row && typeof row === 'object' && 'id' in row) {
    return String(row.id);
  }
  // Last resort: use object reference (not ideal but safe)
  return String(row);
}

/**
 * Get header label for a column.
 */
function getHeaderLabel<T>(column: ColumnDef<T>): string {
  return column.header ?? column.id;
}

// ============================================================================
// PRD-04: SAVED VIEWS STORAGE HELPERS
// ============================================================================

interface SavedViewsIndex {
  name: string;
  updatedAt: number;
}

/**
 * Validate saved view name.
 * Rules: trim, 1–40 chars, reject control chars and `/\?%*:|"<>`
 */
function validateViewName(name: string): { valid: boolean; error?: string } {
  const trimmed = name.trim();
  
  if (trimmed.length === 0) {
    return { valid: false, error: 'Name cannot be empty' };
  }
  
  if (trimmed.length > 40) {
    return { valid: false, error: 'Name cannot exceed 40 characters' };
  }
  
  // Reject control chars and special chars
  const invalidChars = /[/\\?%*:|"<>\x00-\x1f\x7f]/;
  if (invalidChars.test(trimmed)) {
    return { valid: false, error: 'Name contains invalid characters' };
  }
  
  return { valid: true };
}

/**
 * Get saved views index from storage.
 * If missing, scan localStorage for rowakit-view-* keys and rebuild index.
 */
function getSavedViewsIndex(): SavedViewsIndex[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return [];
  }

  try {
    const indexStr = localStorage.getItem('rowakit-views-index');
    if (indexStr) {
      const index = JSON.parse(indexStr) as SavedViewsIndex[];
      if (Array.isArray(index)) {
        return index;
      }
    }
  } catch {
    // Ignore parse errors
  }

  // Rebuild index from existing keys
  const rebuilt: SavedViewsIndex[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('rowakit-view-')) {
        const name = key.substring('rowakit-view-'.length);
        rebuilt.push({
          name,
          updatedAt: Date.now(),
        });
      }
    }
  } catch {
    // Ignore iteration errors
  }

  return rebuilt;
}

/**
 * Save views index to storage.
 */
function setSavedViewsIndex(index: SavedViewsIndex[]): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    localStorage.setItem('rowakit-views-index', JSON.stringify(index));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Load all saved views from storage.
 * Parses index and reads each view, skipping corrupt entries.
 */
function loadSavedViewsFromStorage(): Array<{
  name: string;
  state: {
    page: number;
    pageSize: number;
    sort?: { field: string; direction: 'asc' | 'desc' };
    filters?: Record<string, FilterValue | undefined>;
    columnWidths?: Record<string, number>;
  };
}> {
  if (typeof window === 'undefined' || !window.localStorage) {
    return [];
  }

  const index = getSavedViewsIndex();
  const views = [];

  for (const entry of index) {
    try {
      const viewStr = localStorage.getItem(`rowakit-view-${entry.name}`);
      if (viewStr) {
        const state = JSON.parse(viewStr);
        views.push({
          name: entry.name,
          state,
        });
      }
    } catch {
      // Skip corrupt entries
    }
  }

  return views;
}

// ============================================================================
// PRD-05: URL STATE PARSING & SERIALIZATION
// ============================================================================

/**
 * Parse URL search parameters into table state.
 * Validates all values according to PRD-05 rules:
 * - page >= 1
 * - pageSize from options or defaultPageSize
 * - sortDirection only asc|desc
 * - filters must be object
 * - columnWidths must be object of numbers
 */
function parseUrlState(
  params: URLSearchParams,
  defaultPageSize: number,
  pageSizeOptions?: number[]
): {
  page: number;
  pageSize: number;
  sort?: { field: string; direction: 'asc' | 'desc' };
  filters?: Record<string, FilterValue | undefined>;
  columnWidths?: Record<string, number>;
} {
  // Parse page (default 1, must be >= 1)
  const pageStr = params.get('page');
  let page = 1;
  if (pageStr) {
    const parsed = parseInt(pageStr, 10);
    page = !isNaN(parsed) && parsed >= 1 ? parsed : 1;
  }

  // Parse pageSize (must be valid or use default)
  const pageSizeStr = params.get('pageSize');
  let pageSize = defaultPageSize;
  if (pageSizeStr) {
    const parsed = parseInt(pageSizeStr, 10);
    if (!isNaN(parsed) && parsed >= 1) {
      // If pageSizeOptions provided, validate against it; otherwise accept
      if (pageSizeOptions && pageSizeOptions.length > 0) {
        pageSize = pageSizeOptions.includes(parsed) ? parsed : defaultPageSize;
      } else {
        pageSize = parsed;
      }
    }
  }

  const result: {
    page: number;
    pageSize: number;
    sort?: { field: string; direction: 'asc' | 'desc' };
    filters?: Record<string, FilterValue | undefined>;
    columnWidths?: Record<string, number>;
  } = { page, pageSize };

  // Parse sort (only if both field and valid direction present)
  const sortField = params.get('sortField');
  const sortDir = params.get('sortDirection');
  if (sortField && (sortDir === 'asc' || sortDir === 'desc')) {
    result.sort = { field: sortField, direction: sortDir };
  }

  // Parse filters (must be valid JSON object)
  const filtersStr = params.get('filters');
  if (filtersStr) {
    try {
      const parsed = JSON.parse(filtersStr);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        result.filters = parsed;
      }
    } catch {
      // Ignore invalid filters
    }
  }

  // Parse columnWidths (must be valid JSON object with number values)
  const widthsStr = params.get('columnWidths');
  if (widthsStr) {
    try {
      const parsed = JSON.parse(widthsStr);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        // Validate all values are numbers
        const widths: Record<string, number> = {};
        for (const [key, value] of Object.entries(parsed)) {
          if (typeof value === 'number' && value > 0) {
            widths[key] = value;
          }
        }
        if (Object.keys(widths).length > 0) {
          result.columnWidths = widths;
        }
      }
    } catch {
      // Ignore invalid column widths
    }
  }

  return result;
}

/**
 * Serialize table state to URL search parameters.
 * Omits empty/default values to keep URLs short.
 * PRD-05: Only includes columnWidths if enableColumnResizing is true.
 */
function serializeUrlState(
  query: FetcherQuery,
  filters: Record<string, FilterValue | undefined>,
  columnWidths: Record<string, number>,
  defaultPageSize: number,
  enableColumnResizing: boolean
): string {
  const params = new URLSearchParams();

  // Always include page (even if 1, for clarity)
  params.set('page', String(query.page));
  
  // Only include pageSize if different from default
  if (query.pageSize !== defaultPageSize) {
    params.set('pageSize', String(query.pageSize));
  }

  // Include sort if present
  if (query.sort) {
    params.set('sortField', query.sort.field);
    params.set('sortDirection', query.sort.direction);
  }

  // Include filters if non-empty
  if (filters && Object.keys(filters).length > 0) {
    const nonEmptyFilters = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== undefined)
    );
    if (Object.keys(nonEmptyFilters).length > 0) {
      params.set('filters', JSON.stringify(nonEmptyFilters));
    }
  }

  // Include columnWidths only if resizing enabled and widths exist
  if (enableColumnResizing && Object.keys(columnWidths).length > 0) {
    params.set('columnWidths', JSON.stringify(columnWidths));
  }

  return params.toString();
}

function renderCell<T>(
  column: ColumnDef<T>,
  row: T,
  isLoading: boolean,
  setConfirmState: (state: ConfirmState<T> | null) => void
): ReactNode {
  switch (column.kind) {
    case 'text': {
      const value = row[column.field];
      if (column.format) {
        return column.format(value);
      }
      return String(value ?? '');
    }

    case 'date': {
      const value = row[column.field];
      if (column.format) {
        return column.format(value as Date | string | number);
      }
      // Default date formatting
      if (value instanceof Date) {
        return value.toLocaleDateString();
      }
      if (typeof value === 'string' || typeof value === 'number') {
        return new Date(value).toLocaleDateString();
      }
      return '';
    }

    case 'boolean': {
      const value = row[column.field];
      if (column.format) {
        return column.format(Boolean(value));
      }
      // Default boolean formatting
      return value ? 'Yes' : 'No';
    }

    case 'badge': {
      const value = row[column.field];
      const valueStr = String(value ?? '');
      
      // Look up mapping
      const mapped = column.map?.[valueStr];
      const label = mapped?.label ?? valueStr;
      const tone = mapped?.tone ?? 'neutral';
      
      return (
        <span className={`rowakit-badge rowakit-badge-${tone}`}>
          {label}
        </span>
      );
    }

    case 'number': {
      const value = row[column.field];
      const numValue = Number(value ?? 0);
      
      if (column.format) {
        if (typeof column.format === 'function') {
          return column.format(numValue, row);
        }
        // Intl.NumberFormatOptions
        return new Intl.NumberFormat(undefined, column.format).format(numValue);
      }
      
      // Default number formatting
      return numValue.toLocaleString();
    }

    case 'actions': {
      const columnWithActions = column as ActionsColumnDef<T>;
      // Safety check: ensure actions is an array
      if (!Array.isArray(columnWithActions.actions)) {
        return null;
      }
      return (
        <div className="rowakit-table-actions">
          {columnWithActions.actions.map((action) => {
            const isDisabled =
              isLoading ||
              action.disabled === true ||
              (typeof action.disabled === 'function' && action.disabled(row));

            const handleClick = () => {
              if (isDisabled || action.loading) {
                return;
              }

              // If action requires confirmation, show modal
              if (action.confirm) {
                setConfirmState({ action, row });
              } else {
                // Execute action directly
                void action.onClick(row);
              }
            };

            return (
              <button
                key={action.id}
                onClick={handleClick}
                disabled={isDisabled || action.loading}
                type="button"
                className="rowakit-button rowakit-button-secondary"
              >
                {action.icon && typeof action.icon === 'string' ? (
                  <span>{action.icon}</span>
                ) : (
                  action.icon
                )}
                {action.label}
              </button>
            );
          })}
        </div>
      );
    }

    case 'custom': {
      return column.render(row);
    }

    default: {
      // Exhaustive check
      const _exhaustive: never = column;
      return _exhaustive;
    }
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * RowaKitTable - Server-side table component for internal/business apps.
 *
 * This component renders a table with headers and body based on column definitions.
 * It handles all column types (text, date, boolean, actions, custom) and provides
 * a clean API for defining table structure.
 *
 * Features:
 * - Automatic data fetching on mount and query changes
 * - Loading, error, and empty states
 * - Stale request handling
 * - Retry on error
 *
 * @example
 * ```tsx
 * import { RowaKitTable, col } from '@rowakit/table';
 *
 * interface User {
 *   id: string;
 *   name: string;
 *   email: string;
 *   createdAt: Date;
 *   active: boolean;
 * }
 *
 * const fetchUsers: Fetcher<User> = async (query) => {
 *   const response = await fetch(`/api/users?page=${query.page}&pageSize=${query.pageSize}`);
 *   return response.json();
 * };
 *
 * function UsersTable() {
 *   return (
 *     <RowaKitTable
 *       fetcher={fetchUsers}
 *       columns={[
 *         col.text('name', { header: 'Name', sortable: true }),
 *         col.text('email', { header: 'Email' }),
 *         col.date('createdAt', { header: 'Created' }),
 *         col.boolean('active', { header: 'Active' }),
 *         col.actions([
 *           { id: 'edit', label: 'Edit', onClick: (user) => editUser(user) },
 *           { id: 'delete', label: 'Delete', confirm: true, onClick: (user) => deleteUser(user) }
 *         ])
 *       ]}
 *       defaultPageSize={20}
 *       rowKey="id"
 *     />
 *   );
 * }
 * ```
 */
export function RowaKitTable<T>({
  fetcher,
  columns,
  defaultPageSize = 20,
  pageSizeOptions = [10, 20, 50],
  rowKey,
  className = '',
  enableFilters = false,
  enableColumnResizing = false,
  syncToUrl = false,
  enableSavedViews = false,
}: SmartTableProps<T>) {
  // State management
  const [dataState, setDataState] = useState<DataState<T>>({
    state: 'idle',
    items: [],
    total: 0,
  });

  const [query, setQuery] = useState<FetcherQuery>({
    page: 1,
    pageSize: defaultPageSize,
  });

  // Filter state (field -> FilterValue)
  const [filters, setFilters] = useState<Record<string, FilterValue | undefined>>({});

  // Stage C: Column widths for resizing
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});

  // Stage C: Refs for resize optimization
  const resizeRafRef = useRef<number | null>(null);
  const resizePendingRef = useRef<{ colId: string; width: number } | null>(null);
  const tableRef = useRef<HTMLTableElement | null>(null);

  // PRD-01: Prevent accidental sort during resize
  const isResizingRef = useRef(false);
  const lastResizeEndTsRef = useRef(0);
  const resizingColIdRef = useRef<string | null>(null);
  const didHydrateUrlRef = useRef(false);
  const didSkipInitialUrlSyncRef = useRef(false);

  // PRD-05: URL sync debounce ref (for columnWidths)
  const urlSyncDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Stage C: Saved views
  const [savedViews, setSavedViews] = useState<Array<{
    name: string;
    state: {
      page: number;
      pageSize: number;
      sort?: { field: string; direction: 'asc' | 'desc' };
      filters?: Record<string, FilterValue | undefined>;
      columnWidths?: Record<string, number>;
    };
  }>>([]);

  // PRD-04: Save view form state
  const [showSaveViewForm, setShowSaveViewForm] = useState(false);
  const [saveViewInput, setSaveViewInput] = useState('');
  const [saveViewError, setSaveViewError] = useState<string>('');
  const [overwriteConfirmName, setOverwriteConfirmName] = useState<string | null>(null);

  // PRD-04: Hydrate saved views on mount
  useEffect(() => {
    if (!enableSavedViews) return;

    const views = loadSavedViewsFromStorage();
    setSavedViews(views);
  }, [enableSavedViews]);

  // Confirmation state for actions that require confirmation
  const [confirmState, setConfirmState] = useState<ConfirmState<T> | null>(null);

  // Request tracking to ignore stale responses
  const requestIdRef = useRef(0);

  // Stage C: Sync to URL on query changes (PRD-05: Validated and debounced)
  useEffect(() => {
    if (!syncToUrl) {
      didSkipInitialUrlSyncRef.current = false;
      return;
    }

    // IMPORTANT: On mount, do not overwrite the incoming URL before
    // `parseUrlState` has a chance to read it.
    if (!didSkipInitialUrlSyncRef.current) {
      didSkipInitialUrlSyncRef.current = true;
      return;
    }

    // Clear any pending debounce
    if (urlSyncDebounceRef.current) {
      clearTimeout(urlSyncDebounceRef.current);
      urlSyncDebounceRef.current = null;
    }

    // Query/sort/filter changes: write immediately
    const urlStr = serializeUrlState(query, filters, columnWidths, defaultPageSize, enableColumnResizing);
    window.history.replaceState(null, '', `?${urlStr}`);
  }, [query, filters, syncToUrl, enableColumnResizing, defaultPageSize]);

  // PRD-05: Debounce columnWidths updates (150ms) while resizing
  useEffect(() => {
    if (!syncToUrl || !enableColumnResizing) return;

    // Skip initial mount so we don't clobber URL before parsing.
    if (!didSkipInitialUrlSyncRef.current) return;

    // Clear any pending debounce
    if (urlSyncDebounceRef.current) {
      clearTimeout(urlSyncDebounceRef.current);
    }

    // Schedule debounced URL update for columnWidths
    urlSyncDebounceRef.current = setTimeout(() => {
      const urlStr = serializeUrlState(query, filters, columnWidths, defaultPageSize, enableColumnResizing);
      window.history.replaceState(null, '', `?${urlStr}`);
      urlSyncDebounceRef.current = null;
    }, 150);

    // Cleanup on unmount
    return () => {
      if (urlSyncDebounceRef.current) {
        clearTimeout(urlSyncDebounceRef.current);
        urlSyncDebounceRef.current = null;
      }
    };
  }, [columnWidths, syncToUrl, enableColumnResizing, query, filters, defaultPageSize]);

  // Stage C: Load from URL on mount (PRD-05: Validated parsing)
  useEffect(() => {
    if (!syncToUrl) {
      // If URL sync is disabled, allow future re-hydration if re-enabled.
      didHydrateUrlRef.current = false;
      return;
    }
    if (didHydrateUrlRef.current) return;
    didHydrateUrlRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const parsed = parseUrlState(params, defaultPageSize, pageSizeOptions);

    setQuery({
      page: parsed.page,
      pageSize: parsed.pageSize,
      sort: parsed.sort,
      filters: parsed.filters,
    });

    if (parsed.filters) {
      setFilters(parsed.filters);
    }

    if (parsed.columnWidths && enableColumnResizing) {
      // Clamp URL widths by per-column min/max so a stale/malicious URL can't
      // make a column unusably tiny (e.g. "Product Name" showing only "P").
      const clamped: Record<string, number> = {};
      for (const [colId, rawWidth] of Object.entries(parsed.columnWidths)) {
        const widthNum = typeof rawWidth === 'number' ? rawWidth : Number(rawWidth);
        if (!Number.isFinite(widthNum)) continue;

        const colDef = columns.find((c) => c.id === colId);
        if (!colDef) continue;

        const minW = colDef.minWidth ?? 80;
        const maxW = colDef.maxWidth;

        let finalW = Math.max(minW, widthNum);
        if (maxW != null) {
          finalW = Math.min(finalW, maxW);
        }
        clamped[colId] = finalW;
      }

      setColumnWidths(clamped);
    }
    // If URL doesn't provide widths, keep `columnWidths` empty and allow
    // defaults from `column.width` to apply.
  }, [syncToUrl, defaultPageSize, enableColumnResizing, pageSizeOptions, columns]);

  // Sync filters to query (and reset page to 1 when filters change)
  useEffect(() => {
    if (!enableFilters) return;

    // Build filters object, excluding undefined values
    const activeFilters: Record<string, FilterValue> = {};
    let hasFilters = false;
    
    for (const [field, value] of Object.entries(filters)) {
      if (value !== undefined) {
        activeFilters[field] = value;
        hasFilters = true;
      }
    }

    // Per spec: filters must be undefined when empty (not {})
    const filtersToSend = hasFilters ? activeFilters : undefined;

    setQuery((prev) => ({
      ...prev,
      filters: filtersToSend,
      page: 1, // Reset page to 1 when filters change
    }));
  }, [filters, enableFilters]);

  // Fetch data effect
  useEffect(() => {
    const currentRequestId = ++requestIdRef.current;

    setDataState((prev) => ({ ...prev, state: 'loading' }));

    fetcher(query)
      .then((result) => {
        // Ignore stale responses
        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        if (result.items.length === 0) {
          setDataState({
            state: 'empty',
            items: [],
            total: result.total,
          });
        } else {
          setDataState({
            state: 'success',
            items: result.items,
            total: result.total,
          });
        }
      })
      .catch((error: unknown) => {
        // Ignore stale responses
        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        setDataState({
          state: 'error',
          items: [],
          total: 0,
          error: error instanceof Error ? error.message : 'Failed to load data',
        });
      });
  }, [fetcher, query]);

  // Retry handler
  const handleRetry = () => {
    // Force re-fetch by updating query reference
    setQuery({ ...query });
  };

  // Pagination handlers
  const handlePreviousPage = () => {
    if (query.page > 1) {
      setQuery((prev) => ({ ...prev, page: prev.page - 1 }));
    }
  };

  const handleNextPage = () => {
    const totalPages = Math.ceil(dataState.total / query.pageSize);
    if (query.page < totalPages) {
      setQuery((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setQuery({ ...query, pageSize: newPageSize, page: 1 });
  };

  // Sorting handler
  const handleSort = (field: string) => {
    setQuery((prev) => {
      // If sorting by a different field, start with ascending
      if (prev.sort?.field !== field) {
        return { ...prev, sort: { field, direction: 'asc' }, page: 1 };
      }

      // Toggle sort direction for the same field
      if (prev.sort.direction === 'asc') {
        return { ...prev, sort: { field, direction: 'desc' }, page: 1 };
      }

      // Remove sort (back to unsorted)
      const { sort: _sort, ...rest } = prev;
      return { ...rest, page: 1 };
    });
  };

  // Get sort indicator for a column
  const getSortIndicator = (field: string): string => {
    if (!query.sort || query.sort.field !== field) {
      return '';
    }
    return query.sort.direction === 'asc' ? ' ↑' : ' ↓';
  };

  // Stage C: Schedule column width update (RAF throttle)
  const scheduleColumnWidthUpdate = (colId: string, width: number) => {
    resizePendingRef.current = { colId, width };

    if (resizeRafRef.current != null) return;

    resizeRafRef.current = requestAnimationFrame(() => {
      resizeRafRef.current = null;

      const pending = resizePendingRef.current;
      if (!pending) return;

      handleColumnResize(pending.colId, pending.width);
    });
  };

  // Stage C: Column resize handler
  const handleColumnResize = (columnId: string, newWidth: number) => {
    // Enforce minimum width
    const minWidth = columns.find(c => c.id === columnId)?.minWidth ?? 80;
    const maxWidth = columns.find(c => c.id === columnId)?.maxWidth;
    
    let finalWidth = Math.max(minWidth, newWidth);
    if (maxWidth) {
      finalWidth = Math.min(finalWidth, maxWidth);
    }
    
    // PRD-03: Guard against unchanged widths to avoid extra renders
    if (columnWidths[columnId] === finalWidth) {
      return;
    }

    setColumnWidths((prev) => ({
      ...prev,
      [columnId]: finalWidth,
    }));
  };

  // Stage C: Column resize drag handler
  // PRD-02: Now uses Pointer Events for mouse + touch + pen support
  const autoFitColumnWidth = (columnId: string) => {
    const tableEl = tableRef.current;
    if (!tableEl) return;

    const th = tableEl.querySelector(`th[data-col-id="${columnId}"]`) as HTMLTableCellElement | null;
    if (!th) return;

    const tds = Array.from(
      tableEl.querySelectorAll(`td[data-col-id="${columnId}"]`),
    ) as HTMLTableCellElement[];

    const headerW = th.scrollWidth;
    const cellsMaxW = tds.reduce((max, td) => Math.max(max, td.scrollWidth), 0);

    const padding = 24; // buffer for padding + sort icon
    const raw = Math.max(headerW, cellsMaxW) + padding;

    const colDef = columns.find((c) => c.id === columnId);
    const minW = colDef?.minWidth ?? 80;
    const maxW = colDef?.maxWidth ?? 600;

    const finalW = Math.max(minW, Math.min(raw, maxW));
    setColumnWidths((prev) => ({ ...prev, [columnId]: finalW }));
  };

  const startColumnResize = (e: React.PointerEvent<HTMLDivElement>, columnId: string) => {
    e.preventDefault();
    e.stopPropagation(); // PRD-01: Prevent sort bubbling

    // Double-click auto-fit: handle via pointerdown.detail to avoid relying on
    // onDoubleClick sequencing in presence of pointer capture.
    if (e.detail === 2) {
      autoFitColumnWidth(columnId);
      return;
    }

    // PRD-02: Button gating for mouse pointer (require primary button)
    if (e.pointerType === 'mouse' && e.buttons !== 1) {
      return;
    }

    // Save currentTarget reference before event becomes stale
    const target = e.currentTarget;
    const pointerId = e.pointerId;

    // PRD-02: Acquire pointer capture on the handle element
    try {
      target.setPointerCapture(pointerId);
    } catch {
      // setPointerCapture may not be available in test environment
    }

    // PRD-01: Mark as resizing
    isResizingRef.current = true;
    resizingColIdRef.current = columnId;
    
    const startX = e.clientX;
    const th = (target.parentElement as HTMLTableCellElement);
    
    // Get the actual width of current column
    // (either from state if resized, or from offsetWidth if auto)
    let startWidth = columnWidths[columnId] ?? th.offsetWidth;

    // If current column is too small (< 80px), use a minimum base width
    // to ensure we always have enough space to drag comfortably
    const MIN_DRAG_WIDTH = 80;
    if (startWidth < MIN_DRAG_WIDTH) {
      // Try to get a usable width from next column or use fallback
      const nextTh = th.nextElementSibling as HTMLTableCellElement | null;
      if (nextTh && nextTh.offsetWidth >= 50) {
        startWidth = nextTh.offsetWidth;
      } else {
        // Fallback: use 100px as a comfortable base for dragging
        startWidth = 100;
      }
    }

    // Prevent text selection during drag
    document.body.classList.add('rowakit-resizing');

    // PRD-02: Use pointer events instead of mouse events
    const handlePointerMove = (moveEvent: PointerEvent) => {
      const delta = moveEvent.clientX - startX;
      const newWidth = startWidth + delta;
      // Use RAF throttle for smooth performance
      scheduleColumnWidthUpdate(columnId, newWidth);
    };

    const cleanupResize = () => {
      target.removeEventListener('pointermove', handlePointerMove);
      target.removeEventListener('pointerup', handlePointerUp);
      target.removeEventListener('pointercancel', handlePointerCancel);
      
      // Re-enable text selection
      document.body.classList.remove('rowakit-resizing');
      
      // PRD-01: Mark resize as complete and set suppression window
      isResizingRef.current = false;
      resizingColIdRef.current = null;
      lastResizeEndTsRef.current = Date.now();

      // PRD-02: Release pointer capture
      try {
        target.releasePointerCapture(pointerId);
      } catch {
        // Already released or pointer no longer active
      }
    };

    const handlePointerUp = () => {
      cleanupResize();
    };

    const handlePointerCancel = () => {
      cleanupResize();
    };

    target.addEventListener('pointermove', handlePointerMove);
    target.addEventListener('pointerup', handlePointerUp);
    target.addEventListener('pointercancel', handlePointerCancel);
  };

  // Stage C: Double-click to auto-fit content
  // PRD-02: Updated signature to match PointerEvent handler pattern
  const handleColumnResizeDoubleClick = (e: React.MouseEvent<HTMLDivElement>, columnId: string) => {
    e.preventDefault();
    e.stopPropagation(); // PRD-01: Prevent sort bubbling from double-click

    autoFitColumnWidth(columnId);
  };

  // Stage C: Saved views handlers
  const saveCurrentView = (name: string) => {
    const viewState = {
      page: query.page,
      pageSize: query.pageSize,
      sort: query.sort,
      filters: query.filters,
      columnWidths: enableColumnResizing ? columnWidths : undefined,
    };

    setSavedViews((prev) => {
      const filtered = prev.filter((v) => v.name !== name);
      return [...filtered, { name, state: viewState }];
    });

    // PRD-04: Update storage with index
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        // Save the view
        localStorage.setItem(`rowakit-view-${name}`, JSON.stringify(viewState));
        
        // Update index
        const index = getSavedViewsIndex();
        const filtered = index.filter((v) => v.name !== name);
        filtered.push({ name, updatedAt: Date.now() });
        setSavedViewsIndex(filtered);
      } catch {
        // Ignore storage errors
      }
    }
  };

  const loadSavedView = (name: string) => {
    const view = savedViews.find((v) => v.name === name);
    if (!view) return;

    const { state } = view;
    setQuery({
      page: state.page,
      pageSize: state.pageSize,
      sort: state.sort,
      filters: state.filters,
    });

    // Also update the filters state to keep input fields in sync
    setFilters(state.filters ?? {});

    if (state.columnWidths && enableColumnResizing) {
      setColumnWidths(state.columnWidths);
    }
  };

  const deleteSavedView = (name: string) => {
    setSavedViews((prev) => prev.filter((v) => v.name !== name));
    
    // PRD-04: Remove from storage and index
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.removeItem(`rowakit-view-${name}`);
        
        // Update index
        const index = getSavedViewsIndex();
        const filtered = index.filter((v) => v.name !== name);
        setSavedViewsIndex(filtered);
      } catch {
        // Ignore storage errors
      }
    }
  };

  const resetTableState = () => {
    setQuery({
      page: 1,
      pageSize: defaultPageSize,
    });
    setFilters({});
    setColumnWidths({});
  };

  // Helper function to apply filterTransform to filter values for number columns
  const transformFilterValueForColumn = (
    column: ColumnDef<T> | undefined,
    value: FilterValue | undefined,
  ): FilterValue | undefined => {
    if (!value || column?.kind !== 'number') {
      return value;
    }

    const numberColumn = column as ColumnDef<T> & {
      filterTransform?: (input: number) => number;
    };

    if (!numberColumn.filterTransform) {
      return value;
    }

    if (value.op === 'equals' && typeof value.value === 'number') {
      return {
        ...value,
        value: numberColumn.filterTransform(value.value),
      };
    }

    if (value.op === 'range' && typeof value.value === 'object') {
      const { from, to } = value.value;
      return {
        op: 'range',
        value: {
          from:
            from !== undefined && typeof from === 'number'
              ? numberColumn.filterTransform(from)
              : from,
          to:
            to !== undefined && typeof to === 'number'
              ? numberColumn.filterTransform(to)
              : to,
        },
      };
    }

    return value;
  };

  // Filter handlers
  const handleFilterChange = (field: string, value: FilterValue | undefined) => {
    // Stage C: Apply filter transform if defined
    const column = columns.find(c => c.id === field);
    const transformedValue = transformFilterValueForColumn(column, value);

    setFilters((prev) => ({
      ...prev,
      [field]: transformedValue,
    }));
  };

  const handleClearFilter = (field: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[field];
      return newFilters;
    });
  };

  const handleClearAllFilters = () => {
    setFilters({});
  };

  const isLoading = dataState.state === 'loading';
  const isError = dataState.state === 'error';
  const isEmpty = dataState.state === 'empty';
  const totalPages = Math.ceil(dataState.total / query.pageSize);
  const canGoPrevious = query.page > 1 && !isLoading;
  const canGoNext = query.page < totalPages && !isLoading;

  const hasActiveFilters = enableFilters && Object.values(filters).some(v => v !== undefined);

  // PRD-03: Apply fixed layout class when resizing is enabled
  const containerClass = [
    'rowakit-table',
    enableColumnResizing ? 'rowakit-layout-fixed' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClass}>
      {enableSavedViews && (
        <div className="rowakit-saved-views-group">
          {!showSaveViewForm ? (
            <button
              onClick={() => {
                setShowSaveViewForm(true);
                setSaveViewInput('');
                setSaveViewError('');
                setOverwriteConfirmName(null);
              }}
              className="rowakit-saved-view-button"
              type="button"
            >
              Save View
            </button>
          ) : (
            <div className="rowakit-save-view-form">
              {overwriteConfirmName ? (
                <div className="rowakit-save-view-confirm">
                  <p>View "{overwriteConfirmName}" already exists. Overwrite?</p>
                  <button
                    onClick={() => {
                      saveCurrentView(overwriteConfirmName);
                      setShowSaveViewForm(false);
                      setSaveViewInput('');
                      setSaveViewError('');
                      setOverwriteConfirmName(null);
                    }}
                    className="rowakit-saved-view-button"
                    type="button"
                  >
                    Overwrite
                  </button>
                  <button
                    onClick={() => {
                      setOverwriteConfirmName(null);
                    }}
                    className="rowakit-saved-view-button"
                    type="button"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    value={saveViewInput}
                    onChange={(e) => {
                      setSaveViewInput(e.target.value);
                      setSaveViewError('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        // Validate and save
                        const validation = validateViewName(saveViewInput);
                        if (!validation.valid) {
                          setSaveViewError(validation.error || 'Invalid name');
                          return;
                        }

                        // Check if exists
                        if (savedViews.some((v) => v.name === saveViewInput.trim())) {
                          setOverwriteConfirmName(saveViewInput.trim());
                        } else {
                          saveCurrentView(saveViewInput.trim());
                          setShowSaveViewForm(false);
                          setSaveViewInput('');
                          setSaveViewError('');
                        }
                      }
                    }}
                    placeholder="Enter view name..."
                    className="rowakit-save-view-input"
                  />
                  {saveViewError && (
                    <div className="rowakit-save-view-error">{saveViewError}</div>
                  )}
                  <button
                    onClick={() => {
                      const validation = validateViewName(saveViewInput);
                      if (!validation.valid) {
                        setSaveViewError(validation.error || 'Invalid name');
                        return;
                      }

                      // Check if exists
                      if (savedViews.some((v) => v.name === saveViewInput.trim())) {
                        setOverwriteConfirmName(saveViewInput.trim());
                      } else {
                        saveCurrentView(saveViewInput.trim());
                        setShowSaveViewForm(false);
                        setSaveViewInput('');
                        setSaveViewError('');
                      }
                    }}
                    className="rowakit-saved-view-button"
                    type="button"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setShowSaveViewForm(false);
                      setSaveViewInput('');
                      setSaveViewError('');
                    }}
                    className="rowakit-saved-view-button"
                    type="button"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          )}
          {savedViews.map((view) => (
            <div key={view.name} className="rowakit-saved-view-item">
              <button
                onClick={() => loadSavedView(view.name)}
                className="rowakit-saved-view-button"
                type="button"
              >
                {view.name}
              </button>
              <button
                onClick={() => deleteSavedView(view.name)}
                className="rowakit-saved-view-button rowakit-saved-view-button-delete"
                type="button"
                title="Delete this view"
              >
                ×
              </button>
            </div>
          ))}
          {(hasActiveFilters || query.page > 1 || query.sort) && (
            <button
              onClick={resetTableState}
              className="rowakit-saved-view-button"
              type="button"
            >
              Reset
            </button>
          )}
        </div>
      )}
      {hasActiveFilters && (
        <div className="rowakit-table-filter-controls">
          <button
            onClick={handleClearAllFilters}
            className="rowakit-button rowakit-button-secondary"
            type="button"
          >
            Clear all filters
          </button>
        </div>
      )}
      <table ref={tableRef}>
        <thead>
          <tr>
            {columns.map((column) => {
              const isSortable = column.kind !== 'actions' && 
                                 (column.kind === 'custom' ? false : column.sortable === true);
              const field = column.kind === 'actions' ? '' : 
                           column.kind === 'custom' ? column.field : 
                           column.field;

              const isResizable = enableColumnResizing && column.kind !== 'actions';
              // Use resized width first, then fall back to column.width definition
              const actualWidth = columnWidths[column.id] ?? column.width;

              return (
                <th
                  key={column.id}
                  data-col-id={column.id}
                  onClick={isSortable ? () => {
                    // PRD-01: Suppress sort if resizing or during suppression window
                    if (isResizingRef.current) return;
                    if (Date.now() - lastResizeEndTsRef.current < 150) return;
                    handleSort(String(field));
                  } : undefined}
                  role={isSortable ? 'button' : undefined}
                  tabIndex={isSortable ? 0 : undefined}
                  onKeyDown={isSortable ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSort(String(field));
                    }
                  } : undefined}
                  aria-sort={
                    isSortable && query.sort?.field === String(field)
                      ? query.sort.direction === 'asc' ? 'ascending' : 'descending'
                      : undefined
                  }
                  style={{
                    width: actualWidth != null ? `${actualWidth}px` : undefined,
                    textAlign: column.align,
                    position: isResizable ? 'relative' : undefined,
                  }}
                  // PRD-03: Re-enable truncation for resizable columns (now safe with fixed layout)
                  className={[
                    column.truncate ? 'rowakit-cell-truncate' : '',
                    resizingColIdRef.current === column.id ? 'resizing' : '' // PRD-01
                  ].filter(Boolean).join(' ') || undefined}
                >
                  {getHeaderLabel(column)}{isSortable && getSortIndicator(String(field))}
                  {isResizable && (
                    <div
                      className="rowakit-column-resize-handle"
                      onPointerDown={(e) => startColumnResize(e, column.id)}
                      onDoubleClick={(e) => handleColumnResizeDoubleClick(e, column.id)}
                      title="Drag to resize | Double-click to auto-fit content"
                    />
                  )}
                </th>
              );
            })}
          </tr>
          {enableFilters && (
            <tr className="rowakit-table-filter-row">
              {columns.map((column) => {
                const field = column.kind === 'actions' || column.kind === 'custom' ? '' : String(column.field);
                const canFilter = field && column.kind !== 'actions';
                
                if (!canFilter) {
                  return <th key={column.id}></th>;
                }

                const filterValue = filters[field];

                // Badge column: select with options
                if (column.kind === 'badge') {
                  const options = column.map ? Object.keys(column.map) : [];
                  return (
                    <th key={column.id}>
                      <select
                        className="rowakit-filter-select"
                        value={filterValue?.op === 'equals' ? String(filterValue.value ?? '') : ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '') {
                            handleClearFilter(field);
                          } else {
                            handleFilterChange(field, { op: 'equals', value });
                          }
                        }}
                      >
                        <option value="">All</option>
                        {options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </th>
                  );
                }

                // Boolean column: select with True/False/All
                if (column.kind === 'boolean') {
                  return (
                    <th key={column.id}>
                      <select
                        className="rowakit-filter-select"
                        value={
                          filterValue?.op === 'equals' && typeof filterValue.value === 'boolean'
                            ? String(filterValue.value)
                            : ''
                        }
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '') {
                            handleClearFilter(field);
                          } else {
                            handleFilterChange(field, { op: 'equals', value: value === 'true' });
                          }
                        }}
                      >
                        <option value="">All</option>
                        <option value="true">True</option>
                        <option value="false">False</option>
                      </select>
                    </th>
                  );
                }

                // Date column: from/to inputs
                if (column.kind === 'date') {
                  const fromValue = filterValue?.op === 'range' ? filterValue.value.from ?? '' : '';
                  const toValue = filterValue?.op === 'range' ? filterValue.value.to ?? '' : '';
                  
                  return (
                    <th key={column.id}>
                      <div className="rowakit-filter-date-range">
                        <input
                          type="date"
                          className="rowakit-filter-input"
                          placeholder="From"
                          value={fromValue}
                          onChange={(e) => {
                            const from = e.target.value || undefined;
                            const to = toValue || undefined;
                            if (!from && !to) {
                              handleClearFilter(field);
                            } else {
                              handleFilterChange(field, { op: 'range', value: { from, to } });
                            }
                          }}
                        />
                        <input
                          type="date"
                          className="rowakit-filter-input"
                          placeholder="To"
                          value={toValue}
                          onChange={(e) => {
                            const to = e.target.value || undefined;
                            const from = fromValue || undefined;
                            if (!from && !to) {
                              handleClearFilter(field);
                            } else {
                              handleFilterChange(field, { op: 'range', value: { from, to } });
                            }
                          }}
                        />
                      </div>
                    </th>
                  );
                }

                // Text/Number column: text or number input
                const isNumberColumn = column.kind === 'number';
                
                // Stage C: Number column can use range filter
                if (isNumberColumn) {
                  const fromValue = filterValue?.op === 'range' ? String(filterValue.value.from ?? '') : 
                                   filterValue?.op === 'equals' && typeof filterValue.value === 'number' ? String(filterValue.value) : '';
                  const toValue = filterValue?.op === 'range' ? String(filterValue.value.to ?? '') : '';
                  
                  // If there's an equals filter, show simple input; otherwise show range
                  const showRangeUI = !filterValue || filterValue.op === 'range';
                  
                  if (showRangeUI) {
                    return (
                      <th key={column.id}>
                        <div className="rowakit-filter-number-range">
                          <input
                            type="number"
                            className="rowakit-filter-input"
                            placeholder="Min"
                            value={fromValue}
                            onChange={(e) => {
                              const from = e.target.value ? Number(e.target.value) : undefined;
                              const to = toValue ? Number(toValue) : undefined;
                              if (from === undefined && to === undefined) {
                                handleClearFilter(field);
                              } else {
                                handleFilterChange(field, { op: 'range', value: { from, to } } as FilterValue);
                              }
                            }}
                          />
                          <input
                            type="number"
                            className="rowakit-filter-input"
                            placeholder="Max"
                            value={toValue}
                            onChange={(e) => {
                              const to = e.target.value ? Number(e.target.value) : undefined;
                              const from = fromValue ? Number(fromValue) : undefined;
                              if (from === undefined && to === undefined) {
                                handleClearFilter(field);
                              } else {
                                handleFilterChange(field, { op: 'range', value: { from, to } } as FilterValue);
                              }
                            }}
                          />
                        </div>
                      </th>
                    );
                  }
                }

                // Regular text/number input
                return (
                  <th key={column.id}>
                    <input
                      type={isNumberColumn ? 'number' : 'text'}
                      className="rowakit-filter-input"
                      placeholder={`Filter ${getHeaderLabel(column)}...`}
                      value={
                        filterValue?.op === 'contains'
                          ? filterValue.value
                          : filterValue?.op === 'equals' && typeof filterValue.value === 'string'
                          ? filterValue.value
                          : filterValue?.op === 'equals' && typeof filterValue.value === 'number'
                          ? String(filterValue.value)
                          : ''
                      }
                      onChange={(e) => {
                        const rawValue = e.target.value;
                        if (rawValue === '') {
                          handleClearFilter(field);
                        } else if (isNumberColumn) {
                          const numValue = Number(rawValue);
                          if (!isNaN(numValue)) {
                            // Send the parsed numeric value, not the string
                            handleFilterChange(field, { op: 'equals', value: numValue } as FilterValue);
                          } else {
                            // Invalid numeric input: clear the filter to avoid confusing UX
                            handleClearFilter(field);
                          }
                        } else {
                          // Text: use "contains"
                          handleFilterChange(field, { op: 'contains', value: rawValue } as FilterValue);
                        }
                      }}
                    />
                  </th>
                );
              })}
            </tr>
          )}
        </thead>
        <tbody>
          {isLoading && (
            <tr>
              <td colSpan={columns.length} className="rowakit-table-loading">
                <div className="rowakit-table-loading-spinner"></div>
                <span>Loading...</span>
              </td>
            </tr>
          )}

          {isError && (
            <tr>
              <td colSpan={columns.length} className="rowakit-table-error">
                <div className="rowakit-table-error-message">
                  {dataState.error ?? 'An error occurred'}
                </div>
                <button
                  onClick={handleRetry}
                  className="rowakit-button rowakit-button-primary"
                  type="button"
                >
                  Retry
                </button>
              </td>
            </tr>
          )}

          {isEmpty && (
            <tr>
              <td colSpan={columns.length} className="rowakit-table-empty">
                No data
              </td>
            </tr>
          )}

          {dataState.state === 'success' &&
            dataState.items.map((row) => {
              const key = getRowKey(row, rowKey);
              return (
                <tr key={key}>
                  {columns.map((column) => {
                    const cellClass = [
                      column.kind === 'number' ? 'rowakit-cell-number' : '',
                      column.truncate ? 'rowakit-cell-truncate' : '',
                    ].filter(Boolean).join(' ') || undefined;
                    
                    // PRD-03: Apply width to body cells matching header width (resized or column.width)
                    const actualWidth = columnWidths[column.id] ?? column.width;
                    
                    return (
                      <td 
                        key={column.id}
                        data-col-id={column.id}
                        className={cellClass}
                        style={{
                          width: actualWidth != null ? `${actualWidth}px` : undefined,
                          textAlign: column.align || (column.kind === 'number' ? 'right' : undefined),
                        }}
                      >
                        {renderCell(column, row, isLoading, setConfirmState)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
        </tbody>
      </table>

      {/* Pagination Controls */}
      {dataState.total > 0 && (
        <div className="rowakit-table-pagination">
          {/* Left: Page size selector */}
          <div className="rowakit-table-pagination-left">
            <label htmlFor="page-size">
              Rows per page:
            </label>
            <select
              id="page-size"
              value={query.pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              disabled={isLoading}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          {/* Center: Page info */}
          <div className="rowakit-table-pagination-center">
            Page {query.page} of {totalPages} ({dataState.total} total)
          </div>

          {/* Right: Previous/Next buttons */}
          <div className="rowakit-table-pagination-right">
            <button
              onClick={handlePreviousPage}
              disabled={!canGoPrevious}
              className="rowakit-button rowakit-button-primary rowakit-button-pagination"
              type="button"
              aria-label="Previous page"
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={!canGoNext}
              className="rowakit-button rowakit-button-primary rowakit-button-pagination"
              type="button"
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmState && (
        <div
          className="rowakit-modal-backdrop"
          onClick={() => setConfirmState(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
        >
          <div className="rowakit-modal" onClick={(e) => e.stopPropagation()}>
            <h2 id="confirm-dialog-title" className="rowakit-modal-title">
              Confirm Action
            </h2>
            <p className="rowakit-modal-content">
              Are you sure you want to {confirmState.action.label.toLowerCase()}? This action cannot be
              undone.
            </p>
            <div className="rowakit-modal-actions">
              <button
                onClick={() => setConfirmState(null)}
                className="rowakit-button rowakit-button-secondary"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  void confirmState.action.onClick(confirmState.row);
                  setConfirmState(null);
                }}
                className="rowakit-button rowakit-button-danger"
                type="button"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * @deprecated Use RowaKitTable instead. SmartTable is kept as an alias for backward compatibility.
 */
export const SmartTable = RowaKitTable;
