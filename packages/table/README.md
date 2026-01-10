# @rowakit/table

**Server-side-first React table for internal & business applications.**
Predictable API. Thin client. No data-grid bloat.

---

## Why @rowakit/table?

Most React table libraries grow into complex data grids.
RowaKit Table is intentionally different:

* Backend owns data logic (pagination, sorting, filtering)
* Frontend stays thin and predictable
* API is opinionated and stable
* Workflow features are built-in, not bolted on

---

## Installation

```bash
npm install @rowakit/table
# or
pnpm add @rowakit/table
# or
yarn add @rowakit/table
```

Import base styles:

```ts
import '@rowakit/table/styles';
```

---

## Quick Start

```tsx
import { RowaKitTable, col } from '@rowakit/table';
import type { Fetcher } from '@rowakit/table';
import '@rowakit/table/styles';

type User = { id: string; name: string; email: string; active: boolean };

const fetchUsers: Fetcher<User> = async ({ page, pageSize, sort }) => {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  if (sort) {
    params.set('sortField', sort.field);
    params.set('sortDir', sort.direction);
  }

  const res = await fetch(`/api/users?${params}`);
  if (!res.ok) throw new Error('Failed to fetch users');

  return res.json();
};

export function UsersTable() {
  return (
    <RowaKitTable
      fetcher={fetchUsers}
      rowKey="id"
      columns={[
        col.text('name', { header: 'Name', sortable: true }),
        col.text('email', { header: 'Email' }),
        col.boolean('active', { header: 'Active' }),
        col.actions([
          { id: 'edit', label: 'Edit' },
          { id: 'delete', label: 'Delete', confirm: true },
        ]),
      ]}
    />
  );
}
```

---

## Features (v0.5.0)

### Core table

* Server-side pagination, sorting, filtering
* Typed `Fetcher<T>` contract
* Built-in loading / error / empty states
* Stale request protection

### Columns

* `col.text`
* `col.number`
* `col.date`
* `col.boolean`
* `col.badge`
* `col.actions`
* `col.custom`

### UX & workflows

* Column resizing (pointer events)
* Double-click auto-fit
* URL sync
* Saved views
* Row selection (page-scoped)
* Bulk actions
* Export via `exporter` callback

---

## Fetcher Contract

```ts
type Fetcher<T> = (query: {
  page: number;
  pageSize: number;
  sort?: { field: string; direction: 'asc' | 'desc' };
  filters?: Record<string, unknown>;
}) => Promise<{ items: T[]; total: number }>;
```

Guidelines:

* Backend is the source of truth
* Throw errors to trigger built-in error UI
* Ignore stale requests (handled internally)

---

## Row Selection

```tsx
<RowaKitTable
  enableRowSelection
  onSelectionChange={(keys) => console.log(keys)}
  fetcher={fetchUsers}
  columns={[/* ... */]}
/>
```

* Selection is page-scoped
* Resets on page change

---

## Multi-Column Sorting

Sort by multiple columns simultaneously using **Ctrl+Click** (Windows/Linux) or **Cmd+Click** (Mac) on column headers:

```tsx
// Hold Ctrl/Cmd and click column headers in order
// Priority is determined by click order (first click = priority 1)

// The fetcher receives sorts array:
const fetcher = async (query: FetcherQuery) => {
  // query.sorts = [
  //   { field: 'lastName', direction: 'asc', priority: 1 },
  //   { field: 'firstName', direction: 'asc', priority: 2 },
  //   { field: 'salary', direction: 'desc', priority: 3 }
  // ]
  const res = await fetch('/api/users', {
    method: 'POST',
    body: JSON.stringify(query),
  });
  return res.json();
};

<RowaKitTable fetcher={fetcher} columns={[/* ... */]} />
```

**Migration from deprecated `sort` field:**
- Old format: `query.sort = { field: 'name', direction: 'asc' }`
- New format: `query.sorts = [{ field: 'name', direction: 'asc', priority: 1 }]`
- Both fields coexist during transition; `sort` will be removed in v2.0.0

**UI Indicators:**
- Single column: Standard sort arrow indicator
- Multiple columns: Priority number displayed on sorted column headers

---

## Bulk Actions

```tsx
<RowaKitTable
  enableRowSelection
  bulkActions={[
    {
      id: 'delete',
      label: 'Delete selected',
      confirm: { title: 'Confirm delete' },
      onClick: (keys) => console.log(keys),
    },
  ]}
  fetcher={fetchUsers}
  columns={[/* ... */]}
/>
```

---

## Export (CSV)

```tsx
const exporter = async (query) => {
  const res = await fetch('/api/export', {
    method: 'POST',
    body: JSON.stringify(query),
  });

  const { url } = await res.json();
  return { url };
};

<RowaKitTable exporter={exporter} fetcher={fetchUsers} columns={[/* ... */]} />
```

Export is server-triggered and scales well for large datasets.

---

## Roadmap & Versioning

* Current: **0.5.0** (Stage E)
* No breaking changes in 0.5.x
* API freeze planned for 1.0.0

See roadmap: `docs/ROADMAP.md`

---

## Support RowaKit

If RowaKit helps your team:

* ⭐ Star the repo
* 💖 [Sponsor on GitHub](https://github.com/sponsors/midflow)
* ☕ [Buy us a coffee](https://buymeacoffee.com/midflow)

Every bit of support helps sustain long-term maintenance.

---

## License

MIT © RowaKit Contributors

---

**Built for teams shipping internal tools, not demos.**