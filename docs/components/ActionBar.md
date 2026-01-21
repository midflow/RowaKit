# ActionBar

Display selection summary and bulk action triggers.

## Installation

```bash
npm install @rowakit/table
```

## Usage

```tsx
import { ActionBar } from '@rowakit/table';

<ActionBar
  selectedCount={5}
  totalCount={100}
  actions={[
    { id: 'delete', label: 'Delete', onClick: handleDelete, variant: 'danger' }
  ]}
  onClearSelection={() => setSelected([])}
/>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `selectedCount` | `number` | Number of selected items (required) |
| `totalCount` | `number` | Total items available (optional, shows "X of Y") |
| `actions` | `ActionBarAction[]` | Bulk actions array |
| `onClearSelection` | `() => void` | Clear selection handler |
| `className` | `string` | Custom className |

## ActionBarAction

```typescript
interface ActionBarAction {
  id: string;              // Unique action ID
  label: string;           // Button label
  onClick: () => void;     // Click handler
  variant?: 'default' | 'danger';  // Visual style
  disabled?: boolean;      // Disabled state
}
```

## Standalone Usage

```tsx
function MyComponent() {
  const [selected, setSelected] = useState([]);
  
  return (
    <ActionBar
      selectedCount={selected.length}
      actions={[
        {
          id: 'export',
          label: 'Export Selected',
          onClick: () => exportData(selected),
        },
        {
          id: 'delete',
          label: 'Delete',
          onClick: () => deleteItems(selected),
          variant: 'danger',
        },
      ]}
      onClearSelection={() => setSelected([])}
    />
  );
}
```

## Combined with Table

```tsx
function UsersTable() {
  const [selected, setSelected] = useState<string[]>([]);
  
  return (
    <>
      <ActionBar
        selectedCount={selected.length}
        totalCount={users.length}
        actions={[
          {
            id: 'delete',
            label: `Delete ${selected.length}`,
            onClick: () => handleBulkDelete(selected),
            variant: 'danger',
          },
        ]}
        onClearSelection={() => setSelected([])}
      />
      
      <RowaKitTable
        fetcher={fetchUsers}
        enableRowSelection
        onSelectionChange={setSelected}
      />
    </>
  );
}
```

## Behavior

- **Auto-hides** when `selectedCount` is 0
- **Clear button** only shows if `onClearSelection` is provided
- **Total count** only shows if `totalCount` is provided
- **Action buttons** styled by variant (`default` or `danger`)

## Scope & Non-goals

✅ **What ActionBar does:**
- Displays selection count
- Hosts bulk action triggers
- Provides clear selection button

❌ **What ActionBar does NOT do:**
- Does not manage selection state (consumer's responsibility)
- Does not implement cross-page selection
- Does not handle background jobs or progress
- Does not connect directly to table internals

## Demo

See live demo: [Demo 13 - ActionBar](../../packages/demo/src/demos/13-action-bar/Demo.tsx)

Combined example: [Demo 14 - Toolkit Combined](../../packages/demo/src/demos/14-toolkit-combined/Demo.tsx)
