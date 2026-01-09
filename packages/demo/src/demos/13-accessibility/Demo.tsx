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
 * Demo 13: Accessibility Baseline
 *
 * Shows keyboard navigation and screen reader support.
 * All features are accessible via keyboard alone.
 */
export default function AccessibilityDemo() {
  return (
    <div className="demo-container">
      <h2>Accessibility Demo</h2>
      <p>
        This demo showcases built-in accessibility features. Try navigating with your keyboard:
      </p>

      <div className="a11y-checklist">
        <h3>Keyboard Navigation</h3>
        <ul>
          <li>
            <strong>Tab</strong> to sortable column headers (they have underlined text)
          </li>
          <li>
            <strong>Enter</strong> or <strong>Space</strong> to sort by column
          </li>
          <li>
            <strong>Shift+Space</strong> to add secondary sort
          </li>
          <li>
            <strong>Tab</strong> to action buttons in the "Actions" column
          </li>
          <li>
            <strong>Enter</strong> to trigger action
          </li>
          <li>
            <strong>ESC</strong> to close confirmation dialogs
          </li>
        </ul>
      </div>

      <div className="a11y-features">
        <h3>Screen Reader Features</h3>
        <ul>
          <li>Sortable headers announce sort direction (ascending/descending)</li>
          <li>Confirmation modals have proper dialog semantics</li>
          <li>Modal focus trap ensures tab stays within modal</li>
          <li>Button labels are clear and descriptive</li>
          <li>Table structure uses semantic HTML (&lt;table&gt;, &lt;thead&gt;, &lt;tbody&gt;)</li>
        </ul>
      </div>

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
              id: 'edit',
              label: 'Edit',
              onClick: (row) => alert(`Editing: ${row.name}`),
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
            id: 'approve',
            label: 'Approve',
            onClick: (keys) => alert(`Approved ${keys.length} users`),
          },
          {
            id: 'delete',
            label: 'Delete Selected',
            confirm: {
              title: 'Delete Users',
              description: 'This action cannot be undone.',
            },
            onClick: (keys) => alert(`Deleted ${keys.length} users`),
          },
        ]}
        pageSizeOptions={[5, 10, 20]}
        defaultPageSize={5}
      />
    </div>
  );
}
