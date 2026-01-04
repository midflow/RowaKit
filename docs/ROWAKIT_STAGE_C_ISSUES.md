# RowaKit – Stage C Issues (v0.3.0)
Demand-driven advanced features for internal & business applications.

Stage C focuses on **usability and productivity**, while strictly avoiding turning RowaKit into a generic datagrid.

---

## 🚨 Global Scope Lock (applies to ALL issues)
- Server-side first (no client-side data processing)
- NOT a generic datagrid
- NO virtualization, grouping, pivoting
- NO row selection / bulk actions
- NO query builder UI
- NO spreadsheet-like editing
- Backward compatible with v0.2.x

---

## C-01: Column resizing (MVP)

### Problem
In internal tools, fixed column widths are often insufficient. Users need quick manual resizing.

### Scope (LOCKED)
- Resize columns by dragging a handle in the column header
- Width stored in table state (in-memory only)
- Apply width immediately to column style

### Out of scope
- Auto-fit / double-click resize
- Persistence to backend
- ResizeObserver-based auto logic
- Mobile/touch optimizations

### UX rules
- Resize handle visible on hover
- Cursor changes to `col-resize`
- Min width enforced (e.g. 80px)
- Optional max width

### Acceptance Criteria
- Columns can be resized smoothly
- Resizing does not break layout or truncate logic
- Sorting/filtering continue to work
- No breaking changes to existing column definitions

---

## C-02: Saved Views (Minimal)

### Problem
Users want to:
- Reload page without losing state
- Share a filtered/sorted view via URL
- Quickly switch between common views

### Scope (LOCKED)
Saved views consist of two layers:

#### 1. URL Sync (mandatory)
Sync the following to URL query string:
- page
- pageSize
- sort
- filters
- columnWidths (if C-01 is implemented)

#### 2. Presets (minimal)
- Save current view with a name
- Load / delete saved views
- Storage: localStorage OR in-memory only

### Out of scope
- Server-side persistence
- User accounts
- Versioned schemas
- Sharing saved views across users

### API
```tsx
<SmartTable
  syncToUrl
  enableSavedViews
/>
```

### Acceptance Criteria
- Reloading page restores table state
- Copying URL reproduces the same view
- Saved views can be created and restored
- Reset view returns table to default state

---

## C-03: Advanced Filters (Minimal)

### Problem
Exact-match number filters are insufficient for:
- Price ranges
- Stock thresholds
- Discount ranges

### Scope (LOCKED)
Extend **existing filters**, do NOT redesign them.

#### Number range filters
Reuse existing operator:
```ts
{ op: "range", value: { from?: number; to?: number } }
```

- Only for `col.number`
- UI: two inputs (min / max)
- Either `from` or `to` may be omitted

#### Filter transform (escape hatch)
Allow column-level transform before sending to fetcher.

```ts
col.number("discount", {
  filterTransform: (input) => input / 100
})
```

### Rules
- Transform applies only to filter value
- Sorting/rendering remain unchanged
- Transform is optional (default = identity)

### Out of scope
- New operators (gt, lt, regex, etc.)
- Query builder UI
- Complex validation logic

### Acceptance Criteria
- Number range filters work end-to-end
- Discount % can be filtered correctly without backend hacks
- Filters still reset page to 1
- Backward compatibility preserved

---

## ✅ Stage C Completion Criteria
Stage C is considered complete when:
- C-01, C-02, C-03 are implemented
- CI is green
- Documentation reflects new features
- No datagrid-like features introduced
- Ready to tag **v0.3.0**
