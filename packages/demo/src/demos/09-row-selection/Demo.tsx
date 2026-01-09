import { useState } from 'react';
import { SmartTable } from '@rowakit/table';
import { col } from '@rowakit/table';
import type { Fetcher } from '@rowakit/table';
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
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const filtered = MOCK_USERS.filter((user) => {
    // Apply filters if needed
    return true;
  });

  const sorted = [...filtered];
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

  return { items, total: filtered.length };
};

/**
 * Demo 09: Row Selection
 *
 * Shows how to enable row selection with checkboxes and track selected rows.
 * Selection is page-scoped and automatically resets on page/data changes.
 */
export default function RowSelectionDemo() {
  const [selectedKeys, setSelectedKeys] = useState<Array<string | number>>([]);

  return (
    <div className="demo-container">
      <h2>Row Selection Demo</h2>
      <p>
        Click checkboxes to select rows. The header checkbox selects/deselects the entire page.
      </p>

      {selectedKeys.length > 0 && (
        <div className="selection-info">
          <strong>Selected {selectedKeys.length} rows:</strong>
          <pre>{JSON.stringify(selectedKeys, null, 2)}</pre>
        </div>
      )}

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
        enableRowSelection={true}
        onSelectionChange={setSelectedKeys}
        pageSizeOptions={[5, 10, 20]}
        defaultPageSize={5}
      />
    </div>
  );
}
