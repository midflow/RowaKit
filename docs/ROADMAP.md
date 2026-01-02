# RowaKit Roadmap

> This roadmap outlines the planned evolution of RowaKit Table.  
> **Important:** We only add features when there's real-world demand.

---

## Current Status

**Version:** 0.2.2  
**Stage:** B (Production Improvements) - ✅ **COMPLETE**  
**Next:** Stage C (Advanced / Optional) - 💭 Demand-driven

---

## Stage A — MVP (v0.1.0) ✅ COMPLETE

**Goal:** Server-side table that "just works" for 80% of internal app use cases.

### Shipped Features
- ✅ Server-side pagination (next/prev, page size selector)
- ✅ Single-column sorting (asc/desc/none)
- ✅ 5 column types:
  - `col.text()` - text display
  - `col.date()` - date formatting
  - `col.boolean()` - Yes/No rendering
  - `col.actions()` - row actions with confirmation
  - `col.custom()` - escape hatch for custom rendering
- ✅ Automatic states:
  - Loading (skeleton/spinner)
  - Error (with retry button)
  - Empty (customizable message)
- ✅ Action buttons:
  - Confirmation dialogs (for delete, etc.)
  - Disabled state during loading
- ✅ Fetcher contract:
  - `{ page, pageSize, sort?, filters? }` → `{ items, total }`
- ✅ TypeScript:
  - Full type safety with generics
  - Excellent IntelliSense
- ✅ Basic styling:
  - CSS variables for theming
  - Responsive overflow (horizontal scroll)

### What's NOT in Stage A
# Roadmap

This document describes the planned evolution of RowaKit in staged, demand-driven phases. It is written for maintainers and contributors and focuses on decisions, priorities, and upgrade paths.

## Principles
- Server-side first: features must fit the server-side, low-client-overhead philosophy.
- Small core + escape hatch: prioritize a minimal, well-maintained core API and enable extension via `col.custom()` and composable hooks.
- Demand-driven: non-trivial features require demonstrated demand and a clear maintenance plan.

## Stage A — Initial Release (v0.1.x) — Complete
- Delivered: core table component, server-side fetcher contract, pagination, single-column sorting, text/date/boolean/actions/custom column types, responsive styling, TypeScript types, and examples.

## Stage B — Production Improvements (v0.2.2) — ✅ COMPLETE

**Delivered (v0.2.2):**
- ✅ Server-side text filters with type-specific UIs (text, number, boolean, date, badge)
- ✅ Number column with Intl.NumberFormat support (`col.number()`)
- ✅ Badge column with visual tone mapping (`col.badge()`)
- ✅ Filter numeric values sent as numbers (not strings) for precise server-side matching
- ✅ Date range filters for date columns
- ✅ Clear filters functionality
- ✅ Full TypeScript types for filters
- ✅ Comprehensive filter examples in demo

**Shipped:** 2026-01-02

## Stage C — Advanced / Optional (Future)
Only considered with significant demand and a maintenance commitment.
- Multi-column sorting (careful design for server interaction)
- Server-triggered exports (CSV/Excel) and large-file handling
- Column resizing or persistent column ordering (opt-in)

## Out of Scope (Permanent)
- Virtualization (use dedicated libraries such as TanStack Virtual)
- Grouping/pivot/analytics engines (use AG Grid or dedicated BI tools)
- Spreadsheet-style inline editing or full spreadsheet behavior

## Decision Process
1. Issue filed with real-world use case and example server API.
2. Triage: product/maintainers confirm scope fit and demand level.
3. Design proposal: API, examples, and migration notes.
4. Implementation in a feature branch with tests and examples.
5. Release and documentation update (CHANGELOG, examples, migration guide).

## Release Strategy
- Pre-1.0 (0.x): prioritize iterative improvements; small breaking changes may occur but document them.
- 1.0: stable public API, semver rules strictly applied.

## How to propose a feature
- Open an issue describing the problem, API sketch, and at least two real-world use cases.
- Explain why existing extension points (e.g., `col.custom()`) are insufficient.
- Link adopters or stakeholders to demonstrate demand.

## References
- README.md — usage and quick start
- docs/DECISIONS_SCOPE_LOCK.md — design constraints and long-term philosophy

[unreleased]: https://github.com/midflow/RowaKit/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/midflow/RowaKit/releases/tag/v0.1.0

#### 7. Accessibility Basics
- Keyboard navigation for sorting
- Aria labels for actions and pagination

### Non-Goals (Still Out of Scope)
- ❌ Column grouping/pinning
- ❌ Virtualization
- ❌ Multi-sort
- ❌ Client-side filtering
- ❌ Drag-drop

**Status:** 🚧 **Waiting for demand.** File issues/discussions if you need these features.

---

## Stage C — v1.5+ (Maybe)

**Goal:** Add-ons based on strong, repeated user demand.

**Trigger:** Only implement if multiple users request AND it aligns with scope.

### Candidate Features (No Commitment)

#### Row Selection + Bulk Actions
- Checkbox column
- Select all/none
- Bulk action toolbar
- **Risk:** API explosion. Needs careful design.

#### Server-Triggered CSV Export
- Export button calls `exporter(query)` function
- Server handles large datasets
- Client downloads result

#### URL State Persistence
- Sync table state (page, sort, filters) to URL query params
- Shareable links
- Browser back/forward support

#### Column Visibility Toggles
- Show/hide columns
- Persist to localStorage (optional)

### Still Out of Scope (Forever)
- ❌ Virtualization → use TanStack Virtual
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
3. **Join discussions** - Share experiences
4. **Contribute** - Submit PRs for approved features

**Note:** We prioritize features with:
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
