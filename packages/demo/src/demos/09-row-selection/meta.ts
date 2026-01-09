/**
 * Demo 09: Row Selection
 * Metadata and documentation
 */

export const meta = {
  title: 'Row Selection',
  description: 'Select rows with checkboxes for bulk operations (Stage E).',
  keywords: ['selection', 'checkboxes', 'bulk', 'workflow', 'stage-e'],
  difficulty: 'intermediate',
  learningOutcomes: [
    'Enable row selection with enableRowSelection',
    'Track selected rows via onSelectionChange',
    'Use header checkbox to select/deselect page',
    'Understand automatic reset on page change',
  ],
  notes: `
## Key Points

- **enableRowSelection**: Set to \`true\` to add checkboxes
- **onSelectionChange**: Callback receives array of selected row keys
- **Page-scoped**: Only affects current page (prevents confusion)
- **Header checkbox**: Indeterminate state when partially selected
- **Auto-reset**: Selection clears when page or dataset changes

## Example

\`\`\`typescript
<SmartTable
  fetcher={fetcher}
  columns={columns}
  enableRowSelection={true}
  onSelectionChange={(keys) => {
    console.log('Selected:', keys);
    setSelectedKeys(keys);
  }}
/>
\`\`\`

## Integration with Bulk Actions

Selection is the foundation for bulk operations. See the next demo for examples.
  `,
};
