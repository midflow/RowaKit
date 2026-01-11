/**
 * Harness Test App - UI Component for Testing
 *
 * Renders the real RowaKitTable component with configurable props.
 */

import React from 'react';
import { RowaKitTable, col, type Fetcher, type BulkActionDef, type Exporter } from '@rowakit/table';
import type { TestUser } from '../dataset';

export interface HarnessTestAppProps {
  /** Data fetcher */
  fetcher: Fetcher<TestUser>;
  /** Enable row selection */
  enableSelection?: boolean;
  /** Bulk actions */
  bulkActions?: BulkActionDef[];
  /** Export handler */
  exporter?: Exporter;
  /** URL sync enabled */
  urlSync?: boolean;
  /** Saved views enabled */
  savedViews?: string;
  /** Enable filters */
  enableFilters?: boolean;
  /** Test ID for query targeting */
  testId?: string;
}

/**
 * HarnessTestApp component
 * 
 * This component renders RowaKitTable with full feature support.
 * Used by UI-level harness tests to validate component behavior.
 */
export function HarnessTestApp({
  fetcher,
  enableSelection = false,
  bulkActions,
  exporter,
  urlSync = false,
  savedViews,
  enableFilters = false,
  testId = 'harness-table',
}: HarnessTestAppProps) {
  const columns = [
    col.text('name', {
      header: 'Name',
      sortable: true,
      width: 200,
    }),
    col.text('email', {
      header: 'Email',
      sortable: true,
      width: 250,
    }),
    col.number('age', {
      header: 'Age',
      sortable: true,
      width: 100,
    }),
    col.number('salary', {
      header: 'Salary',
      sortable: true,
      width: 150,
      format: (value) => `$${value.toLocaleString()}`,
    }),
    col.text('department', {
      header: 'Department',
      sortable: true,
      width: 150,
    }),
    col.badge('role', {
      header: 'Role',
      map: {
        admin: { label: 'Admin', tone: 'purple' },
        user: { label: 'User', tone: 'blue' },
        guest: { label: 'Guest', tone: 'gray' },
      },
    }),
    col.boolean('active', {
      header: 'Active',
      sortable: true,
    }),
    col.date('joinedAt', {
      header: 'Joined',
      sortable: true,
      width: 150,
    }),
  ];

  return (
    <div data-testid={testId}>
      <RowaKitTable
        fetcher={fetcher}
        columns={columns}
        getRowKey={(row) => row.id}
        enableSelection={enableSelection}
        bulkActions={bulkActions}
        exporter={exporter}
        urlSync={urlSync}
        savedViews={savedViews}
        enableFilters={enableFilters}
      />
    </div>
  );
}
