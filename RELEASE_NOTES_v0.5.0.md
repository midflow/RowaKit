# RowaKit v0.5.0 — Core Features + Accessibility

**Release Date:** January 9, 2026  
**Stage:** E (Core Features + a11y)

## Summary

This release completes Stage E with essential production features and accessibility baseline:

- **Row Selection** — Page-scoped checkboxes with indeterminate state
- **Bulk Actions** — Action buttons for selected rows with confirmation
- **CSV Export** — Pluggable exporter callback with loading states
- **a11y Baseline** — `aria-sort`, focus traps in modals, proper dialog semantics
- **Repo Hygiene** — Junk file prevention, CI documentation
- **Code Quality** — Internal hook refactor (composable, testable)
- **Version Automation** — Injected from package.json at build time

**Test Results:** 246 tests passing | Build successful | Lint clean

## What's New

### Row Selection (E-02)
```tsx
<RowaKitTable
  enableRowSelection={true}
  onSelectionChange={(keys) => console.log('Selected:', keys)}
  columns={[...]}
  fetcher={fetchData}
/>
```
- Page-scoped selection (resets on page change)
- Header checkbox with indeterminate state
- Selection state helpers in `selection.ts`

### Bulk Actions (E-03)
```tsx
<RowaKitTable
  enableRowSelection={true}
  bulkActions={[
    { 
      id: 'delete', 
      label: 'Delete Selected',
      confirm: { title: 'Confirm Deletion' },
      onClick: (selectedKeys) => deleteRows(selectedKeys)
    }
  ]}
  columns={[...]}
  fetcher={fetchData}
/>
```

### CSV Export (E-04)
```tsx
const exporter: Exporter = async (query) => {
  const response = await fetch(`/api/export?...query params`);
  return { url: response.headers.get('content-disposition') };
};

<RowaKitTable
  exporter={exporter}
  columns={[...]}
  fetcher={fetchData}
/>
```

### Accessibility Features (E-07)
- ✅ `aria-sort="ascending|descending|none"` on sortable headers
- ✅ Focus trap in modals (Tab/Shift+Tab cycling, ESC to close)
- ✅ Auto-focus first focusable element in dialogs
- ✅ Proper dialog semantics (role="dialog", aria-modal="true")
- ✅ All modals keyboard-navigable

### Internal Refactoring (E-01)
Extracted 5 composable hooks for cleaner architecture:
- `useFetcherState` — Data fetching + state machine
- `useSortingState` — Sort state + handlers
- `useColumnResizing` — Pointer-based resizing
- `useUrlSync` — URL query string synchronization
- `useSavedViews` — localStorage persistence
- `useFocusTrap` — **NEW** Modal focus management

All existing behavior preserved; no breaking changes.

## Breaking Changes

None. This is a purely additive release.

## Migration Guide

**For existing code:** No changes needed. All new features are opt-in.

**To enable new features:**

1. **Row Selection:**
   - Add `enableRowSelection={true}` prop
   - Optionally add `bulkActions` array

2. **CSV Export:**
   - Create an `Exporter` function
   - Pass via `exporter` prop

3. **Accessibility:**
   - Already applied automatically
   - No action needed

## Performance

- Bundle size: ~1.5 KB gzipped (new features)
- No performance regressions in existing features
- All tests still pass in <120ms

## Resolved Issues

- ✅ No hardcoded version strings (E-05)
- ✅ Junk files cleaned up; prevention rules added (E-06)
- ✅ Accessibility baseline established (E-07)
- ✅ Code organization improved (E-01)

## Known Limitations

**Optional/Out of Scope:**
- E-04 (Multi-column sort) — Deferred pending demand

## Assets

- Built artifacts: `packages/table/dist/`
  - ESM: 56.37 KB (index.js)
  - CJS: 57.73 KB (index.cjs)
  - DTS: 16.67 KB (index.d.ts)

## Testing

```bash
# Run full test suite
pnpm test

# Expected output: 246 tests passing
```

## Next Steps

**v0.6.0 (Demand-driven):**
- Multi-column sorting (if requested)
- Additional export formats (JSON, XML)
- Custom bulk action confirmations
- Further a11y enhancements

**Contributing:** See [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## Changelog

For detailed changes, see:
- [packages/table/CHANGELOG.md](./packages/table/CHANGELOG.md)
- [CHANGELOG.md](./CHANGELOG.md)

---

**Version:** @rowakit/table@0.5.0  
**Repository:** [github.com/midflow/rowakit](https://github.com/midflow/rowakit)  
**License:** MIT
