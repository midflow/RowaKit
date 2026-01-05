/**
 * Demo 03: Row Actions
 * Metadata and documentation
 */

export const meta = {
  title: 'Row Actions',
  description: 'Handle row actions with confirmation dialogs and async operations.',
  keywords: ['actions', 'confirm', 'async', 'user-feedback'],
  difficulty: 'beginner',
  learningOutcomes: [
    'Create action buttons with col.actions',
    'Handle async operations with feedback',
    'Show confirmation dialogs before destructive actions',
    'Provide user feedback with state management',
  ],
  notes: `
## Row Actions API

\`\`\`typescript
col.actions<T>([
  {
    id: 'edit',
    label: 'Edit',
    onClick: (item) => { /* ... */ },
  },
  {
    id: 'delete',
    label: 'Delete',
    onClick: (item) => { /* ... */ },
    confirm: true,  // Shows confirmation dialog
  },
])
\`\`\`

## Async Operations

For async operations, wrap API calls in the action handler:

\`\`\`typescript
const handleDelete = async (task: Task) => {
  const response = await fetch(\`/api/tasks/\${task.id}\`, {
    method: 'DELETE',
  });
  if (response.ok) {
    // Refresh table or show success message
  }
};
\`\`\`

## User Feedback

Always provide feedback to users:
- Show loading state
- Display success/error messages
- Use confirmation for destructive actions

\`\`\`typescript
const [message, setMessage] = useState('');
const handleAction = async (item: T) => {
  setMessage('Processing...');
  try {
    await api.doSomething(item);
    setMessage('✓ Success!');
  } catch (err) {
    setMessage('✗ Error');
  }
  setTimeout(() => setMessage(''), 3000);
};
\`\`\`

## Next Steps

Learn about filtering and server-side queries in the next demo.
  `,
};
