# RowaKit

**Server-side-first table components for React internal & business applications**

[![CI](https://github.com/Midflow/rowakit/actions/workflows/ci.yml/badge.svg)](https://github.com/Midflow/rowakit/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## What is RowaKit?

**RowaKit** is an **opinionated React table library** built specifically for **internal / line-of-business applications** where:

* ✅ **Data lives on the server** (pagination, sorting, filtering via APIs)
* ✅ **Predictable patterns** matter more than unlimited configurability
* ✅ **Developer experience** is optimized for real-world CRUD screens
* ✅ **Escape hatches** exist without bloating the core (`col.custom()`)

RowaKit focuses on the **80% case** of business tables and intentionally avoids becoming a generic data grid.

### What RowaKit is NOT

* ❌ Not a spreadsheet-like data grid (no pivot, grouping, inline editing)
* ❌ Not client-heavy (no large client-side sorting/filtering of datasets)
* ❌ Not infinitely configurable (clear scope lock by design)

📌 Read more: [Design Decisions & Scope Lock](./docs/DECISIONS_SCOPE_LOCK.md)

---

## Installation

RowaKit is published as a standard npm package and works with **npm**, **pnpm**, or **yarn**.

```bash
npm install @rowakit/table
# or
pnpm add @rowakit/table
# or
yarn add @rowakit/table
```

---

## Try it in 30 seconds (Live Demo)

▶ **Open Live Playground (CodeSandbox)**
[https://codesandbox.io/p/github/midflow/rowakit/main](https://codesandbox.io/p/github/midflow/rowakit/main)

What you get:

* Real RowaKit demo app (`packages/demo`)
* No setup, runs instantly in the browser
* Server-side pagination, sorting, resizing, saved views
* Editable source code

> This playground mirrors the real repository setup and is always kept in sync.

---

## Quick Start (2 minutes)

```tsx
import { RowaKitTable, col } from '@rowakit/table';
import type { Fetcher } from '@rowakit/table';
import '@rowakit/table/styles';

interface User {
  id: string;
  name: string;
  email: string;
  active: boolean;
}

// 1. Create a fetcher that talks to your API
const fetchUsers: Fetcher<User> = async (query) => {
  const params = new URLSearchParams({
    page: query.page.toString(),
    pageSize: query.pageSize.toString(),
    ...(query.sort && {
      sortField: query.sort.field,
      sortDir: query.sort.direction,
    }),
  });

  const res = await fetch(`/api/users?${params}`);
  if (!res.ok) throw new Error('Failed to fetch');

  return res.json(); // { items: User[], total: number }
};

// 2. Define columns and render the table
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

✨ **That’s it.** Loading, errors, pagination, sorting, and state sync are handled automatically.

---

## Key Features

### Core

* 🚀 **Server-side first** – pagination, sorting, filtering via your API
* 🎯 **Type-safe** – full TypeScript generics
* 📦 **Column factory API** – `text`, `number`, `date`, `boolean`, `badge`, `actions`, `custom`
* ⚡ **Smart fetching** – request deduplication, stale protection
* ✅ **Built-in states** – loading, error, empty handled for you
* 🖱️ **Resizable columns** – pointer-based drag with min/max constraints
* 📌 **Saved views** – persist table state to localStorage
* 🔗 **URL sync** – share table state via query string

### Resizing (Hardened)

* Pointer Events (mouse / touch / pen)
* Double-click auto-fit to content
* No accidental sort during resize
* Stable layout using `table-layout: fixed`

### Selection & Bulk Actions

* ✅ Row selection with page-scoped checkboxes
* ✅ Indeterminate state for partial selection
* ✅ Bulk action buttons with confirmation dialogs
* ✅ Selection resets on page change

### Export & Integrations

* ✅ CSV/JSON export via pluggable `exporter` callback
* ✅ Current query snapshot passed (filters, sort, pagination)
* ✅ Error handling with inline display
* ✅ Loading state during export

### Accessibility Baseline

* ✅ `aria-sort` on sortable headers
* ✅ Modal focus trap (Tab/Shift+Tab cycling)
* ✅ ESC key closes dialogs
* ✅ Proper dialog semantics (role, aria-modal, aria-labelledby)

### Saved Views + URL State

* Automatic persistence & hydration
* Shareable URLs preserve exact table state
* Safe parsing & corruption tolerance

---

## Documentation

* 📖 **[Table API](./packages/table/README.md)** – full component & column API
* 🧪 **[Examples](./packages/table/examples/)** – real-world scenarios
* 🗺️ **[Roadmap](./docs/ROADMAP.md)** – staged development plan
* 🔒 **[Scope Lock](./docs/DECISIONS_SCOPE_LOCK.md)** – what is intentionally out
* 🤝 **[Contributing](./CONTRIBUTING.md)** – how to contribute

---

## Roadmap Overview

* ✅ **Stage A** – MVP (server-side pagination & sorting)
* ✅ **Stage B (v0.2.x)** – production readiness (filters, number/badge columns)
* ✅ **Stage C (v0.4.0)** – advanced features (resizing, URL sync, saved views)
* ✅ **Stage D (v0.4.0)** – polish & correctness hardening
* ✅ **Stage E (v0.5.0)** – core features + a11y (row selection, bulk actions, export, accessibility)
* 💭 **Stage F (planned)** – demand-driven features (multi-sort, additional export formats)

See [ROADMAP.md](./docs/ROADMAP.md) for details.

---

## Philosophy

1. **Server-side first** – client stays thin
2. **Small core, clear escape hatch** – `col.custom()` for edge cases
3. **Convention over configuration** – fewer props, more consistency
4. **Business tables ≠ data grids** – intentional scope

This keeps RowaKit **predictable**, **maintainable**, and **easy to onboard**.

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
