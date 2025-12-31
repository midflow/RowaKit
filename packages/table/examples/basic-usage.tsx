/**
 * Basic Usage Example - RowaKitTable with Server-Side Data
 * 
 * This example demonstrates:
 * - Setting up a fetcher function for server-side data
 * - Defining columns with different types
 * - Handling pagination, sorting, and actions
 * - Error and loading states
 */

/* eslint-disable no-console */

import React from 'react';
import { RowaKitTable, col } from '@rowakit/table';
import type { Fetcher } from '@rowakit/table';

// 1. Define your data type
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  active: boolean;
  createdAt: Date;
}

// 2. Create a fetcher function that calls your API
const fetchUsers: Fetcher<User> = async (query) => {
  // Build query parameters
  const params = new URLSearchParams({
    page: query.page.toString(),
    pageSize: query.pageSize.toString(),
  });

  // Add sorting if present
  if (query.sort) {
    params.append('sortBy', query.sort.field);
    params.append('sortOrder', query.sort.direction);
  }

  // Call your API
  const response = await fetch(`/api/users?${params}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }

  // Return data in the expected format
  const data = await response.json();
  return {
    items: data.users,
    total: data.total,
  };
};

// 3. Create your table component
export function UsersTable() {
  const handleEdit = (user: User) => {
    console.log('Editing user:', user);
    // Navigate to edit page or open modal
  };

  const handleDelete = async (user: User) => {
    console.log('Deleting user:', user);
    // Call delete API
    await fetch(`/api/users/${user.id}`, { method: 'DELETE' });
    // Table will automatically refetch
  };

  return (
    <div>
      <h1>Users Management</h1>
      <RowaKitTable
        fetcher={fetchUsers}
        columns={[
          col.text<User>('name', {
            header: 'Full Name',
            sortable: true,
          }),
          col.text<User>('email', {
            header: 'Email Address',
            sortable: true,
          }),
          col.text<User>('role', {
            header: 'Role',
            format: (value) => value.toUpperCase(),
          }),
          col.boolean<User>('active', {
            header: 'Status',
            format: (active) => (active ? 'Active' : 'Inactive'),
          }),
          col.date<User>('createdAt', {
            header: 'Joined',
            sortable: true,
            format: (date) => new Date(date).toLocaleDateString(),
          }),
          col.actions<User>([
            {
              id: 'edit',
              label: 'Edit',
              icon: '✏️',
              onClick: handleEdit,
            },
            {
              id: 'delete',
              label: 'Delete',
              icon: '🗑️',
              confirm: true,
              disabled: (user) => user.role === 'admin',
              onClick: handleDelete,
            },
          ]),
        ]}
        rowKey="id"
        defaultPageSize={20}
        pageSizeOptions={[10, 20, 50, 100]}
      />
    </div>
  );
}
