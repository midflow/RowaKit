/**
 * Demo 12: QueryToolbar Component
 * Metadata and documentation
 */

export const meta = {
  id: '12-query-toolbar',
  title: 'QueryToolbar Component',
  description:
    'Table-adjacent component for controlling and visualizing query state (search, filters, sort, actions).',
  keywords: ['query-toolbar', 'search', 'filters', 'toolkit', 'component'],
  difficulty: 'intermediate',
  learningOutcomes: [
    'Use QueryToolbar as a standalone component',
    'Manage search and filter state',
    'Display sort information',
    'Add custom action buttons',
    'Integrate with table controls',
  ],
  notes: `
## QueryToolbar Overview

The **QueryToolbar** component provides a unified interface for query controls above a table or data view.

### Key Features

- **Search Input**: Built-in search with clear button
- **Filter Badge**: Shows active filter count
- **Sort Info**: Display current sort order
- **Custom Actions**: Add export, refresh, or other buttons
- **Lightweight**: No dependencies on RowaKitTable

### Props

- \`searchQuery\`: Current search text
- \`onSearchChange\`: Callback when search changes
- \`activeFilterCount\`: Number of active filters
- \`onFilterClick\`: Callback to open filter panel
- \`sortInfo\`: Display current sort (optional)
- \`actions\`: React elements for custom buttons
- \`className\`: Custom CSS class

### Usage

\`\`\`typescript
<QueryToolbar
  searchQuery={search}
  onSearchChange={setSearch}
  activeFilterCount={filterCount}
  onFilterClick={() => openFilterPanel()}
  sortInfo="Name (A→Z)"
  actions={<button>Export</button>}
/>
\`\`\`

### Standalone

QueryToolbar works independently - no table required! Use with:
- API-driven data grids
- Search interfaces
- Command palettes
- Custom data views

### Consumer Orchestration

State is managed by the consumer (parent component). The component is a pure UI control.
  `,
};
