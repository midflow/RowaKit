/**
 * Demo 01: Basic Table
 * Metadata and documentation
 */

export const meta = {
  title: 'Basic Table',
  description: 'Minimal table with columns, pagination, and sorting.',
  keywords: ['pagination', 'sorting', 'columns', 'intro', 'getting-started'],
  difficulty: 'beginner',
  learningOutcomes: [
    'Create a table with RowaKitTable',
    'Define columns using col.text, col.date, col.boolean',
    'Enable sorting on columns',
    'Handle pagination via fetcher',
    'Add row actions (Edit, Delete)',
  ],
  notes: `
## Key Points

- **Sorting**: Set \`sortable: true\` on columns to enable server-side sorting
- **Pagination**: The fetcher receives \`query.page\` and \`query.pageSize\`
- **Row Actions**: Use \`col.actions\` to add context menu buttons
- **Confirm**: Set \`confirm: true\` on actions to show a confirmation dialog

## Common Patterns

\`\`\`typescript
// Enable sorting
col.text<T>('fieldName', { sortable: true })

// Format values
col.number<T>('price', { format: (v) => \`\$\${v.toFixed(2)}\` })

// Add actions
col.actions<T>([
  { id: 'edit', label: 'Edit', onClick: handleEdit },
  { id: 'delete', label: 'Delete', onClick: handleDelete, confirm: true },
])
\`\`\`

## Next Steps

Try adding filters, custom columns, or URL synchronization in the next demos.
  `,
};
