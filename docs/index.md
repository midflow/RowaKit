# RowaKit Table

**Server-side React table for admin & data-heavy applications.**

RowaKit Table is a **server-side-first React table** that supports pagination, sorting, filtering, URL-synced state, saved views, and CSV export hooks — without turning into a heavy data grid.

If you are building **admin panels, dashboards, or business tools**, RowaKit helps you keep data flow predictable and backend-driven.

---

## ✨ Why RowaKit Table?

Most React table libraries focus on **client-side data engines** or **spreadsheet-style features**.

RowaKit takes a different approach:

- ✅ **Server-side first** — pagination, sorting, and filtering always happen on the backend
- ✅ **Predictable data flow** — no hidden client-side transformations
- ✅ **URL-synced table state** — deep-linking and shareable URLs by default
- ✅ **Saved views** — common admin workflows built-in
- ✅ **Typed fetcher contract** — explicit, backend-friendly API
- ✅ **CSV export hooks** — export data without coupling UI and backend logic

---

## 🚀 Quick Start (10 minutes)

### Install

```bash
pnpm add @rowakit/table
```

### Minimal example

```tsx
import { SmartTable, col } from "@rowakit/table";

const columns = [
  col.text("name", { label: "Name" }),
  col.number("amount", { label: "Amount" }),
  col.date("createdAt", { label: "Created at" }),
];

export function OrdersTable() {
  return (
    <SmartTable
      columns={columns}
      fetcher={async ({ page, pageSize, sort, filters }) => {
        const res = await fetch("/api/orders", {
          method: "POST",
          body: JSON.stringify({ page, pageSize, sort, filters }),
        });

        return res.json(); // { items, total }
      }}
    />
  );
}
```

➡️ See the full guide: **[Quickstart](./quickstart.md)**

---

## 🧠 Server-side-first mental model

RowaKit follows a simple rule:

> **The table never decides how data is processed. Your backend does.**

---

## 📦 Features at a glance

- Server-side pagination, sorting, and filtering
- URL-synced table state
- Saved views
- CSV export hooks
- Type-safe API

---

**RowaKit Table**  
_Server-side tables without grid complexity._
