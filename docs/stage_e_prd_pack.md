# Stage E – PRD Pack (v0.5.0)

> **Project:** RowaKit  
> **Stage:** E – Workflow & Extensibility  
> **Target version:** 0.5.0

---

## PRD-E0 — Internal Architecture Refactor (NO API CHANGE)

**Priority:** 🔴 Critical  
**Type:** Engineering / Maintainability

### Objective
Reduce risk of `SmartTable` becoming a God component by refactoring internal logic into composable hooks.

### Affected Paths
```
packages/table/src/components/SmartTable.tsx
packages/table/src/hooks/
packages/table/src/state/
```

### Scope
- Extract logic into hooks:
  - `useFetcherState`
  - `useSortingState`
  - `useColumnResizing`
  - `useUrlSync`
  - `useSavedViews`
- `SmartTable` becomes composition + render only

### Out of Scope
- No public API changes
- No user-facing behavior changes

### Acceptance Criteria
- All existing tests pass
- Public API unchanged
- Reduced complexity of `SmartTable.tsx`

### Tests Required
- Existing tests must pass
- Hook-level tests if boundaries are introduced

---

## PRD-E1 — Row Selection v1

**Priority:** 🔴 Critical  
**Type:** Feature (Business Workflow)

### Objective
Enable row-level selection as foundation for bulk workflows.

### Affected Paths
```
packages/table/src/components/SmartTable.tsx
packages/table/src/components/RowSelectionColumn.tsx
packages/table/src/state/selection.ts
```

### API
```ts
enableRowSelection?: boolean
onSelectionChange?: (keys: Array<string | number>) => void
```

### Behavior
- Checkbox per row
- Header checkbox selects current page only
- Selection resets on page or dataset key change

### Out of Scope
- Cross-page selection
- Range (shift) selection

### Acceptance Criteria
- Correct selection behavior
- No UI if disabled

### Tests Required
- Select / unselect rows
- Select all current page
- Reset on pagination

---

## PRD-E2 — Bulk Actions v1

**Priority:** 🔴 Critical  
**Type:** Feature

### Objective
Enable grouped operations on selected rows.

### Affected Paths
```
packages/table/src/components/BulkActionBar.tsx
packages/table/src/components/SmartTable.tsx
```

### API
```ts
bulkActions?: Array<{
  id: string
  label: string
  confirm?: {
    title: string
    description?: string
  }
  onClick: (selectedKeys: Array<string | number>) => void
}>
```

### Behavior
- Bulk bar visible when selection > 0
- Confirm modal reused

### Out of Scope
- Async progress UI
- Undo / optimistic UI

### Acceptance Criteria
- Correct keys passed
- Confirm flow works

### Tests Required
- Action invocation
- Confirm accept/cancel

---

## PRD-E3 — Export CSV v1 (Server Triggered)

**Priority:** 🟠 High  
**Type:** Feature

### Objective
Enable exporting data based on current table state.

### Affected Paths
```
packages/table/src/components/ExportButton.tsx
packages/table/src/types/export.ts
```

### API
```ts
exporter?: (query: FetcherQuery) => Promise<{ url: string } | Blob>
```

### Behavior
- Uses snapshot of current query
- Non-blocking UI

### Out of Scope
- Excel / PDF export
- Background job UI

### Acceptance Criteria
- Correct query passed
- Error handling implemented

### Tests Required
- Exporter invocation
- Error handling

---

## PRD-E4 — Multi-Column Sorting v1 (Minimal)

**Priority:** 🟡 Medium  
**Type:** Feature (Advanced)

### Objective
Support secondary sort without breaking existing behavior.

### Behavior
- Default click = single sort
- Ctrl/Cmd + click = add secondary sort

### Acceptance Criteria
- Backward compatibility preserved
- URL sync works correctly

---

## PRD-E5 — Version Automation

**Priority:** 🟢 Low  
**Type:** Engineering

### Objective
Remove hardcoded version constants.

### Scope
- Inject version from `package.json`
- Demo reflects dynamic version

### Tests Required
- Version consistency test

---

## PRD-E6 — Repo Hygiene & Docs Sweep

**Priority:** 🟢 Low  
**Type:** Maintenance

### Scope
- Remove `.tmp`, `.backup` files
- Fix `docs/ROADMAP.md`
- CI rule to prevent junk files

---

## PRD-E7 — Accessibility Baseline

**Priority:** 🟡 Medium  
**Type:** Quality

### Scope
- `aria-sort` on headers
- Modal focus trap
- Keyboard-safe resize

### Acceptance Criteria
- No accessibility regressions

