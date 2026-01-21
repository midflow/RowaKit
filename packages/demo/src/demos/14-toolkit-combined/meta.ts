/**
 * Demo 14: Table Toolkit Combined
 * Metadata and documentation
 */

export const meta = {
  id: '14-toolkit-combined',
  title: 'Table Toolkit Combined',
  description:
    'Complete toolkit showcasing RowaKitTable, QueryToolbar, and ActionBar working together.',
  keywords: ['toolkit', 'query-toolbar', 'action-bar', 'table', 'integration'],
  difficulty: 'intermediate',
  learningOutcomes: [
    'Compose QueryToolbar + ActionBar + RowaKitTable',
    'Manage shared state across components',
    'Handle search, filters, and bulk operations',
    'Orchestrate consumer-driven interactions',
    'Build complete data management UI',
  ],
  notes: `
## Table Toolkit Overview

The **Table Toolkit** consists of three composable components:

1. **QueryToolbar**: Controls and visualizes query state
2. **ActionBar**: Manages bulk operations on selections
3. **RowaKitTable**: Server-side paginated data display

### Architecture

\`\`\`
┌─────────────────────────────────────────┐
│      Parent Component (State)           │
│  ┌─────────────────────────────────────┐│
│  │  QueryToolbar                       ││
│  │  (search, filters, sort, actions)   ││
│  └─────────────────────────────────────┘│
│  ┌─────────────────────────────────────┐│
│  │  ActionBar                          ││
│  │  (selection summary + bulk ops)     ││
│  └─────────────────────────────────────┘│
│  ┌─────────────────────────────────────┐│
│  │  RowaKitTable                       ││
│  │  (data display + pagination)        ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
\`\`\`

### State Management Pattern

The consumer (parent) manages all state:

\`\`\`typescript
// Parent component
const [search, setSearch] = useState('');
const [selected, setSelected] = useState<string[]>([]);
const [filterCount, setFilterCount] = useState(0);

return (
  <QueryToolbar ... />
  <ActionBar ... />
  <RowaKitTable ... />
);
\`\`\`

### Benefits

✅ **No tight coupling** between components
✅ **Flexible** - use all three or individually
✅ **Testable** - each component is independent
✅ **Extensible** - easy to add custom components
✅ **Consumer control** - you decide the interactions

### Real-World Usage

Perfect for:
- Admin dashboards
- Data management UIs
- Server-side filtered lists
- Multi-select workflows
- Bulk data operations
  `,
};
