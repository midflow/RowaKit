import { SmartTable } from '@rowakit/table';
import { col } from '@rowakit/table';
import type { Fetcher, FetcherQuery } from '@rowakit/table';
import '../../styles.css';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
}

const MOCK_USERS: User[] = [
  { id: '1', name: 'Alice Johnson', email: 'alice@example.com', role: 'admin' },
  { id: '2', name: 'Bob Smith', email: 'bob@example.com', role: 'user' },
  { id: '3', name: 'Charlie Brown', email: 'charlie@example.com', role: 'user' },
  { id: '4', name: 'Diana Prince', email: 'diana@example.com', role: 'admin' },
  { id: '5', name: 'Eve Wilson', email: 'eve@example.com', role: 'user' },
  { id: '6', name: 'Frank Miller', email: 'frank@example.com', role: 'guest' },
  { id: '7', name: 'Grace Lee', email: 'grace@example.com', role: 'user' },
  { id: '8', name: 'Henry Taylor', email: 'henry@example.com', role: 'admin' },
  { id: '9', name: 'Iris Chen', email: 'iris@example.com', role: 'user' },
  { id: '10', name: 'Jack Davis', email: 'jack@example.com', role: 'user' },
];

const fetcher: Fetcher<User> = async (query) => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const sorted = [...MOCK_USERS];
  // PRD-E4: Support multi-column sorting
  if (query.sorts && query.sorts.length > 0) {
    sorted.sort((a, b) => {
      for (const sort of query.sorts || []) {
        const aVal = a[sort.field as keyof User] || '';
        const bVal = b[sort.field as keyof User] || '';
        const cmp = String(aVal).localeCompare(String(bVal));
        if (cmp !== 0) {
          return sort.direction === 'asc' ? cmp : -cmp;
        }
      }
      return 0;
    });
  } else if (query.sort) {
    sorted.sort((a, b) => {
      const aVal = a[query.sort!.field as keyof User] || '';
      const bVal = b[query.sort!.field as keyof User] || '';
      const cmp = String(aVal).localeCompare(String(bVal));
      return query.sort!.direction === 'asc' ? cmp : -cmp;
    });
  }

  const start = (query.page - 1) * query.pageSize;
  const items = sorted.slice(start, start + query.pageSize);
  return { items, total: sorted.length };
};

/**
 * Demo 11: CSV Export
 *
 * Shows how to implement server-triggered CSV export with current query state.
 * The exporter receives filters, sort, and pagination context.
 */
export default function CsvExportDemo() {
  // Simulate server export endpoint
  const handleExport = async (query: FetcherQuery) => {
    // In a real app, send query to server and get download URL or Blob
    // For demo, simulate delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Generate CSV with ALL data from MOCK_USERS (simulating server-side export)
    // In real app, server would respect query filters, sort, pagination
    const csvRows = ['ID,Name,Email,Role'];
    for (const user of MOCK_USERS) {
      csvRows.push(`${user.id},"${user.name}","${user.email}","${user.role}"`);
    }
    const csvContent = csvRows.join('\n');

    // Return Blob - ExportButton will handle download automatically
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    return blob;
  };

  return (
    <div className="demo-container">
      <h2>CSV Export Demo</h2>
      <p>
        Click the export button in the toolbar. The exporter receives the current table state
        (filters, sort, pagination) to match server behavior.
      </p>

      <SmartTable
        fetcher={fetcher}
        columns={[
          col.text<User>('id'),
          col.text<User>('name', { sortable: true, width: 200 }),
          col.text<User>('email', { sortable: true, width: 250 }),
          col.text<User>('role', { sortable: true }),
          col.actions<User>([
            {
              id: 'view',
              label: 'View',
              onClick: (row) => alert(`Viewing: ${row.name}`),
            },
          ]),
        ]}
        exporter={handleExport}
        pageSizeOptions={[5, 10, 20]}
        defaultPageSize={5}
      />
    </div>
  );
}
