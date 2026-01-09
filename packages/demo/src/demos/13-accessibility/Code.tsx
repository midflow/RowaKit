import { SmartTable } from '@rowakit/table';
import { col } from '@rowakit/table';
import type { Fetcher } from '@rowakit/table';

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
 * Accessibility Code Example
 *
 * Demonstrates accessible table with all Stage E features.
 * Keyboard navigation and screen reader support built-in.
 */
export default function AccessibilityCode() {
  return (
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
            label: 'View User',
            onClick: (row) => alert(`Viewing: ${row.name}`),
          },
          {
            id: 'delete',
            label: 'Delete',
            confirm: true,
            onClick: (row) => alert(`Deleted: ${row.name}`),
          },
        ]),
      ]}
      enableRowSelection={true}
      bulkActions={[
        {
          id: 'delete',
          label: 'Delete Selected',
          confirm: {
            title: 'Delete Users',
            description: 'This action cannot be undone.',
          },
          onClick: (keys) => console.log('Deleted:', keys),
        },
      ]}
      pageSizeOptions={[5, 10, 20]}
      defaultPageSize={5}
    />
  );
}
