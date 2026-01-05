/**
 * CustomColumnsDemo Code - Advanced rendering with custom columns
 * Shows: col.custom() escape hatch for complex rendering
 */

export const code = `import { RowaKitTable, col } from '@rowakit/table';
import type { Fetcher } from '@rowakit/table';

interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee: string;
  dueDate: Date;
}

const fetchTasks: Fetcher<Task> = async (query) => {
  // Your API call here
  const items: Task[] = [];
  return { items, total: 0 };
};

export default function TaskBoard() {
  return (
    <RowaKitTable
      fetcher={fetchTasks}
      columns={[
        col.text<Task>('title', { header: 'Task', sortable: true }),
        
        // Custom priority badge
        col.custom<Task>({
          header: 'Priority',
          render: (task) => (
            <span
              style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '4px',
                backgroundColor:
                  task.priority === 'high'
                    ? '#fee'
                    : task.priority === 'medium'
                      ? '#ffeaa7'
                      : '#d4edda',
                color:
                  task.priority === 'high'
                    ? '#c00'
                    : task.priority === 'medium'
                      ? '#856404'
                      : '#155724',
                fontSize: '0.875rem',
              }}
            >
              {task.priority}
            </span>
          ),
        }),
        
        col.text<Task>('status'),
        col.text<Task>('assignee'),
      ]}
      rowKey="id"
    />
  );
}`;
