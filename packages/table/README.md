
# @rowakit/table

**A React Table Toolkit for server-side data: Table + QueryToolbar + ActionBar — built for admin & data-heavy apps.**

**What's included:**
- **RowaKitTable** — Server-side table with pagination, sorting, filtering, URL sync, saved views, CSV export
- **QueryToolbar** — Control and visualize query state (search, filters, sort)
- **ActionBar** — Selection summary + bulk action triggers

**Features:**
- Server-side pagination, sorting, filtering
- Column filters and custom columns
- CSV export hooks and exporter callback
- URL-synced state and saved views
- Bulk actions, selection, and error/loading states


---

`@rowakit/table` is **stable as of v1.0.0**.

See:
- [API Stability](../../docs/API_STABILITY.md)
- [API Freeze Summary](../../docs/API_FREEZE_SUMMARY.md)

---

## Why @rowakit/table?

Most React table libraries grow into complex data grids.
RowaKit Table is intentionally different:

* Backend owns data logic (pagination, sorting, filtering)
* Frontend stays thin and predictable
* API is opinionated and stable
* Workflow features are built-in, not bolted on

---

## Is RowaKit for You?

### ✅ Good Fit

- **Admin panels & dashboards** — CRUD management, data entry
- **Data-heavy apps** — Backend pagination, sorting, filtering
- **Business workflows** — Selection, bulk actions, export
- **Scalable tables** — Thousands of rows handled by backend
- **Predictable needs** — You know what users will do with the table

### ❌ Not a Good Fit

- **Client-side-only data** — All rows already in memory (< 1000 rows)
* **Spreadsheet-style apps** — Pivot tables, formulas, cell editing
* **Highly customized appearance** — Extensive CSS overrides
* **Real-time collaboration** — Live editing, conflict resolution
* **Complex visualizations** — Charts, sparklines, nested data

### 🤔 Unsure?

Ask yourself:
- Is my backend the source of truth for ordering, filtering?
- Do I need more than one page of results?
- Do my users perform bulk operations?

If yes → RowaKit is probably right.

---

## Server-Side-First Mental Model

RowaKit reverses how most client-side tables work:

### Traditional (Client-First)
```
Client: "Here's all 10,000 rows"
Table: "I'll sort, filter, and paginate them"
```

**Problem:** Network bandwidth, memory, sorting speed all suffer.

### RowaKit (Server-First)
```
User: "Sort by Name (ascending)"
Table: "Backend, please send users sorted by Name, page 1"
Backend: "Here's the first 20, sorted. Total: 523."
Table: Render 20 rows.
```

**Benefit:** Backend does the heavy lifting. Frontend stays thin.

### How It Works

1. **User changes page/sort/filter**
2. **Table sends query** → `{ page: 2, pageSize: 20, sort: { field: 'name', direction: 'asc' } }`
3. **Your fetcher** calls your backend API with these parameters
4. **Backend** executes the query (filters, sorts, paginates)
5. **Backend** returns `{ items: [...20 rows], total: 523 }`
6. **Table** renders and waits for next user action

### URL Sync: Shareable State

URL automatically reflects table state:

```
/users → page 1
/users?page=2&sort=name&sortDir=asc → page 2, sorted by name
```

Share the URL → recipient sees the same view.

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

## Features (v1.0.0)

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
  /** Deprecated (kept for backward compatibility; planned removal in v2.0.0). */
  sort?: { field: string; direction: 'asc' | 'desc' };
  /** Multi-column sorting (preferred). */
  sorts?: Array<{ field: string; direction: 'asc' | 'desc'; priority: number }>;
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

* Current: **1.0.0** (stable)
* No breaking changes in 1.x (breaking changes require v2.0.0)
* Public API stability policy applies from v1.0.0

See roadmap: [docs/ROADMAP.md](../../docs/ROADMAP.md)

---

## Quick Links & Resources

### Getting Started
- **[Quick Start (10 min)](../../docs/quickstart.md)** — Minimal working example
- **Basic Usage Example** — [packages/table/examples/basic-usage.tsx](./examples/basic-usage.tsx)
- **Mock Server Example** — [packages/table/examples/mock-server.tsx](./examples/mock-server.tsx) (testing without backend)

### Learning
- **Server-Side-First Model** — See "Server-Side-First Mental Model" section above
- **API Documentation** — [API_STABILITY.md](../../docs/API_STABILITY.md)
- **Decisions & Scope** — [ROADMAP.md](../../docs/ROADMAP.md)

### Examples
- **Custom Columns** — [packages/table/examples/custom-columns.tsx](./examples/custom-columns.tsx)
- **Styling** — [packages/table/examples/styling.tsx](./examples/styling.tsx)

---

## Roadmap & Versioning

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