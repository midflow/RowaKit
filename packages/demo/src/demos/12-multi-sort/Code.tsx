import { SmartTable } from '@rowakit/table';
import { col } from '@rowakit/table';
import type { Fetcher } from '@rowakit/table';

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
];

const fetcher: Fetcher<User> = async (query) => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const start = (query.page - 1) * query.pageSize;
  const items = MOCK_USERS.slice(start, start + query.pageSize);
  return { items, total: MOCK_USERS.length };
};

/**
 * Multi-Column Sorting Code Example
 *
 * Demonstrates multi-sort capability (automatically handled by SmartTable).
 * No special configuration needed - Ctrl/Cmd+Click works out of the box.
 */
export default function MultiSortCode() {
  return (
    <SmartTable
      fetcher={fetcher}
      columns={[
        col.text<User>('id'),
        col.text<User>('name', { sortable: true, width: 200 }),
        col.text<User>('email', { sortable: true, width: 250 }),
        col.text<User>('role', { sortable: true, width: 120 }),
        col.text<User>('status', { sortable: true, width: 100 }),
      ]}
      pageSizeOptions={[5, 10, 20]}
      defaultPageSize={5}
    />
  );
}
