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
import { useColumnResizing } from '../hooks/useColumnResizing';
import { useFetcherState } from '../hooks/useFetcherState';
import { useSavedViews } from '../hooks/useSavedViews';
import { useSortingState } from '../hooks/useSortingState';
import { useUrlSync } from '../hooks/useUrlSync';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { RowSelectionCell, RowSelectionHeaderCell } from './RowSelectionColumn';
import { BulkActionBar } from './BulkActionBar';
import type { BulkActionDef } from './BulkActionBar';
import { ExportButton } from './ExportButton';
import type { Exporter } from '../types/export';
import {
  clearSelection,
  isAllSelected,
  isIndeterminate,
  selectAll,
  toggleSelectionKey,
} from '../state/selection';

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

  /** Stage E: Enable row selection (default: false) */
  enableRowSelection?: boolean;

  /** Stage E: Selection change callback */
  onSelectionChange?: (keys: Array<string | number>) => void;

  /** Stage E: Bulk actions based on selection */
  bulkActions?: BulkActionDef[];

  /** Stage E: Export CSV (server-triggered) */
  exporter?: Exporter;
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
  enableRowSelection = false,
  onSelectionChange,
  bulkActions,
  exporter,
}: SmartTableProps<T>) {
  const [query, setQuery] = useState<FetcherQuery>({
    page: 1,
    pageSize: defaultPageSize,
  });

  // Filter state (field -> FilterValue)
  const [filters, setFilters] = useState<Record<string, FilterValue | undefined>>({});
  // Confirmation state for actions that require confirmation
  const [confirmState, setConfirmState] = useState<ConfirmState<T> | null>(null);

  // Stage E: Row selection state (page-scoped)
  const [selectedKeys, setSelectedKeys] = useState<Array<string | number>>([]);
  const selectedKeysRef = useRef<Array<string | number>>(selectedKeys);
  useEffect(() => {
    selectedKeysRef.current = selectedKeys;
  }, [selectedKeys]);

  // Stage E: Bulk action confirmation state
  const [bulkConfirmState, setBulkConfirmState] = useState<{
    action: BulkActionDef;
    selectedKeys: Array<string | number>;
  } | null>(null);

  // Stage E7 (a11y): Modal refs for focus trap
  const confirmModalRef = useRef<HTMLDivElement>(null);
  const bulkConfirmModalRef = useRef<HTMLDivElement>(null);

  const {
    tableRef,
    columnWidths,
    setColumnWidths,
    startColumnResize,
    handleColumnResizeDoubleClick,
    isResizingRef,
    lastResizeEndTsRef,
    resizingColIdRef,
  } = useColumnResizing(columns);

  useUrlSync({
    syncToUrl,
    enableColumnResizing,
    defaultPageSize,
    pageSizeOptions,
    columns,
    query,
    setQuery,
    filters,
    setFilters,
    columnWidths,
    setColumnWidths,
  });

  const { dataState, handleRetry, isLoading, isError, isEmpty } = useFetcherState(fetcher, query, setQuery);
  const { handleSort, getSortIndicator } = useSortingState(query, setQuery);

  const pageRowKeys = dataState.items.map((row) => getRowKey(row, rowKey));
  const headerChecked = isAllSelected(selectedKeys, pageRowKeys);
  const headerIndeterminate = isIndeterminate(selectedKeys, pageRowKeys);

  // Clear selection when row selection is disabled or page changes
  // Note: Removed dataState.items dependency to prevent clearing on every data refresh
  useEffect(() => {
    // Only clear selection on page change if there was an existing selection
    if (selectedKeysRef.current.length === 0) return;
    setSelectedKeys(clearSelection());
  }, [query.page]);

  // Clear selection if row selection feature is turned off
  useEffect(() => {
    if (!enableRowSelection) {
      // Only update if there is something to clear to avoid unnecessary state updates
      if (selectedKeysRef.current.length === 0) return;
      setSelectedKeys(clearSelection());
    }
  }, [enableRowSelection]);

  useEffect(() => {
    if (!enableRowSelection || !onSelectionChange) return;
    onSelectionChange(selectedKeys);
  }, [enableRowSelection, onSelectionChange, selectedKeys]);

  const {
    savedViews,
    showSaveViewForm,
    saveViewInput,
    saveViewError,
    overwriteConfirmName,
    openSaveViewForm,
    cancelSaveViewForm,
    onSaveViewInputChange,
    onSaveViewInputKeyDown,
    attemptSave,
    confirmOverwrite,
    cancelOverwrite,
    loadSavedView,
    deleteSavedView,
    resetTableState,
  } = useSavedViews({
    enableSavedViews,
    enableColumnResizing,
    defaultPageSize,
    query,
    setQuery,
    setFilters,
    columnWidths,
    setColumnWidths,
  });

  // Stage E7 (a11y): Apply focus trap to modals
  useFocusTrap(confirmModalRef, {
    onEscape: () => setConfirmState(null),
    autoFocus: true,
  });

  useFocusTrap(bulkConfirmModalRef, {
    onEscape: () => setBulkConfirmState(null),
    autoFocus: true,
  });

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

  const totalPages = Math.ceil(dataState.total / query.pageSize);
  const canGoPrevious = query.page > 1 && !isLoading;
  const canGoNext = query.page < totalPages && !isLoading;

  const tableColumnCount = columns.length + (enableRowSelection ? 1 : 0);

  const hasActiveFilters = enableFilters && Object.values(filters).some(v => v !== undefined);

  // PRD-03: Apply fixed layout class when resizing is enabled
  const containerClass = [
    'rowakit-table',
    enableColumnResizing ? 'rowakit-layout-fixed' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClass}>
      {enableRowSelection && bulkActions && bulkActions.length > 0 && selectedKeys.length > 0 && (
        <BulkActionBar
          selectedCount={selectedKeys.length}
          actions={bulkActions}
          onActionClick={(actionId) => {
            const action = bulkActions.find((a) => a.id === actionId);
            if (!action) return;

            const snapshot = [...selectedKeys];

            if (action.confirm) {
              setBulkConfirmState({ action, selectedKeys: snapshot });
              return;
            }

            action.onClick(snapshot);
          }}
        />
      )}

      {exporter && <ExportButton exporter={exporter} query={query} />}

      {enableSavedViews && (
        <div className="rowakit-saved-views-group">
          {!showSaveViewForm ? (
            <button
              onClick={openSaveViewForm}
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
                    onClick={confirmOverwrite}
                    className="rowakit-saved-view-button"
                    type="button"
                  >
                    Overwrite
                  </button>
                  <button
                    onClick={cancelOverwrite}
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
                    onChange={onSaveViewInputChange}
                    onKeyDown={onSaveViewInputKeyDown}
                    placeholder="Enter view name..."
                    className="rowakit-save-view-input"
                  />
                  {saveViewError && (
                    <div className="rowakit-save-view-error">{saveViewError}</div>
                  )}
                  <button
                    onClick={attemptSave}
                    className="rowakit-saved-view-button"
                    type="button"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelSaveViewForm}
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
            {enableRowSelection && (
              <RowSelectionHeaderCell
                checked={headerChecked}
                indeterminate={headerIndeterminate}
                disabled={isLoading || pageRowKeys.length === 0}
                onChange={(checked) => {
                  if (checked) {
                    setSelectedKeys(selectAll(pageRowKeys));
                  } else {
                    setSelectedKeys(clearSelection());
                  }
                }}
              />
            )}
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
                  onClick={isSortable ? (e) => {
                    // PRD-01: Suppress sort if resizing or during suppression window
                    if (isResizingRef.current) return;
                    if (Date.now() - lastResizeEndTsRef.current < 150) return;
                    // PRD-E4: Multi-sort support via Ctrl/Cmd + click
                    const isMultiSort = e.ctrlKey || e.metaKey;
                    handleSort(String(field), isMultiSort);
                  } : undefined}
                  role={isSortable ? 'button' : undefined}
                  tabIndex={isSortable ? 0 : undefined}
                  onKeyDown={isSortable ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      // PRD-E4: Shift for multi-sort in keyboard mode
                      const isMultiSort = e.shiftKey;
                      handleSort(String(field), isMultiSort);
                    }
                  } : undefined}
                  aria-sort={
                    isSortable && (query.sorts?.find(s => s.field === String(field))?.priority === 0 || query.sort?.field === String(field))
                      ? (query.sorts?.find(s => s.field === String(field))?.direction ?? query.sort?.direction) === 'asc' ? 'ascending' : 'descending'
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
              {enableRowSelection && <th></th>}
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
              <td colSpan={tableColumnCount} className="rowakit-table-loading">
                <div className="rowakit-table-loading-spinner"></div>
                <span>Loading...</span>
              </td>
            </tr>
          )}

          {isError && (
            <tr>
              <td colSpan={tableColumnCount} className="rowakit-table-error">
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
              <td colSpan={tableColumnCount} className="rowakit-table-empty">
                No data
              </td>
            </tr>
          )}

          {dataState.state === 'success' &&
            dataState.items.map((row) => {
              const key = getRowKey(row, rowKey);
              return (
                <tr key={key}>
                  {enableRowSelection && (
                    <RowSelectionCell
                      rowKey={key}
                      disabled={isLoading}
                      checked={selectedKeys.includes(key)}
                      onChange={() => {
                        setSelectedKeys((prev) => toggleSelectionKey(prev, key));
                      }}
                    />
                  )}
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
          ref={confirmModalRef}
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

      {bulkConfirmState && (
        <div
          ref={bulkConfirmModalRef}
          className="rowakit-modal-backdrop"
          onClick={() => setBulkConfirmState(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="bulk-confirm-dialog-title"
        >
          <div className="rowakit-modal" onClick={(e) => e.stopPropagation()}>
            <h2 id="bulk-confirm-dialog-title" className="rowakit-modal-title">
              {bulkConfirmState.action.confirm?.title ?? 'Confirm Action'}
            </h2>
            <p className="rowakit-modal-content">
              {bulkConfirmState.action.confirm?.description ?? 'Are you sure you want to perform this action? This action cannot be undone.'}
            </p>
            <div className="rowakit-modal-actions">
              <button
                onClick={() => setBulkConfirmState(null)}
                className="rowakit-button rowakit-button-secondary"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  bulkConfirmState.action.onClick(bulkConfirmState.selectedKeys);
                  setBulkConfirmState(null);
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
