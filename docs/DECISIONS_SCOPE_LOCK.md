# Design Decisions: Scope Lock

> This document explains WHY RowaKit is opinionated and what's in/out of scope.

---

## Core Philosophy

RowaKit Table is **deliberately constrained** to be:

1. **Server-side first** - Data operations (pagination, sorting, filtering) happen on the server
2. **Small core + escape hatch** - Core handles common cases, `col.custom()` handles edge cases
3. **Business tables, not data grids** - Internal apps, dashboards, admin panels
4. **Convention over configuration** - Sensible defaults, minimal API surface

---

## What RowaKit IS

✅ **Server-side table component**
- Fetcher contract standardizes API integration
- Pagination, sorting, filtering via server
- Smart request handling (retry, stale requests)

✅ **Developer-friendly**
- Type-safe with TypeScript generics
- Minimal props, clear API
- `col.custom()` for full control when needed

✅ **Production-ready basics**
- Loading, error, empty states
- Action buttons with confirmation
- 5 column types cover 80% of use cases

✅ **Maintainable**
- Small codebase
- Clear boundaries
- Easy to reason about

---

## What RowaKit is NOT

❌ **Not a generic data grid**

RowaKit will **never** support:
- Virtualization / infinite scroll
- Grouping / pivot tables
- Spreadsheet-like cell editing
- Client-side data engines (large dataset filtering/sorting)
- Column pinning / resizing / drag-drop
- Query builder UI

**Why?** These features:
- Dramatically increase complexity (10x+ codebase size)
- Create competing concerns (server-side vs client-side)
- Turn RowaKit into "yet another data grid"
- Don't align with our "business tables" focus

❌ **Not a one-size-fits-all solution**

If you need:
- Excel-like editing → use AG Grid, Handsontable
- Virtualization for millions of rows → use TanStack Virtual + TanStack Table
- Pivot/grouping → use AG Grid, DevExtreme
- Full client-side power → use TanStack Table

RowaKit serves a **specific niche**: server-side business tables for internal apps.

---

## Decision Matrix

| Feature | RowaKit | Why In/Out |
|---------|---------|------------|
| Server-side pagination | ✅ Yes | Core use case |
| Server-side sorting | ✅ Yes | Core use case |
| Server-side filtering | ✅ Yes (Stage B) | Common need, server-driven |
| Action buttons | ✅ Yes | Common in admin/business apps |
| `col.custom()` | ✅ Yes | Escape hatch for edge cases |
| `col.badge()` | ✅ Yes (Stage B) | High ROI, low complexity |
| `col.number()` | ✅ Yes (Stage B) | High ROI, low complexity |
| Virtualization | ❌ No | Wrong abstraction, scope creep |
| Grouping/pivot | ❌ No | Complexity explosion, niche need |
| Cell editing | ❌ No | Use forms, not inline editing |
| Column pinning | ❌ No | Niche, complex, not server-driven |
| Client-side filtering | ❌ No | Against "server-first" principle |
| Export (client) | ❌ No | Server should handle large exports |
| Export (server-trigger) | ✅ Maybe (Stage C) | If demand exists |

---

## When to Use RowaKit

✅ **Good fits:**
- Internal admin panels
- Business dashboards
- CRUD interfaces
- User/product/order management tables
- Reports with server-side pagination
- < 10,000 rows per page (server handles pagination)

❌ **Bad fits:**
- Public-facing data grids with complex interactions
- Excel replacement
- Real-time collaborative editing
- Analytics with complex pivoting/grouping
- > 100,000 rows client-side

---

## Evolution Strategy

### Stage A (MVP) ✅ DONE
Core server-side table with 5 column types, actions, states.

### Stage B (v1.0) 🚧 PLANNED
**Only if there's real-world demand:**
- `col.badge()` - status/enum rendering
- `col.number()` - number formatting
- Basic server-side filters (text contains, equals, date range)
- Column ergonomics (sortable, width, align)

### Stage C (v1.5+) 💭 MAYBE
**Only if strong demand:**
- Row selection + bulk actions (careful: API explosion risk)
- Server-triggered CSV export
- URL state persistence

**NOT on roadmap:**
- Virtualization → use TanStack Virtual
- Grouping/pivot → use AG Grid
- Spreadsheet editing → use Handsontable
- Client-side data engines → use TanStack Table

---

## Scope Lock Enforcement

### For Maintainers

When evaluating feature requests, ask:

1. **Does it conflict with "server-side first"?** → Reject
2. **Does it turn RowaKit into a data grid?** → Reject
3. **Can it be solved with `col.custom()`?** → Suggest that instead
4. **Is the demand real?** → Ask for 3+ use cases from different users
5. **Does it balloon the API?** → Reject or simplify

### For Contributors

Before proposing a feature:

1. Check this document
2. Check the [Roadmap](./ROADMAP.md)
3. Ask: "Can I solve this with `col.custom()`?"
4. If not, open an issue for discussion BEFORE coding

**Unsolicited PRs for out-of-scope features will be closed.**

---

## Philosophy Summary

> RowaKit is a **scalpel**, not a Swiss Army knife.  
> It does one thing well: server-side business tables.  
> For everything else, use the right tool.

This constraint is **intentional** and **permanent**.

---

## Questions?

- Read the [FAQ](../packages/table/README.md#faq)
- Open a [Discussion](https://github.com/Midflow/rowakit/discussions)
- File an issue using the "question" template

**Remember:** Constraints breed creativity. Use `col.custom()` for one-offs, and propose new column types only if there's repeated demand.
