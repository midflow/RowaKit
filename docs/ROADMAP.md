# RowaKit Roadmap

> This roadmap outlines the planned evolution of RowaKit Table.  
> **Important:** We only add features when there's real-world demand.

---

## Current Status

**Version:** 0.4.0  
**Stage:** D (Polish + Correctness) - ✅ **COMPLETE**  
**Next:** Demand-driven enhancements

---

## Stage A — MVP (v0.1.0) ✅ COMPLETE

**Goal:** Server-side table that "just works" for 80% of internal app use cases.

### Shipped Features
- ✅ Server-side pagination (next/prev, page size selector)
- ✅ Single-column sorting (asc/desc/none)
- ✅ 5 column types (text, date, boolean, actions, custom)
- ✅ Automatic states (loading, error, empty)
- ✅ Action buttons with confirmation dialogs
- ✅ Fetcher contract: `{ page, pageSize, sort?, filters? }` → `{ items, total }`
- ✅ Full TypeScript support with generics
- ✅ Basic styling with CSS variables

---

## Stage B — Production Improvements (v0.2.x) ✅ COMPLETE

**Delivered:**
- ✅ Server-side text filters with type-specific UIs (text, number, boolean, date, badge)
- ✅ `col.number()` with Intl.NumberFormat support
- ✅ `col.badge()` with visual tone mapping
- ✅ Number values sent as numeric type (not strings)
- ✅ Date range filters for date columns
- ✅ Clear filters functionality with "Clear all" button
- ✅ Column modifiers: `width`, `align`, `truncate`
- ✅ Full TypeScript types for all filters

**Shipped:** 2026-01-02

---

## Stage C — Advanced / Optional (v0.3.0) ✅ COMPLETE

**Delivered:**

### C-01: Column Resizing (MVP)
- ✅ Interactive drag-to-resize handles on column headers
- ✅ Min/max width constraints (configurable per column)
- ✅ In-memory state management
- ✅ Optional URL persistence via C-02 features
- ✅ Smooth visual feedback with hover transitions

### C-02: Saved Views + URL State Sync
- ✅ Automatic URL query string sync (page, pageSize, sort, filters, columnWidths)
- ✅ Share URLs to preserve exact table state
- ✅ Named saved views with localStorage persistence
- ✅ Load/delete/reset buttons for view management
- ✅ Automatic state restoration on page load

### C-03: Advanced Number Range Filters + FilterTransform
- ✅ Number columns support min/max range filtering
- ✅ Optional `filterTransform` for filter value adaptation
- ✅ Example: User enters 15% (percentage), backend receives 0.15 (fraction)
- ✅ Backward compatible with existing equals operator

**Shipped:** 2026-01-03

---

## Stage D — Polish + Correctness (v0.4.0) ✅ COMPLETE

**Goal:** Harden Stage C features (resizing, URL sync, saved views) with correctness, UX polish, and resilience.

### D-01: Prevent Accidental Sort While Resizing
- ✅ Stop event propagation on resize handle (prevent bubbling to sort handler)
- ✅ Add sort suppression window (150ms grace period after resize ends)
- ✅ Apply `.resizing` CSS class to active column header
- ✅ Resize and double-click never trigger sort

### D-02: Pointer Events Resizing (Mouse + Touch + Pen)
- ✅ Migrate from MouseEvent to PointerEvent
- ✅ Use pointer capture for reliable drag-to-end tracking
- ✅ Primary button gating for mouse pointers
- ✅ Proper cleanup on `pointercancel` (avoids stuck resizing state)
- ✅ Works with touch devices and stylus/pen input

### D-03: Column Width Model Hardening + Fixed Layout
- ✅ Apply widths to both `<th>` and `<td>` (stable alignment)
- ✅ Use `table-layout: fixed` for resizable columns (scoped via `.rowakit-layout-fixed` class)
- ✅ Re-enable `.rowakit-cell-truncate` for body cells when `column.truncate: true`
- ✅ RAF-throttled resize updates with change guards
- ✅ Double-click auto-fit with `scrollWidth` calculation

### D-04: Saved Views Persistence (localStorage)
- ✅ Add storage index (`rowakit-views-index`) tracking saved view names and timestamps
- ✅ Hydrate on mount: read index, or scan localStorage for `rowakit-view-*` keys if missing
- ✅ Replace blocking `window.prompt()` with inline form + optional overwrite confirmation
- ✅ Safe parsing with try/catch; skip corrupted views
- ✅ Views persist across browser reload

### D-05: URL Sync Hardening (Validate + Throttle)
- ✅ Pure parse helpers: `parseUrlState()`, `serializeUrlState()`
- ✅ Validation: page ≥ 1, pageSize in options, sortDirection asc|desc, filters/columnWidths objects
- ✅ Debounce columnWidths writes during resize (150-250ms)
- ✅ Invalid URL values clamped to safe defaults
- ✅ Backward compatible with old URLs

**Shipped:** 2026-01-05

---

## Out of Scope (Permanent)

- ❌ Virtualization (use TanStack Virtual, react-window)
- ❌ Grouping/pivot/aggregations (use AG Grid or Cube.js)
- ❌ Spreadsheet-style inline editing (use Handsontable)
- ❌ Client-side data processing engines (use TanStack Table)
- ❌ Advanced column features (pinning, drag-drop reordering - use AG Grid)

---

## Philosophy

**Server-side first:** All data operations (pagination, sorting, filtering) are handled by the backend. The table is a thin presentation layer.

**Small core + escape hatch:** Minimal API with `col.custom()` for flexibility when built-in columns don't fit.

**Opinionated:** Convention over configuration. Designed for internal/business apps, not generic use.

**Not a data grid:** This is a table component, not a full-featured spreadsheet engine.

---

## How to Propose a Feature

1. **File an issue** with a real-world use case
2. **Show demand** - Include at least two examples or stakeholders
3. **Explain constraints** - Why existing escape hatches (`col.custom()`) aren't sufficient
4. **Design API** - Provide code examples
5. **Discuss** - Let maintainers assess scope fit and maintenance burden

---

## Release Strategy

- **Pre-1.0 (0.x):** Prioritize improvements; small breaking changes documented with migration guides
- **1.0+:** Strict semver; breaking changes only in major versions

---

## References

- [README.md](../README.md) — Usage and quick start
- [packages/table/README.md](../packages/table/README.md) — Detailed documentation
- [DECISIONS_SCOPE_LOCK.md](./DECISIONS_SCOPE_LOCK.md) — Design constraints
- [CHANGELOG.md](../CHANGELOG.md) — Version history
- ❌ Grouping/pivot → use AG Grid
- ❌ Spreadsheet editing → use Handsontable
- ❌ Client-side data engines → use TanStack Table

**Status:** 💭 **Uncertain.** Only if there's overwhelming demand.

---

## Decision Process

### How Features Get Added

1. **User files an issue** using the feature request template
2. **Scope check:** Does it conflict with [DECISIONS_SCOPE_LOCK.md](./DECISIONS_SCOPE_LOCK.md)?
   - If yes → close with explanation
3. **Demand check:** Is there repeated demand from multiple users?
   - If no → wait for more requests
4. **Design:** Ensure feature fits RowaKit's API philosophy
5. **Implement:** Keep changes minimal, test thoroughly
6. **Ship:** Update docs, examples, changelog

### What Gets Rejected

- Features that turn RowaKit into a data grid
- Client-side-heavy features (conflicts with "server-first")
- Niche features solvable with `col.custom()`
- Features with low ROI vs high complexity

---

## Long-Term Vision

RowaKit will remain:
- **Server-side first** - always
- **Small core** - no bloat
- **Opinionated** - clear constraints
- **Maintainable** - single maintainer friendly

We will **never**:
- Compete with AG Grid, TanStack Table, or Handsontable
- Support every possible use case
- Sacrifice simplicity for flexibility

---

## Community Input

Want to influence the roadmap?

1. **Star the repo** ⭐ - Shows interest
2. **File issues** - Describe your use case
3. **Join discussions** - S5  
**Current Version:** 0.4.0
**Latest Release:** Stage D (v0.4.0)
**Next Milestone:** Stage Etures with:
- Clear, real-world use cases (not hypothetical)
- Repeated requests from different users
- Low complexity, high ROI
- Alignment with scope lock

---

## Release Strategy

### Versioning
- **0.x** - Beta, API may change slightly
- **1.0** - Stable API, semver guarantees
- **1.x** - Minor features, backward compatible
- **2.0+** - Only if breaking changes are unavoidable

### Release Cadence
- **Stage A (0.1.x)** - Bug fixes only
- **Stage B (1.0)** - When demand warrants + maintainer time
- **Stage C (1.5+)** - Opportunistic, no timeline

---

## FAQ

**Q: When will Stage B ship?**  
A: ✅ Stage B shipped in v0.2.2 (2026-01-02). It includes filters, number/badge columns, and full TypeScript support.

**Q: Can I sponsor to prioritize a feature?**  
A: Sponsorship helps sustainability, but doesn't guarantee features. Scope lock is permanent.

**Q: What if I need virtualization?**  
A: Use [TanStack Virtual](https://tanstack.com/virtual) + [TanStack Table](https://tanstack.com/table). RowaKit isn't for that.

**Q: Will RowaKit ever support [X out-of-scope feature]?**  
A: No. Read [DECISIONS_SCOPE_LOCK.md](./DECISIONS_SCOPE_LOCK.md).

---

**Last Updated:** 2026-01-02  
**Current Version:** 0.2.2
**Latest Release:** Stage B (v0.2.2)
**Next Milestone:** Stage C (demand-driven, no timeline)
