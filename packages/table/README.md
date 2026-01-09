# @rowakit/table

**Server-side-first React table for internal & business applications**

RowaKit Table is an **opinionated React table component** designed for real-world internal apps and admin dashboards. It assumes **all data operations live on the server** and provides a clean, predictable API optimized for CRUD-style business screens.

> If you are looking for a spreadsheet-like data grid with virtualization, grouping, or pivoting, this is intentionally **not** that library.

---

## Why RowaKit Table?

Most React table libraries are **client-first** and optimized for maximum flexibility. RowaKit takes the opposite approach:

* ✅ Server-side pagination, sorting, filtering by default
* ✅ Minimal, convention-driven API (less boilerplate)
* ✅ Strong TypeScript contracts between UI and backend
* ✅ Built for long-lived internal tools, not demo-heavy grids

This makes RowaKit especially suitable for:

* Admin dashboards
* Back-office / internal tools
* B2B SaaS management screens
* Enterprise CRUD applications

---

## Features

* 🚀 **Server-side first** – pagination, sorting, filtering handled by your backend
* 🎯 **Type-safe** – full TypeScript support with generics
* 🧠 **Minimal API** – convention over configuration
* 🪝 **Escape hatch** – `col.custom()` for full rendering control
* 🎛️ **7 column types** – text, number, date, boolean, badge, actions, custom
* 🖱️ **Column resizing** – drag handles, min/max width, double-click auto-fit (v0.4.0+)
* 📌 **Saved views** – persist table state to localStorage (v0.4.0+)
* 🔗 **URL sync** – share exact table state via query string (v0.4.0+)
* 🧮 **Number range filters** – min/max with optional value transforms
* ✅ **Row selection** – select/deselect rows with bulk header checkbox (v0.5.0+)
* 🎬 **Bulk actions** – execute operations on multiple selected rows (v0.5.0+)
* 💾 **CSV export** – server-triggered export with customizable formatter (v0.5.0+)
* 🔄 **Multi-column sorting** – Ctrl+Click to sort by multiple columns with priority (v0.5.0+)
* ♿ **Accessibility** – ARIA labels, keyboard navigation, focus management (v0.5.0+)
* 🔄 **Smart fetching** – retry on error, stale request protection
* ✅ **Built-in states** – loading, error, empty handled automatically

---

## Installation

RowaKit Table is published on npm and works with **npm**, **pnpm**, or **yarn**.

```bash
npm install @rowakit/table
# or
pnpm add @rowakit/table
# or
yarn add @rowakit/table
```

---

## Quick Start (5 minutes)

### 1. Import

```tsx
import { RowaKitTable, col } from '@rowakit/table';
import type { Fetcher } from '@rowakit/table';
import '@rowakit/table/styles';
```

### 2. Define a fetcher (server contract)

```tsx
interface User {
  id: string;
  name: string;
  email: string;
  active: boolean;
}

const fetchUsers: Fetcher<User> = async ({ page, pageSize, sort, filters }) => {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  if (sort) {
    params.set('sortBy', sort.field);
    params.set('sortDir', sort.direction);
  }

  const res = await fetch(`/api/users?${params}`);
  if (!res.ok) throw new Error('Failed to fetch users');

  return res.json(); // { items: User[], total: number }
};
```

### 3. Render the table

```tsx
function UsersTable() {
  return (
    <RowaKitTable
      fetcher={fetchUsers}
      rowKey="id"
      columns={[
        col.text('name', { header: 'Name', sortable: true }),
        col.text('email', { header: 'Email' }),
        col.boolean('active', { header: 'Active' }),
        col.actions([
          { id: 'edit', label: 'Edit', onClick: (row) => console.log(row) },
          { id: 'delete', label: 'Delete', confirm: true },
        ]),
      ]}
    />
  );
}
```

That’s it — loading, error, pagination, sorting, and retry are handled automatically.

---

## Core Concepts

### Fetcher Contract

The **Fetcher** defines the contract between the table and your backend.

```ts
type Fetcher<T> = (query: {
  page: number;
  pageSize: number;
  sort?: { field: string; direction: 'asc' | 'desc' };
  filters?: Record<string, unknown>;
}) => Promise<{ items: T[]; total: number }>;
```

* Fetcher is called on mount and whenever table state changes
* Throw an error to trigger the built-in error + retry UI
* Stale requests are ignored automatically

---

## Column API

RowaKit provides a **column factory API** via `col.*` helpers.

### Basic columns

```ts
col.text('name')
col.number('price', { format: { style: 'currency', currency: 'USD' } })
col.date('createdAt', { sortable: true })
col.boolean('active')
```

### Badge column (enum/status)

```ts
col.badge('status', {
  header: 'Status',
  sortable: true,
  map: {
    active: { label: 'Active', tone: 'success' },
    pending: { label: 'Pending', tone: 'warning' },
    error: { label: 'Error', tone: 'danger' },
  },
});
```

### Actions column

```ts
col.actions([
  { id: 'edit', label: 'Edit', onClick: (row) => edit(row) },
  { id: 'delete', label: 'Delete', confirm: true, onClick: (row) => remove(row) },
]);
```

### Custom column (escape hatch)

```tsx
col.custom('user', (row) => (
  <div style={{ display: 'flex', gap: 8 }}>
    <img src={row.avatar} width={24} />
    <span>{row.name}</span>
  </div>
));
```

---

## Advanced Features (v0.4.0+)

### Column Resizing

* Drag handle on header edge
* Min/max width constraints
* Double-click to auto-fit content
* Pointer Events (mouse / touch / pen)
* No accidental sort while resizing

### Saved Views + URL Sync

* Persist page, sort, filters, and column widths
* Share URLs that restore exact table state
* Named views saved to localStorage
* Safe parsing & corruption tolerance

---

## Styling

RowaKit ships with minimal default styles via CSS variables.

```ts
import '@rowakit/table/styles';
```

You can:

* Override CSS variables for theming
* Use `className` to scope custom styles
* Skip default styles and fully style from scratch

---

## Philosophy & Scope

* **Server-side first** – client stays thin
* **Small core** – no grid bloat
* **Clear escape hatch** – `col.custom()`
* **Business tables ≠ spreadsheets**

See the scope lock and rationale in the root repository docs.

---

## Versioning & Roadmap

* Current: **v0.5.x** (Stage E – row selection, bulk actions, export, multi-sort, a11y)
* API is stable; patches are backward compatible
* Completed: Stages A-E with full feature set for internal business applications
* See [CHANGELOG.md](./CHANGELOG.md) for detailed v0.5.0 features and [docs/ROADMAP.md](../../docs/ROADMAP.md)

---

## License

MIT

---

Built for teams shipping serious internal tools, not toy demos.
