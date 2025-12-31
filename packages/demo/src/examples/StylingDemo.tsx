import React from 'react';
import { RowaKitTable, col } from '@rowakit/table';
import type { Fetcher } from '@rowakit/table';

interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee: string;
  dueDate: Date;
}

const MOCK_TASKS: Task[] = [
  {
    id: '1',
    title: 'Update documentation',
    status: 'in-progress',
    priority: 'high',
    assignee: 'Alice',
    dueDate: new Date('2024-12-15'),
  },
  {
    id: '2',
    title: 'Fix navigation bug',
    status: 'todo',
    priority: 'medium',
    assignee: 'Bob',
    dueDate: new Date('2024-12-20'),
  },
  {
    id: '3',
    title: 'Deploy to staging',
    status: 'done',
    priority: 'low',
    assignee: 'Charlie',
    dueDate: new Date('2024-12-10'),
  },
];

const fetchTasks: Fetcher<Task> = async () => {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return {
    items: MOCK_TASKS,
    total: MOCK_TASKS.length,
  };
};

export default function StylingDemo() {
  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'done':
        return { bg: '#d1fae5', color: '#065f46' };
      case 'in-progress':
        return { bg: '#dbeafe', color: '#1e40af' };
      case 'todo':
        return { bg: '#f3f4f6', color: '#374151' };
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return '#dc2626';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#10b981';
    }
  };

  return (
    <>
      <style>{`
        .custom-theme-table {
          --rowakit-color-primary-600: #8b5cf6;
          --rowakit-color-border: #e9d5ff;
        }
        
        .custom-theme-table table thead tr {
          background: linear-gradient(to right, #f3e8ff, #fae8ff);
        }
        
        .custom-theme-table table tbody tr:hover {
          background-color: #faf5ff;
        }
      `}</style>

      <h2>Styling Example</h2>
      <p>Custom theming with CSS variables and className prop</p>
      
      <RowaKitTable
        fetcher={fetchTasks}
        className="custom-theme-table"
        columns={[
          col.text<Task>('title', { header: 'Task' }),
          col.custom<Task>({
            id: 'status',
            header: 'Status',
            render: (task) => {
              const colors = getStatusColor(task.status);
              return (
                <span
                  style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    backgroundColor: colors.bg,
                    color: colors.color,
                  }}
                >
                  {task.status}
                </span>
              );
            },
          }),
          col.custom<Task>({
            id: 'priority',
            header: 'Priority',
            render: (task) => (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  style={{
                    width: '0.5rem',
                    height: '0.5rem',
                    borderRadius: '50%',
                    backgroundColor: getPriorityColor(task.priority),
                  }}
                />
                <span style={{ textTransform: 'capitalize' }}>{task.priority}</span>
              </div>
            ),
          }),
          col.text<Task>('assignee'),
          col.custom<Task>({
            id: 'dueDate',
            header: 'Due Date',
            render: (task) => {
              const isOverdue = task.dueDate < new Date() && task.status !== 'done';
              return (
                <span style={{ color: isOverdue ? '#dc2626' : 'inherit' }}>
                  {task.dueDate.toLocaleDateString()}
                  {isOverdue && ' ⚠️'}
                </span>
              );
            },
          }),
        ]}
        rowKey="id"
      />
    </>
  );
}
