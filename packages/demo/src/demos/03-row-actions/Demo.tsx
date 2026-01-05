/**
 * Demo 03: Row Actions
 * Shows how to handle async row actions with user feedback and error handling
 */

import { RowaKitTable, col } from '@rowakit/table';
import type { Fetcher } from '@rowakit/table';
import { useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
}

const MOCK_USERS: User[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', status: 'active' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'inactive' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', status: 'active' },
  { id: '4', name: 'Alice Williams', email: 'alice@example.com', status: 'active' },
  { id: '5', name: 'Charlie Brown', email: 'charlie@example.com', status: 'inactive' },
];

const fetchUsers: Fetcher<User> = async (query) => {
  await new Promise((r) => setTimeout(r, 300));
  const start = (query.page - 1) * query.pageSize;
  return {
    items: MOCK_USERS.slice(start, start + query.pageSize),
    total: MOCK_USERS.length,
  };
};

export default function RowActionsDemo() {
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleArchive = async (user: User) => {
    const confirmed = window.confirm(`Archive "${user.name}"?`);
    if (!confirmed) return;

    try {
      setFeedback(null);
      // Simulate async API call
      await new Promise((r) => setTimeout(r, 800));
      setFeedback({ type: 'success', message: `✓ Archived "${user.name}"` });
    } catch (error) {
      setFeedback({ type: 'error', message: `Failed to archive "${user.name}"` });
    }
  };

  const handleSendEmail = async (user: User) => {
    try {
      setFeedback(null);
      await new Promise((r) => setTimeout(r, 500));
      setFeedback({ type: 'success', message: `✓ Email sent to ${user.email}` });
    } catch (error) {
      setFeedback({ type: 'error', message: 'Failed to send email' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {feedback && (
        <div
          style={{
            padding: '12px',
            borderRadius: '6px',
            backgroundColor: feedback.type === 'success' ? '#d4edda' : '#f8d7da',
            color: feedback.type === 'success' ? '#155724' : '#721c24',
            fontSize: '13px',
          }}
        >
          {feedback.message}
        </div>
      )}

      <div style={{ backgroundColor: '#f0f9ff', padding: '12px', borderRadius: '6px', fontSize: '13px' }}>
        <strong>Demo Notes:</strong> Click Archive or Email to trigger async handlers. Confirmations prevent accidental actions.
      </div>

      <RowaKitTable
        fetcher={fetchUsers}
        columns={[
          col.text<User>('name', { sortable: true }),
          col.text<User>('email'),
          col.text<User>('status', { sortable: true }),
          col.actions<User>([
            {
              id: 'archive',
              label: 'Archive',
              onClick: (row) => handleArchive(row),
            },
            {
              id: 'email',
              label: 'Email',
              onClick: (row) => handleSendEmail(row),
            },
          ]),
        ]}
        rowKey="id"
        defaultPageSize={10}
      />
    </div>
  );
}
