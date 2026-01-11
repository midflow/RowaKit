import { RowaKitTable, col } from '@rowakit/table';
import type { Fetcher, BulkActionDef, Exporter } from '@rowakit/table';

/**
 * Consumer Smoke Test — Type Safety Validation
 *
 * This app validates that:
 * 1. All public types are exported
 * 2. TypeScript inference works without `any`
 * 3. Component renders successfully
 */

interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  active: boolean;
  role: 'admin' | 'user' | 'guest';
  salary: number;
  joinedAt: string;
}

// Mock data generator
const generateUsers = (count: number): User[] => {
  const roles: Array<'admin' | 'user' | 'guest'> = ['admin', 'user', 'guest'];
  return Array.from({ length: count }, (_, i) => ({
    id: `user-${i + 1}`,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    age: 20 + (i % 50),
    active: i % 3 !== 0,
    role: roles[i % roles.length],
    salary: 30000 + i * 1000,
    joinedAt: new Date(2020 + (i % 5), (i % 12), 1).toISOString(),
  }));
};

const allUsers = generateUsers(1000);

// Fetcher with proper typing (no `any`)
const fetchUsers: Fetcher<User> = async (query) => {
  await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate network

  let filtered = [...allUsers];

  // Apply filters
  if (query.filters) {
    Object.entries(query.filters).forEach(([field, filterValue]) => {
      if (filterValue && typeof filterValue === 'object' && 'value' in filterValue) {
        const { op, value } = filterValue as { op: string; value: unknown };
        
        if (op === 'contains' && typeof value === 'string') {
          filtered = filtered.filter((user) =>
            String(user[field as keyof User]).toLowerCase().includes(value.toLowerCase())
          );
        } else if (op === 'equals') {
          filtered = filtered.filter((user) => user[field as keyof User] === value);
        } else if (op === 'range' && typeof value === 'object' && value !== null) {
          const rangeValue = value as { from?: number; to?: number };
          filtered = filtered.filter((user) => {
            const val = user[field as keyof User] as number;
            if (rangeValue.from !== undefined && val < rangeValue.from) return false;
            if (rangeValue.to !== undefined && val > rangeValue.to) return false;
            return true;
          });
        }
      }
    });
  }

  // Apply sorting (multi-sort support)
  if (query.sorts && query.sorts.length > 0) {
    filtered.sort((a, b) => {
      for (const sortCol of query.sorts!) {
        const aVal = a[sortCol.field as keyof User];
        const bVal = b[sortCol.field as keyof User];
        
        if (aVal < bVal) return sortCol.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortCol.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  } else if (query.sort) {
    // Fallback to old single-sort format
    const { field, direction } = query.sort;
    filtered.sort((a, b) => {
      const aVal = a[field as keyof User];
      const bVal = b[field as keyof User];
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Apply pagination
  const start = (query.page - 1) * query.pageSize;
  const end = start + query.pageSize;
  const items = filtered.slice(start, end);

  return {
    items,
    total: filtered.length,
  };
};

// Bulk actions with proper typing (no `any`)
const bulkActions: BulkActionDef[] = [
  {
    id: 'activate',
    label: 'Activate selected',
    onClick: (keys) => {
      console.log('Activating users:', keys);
      alert(`Would activate ${keys.length} users`);
    },
  },
  {
    id: 'delete',
    label: 'Delete selected',
    confirm: {
      title: 'Confirm deletion',
      description: 'Are you sure you want to delete these users?',
    },
    onClick: (keys) => {
      console.log('Deleting users:', keys);
      alert(`Would delete ${keys.length} users`);
    },
  },
];

// Exporter with proper typing (no `any`)
const exporter: Exporter = async (query) => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  console.log('Export requested with query:', query);
  
  // In real app, this would trigger server-side CSV generation
  const mockUrl = `data:text/csv;charset=utf-8,${encodeURIComponent('id,name,email\n')}`;
  
  return { url: mockUrl };
};

function App() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>RowaKit Consumer Smoke Test (Vite + React + TypeScript)</h1>
      <p>
        <strong>Purpose:</strong> Validate that all public APIs are properly typed and work without `any`.
      </p>
      <p>
        <strong>Features tested:</strong> Fetcher, BulkActionDef, Exporter, SortColumn, row selection, multi-sort
      </p>
      
      <hr style={{ margin: '2rem 0' }} />

      <RowaKitTable
        fetcher={fetchUsers}
        rowKey="id"
        enableRowSelection
        bulkActions={bulkActions}
        exporter={exporter}
        columns={[
          col.text('name', { 
            header: 'Name', 
            sortable: true,
          }),
          col.text('email', { 
            header: 'Email',
            sortable: true,
          }),
          col.number('age', { 
            header: 'Age', 
            sortable: true,
          }),
          col.badge('role', {
            header: 'Role',
            sortable: true,
            map: {
              admin: { label: 'Admin', tone: 'danger' },
              user: { label: 'User', tone: 'success' },
              guest: { label: 'Guest', tone: 'neutral' },
            },
          }),
          col.number('salary', {
            header: 'Salary',
            sortable: true,
            format: (val) => new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(val),
          }),
          col.boolean('active', { 
            header: 'Active',
            sortable: true,
          }),
          col.date('joinedAt', { 
            header: 'Joined',
            sortable: true,
          }),
          col.actions<User>([
            { 
              id: 'edit', 
              label: 'Edit',
              onClick: (row) => alert(`Edit user: ${row.name}`),
            },
            { 
              id: 'view', 
              label: 'View',
              onClick: (row) => alert(`View user: ${row.name}`),
            },
            { 
              id: 'delete', 
              label: 'Delete', 
              confirm: true,
              onClick: (row) => console.log('Delete user:', row.id),
            },
          ]),
        ]}
      />
    </div>
  );
}

export default App;
