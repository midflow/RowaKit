/**
 * Demo 13: ActionBar Component
 * Metadata and documentation
 */

export const meta = {
  id: '13-action-bar',
  title: 'ActionBar Component',
  description:
    'Table-adjacent component for displaying selection summary and bulk action triggers.',
  keywords: ['action-bar', 'bulk-actions', 'selection', 'toolkit', 'component'],
  difficulty: 'intermediate',
  learningOutcomes: [
    'Use ActionBar as a standalone component',
    'Display selection count and total',
    'Trigger bulk operations',
    'Handle clear selection',
    'Use action variants (default, danger)',
  ],
  notes: `
## ActionBar Overview

The **ActionBar** component provides a sticky bar for bulk operations on selected items.

### Key Features

- **Selection Display**: Shows selected/total count
- **Clear Button**: Easy way to deselect all
- **Bulk Actions**: Multiple action buttons with variants
- **Auto-hide**: Disappears when selection is empty
- **Variants**: Default (primary) and danger (destructive) actions
- **Lightweight**: No dependencies on RowaKitTable

### Props

- \`selectedCount\`: Number of selected items
- \`totalCount\`: Total items (optional)
- \`actions\`: Array of ActionBarAction objects
- \`onClearSelection\`: Callback to clear selection
- \`className\`: Custom CSS class

### ActionBarAction Interface

\`\`\`typescript
interface ActionBarAction {
  id: string;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
  disabled?: boolean;
}
\`\`\`

### Usage

\`\`\`typescript
<ActionBar
  selectedCount={selected.length}
  totalCount={100}
  actions={[
    {
      id: 'export',
      label: 'Export Selected',
      onClick: () => exportSelected(selected),
    },
    {
      id: 'delete',
      label: 'Delete',
      onClick: () => deleteSelected(selected),
      variant: 'danger',
    },
  ]}
  onClearSelection={() => setSelected([])}
/>
\`\`\`

### Standalone

ActionBar works independently - perfect for:
- Multi-select lists
- Bulk item management
- Data grids without RowaKitTable
- Custom selection UIs

### Consumer Orchestration

The consumer manages all state - ActionBar is a pure UI control that triggers callbacks.
  `,
};
