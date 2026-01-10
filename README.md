# RowaKit

**Server-side-first table components for React — built for internal tools & business apps.**
Fast to adopt. Predictable by design. No data-grid bloat.

---

## Why RowaKit?

Most table libraries optimize for **client-first** flexibility and end up as heavy data grids.
RowaKit takes the opposite stance:

* ✅ **Server-side-first**: pagination, sorting, filtering live on the backend
* ✅ **Opinionated, minimal API**: fewer decisions, less boilerplate
* ✅ **Business workflows built-in**: selection, bulk actions, export
* ✅ **No grid bloat**: no virtualization, no pivoting, no spreadsheet UX

> RowaKit is designed for **real internal tools**, not spreadsheet-style data grids.

---

## Try it live

▶ **Live Playground (CodeSandbox)**
[https://codesandbox.io/p/github/midflow/rowakit/main](https://codesandbox.io/p/github/midflow/rowakit/main)

Demo highlights:

* Server-side pagination, sorting, filtering
* Column resizing (pointer-based + double-click auto-fit)
* URL sync (shareable table state)
* Saved views (localStorage)
* Row selection + bulk actions
* Export callback (CSV flow)

---

## Installation

```bash
npm install @rowakit/table
# or
pnpm add @rowakit/table
# or
yarn add @rowakit/table
```

---

## Quick Start

```tsx
import { RowaKitTable, col } from '@rowakit/table';
import type { Fetcher } from '@rowakit/table';
import '@rowakit/table/styles';

type User = { id: string; name: string; email: string; active: boolean };

const fetchUsers: Fetcher<User> = async (query) => {
  const params = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
  });

  if (query.sort) {
    params.set('sortField', query.sort.field);
    params.set('sortDir', query.sort.direction);
  }

  const res = await fetch(`/api/users?${params}`);
  if (!res.ok) throw new Error('Failed to fetch users');

  return res.json(); // { items, total }
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

## What you get (v0.6.0 Release Candidate)

### Core

* Server-side pagination, sorting, filtering
* Strong TypeScript `Fetcher<T>` contract
* Built-in loading / error / empty states
* Stale request protection

### UX & Workflows

* Column resizing (Pointer Events)
* Double-click auto-fit
* URL sync (validated + throttled)
* Saved views
* Row selection (page-scoped)
* Bulk actions
* Export via `exporter` callback

---

## Repository structure

* `packages/table` — published library (`@rowakit/table`)
* `packages/demo` — live playground demo
* `docs/` — roadmap, decisions, stage documents

---

## Roadmap

* ✅ Stage A–D: server-side table foundation
* ✅ Stage E (v0.5.0): workflows + stability
* 🚀 Stage F (v0.6.0 RC): API completeness + production validation
* ⏭ Stage G: demand-driven enhancements

See full roadmap: `docs/ROADMAP.md`

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
