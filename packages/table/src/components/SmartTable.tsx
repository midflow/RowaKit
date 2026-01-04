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

/**
 * Render cell content based on column kind.
 */
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

  // Confirmation state for actions that require confirmation
  const [confirmState, setConfirmState] = useState<ConfirmState<T> | null>(null);

  // Request tracking to ignore stale responses
  const requestIdRef = useRef(0);

  // Stage C: Sync to URL on query changes
  useEffect(() => {
    if (!syncToUrl) return;

    const params = new URLSearchParams();
    params.set('page', String(query.page));
    params.set('pageSize', String(query.pageSize));
    
    if (query.sort) {
      params.set('sortField', query.sort.field);
      params.set('sortDirection', query.sort.direction);
    }
    
    if (query.filters && Object.keys(query.filters).length > 0) {
      params.set('filters', JSON.stringify(query.filters));
    }
    
    if (enableColumnResizing && Object.keys(columnWidths).length > 0) {
      params.set('columnWidths', JSON.stringify(columnWidths));
    }

    window.history.replaceState(null, '', `?${params.toString()}`);
  }, [query, columnWidths, syncToUrl, enableColumnResizing]);

  // Stage C: Load from URL on mount
  useEffect(() => {
    if (!syncToUrl) return;

    const params = new URLSearchParams(window.location.search);
    const page = parseInt(params.get('page') ?? '1', 10);
    const pageSize = parseInt(params.get('pageSize') ?? String(defaultPageSize), 10);
    const sortField = params.get('sortField');
    const sortDirection = params.get('sortDirection') as 'asc' | 'desc' | null;
    const filtersStr = params.get('filters');
    const columnWidthsStr = params.get('columnWidths');

    const newQuery: FetcherQuery = {
      page: Math.max(1, page),
      pageSize: Math.max(1, pageSize),
    };

    if (sortField && sortDirection) {
      newQuery.sort = { field: sortField, direction: sortDirection };
    }

    if (filtersStr) {
      try {
        const parsedFilters = JSON.parse(filtersStr);
        if (parsedFilters && typeof parsedFilters === 'object') {
          setFilters(parsedFilters as Record<string, FilterValue | undefined>);
          newQuery.filters = parsedFilters;
        }
      } catch {
        // Ignore invalid filters
      }
    }

    if (enableColumnResizing && columnWidthsStr) {
      try {
        setColumnWidths(JSON.parse(columnWidthsStr));
      } catch {
        // Ignore invalid column widths
      }
    }

    setQuery(newQuery);
  }, [syncToUrl, defaultPageSize, enableColumnResizing]); // Only on mount

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

    setColumnWidths((prev) => ({
      ...prev,
      [columnId]: finalWidth,
    }));
  };

  // Stage C: Column resize drag handler
  const startColumnResize = (e: React.MouseEvent<HTMLDivElement>, columnId: string) => {
    e.preventDefault();
    const startX = e.clientX;
    const th = (e.currentTarget.parentElement as HTMLTableCellElement);
    
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

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      const newWidth = startWidth + delta;
      // Use RAF throttle for smooth performance
      scheduleColumnWidthUpdate(columnId, newWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      // Re-enable text selection
      document.body.classList.remove('rowakit-resizing');
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Stage C: Double-click to auto-fit content
  const handleColumnResizeDoubleClick = (columnId: string) => {
    const tableEl = tableRef.current;
    if (!tableEl) return;

    const th = tableEl.querySelector(`th[data-col-id="${columnId}"]`) as HTMLTableCellElement | null;
    if (!th) return;

    const tds = Array.from(tableEl.querySelectorAll(`td[data-col-id="${columnId}"]`)) as HTMLTableCellElement[];

    const headerW = th.scrollWidth;
    const cellsMaxW = tds.reduce((max, td) => Math.max(max, td.scrollWidth), 0);

    const padding = 24; // buffer for padding + sort icon
    const raw = Math.max(headerW, cellsMaxW) + padding;

    const minW = columns.find(c => c.id === columnId)?.minWidth ?? 80;
    const maxW = columns.find(c => c.id === columnId)?.maxWidth ?? 600; // maxAutoFitWidth default

    const finalW = Math.max(minW, Math.min(raw, maxW));

    setColumnWidths(prev => ({ ...prev, [columnId]: finalW }));
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

    // Store in localStorage if available
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(`rowakit-view-${name}`, JSON.stringify(viewState));
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
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.removeItem(`rowakit-view-${name}`);
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

  return (
    <div className={`rowakit-table${className ? ` ${className}` : ''}`}>
      {enableSavedViews && (
        <div className="rowakit-saved-views-group">
          <button
            onClick={() => {
              // NOTE: This uses window.prompt as a simple placeholder UI for naming saved views.
              // In production applications, replace this with a proper non-blocking modal dialog
              // component that provides better styling, accessibility, and user experience.
              const name = typeof window !== 'undefined' ? window.prompt('Enter view name:') : null;
              if (name) {
                saveCurrentView(name);
              }
            }}
            className="rowakit-saved-view-button"
            type="button"
          >
            Save View
          </button>
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
                  onClick={isSortable ? () => handleSort(String(field)) : undefined}
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
                    width: actualWidth ? `${actualWidth}px` : undefined,
                    textAlign: column.align,
                    position: isResizable ? 'relative' : undefined,
                  }}
                  // Note: truncate styling is disabled when column is resizable to prevent
                  // conflicts with the resize handle and to allow dynamic width adjustments
                  className={column.truncate && !isResizable ? 'rowakit-cell-truncate' : undefined}
                >
                  {getHeaderLabel(column)}{isSortable && getSortIndicator(String(field))}
                  {isResizable && (
                    <div
                      className="rowakit-column-resize-handle"
                      onMouseDown={(e) => startColumnResize(e, column.id)}
                      onDoubleClick={() => handleColumnResizeDoubleClick(column.id)}
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
                    
                    // Only apply width if user has manually resized this column
                    const actualWidth = columnWidths[column.id];
                    
                    return (
                      <td 
                        key={column.id}
                        data-col-id={column.id}
                        className={cellClass}
                        style={{
                          width: actualWidth ? `${actualWidth}px` : undefined,
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
