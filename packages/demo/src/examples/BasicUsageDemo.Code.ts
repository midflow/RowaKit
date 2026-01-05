/**
 * BasicUsageDemo Code - Clean, documentable snippet
 * Shows: pagination, sorting, basic columns, actions
 */

export const code = `import { RowaKitTable, col } from '@rowakit/table';
import type { Fetcher } from '@rowakit/table';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  active: boolean;
  createdAt: Date;
}

// Mock fetcher (simulate server)
const fetchUsers: Fetcher<User> = async (query) => {
  const response = await fetch('/api/users', {
    body: JSON.stringify({
      page: query.page,
      pageSize: query.pageSize,
      sort: query.sort,
    }),
  });
  return response.json();
};

export default function UserTable() {
  const handleEdit = (user: User) => {
    console.log('Edit:', user);
  };

  const handleDelete = async (user: User) => {
    if (confirm(\`Delete \${user.name}?\`)) {
      // Call API to delete
    }
  };

  return (
    <RowaKitTable
      fetcher={fetchUsers}
      columns={[
        col.text<User>('name', { header: 'User Name', sortable: true }),
        col.text<User>('email', { sortable: true }),
        col.text<User>('role', { sortable: true }),
        col.date<User>('createdAt', { header: 'Joined' }),
        col.boolean<User>('active', { header: 'Status' }),
        col.actions<User>([
          { id: 'edit', label: 'Edit', onClick: handleEdit },
          { id: 'delete', label: 'Delete', onClick: handleDelete, confirm: true },
        ]),
      ]}
      rowKey="id"
    />
  );
}`;
