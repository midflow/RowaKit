/**
 * SmartTable Component
 *
 * Core table rendering component that maps columns to table cells.
 * Handles all column types: text, date, boolean, actions, and custom.
 * Includes data fetching state machine with loading/error/empty states.
 *
 * @packageDocumentation
 */

import { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { Fetcher, ColumnDef, FetcherQuery, ActionDef } from '../types';

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

    case 'actions': {
      return (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {column.actions.map((action) => {
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
                style={{
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.875rem',
                  cursor: isDisabled || action.loading ? 'not-allowed' : 'pointer',
                  opacity: isDisabled || action.loading ? 0.5 : 1,
                }}
              >
                {action.icon && typeof action.icon === 'string' ? (
                  <span style={{ marginRight: '0.25rem' }}>{action.icon}</span>
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
 * SmartTable - Server-side table component for internal/business apps.
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
 * import { SmartTable, col } from '@rowakit/table';
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
 *     <SmartTable
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
export function SmartTable<T>({
  fetcher,
  columns,
  defaultPageSize = 20,
  pageSizeOptions = [10, 20, 50],
  rowKey,
  className = '',
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

  // Confirmation state for actions that require confirmation
  const [confirmState, setConfirmState] = useState<ConfirmState<T> | null>(null);

  // Request tracking to ignore stale responses
  const requestIdRef = useRef(0);

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

  const isLoading = dataState.state === 'loading';
  const isError = dataState.state === 'error';
  const isEmpty = dataState.state === 'empty';
  const totalPages = Math.ceil(dataState.total / query.pageSize);
  const canGoPrevious = query.page > 1 && !isLoading;
  const canGoNext = query.page < totalPages && !isLoading;

  return (
    <div className={`rowakit-table${className ? ` ${className}` : ''}`}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {columns.map((column) => {
              const isSortable = column.kind !== 'actions' && 
                                 (column.kind === 'custom' ? false : column.sortable === true);
              const field = column.kind === 'actions' ? '' : 
                           column.kind === 'custom' ? column.field : 
                           column.field;

              return (
                <th
                  key={column.id}
                  onClick={isSortable ? () => handleSort(String(field)) : undefined}
                  style={{
                    textAlign: 'left',
                    padding: '0.75rem',
                    borderBottom: '2px solid #e5e7eb',
                    fontWeight: 600,
                    cursor: isSortable ? 'pointer' : 'default',
                    userSelect: 'none',
                  }}
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
                >
                  {getHeaderLabel(column)}{isSortable && getSortIndicator(String(field))}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  padding: '2rem',
                  textAlign: 'center',
                  color: '#6b7280',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <span>Loading...</span>
                </div>
              </td>
            </tr>
          )}

          {isError && (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  padding: '2rem',
                  textAlign: 'center',
                }}
              >
                <div style={{ color: '#dc2626', marginBottom: '1rem' }}>
                  {dataState.error ?? 'An error occurred'}
                </div>
                <button
                  onClick={handleRetry}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                  }}
                  type="button"
                >
                  Retry
                </button>
              </td>
            </tr>
          )}

          {isEmpty && (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  padding: '2rem',
                  textAlign: 'center',
                  color: '#6b7280',
                }}
              >
                No data
              </td>
            </tr>
          )}

          {dataState.state === 'success' &&
            dataState.items.map((row) => {
              const key = getRowKey(row, rowKey);
              return (
                <tr key={key}>
                  {columns.map((column) => (
                    <td
                      key={column.id}
                      style={{
                        padding: '0.75rem',
                        borderBottom: '1px solid #e5e7eb',
                      }}
                    >
                      {renderCell(column, row, isLoading, setConfirmState)}
                    </td>
                  ))}
                </tr>
              );
            })}
        </tbody>
      </table>

      {/* Pagination Controls */}
      {dataState.total > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem',
            borderTop: '1px solid #e5e7eb',
          }}
        >
          {/* Left: Page size selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label htmlFor="page-size" style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Rows per page:
            </label>
            <select
              id="page-size"
              value={query.pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              disabled={isLoading}
              style={{
                padding: '0.25rem 0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.25rem',
                fontSize: '0.875rem',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.5 : 1,
              }}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          {/* Center: Page info */}
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Page {query.page} of {totalPages} ({dataState.total} total)
          </div>

          {/* Right: Previous/Next buttons */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handlePreviousPage}
              disabled={!canGoPrevious}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: canGoPrevious ? '#3b82f6' : '#e5e7eb',
                color: canGoPrevious ? 'white' : '#9ca3af',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: canGoPrevious ? 'pointer' : 'not-allowed',
                fontSize: '0.875rem',
              }}
              type="button"
              aria-label="Previous page"
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={!canGoNext}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: canGoNext ? '#3b82f6' : '#e5e7eb',
                color: canGoNext ? 'white' : '#9ca3af',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: canGoNext ? 'pointer' : 'not-allowed',
                fontSize: '0.875rem',
              }}
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
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setConfirmState(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              maxWidth: '400px',
              width: '90%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="confirm-dialog-title"
              style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '1rem',
                color: '#111827',
              }}
            >
              Confirm Action
            </h2>
            <p style={{ marginBottom: '1.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
              Are you sure you want to {confirmState.action.label.toLowerCase()}? This action cannot be
              undone.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmState(null)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                }}
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  void confirmState.action.onClick(confirmState.row);
                  setConfirmState(null);
                }}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                }}
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
