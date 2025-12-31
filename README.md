# RowaKit

**Server-side-first table components for React internal/business applications**

[![CI](https://github.com/<YOUR_USERNAME>/rowakit/actions/workflows/ci.yml/badge.svg)](https://github.com/<YOUR_USERNAME>/rowakit/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## What is RowaKit?

RowaKit is an **opinionated React table library** designed for internal/business applications where:
- ✅ **Data lives on the server** (pagination, sorting, filtering via API)
- ✅ **API simplicity** matters more than infinite flexibility
- ✅ **Escape hatches** (`col.custom()`) handle edge cases without bloating the core
- ✅ **Conventions** reduce boilerplate

### What RowaKit is NOT

❌ **Not a generic data grid** - No virtualization, grouping, pivot tables, or spreadsheet editing  
❌ **Not client-side heavy** - No built-in client-side filtering/sorting of large datasets  
❌ **Not infinitely configurable** - Deliberate constraints to maintain simplicity

Read more: [Design Decisions & Scope Lock](./docs/DECISIONS_SCOPE_LOCK.md)

---

## Installation

```bash
npm install @rowakit/table
# or
pnpm add @rowakit/table
```

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

// 1. Create a fetcher that calls your API
const fetchUsers: Fetcher<User> = async (query) => {
  const params = new URLSearchParams({
    page: query.page.toString(),
    pageSize: query.pageSize.toString(),
    ...(query.sort && {
      sortField: query.sort.field,
      sortDir: query.sort.direction,
    }),
  });

  const response = await fetch(`/api/users?${params}`);
  if (!response.ok) throw new Error('Failed to fetch');
  
  return response.json(); // { items: User[], total: number }
};

// 2. Define columns and render
function UsersTable() {
  return (
    <RowaKitTable
      fetcher={fetchUsers}
      columns={[
        col.text('name', { header: 'Name', sortable: true }),
        col.text('email', { header: 'Email' }),
        col.boolean('active', { header: 'Active' }),
        col.actions([
          { id: 'edit', label: 'Edit', onClick: (user) => console.log('Edit:', user) },
          { id: 'delete', label: 'Delete', confirm: true, onClick: (user) => console.log('Delete:', user) }
        ])
      ]}
      rowKey="id"
    />
  );
}
```

**That's it!** The table handles loading, errors, pagination, and sorting automatically.

---

## Features

### Core
- 🚀 **Server-side operations** - Pagination, sorting, filtering via your API
- 🎯 **Type-safe** - Full TypeScript support with generics
- 📦 **5 column types** - `col.text()`, `col.date()`, `col.boolean()`, `col.actions()`, `col.custom()`
- 🎨 **Customizable** - CSS variables for theming, `col.custom()` for advanced rendering
- ⚡ **Smart fetching** - Automatic retry, stale request handling
- ✅ **Built-in states** - Loading, error, empty states out of the box

### Actions
- Row-level actions with confirmation dialogs
- Automatic loading state during async operations
- Custom icons and labels

### Developer Experience
- Minimal API surface (few props)
- Convention over configuration
- Comprehensive TypeScript types
- Clear error messages

---

## Documentation

- 📖 **[Full API Documentation](./packages/table/README.md)** - Detailed component API
- 🎯 **[Examples](./packages/table/examples/)** - Complete working examples
- 🗺️ **[Roadmap](./docs/ROADMAP.md)** - Planned features (Stage B/C)
- 🔒 **[Scope Lock](./docs/DECISIONS_SCOPE_LOCK.md)** - Why RowaKit is opinionated
- 🤝 **[Contributing](./CONTRIBUTING.md)** - How to contribute
- 🔐 **[Security](./SECURITY.md)** - Security policy

---

## Examples

Check out the [`examples/`](./packages/table/examples/) directory for complete working examples:

- **Basic Usage** - Simple table with server-side data
- **Mock Server** - Testing without a backend
- **Custom Columns** - Advanced rendering with `col.custom()`
- **Styling** - Custom theming with CSS variables

---

## Roadmap

### ✅ Stage A (MVP) - **Shipped**
- Server-side pagination, sorting
- 5 column types (text, date, boolean, actions, custom)
- Loading, error, empty states
- Action buttons with confirmation

### 🚧 Stage B (v1.0) - **Planned** (when there's demand)
- `col.badge()` for status/enum
- `col.number()` with formatting
- Basic server-side filters
- Column modifiers (sortable, width, align, etc.)

### 💭 Stage C (v1.5+) - **Maybe** (only if strong demand)
- Row selection + bulk actions
- Export CSV (server-triggered)
- URL state persistence

See [ROADMAP.md](./docs/ROADMAP.md) for details.

---

## Philosophy

RowaKit is built on these principles:

1. **Server-side first** - Data operations happen on the server, not the client
2. **Small core + escape hatch** - Core handles 80% of cases, `col.custom()` handles the rest
3. **Convention over configuration** - Sensible defaults, minimal props
4. **Not a data grid** - Deliberately scoped for business tables, not spreadsheets

This keeps the library **maintainable**, **predictable**, and **easy to learn**.

---

## Contributing

We welcome contributions! Please read:
- [Contributing Guidelines](./CONTRIBUTING.md) - How to contribute
- [Code of Conduct](./CODE_OF_CONDUCT.md) - Community standards
- [Scope Lock](./docs/DECISIONS_SCOPE_LOCK.md) - What's in/out of scope

**Important**: RowaKit is opinionated. Features that turn it into a generic data grid (virtualization, grouping, pivot, etc.) will be rejected. Please discuss proposals in an issue first.

---

## Support RowaKit

If RowaKit helps your project, consider:

⭐ **Star this repo** - It helps others discover the project  
💖 **[Sponsor on GitHub](https://github.com/sponsors/midflow)** - Sustain development  
☕ **[Buy us a coffee](buymeacoffee.com/midflow)** - One-time support

Every contribution, big or small, keeps this project going. Thank you! 🙏

---

## License

MIT © [RowaKit Contributors](./LICENSE)

---

## Status

- **Current Version**: 0.1.0 (Stage A complete)
- **Stability**: Beta - API is stable, but may have minor changes before 1.0
- **Production Ready**: Yes, for internal applications
- **Public Release**: Ready for OSS use

---

**Made with ❤️ for developers building internal tools**
