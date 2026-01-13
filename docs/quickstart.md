# Quick Start Guide — Get a Table Working in 10 Minutes

This guide walks you through building a working RowaKit table from scratch.

## 1. Install (1 minute)

```bash
pnpm add @rowakit/table
```

Import styles in your app:

```tsx
import '@rowakit/table/styles';
```

---

## 2. Create a Fetcher (3 minutes)

A **fetcher** is how your table talks to the backend.

It receives query parameters (page, pageSize, sorting) and returns paginated results:

```tsx
import type { Fetcher } from '@rowakit/table';

interface User {
  id: string;
  name: string;
  email: string;
}

const fetchUsers: Fetcher<User> = async (query) => {
  // Build query params from table state
  const params = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
  });

  // Add sorting if present
  if (query.sort) {
    params.set('sortField', query.sort.field);
    params.set('sortDir', query.sort.direction);
  }

  // Call your API
  const res = await fetch(`/api/users?${params}`);
  if (!res.ok) throw new Error('Failed to fetch users');

  // Return expected format: { items, total }
  return res.json();
};
```

**Key points:**
- Throw errors to trigger built-in error UI
- Always return `{ items: T[], total: number }`
- Backend handles pagination, sorting, filtering

---

## 3. Define Columns (3 minutes)

Columns tell the table what to display:

```tsx
import { RowaKitTable, col } from '@rowakit/table';

const columns = [
  col.text<User>('name', {
    header: 'Name',
    sortable: true,  // Enable sorting on backend
  }),
  col.text<User>('email', {
    header: 'Email',
  }),
  col.actions<User>([
    {
      id: 'view',
      label: 'View',
      onClick: (user) => console.log('View:', user),
    },
  ]),
];
```

**Available column types:**
- `col.text()` — Plain text
- `col.number()` — Formatted numbers
- `col.date()` — Formatted dates
- `col.boolean()` — True/False display
- `col.badge()` — Status badges
- `col.actions()` — Action buttons
- `col.custom()` — Complete control

---

## 4. Render the Table (3 minutes)

```tsx
export function UsersTable() {
  return (
    <RowaKitTable
      fetcher={fetchUsers}
      rowKey="id"              // Unique identifier per row
      columns={columns}
      defaultPageSize={20}     // Optional
    />
  );
}
```

**That's it!** Your table now has:
- ✅ Server-side pagination
- ✅ Column sorting (if sortable: true)
- ✅ Loading / error states
- ✅ Action buttons
- ✅ URL sync (state preserved in URL)

---

## 5. Minimal Working Example (Copy & Paste)

```tsx
import React from 'react';
import { RowaKitTable, col } from '@rowakit/table';
import type { Fetcher } from '@rowakit/table';
import '@rowakit/table/styles';

interface Product {
  id: string;
  name: string;
  price: number;
  inStock: boolean;
}

// Fetcher: Connect to your backend
const fetchProducts: Fetcher<Product> = async (query) => {
  const params = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
  });

  if (query.sort) {
    params.set('sortField', query.sort.field);
    params.set('sortDir', query.sort.direction);
  }

  const res = await fetch(`/api/products?${params}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
};

// Table Component
export function ProductsTable() {
  return (
    <RowaKitTable
      fetcher={fetchProducts}
      rowKey="id"
      columns={[
        col.text<Product>('name', {
          header: 'Product',
          sortable: true,
        }),
        col.number<Product>('price', {
          header: 'Price',
          format: (n) => `$${n.toFixed(2)}`,
        }),
        col.boolean<Product>('inStock', {
          header: 'In Stock',
          format: (v) => v ? 'Yes' : 'No',
        }),
      ]}
      defaultPageSize={20}
    />
  );
}
```

---

## Next Steps

### Add Row Selection

```tsx
<RowaKitTable
  enableRowSelection
  onSelectionChange={(keys) => console.log('Selected:', keys)}
  fetcher={fetchUsers}
  columns={columns}
/>
```

### Add Bulk Actions

```tsx
<RowaKitTable
  enableRowSelection
  bulkActions={[
    {
      id: 'delete',
      label: 'Delete selected',
      confirm: true,
      onClick: async (keys) => {
        await fetch('/api/delete', {
          method: 'POST',
          body: JSON.stringify({ ids: keys }),
        });
      },
    },
  ]}
  fetcher={fetchUsers}
  columns={columns}
/>
```

### Add Saved Views

```tsx
<RowaKitTable
  enableSavedViews
  fetcher={fetchUsers}
  columns={columns}
/>
```

Saved views are stored in localStorage. Users can save and restore custom pagination, sorting, and column state.

---

## API by Use Case

| I want to... | Use this |
|---|---|
| Sort one column | Set `sortable: true` on column, handle `query.sort` in fetcher |
| Sort multiple columns | Handle `query.sorts` array in fetcher (Ctrl/Cmd+Click columns) |
| Filter data | Send `query.filters` to backend (filtering is backend-only) |
| Select rows | Set `enableRowSelection` prop |
| Perform bulk actions | Use `bulkActions` prop + `enableRowSelection` |
| Export data | Use `exporter` callback (returns CSV URL) |
| Persist view | Use `enableSavedViews` (saved to localStorage) |
| Resize columns | Works automatically (user drags column border) |
| Auto-fit column | Double-click column border |

---

## Common Patterns

### Pattern 1: Simple Data Grid

```tsx
<RowaKitTable
  fetcher={fetchData}
  columns={columns}
/>
```

### Pattern 2: Management Interface (Edit + Delete)

```tsx
<RowaKitTable
  fetcher={fetchUsers}
  columns={[
    // ... display columns ...
    col.actions<User>([
      {
        id: 'edit',
        label: 'Edit',
        onClick: (user) => navigate(`/users/${user.id}/edit`),
      },
      {
        id: 'delete',
        label: 'Delete',
        confirm: true,
        onClick: async (user) => {
          await fetch(`/api/users/${user.id}`, { method: 'DELETE' });
          // Table auto-refetches
        },
      },
    ]),
  ]}
/>
```

### Pattern 3: Bulk Operations

```tsx
<RowaKitTable
  enableRowSelection
  bulkActions={[
    {
      id: 'approve',
      label: 'Approve selected',
      onClick: async (ids) => {
        await fetch('/api/approve', {
          method: 'POST',
          body: JSON.stringify({ ids }),
        });
      },
    },
  ]}
  fetcher={fetchItems}
  columns={columns}
/>
```

### Pattern 4: Shareable State

Enable URL sync to make tables shareable:

```tsx
<RowaKitTable
  fetcher={fetchUsers}
  columns={columns}
  // URL sync is enabled by default
  // URL updates automatically as user paginates/sorts
  // URL can be shared to reproduce view
/>
```

---

## Troubleshooting

### Table shows "No data" when it should load

**Cause:** Fetcher is not running or returning wrong format.

**Fix:** Ensure fetcher returns `{ items: T[], total: number }`

```tsx
const fetchData: Fetcher<Item> = async (query) => {
  const res = await fetch('/api/items');
  const data = await res.json();
  
  return {
    items: data.items,  // ← Required
    total: data.total,  // ← Required
  };
};
```

### Sorting doesn't work

**Cause:** Column has `sortable: true` but fetcher ignores `query.sort`.

**Fix:** Check fetcher for sort handling:

```tsx
const fetcher: Fetcher<Item> = async (query) => {
  if (query.sort) {
    // Send to backend
    params.set('sortField', query.sort.field);
    params.set('sortDir', query.sort.direction);
  }
  // ...
};
```

### URL doesn't update when paging

This shouldn't happen — URL sync is automatic. Check browser console for errors.

---

## When to Use RowaKit Table

✅ **Good fit:**
- Server-side data (pagination, sorting on backend)
- Internal tools & business apps
- CRUD interfaces with 100+ rows
- Admin dashboards
- Tables with custom workflows (selection, bulk actions, export)

❌ **Not a good fit:**
- Client-side-only data (< 1000 rows)
- Spreadsheet-style apps (pivot tables, formulas)
- Real-time collaborative editing
- Heavily customized appearance

---

## Learn More

- **Full API reference:** [packages/table/README.md](../packages/table/README.md)
- **Examples:** [packages/table/examples/](../packages/table/examples/)
- **Stability policy:** [docs/API_STABILITY.md](./API_STABILITY.md)
- **Decisions & scope:** [docs/ROADMAP.md](./ROADMAP.md)
