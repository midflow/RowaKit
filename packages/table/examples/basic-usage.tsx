/**
 * Basic Usage Example - RowaKitTable with Server-Side Data
 * 
 * This example demonstrates:
 * - Setting up a fetcher function for server-side data
 * - Defining columns with different types (text, date, boolean, actions)
 * - Handling pagination, sorting, and column actions
 * - Error and loading states (automatic)
 * - Row keys for unique identification
 * 
 * Key concept: The fetcher receives table query state and returns paginated results.
 * The table does NOT hold all data in memory — it fetches from the backend on demand.
 */

/* eslint-disable no-console */

import React from 'react';
import { RowaKitTable, col } from '@rowakit/table';
import type { Fetcher } from '@rowakit/table';

// 1. Define your data type - must match what your API returns
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  active: boolean;
  createdAt: Date;
}

// 2. Create a fetcher function that calls your API
// The fetcher is the bridge between the table UI and your backend
const fetchUsers: Fetcher<User> = async (query) => {
  // Build query parameters from table state
  const params = new URLSearchParams({
    page: query.page.toString(),
    pageSize: query.pageSize.toString(),
  });

  // Add sorting if the user clicked a sortable column
  if (query.sort) {
    params.append('sortBy', query.sort.field);
    params.append('sortOrder', query.sort.direction);
  }

  // Call your API endpoint
  const response = await fetch(`/api/users?${params}`);
  
  // Throw errors to trigger built-in error UI
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }

  // Return data in the expected format: { items: T[], total: number }
  // 'items' = rows for this page
  // 'total' = total row count (for pagination calculation)
  const data = await response.json();
  return {
    items: data.users,
    total: data.total,
  };
};

// 3. Create your table component
export function UsersTable() {
  // Handlers for row actions
  const handleEdit = (user: User) => {
    console.log('Editing user:', user);
    // Navigate to edit page or open modal
  };

  const handleDelete = async (user: User) => {
    console.log('Deleting user:', user);
    // Call delete API
    await fetch(`/api/users/${user.id}`, { method: 'DELETE' });
    // Table will automatically refetch to show updated data
  };

  return (
    <div>
      <h1>Users Management</h1>
      <RowaKitTable
        // Pass your fetcher - table will call it when page/sort changes
        fetcher={fetchUsers}
        // Unique identifier for each row (used for selection and re-rendering)
        rowKey="id"
        // Define columns and their display/behavior
        columns={[
          col.text<User>('name', {
            header: 'Full Name',
            sortable: true,  // User can click to sort; fetcher receives sort params
          }),
          col.text<User>('email', {
            header: 'Email Address',
            sortable: true,
          }),
          col.text<User>('role', {
            header: 'Role',
            // Format function: customize how the value is displayed
            format: (value) => value.toUpperCase(),
          }),
          col.boolean<User>('active', {
            header: 'Status',
            // Convert boolean to human-readable text
            format: (active) => (active ? 'Active' : 'Inactive'),
          }),
          col.date<User>('createdAt', {
            header: 'Joined',
            sortable: true,
            // Custom date formatting
            format: (date) => new Date(date).toLocaleDateString(),
          }),
          // Action buttons column
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
              confirm: true,  // Show confirmation dialog before calling onClick
              disabled: (user) => user.role === 'admin',  // Admin users cannot be deleted
              onClick: handleDelete,
            },
          ]),
        ]}
        // Optional: Set default page size (default is 10)
        defaultPageSize={20}
        // Optional: Allow user to change page size
        pageSizeOptions={[10, 20, 50, 100]}
      />
    </div>
  );
}
