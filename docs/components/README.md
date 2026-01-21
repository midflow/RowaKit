# Table Toolkit Components

The RowaKit Table Toolkit includes three components designed to work together for server-side data management:

## Components

### 1. RowaKitTable
Server-side table with pagination, sorting, filtering, URL sync, saved views, and CSV export.

**See:** [Full Table Documentation](../API_STABILITY.md)

### 2. QueryToolbar
Control and visualize query state (search, filters, sort).

**See:** [QueryToolbar Documentation](./QueryToolbar.md)

**Key Features:**
- Search input with clear button
- Filter count badge
- Sort info display
- Custom action buttons

### 3. ActionBar
Selection summary and bulk action triggers.

**See:** [ActionBar Documentation](./ActionBar.md)

**Key Features:**
- Selection count display
- Clear selection button
- Bulk action buttons
- Auto-hides when empty

## Usage Philosophy

All toolkit components follow these principles:

1. **Standalone capable** — Each component can be used independently
2. **Consumer orchestrates** — State management is your responsibility
3. **No auto-connection** — Components don't connect to each other automatically
4. **Minimal API surface** — Predictable, focused props

## Combined Example

```tsx
import { RowaKitTable, QueryToolbar, ActionBar, col } from '@rowakit/table';

function UsersPage() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  
  return (
    <>
      {/* Query control */}
      <QueryToolbar
        searchQuery={search}
        onSearchChange={setSearch}
        activeFilterCount={0}
      />
      
      {/* Bulk actions */}
      <ActionBar
        selectedCount={selected.length}
        actions={[
          { 
            id: 'delete', 
            label: 'Delete', 
            onClick: handleDelete,
            variant: 'danger'
          }
        ]}
        onClearSelection={() => setSelected([])}
      />
      
      {/* Table */}
      <RowaKitTable
        fetcher={(query) => fetchUsers({ ...query, search })}
        enableRowSelection
        onSelectionChange={setSelected}
        columns={[
          col.text('name', { header: 'Name' }),
          col.text('email', { header: 'Email' }),
        ]}
      />
    </>
  );
}
```

## Live Demo

**Combined Demo:** [Demo 14 - Toolkit Combined](../../packages/demo/src/demos/14-toolkit-combined/Demo.tsx)

Individual demos:
- [Demo 12 - QueryToolbar](../../packages/demo/src/demos/12-query-toolbar/Demo.tsx)
- [Demo 13 - ActionBar](../../packages/demo/src/demos/13-action-bar/Demo.tsx)

## Scope Locks

**What the toolkit does NOT include:**

❌ FilterPanel implementation (consumer builds this)
❌ Cross-page selection (table is page-scoped)
❌ Background job management
❌ Permission/authorization logic
❌ Auto-wiring between components

**Why?** These features require domain-specific decisions that should remain in your application code.

## Architecture

```
┌─────────────────────────────────────────┐
│           Your Application              │
│  (manages state & orchestrates)         │
└────┬──────────┬──────────┬──────────────┘
     │          │          │
     ▼          ▼          ▼
┌──────────┐ ┌───────────┐ ┌──────────────┐
│  Query   │ │  Action   │ │  RowaKit     │
│ Toolbar  │ │   Bar     │ │   Table      │
└──────────┘ └───────────┘ └──────────────┘
```

Consumer controls:
- Query state (search, filters, sort)
- Selection state
- Data fetching logic
- Business workflows
