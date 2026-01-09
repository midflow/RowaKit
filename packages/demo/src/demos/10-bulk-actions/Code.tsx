import { useState } from 'react';
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
 * Bulk Actions Code Example
 *
 * Demonstrates defining bulk actions with confirmation dialogs.
 */
export default function BulkActionsCode() {
  const [, setSelectedKeys] = useState<Array<string | number>>([]);

  return (
    <SmartTable
      fetcher={fetcher}
      columns={[
        col.text<User>('id'),
        col.text<User>('name', { sortable: true, width: 200 }),
        col.text<User>('email', { sortable: true, width: 250 }),
        col.text<User>('role', { sortable: true }),
      ]}
      enableRowSelection={true}
      onSelectionChange={setSelectedKeys}
      bulkActions={[
        {
          id: 'approve',
          label: 'Approve',
          onClick: (keys) => console.log('Approved:', keys),
        },
        {
          id: 'delete',
          label: 'Delete',
          confirm: {
            title: 'Delete Selected Users',
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
