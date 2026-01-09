import { SmartTable } from '@rowakit/table';
import { col } from '@rowakit/table';
import type { Fetcher, FetcherQuery } from '@rowakit/table';

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
];

const fetcher: Fetcher<User> = async (query) => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const start = (query.page - 1) * query.pageSize;
  const items = MOCK_USERS.slice(start, start + query.pageSize);
  return { items, total: MOCK_USERS.length };
};

/**
 * CSV Export Code Example
 *
 * Demonstrates implementing exporter callback for server-triggered export.
 */
export default function CsvExportCode() {
  const handleExport = async (query: FetcherQuery) => {
    // Send query state to server
    const response = await fetch('/api/export/csv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    // Server returns download URL or Blob
    const downloadUrl = await response.text();
    return { url: downloadUrl };
  };

  return (
    <SmartTable
      fetcher={fetcher}
      columns={[
        col.text<User>('id'),
        col.text<User>('name', { sortable: true, width: 200 }),
        col.text<User>('email', { sortable: true, width: 250 }),
        col.text<User>('role', { sortable: true }),
      ]}
      exporter={handleExport}
      pageSizeOptions={[5, 10, 20]}
      defaultPageSize={5}
    />
  );
}
