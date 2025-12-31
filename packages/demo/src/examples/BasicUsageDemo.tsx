import React from 'react';
import { RowaKitTable, col } from '@rowakit/table';
import type { Fetcher } from '@rowakit/table';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  active: boolean;
  createdAt: Date;
}

// Mock API data
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    role: 'admin',
    active: true,
    createdAt: new Date('2023-01-15'),
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    role: 'user',
    active: true,
    createdAt: new Date('2023-03-22'),
  },
  {
    id: '3',
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    role: 'user',
    active: false,
    createdAt: new Date('2023-05-10'),
  },
  {
    id: '4',
    name: 'Diana Prince',
    email: 'diana@example.com',
    role: 'admin',
    active: true,
    createdAt: new Date('2023-02-28'),
  },
  {
    id: '5',
    name: 'Ethan Hunt',
    email: 'ethan@example.com',
    role: 'guest',
    active: true,
    createdAt: new Date('2023-06-15'),
  },
];

// Simulated API fetcher
const fetchUsers: Fetcher<User> = async (query) => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  let data = [...MOCK_USERS];

  if (query.sort) {
    data.sort((a, b) => {
      const aVal = a[query.sort!.field as keyof User];
      const bVal = b[query.sort!.field as keyof User];
      const result = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return query.sort!.direction === 'asc' ? result : -result;
    });
  }

  const start = (query.page - 1) * query.pageSize;
  const end = start + query.pageSize;
  const items = data.slice(start, end);

  return {
    items,
    total: data.length,
  };
};

export default function BasicUsageDemo() {
  const handleEdit = (user: User) => {
    alert(`Editing user: ${user.name}`);
  };

  const handleDelete = async (user: User) => {
    alert(`Deleting user: ${user.name}`);
  };

  return (
    <>
      <h2>Basic Usage Example</h2>
      <p>User management table with server-side pagination, sorting, and actions</p>
      
      <RowaKitTable
        fetcher={fetchUsers}
        columns={[
          col.text<User>('name', { header: 'User Name', sortable: true }),
          col.text<User>('email', { sortable: true }),
          col.text<User>('role', { sortable: true }),
          col.date<User>('createdAt', { header: 'Joined', sortable: true }),
          col.boolean<User>('active', { header: 'Status' }),
          col.actions<User>([
            { id: 'edit', label: 'Edit', onClick: handleEdit },
            { id: 'delete', label: 'Delete', onClick: handleDelete, confirm: true },
          ]),
        ]}
        rowKey="id"
      />
    </>
  );
}
