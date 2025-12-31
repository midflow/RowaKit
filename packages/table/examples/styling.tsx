/**
 * Styling Example - Customizing Table Appearance
 * 
 * This example demonstrates:
 * - Using the className prop
 * - Customizing via CSS variables
 * - Creating custom themes
 * - Responsive styling
 */

/* eslint-disable no-console */

import React from 'react';
import { SmartTable, col } from '@rowakit/table';
import type { Fetcher } from '@rowakit/table';
import '@rowakit/table/styles';

interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee: string;
  dueDate: Date;
}

const fetchTasks: Fetcher<Task> = async () => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return {
    items: [
      {
        id: '1',
        title: 'Implement user authentication',
        status: 'in-progress',
        priority: 'high',
        assignee: 'Alice',
        dueDate: new Date('2024-04-15'),
      },
      {
        id: '2',
        title: 'Design landing page',
        status: 'done',
        priority: 'medium',
        assignee: 'Bob',
        dueDate: new Date('2024-03-20'),
      },
      {
        id: '3',
        title: 'Write API documentation',
        status: 'todo',
        priority: 'low',
        assignee: 'Charlie',
        dueDate: new Date('2024-05-01'),
      },
    ],
    total: 3,
  };
};

export function TasksTableWithCustomStyling() {
  const getStatusBadge = (status: Task['status']) => {
    const styles: Record<Task['status'], React.CSSProperties> = {
      todo: {
        backgroundColor: '#fef3c7',
        color: '#92400e',
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.875rem',
        fontWeight: '500',
      },
      'in-progress': {
        backgroundColor: '#dbeafe',
        color: '#1e40af',
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.875rem',
        fontWeight: '500',
      },
      done: {
        backgroundColor: '#d1fae5',
        color: '#065f46',
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.875rem',
        fontWeight: '500',
      },
    };

    const labels: Record<Task['status'], string> = {
      todo: 'To Do',
      'in-progress': 'In Progress',
      done: 'Done',
    };

    return <span style={styles[status]}>{labels[status]}</span>;
  };

  const getPriorityColor = (priority: Task['priority']) => {
    const colors: Record<Task['priority'], string> = {
      low: '#22c55e',
      medium: '#f59e0b',
      high: '#ef4444',
    };
    return colors[priority];
  };

  return (
    <div>
      <style>
        {`
          /* Custom theme using CSS variables */
          .custom-theme-table {
            --rowakit-color-primary-600: #8b5cf6;
            --rowakit-color-gray-50: #fafaf9;
            --rowakit-color-gray-100: #f5f5f4;
            --rowakit-color-gray-900: #1c1917;
            --rowakit-border-radius-md: 0.5rem;
            --rowakit-spacing-md: 1rem;
          }

          .custom-theme-table th {
            background: linear-gradient(to bottom, #fafafa, #f4f4f5);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            font-size: 0.75rem;
          }

          .custom-theme-table tbody tr:hover {
            background-color: #f9f5ff;
          }
        `}
      </style>

      <h1>Tasks Dashboard</h1>
      
      <SmartTable
        fetcher={fetchTasks}
        className="custom-theme-table"
        columns={[
          col.text<Task>('title', {
            header: 'Task Title',
          }),
          
          col.custom<Task>('status', {
            header: 'Status',
            renderCell: (task) => getStatusBadge(task.status),
          }),

          col.custom<Task>('priority', {
            header: 'Priority',
            renderCell: (task) => (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: getPriorityColor(task.priority),
                  }}
                />
                <span style={{ textTransform: 'capitalize' }}>
                  {task.priority}
                </span>
              </div>
            ),
          }),

          col.text<Task>('assignee', {
            header: 'Assigned To',
          }),

          col.date<Task>('dueDate', {
            header: 'Due Date',
            format: (date) => {
              const d = new Date(date);
              const isOverdue = d < new Date() && d.toDateString() !== new Date().toDateString();
              return (
                <span style={{ color: isOverdue ? '#ef4444' : 'inherit' }}>
                  {d.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                  {isOverdue && ' ⚠️'}
                </span>
              );
            },
          }),

          col.actions<Task>([
            {
              id: 'edit',
              label: 'Edit',
              icon: '✏️',
              onClick: (task) => console.log('Edit:', task.title),
            },
          ]),
        ]}
        rowKey="id"
      />
    </div>
  );
}
