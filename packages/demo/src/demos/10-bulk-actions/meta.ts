/**
 * Demo 10: Bulk Actions
 * Metadata and documentation
 */

export const meta = {
  title: 'Bulk Actions',
  description: 'Perform grouped operations on multiple selected rows with confirmation (Stage E).',
  keywords: ['bulk', 'actions', 'selection', 'confirmation', 'workflow', 'stage-e'],
  difficulty: 'intermediate',
  learningOutcomes: [
    'Define bulk actions with bulkActions prop',
    'Add confirmation dialogs for destructive operations',
    'Handle bulk action callbacks with selected keys',
    'Use BulkActionBar to display actions when rows selected',
  ],
  notes: `
## Key Points

- **bulkActions**: Array of action definitions with id, label, and onClick
- **Confirmation**: Optional \`confirm\` object with title and description
- **Selected Keys**: Action callback receives Array<string | number> of selected row keys
- **BulkActionBar**: Automatically shows when selection > 0
- **Integration**: Works seamlessly with row selection feature

## Example

\`\`\`typescript
const bulkActions = [
  {
    id: 'approve',
    label: 'Approve Selected',
    onClick: (keys) => {
      console.log('Approving:', keys);
      // Call API to approve
    }
  },
  {
    id: 'delete',
    label: 'Delete Selected',
    confirm: {
      title: 'Delete Users',
      description: 'This action cannot be undone.'
    },
    onClick: (keys) => {
      // Delete operation
    }
  }
];
\`\`\`

## Next Steps

Combine with CSV export to support bulk operations with data export.
  `,
};
