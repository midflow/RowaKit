/**
 * Demo 06: Saved Views
 * Shows how to save and load table configurations from localStorage
 */

import { RowaKitTable, col } from '@rowakit/table';
import type { Fetcher } from '@rowakit/table';

interface Task {
  id: string;
  title: string;
  status: 'todo' | 'done';
  priority: 'low' | 'high';
}

const MOCK_TASKS: Task[] = [
  { id: '1', title: 'Setup project', status: 'done', priority: 'high' },
  { id: '2', title: 'Write tests', status: 'todo', priority: 'high' },
  { id: '3', title: 'Code review', status: 'done', priority: 'low' },
  { id: '4', title: 'Deploy', status: 'todo', priority: 'high' },
  { id: '5', title: 'Documentation', status: 'todo', priority: 'low' },
];

const fetchTasks: Fetcher<Task> = async (query) => {
  await new Promise((r) => setTimeout(r, 300));
  
  let data = [...MOCK_TASKS];
  
  // Apply sorting
  if (query.sort) {
    data.sort((a, b) => {
      const av = a[query.sort!.field as keyof Task];
      const bv = b[query.sort!.field as keyof Task];
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return query.sort!.direction === 'asc' ? cmp : -cmp;
    });
  }
  
  const start = (query.page - 1) * query.pageSize;
  return {
    items: data.slice(start, start + query.pageSize),
    total: data.length,
  };
};

export default function SavedViewsDemo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ backgroundColor: '#f0f9ff', padding: '12px', borderRadius: '6px', fontSize: '13px' }}>
        <strong>Demo Notes:</strong> Use the built-in Saved Views UI to save your current sort/page as a named view, then load it later. Views persist in localStorage.
      </div>

      <RowaKitTable
        fetcher={fetchTasks}
        columns={[
          col.text<Task>('title', { header: 'Title', sortable: true }),
          col.text<Task>('status', { header: 'Status', sortable: true }),
          col.text<Task>('priority', { header: 'Priority', sortable: true }),
        ]}
        rowKey="id"
        defaultPageSize={10}
        enableSavedViews={true}
      />
    </div>
  );
}
