# QueryToolbar

Control and visualize query state for your table.

## Installation

```bash
npm install @rowakit/table
```

## Usage

```tsx
import { QueryToolbar } from '@rowakit/table';

<QueryToolbar
  searchQuery={search}
  onSearchChange={setSearch}
  activeFilterCount={2}
  onFilterClick={() => setFilterOpen(true)}
  sortInfo="Name (A→Z)"
/>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `searchQuery` | `string` | Current search query |
| `onSearchChange` | `(query: string) => void` | Search change handler |
| `searchPlaceholder` | `string` | Search placeholder text (default: "Search...") |
| `activeFilterCount` | `number` | Active filter count (shows badge) |
| `onFilterClick` | `() => void` | Filter button click handler |
| `sortInfo` | `string` | Sort info display (e.g., "Name (A→Z)") |
| `actions` | `React.ReactNode` | Additional actions (e.g., refresh, export buttons) |
| `className` | `string` | Custom className |

## Standalone Usage

QueryToolbar can be used without mounting a Table:

```tsx
function MyComponent() {
  const [query, setQuery] = useState({ search: '', filters: {} });
  
  return (
    <QueryToolbar
      searchQuery={query.search}
      onSearchChange={(search) => setQuery({ ...query, search })}
      activeFilterCount={Object.keys(query.filters).length}
      onFilterClick={() => setFilterOpen(true)}
    />
  );
}
```

## Combined with Table

```tsx
function UsersPage() {
  const [search, setSearch] = useState('');
  
  return (
    <>
      <QueryToolbar 
        searchQuery={search} 
        onSearchChange={setSearch}
        actions={<button>Export All</button>}
      />
      <RowaKitTable 
        fetcher={(query) => fetchUsers({ ...query, search })} 
      />
    </>
  );
}
```

## Scope & Non-goals

✅ **What QueryToolbar does:**
- Displays search input
- Shows filter count badge
- Displays sort information
- Hosts action buttons

❌ **What QueryToolbar does NOT do:**
- Does not implement FilterPanel (consumer's responsibility)
- Does not manage query state (consumer orchestrates)
- Does not connect directly to table internals
- Does not handle data fetching

## Demo

See live demo: [Demo 12 - QueryToolbar](../../packages/demo/src/demos/12-query-toolbar/Demo.tsx)

Combined example: [Demo 14 - Toolkit Combined](../../packages/demo/src/demos/14-toolkit-combined/Demo.tsx)
