import { SmartTable } from '@rowakit/table';
import { col } from '@rowakit/table';
import type { Fetcher } from '@rowakit/table';
import '../../styles.css';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  status?: string;
}

const MOCK_USERS: User[] = [
  { id: '1', name: 'Alice Johnson', email: 'alice@example.com', role: 'admin', status: 'active' },
  { id: '2', name: 'Bob Smith', email: 'bob@example.com', role: 'user', status: 'active' },
  { id: '3', name: 'Charlie Brown', email: 'charlie@example.com', role: 'user', status: 'inactive' },
  { id: '4', name: 'Diana Prince', email: 'diana@example.com', role: 'admin', status: 'active' },
  { id: '5', name: 'Eve Wilson', email: 'eve@example.com', role: 'user', status: 'active' },
  { id: '6', name: 'Frank Miller', email: 'frank@example.com', role: 'guest', status: 'inactive' },
  { id: '7', name: 'Grace Lee', email: 'grace@example.com', role: 'user', status: 'active' },
  { id: '8', name: 'Henry Taylor', email: 'henry@example.com', role: 'admin', status: 'inactive' },
  { id: '9', name: 'Iris Chen', email: 'iris@example.com', role: 'user', status: 'active' },
  { id: '10', name: 'Jack Davis', email: 'jack@example.com', role: 'user', status: 'active' },
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
 * Demo 12: Multi-Column Sorting
 *
 * Shows how to use multi-column sorting with Ctrl/Cmd+Click.
 * Sort indicators show priority order.
 */
export default function MultiSortDemo() {
  return (
    <div className="demo-container">
      <h2>Multi-Column Sorting Demo</h2>
      <p>
        <strong>Click</strong> to set primary sort.
        <br />
        <strong>Ctrl+Click</strong> (or <strong>Cmd+Click</strong> on Mac) to add secondary sort.
        <br />
        Sort indicators show the order: ↑ (ascending), ↓ (descending), [2] (secondary), etc.
      </p>

      <SmartTable
        fetcher={fetcher}
        columns={[
          col.text<User>('id'),
          col.text<User>('name', { sortable: true, width: 200 }),
          col.text<User>('email', { sortable: true, width: 250 }),
          col.text<User>('role', { sortable: true, width: 120 }),
          col.text<User>('status', { sortable: true, width: 100 }),
          col.actions<User>([
            {
              id: 'view',
              label: 'View',
              onClick: (row) => alert(`Viewing: ${row.name}`),
            },
          ]),
        ]}
        pageSizeOptions={[5, 10, 20]}
        defaultPageSize={5}
      />

      <div className="demo-hints">
        <h3>Hints</h3>
        <ul>
          <li>Try: Click "Role" to sort by role</li>
          <li>Then: Ctrl+Click "Name" to add secondary sort by name</li>
          <li>Then: Ctrl+Click "Email" to add tertiary sort</li>
          <li>Click "Role" again to clear secondary sorts and return to role-only sort</li>
        </ul>
      </div>
    </div>
  );
}
