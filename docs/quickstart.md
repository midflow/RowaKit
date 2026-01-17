# Quickstart — RowaKit Table (10 Minutes)

Get a **server-side React table working in under 10 minutes**.

RowaKit Table is designed for **admin panels and data-heavy applications** where pagination, sorting, and filtering are handled by the backend — not the browser.

**Live demo:** https://codesandbox.io/p/github/midflow/rowakit/main

---

## 1. Install

```bash
pnpm add @rowakit/table
```

Import styles once in your app entry:

```ts
import '@rowakit/table/styles';
```

---

## 2. Create a Fetcher (Server-side Data)

A **fetcher** connects the table to your backend.

It receives the current table state and must return paginated results.

```ts
import type { Fetcher } from '@rowakit/table';

interface User {
  id: string;
  name: string;
  email: string;
}

export const fetchUsers: Fetcher<User> = async (query) => {
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
```

**Rules:**
- Always return `{ items: T[], total: number }`
- Throw errors to trigger built-in error UI
- All pagination, sorting, and filtering logic lives on the backend

---

## 3. Define Columns

Columns describe **how data is displayed**, not how it is processed.

```tsx
import { col } from '@rowakit/table';

export const columns = [
  col.text<User>('name', {
    header: 'Name',
    sortable: true,
  }),
  col.text<User>('email', {
    header: 'Email',
  }),
  col.actions<User>([
    {
      id: 'view',
      label: 'View',
      onClick: (user) => console.log(user),
    },
  ]),
];
```

Available column helpers:
- `col.text`
- `col.number`
- `col.date`
- `col.boolean`
- `col.badge`
- `col.actions`
- `col.custom`

---

## 4. Render the Table

```tsx
import { RowaKitTable } from '@rowakit/table';
import { columns } from './columns';
import { fetchUsers } from './fetcher';

export function UsersTable() {
  return (
    <RowaKitTable
      rowKey="id"
      fetcher={fetchUsers}
      columns={columns}
      defaultPageSize={20}
    />
  );
}
```

You now get:
- Server-side pagination
- Sorting (when `sortable: true`)
- Loading / empty / error states
- URL-synced table state (enabled by default)

---

## 5. Enable Saved Views

```tsx
<RowaKitTable
  fetcher={fetchUsers}
  columns={columns}
  enableSavedViews
/>
```

Saved views allow users to persist:
- Filters
- Sorting
- Pagination
- Column widths

Views are stored in `localStorage`.

---

## 6. CSV Export (Backend-controlled)

```tsx
<RowaKitTable
  fetcher={fetchUsers}
  columns={columns}
  exporter={async (query) => {
    const res = await fetch('/api/users/export', {
      method: 'POST',
      body: JSON.stringify(query),
    });

    return res.blob();
  }}
/>
```

RowaKit:
- Passes the current query snapshot
- Does not assume CSV structure
- Keeps export logic on the backend

---

## 7. Common Use Cases

| Goal | How |
|---|---|
| Backend pagination | Implement paging in fetcher |
| Column sorting | Set `sortable: true` and handle `query.sort` |
| Multi-column sort | Handle `query.sorts` array |
| Filtering | Send `query.filters` to backend |
| Row selection | `enableRowSelection` |
| Bulk actions | `bulkActions` + selection |
| Shareable URLs | Enabled by default |
| Saved table views | `enableSavedViews` |

---

## When to Use RowaKit

**Good fit:**
- Admin dashboards
- Business & internal tools
- CRUD screens with server-side data
- Tables with export and bulk workflows

**Not a good fit:**
- Client-side-only datasets
- Spreadsheet-style apps
- Pivoting / grouping / aggregation
- Heavy visual customization

---

## Next Steps

- Full API: `packages/table/README.md`
- Examples: `packages/table/examples`
- Scope & philosophy: `docs/DECISIONS_SCOPE_LOCK.md`

---

**RowaKit Table**  
_Server-side tables without grid complexity._
