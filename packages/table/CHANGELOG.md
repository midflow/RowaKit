# Changelog

All notable changes to this package will be documented in this file.

## [0.6.0] - 2026-01-11 (Stage F - API Completeness & Release Candidate)

### Added
- **F-01: Missing Type Exports**
  - `SortColumn` type export: Enables proper TypeScript typing for multi-column sorts
  - `BulkActionDef` type export: Enables proper TypeScript typing for bulk actions
  - Impact: Full IDE autocomplete and type inference for public API consumers

- **F-02: Multi-Sort Feature Documentation**
  - Added comprehensive section to README.md explaining Ctrl/Cmd+Click multi-sort behavior
  - Documented `sorts: SortColumn[]` array format with priority-based ordering
  - Migration guide: `sort` field (deprecated) → `sorts` array (new)
  - Backward compatible: both fields coexist; `sort` removal planned for v2.0.0

- **F-03: Production Validation Framework**
  - Created `docs/PRODUCTION_USAGE.md` template for Phase 2 tracking
  - Enables data-driven decision for v1.0.0 release based on real-world deployments

### Changed
- Package version bumped from 0.5.0 to 0.6.0
- README.md now documents all v0.6.0 features with examples
- ROADMAP.md includes Stage F implementation details

### Status
- 🚀 **Release Candidate**: Ready for production validation
- ✅ All 246 tests passing
- ✅ TypeScript compilation: clean
- ✅ Build artifacts: successful (58.78 KB ESM, 60.16 KB CJS, 17.43 KB DTS)
- ⏳ Phase 2: Production deployments pending (2-3 weeks)

---

## [0.5.0] - 2026-01-09 (Stage E - Row Selection, Bulk Actions, Export, Multi-Sort, Accessibility)

### Added
- **Row Selection (E1)**: Select/deselect individual rows with checkbox column, bulk header checkbox, keyboard support (Space/Enter)
- **Bulk Actions (E2)**: Execute actions on multiple selected rows with confirmation dialogs
- **Server-triggered CSV Export (E3)**: Export button with customizable exporter function, supports server-side export generation
- **Multi-Column Sorting (E4)**: Sort by multiple columns (Ctrl+Click to add sorts), maintains priority order
- **Accessibility Baseline (E7)**: ARIA labels, keyboard navigation, focus trap in modals, semantic HTML
- `enableRowSelection?: boolean` prop to activate row selection UI
- `bulkActions?: BulkAction[]` prop for bulk operation handlers
- `onExport?: Exporter` prop for export functionality
- `sorts?: SortColumn[]` in FetcherQuery for multi-sort support (backward compatible with `sort`)
- `useFocusTrap` hook for keyboard-accessible modals and dialogs

### Changed
- FetcherQuery now supports `sorts: SortColumn[]` array (multi-sort) while maintaining `sort` for backward compatibility
- Demo system expanded with 5 new Stage E examples (09-13)
- All Stage E demos implement proper server-side data operations

### Fixed
- TypeScript typing in useFocusTrap hook for proper non-null assertions on ref assignments
- Focus management in modal dialogs with proper cyclic Tab/Shift+Tab behavior

### Tests & Verification
- All 246+ tests passing
- Build successful: ESM, CJS, and TypeScript definitions
- Demo server running with 13 interactive examples

---

## [0.4.0] - 2026-01-05 (Polish + Correctness)

### Added
- Pointer Events-based resizing (mouse/touch/pen) with pointer capture
- Sort suppression while resizing (no accidental sort from handle events)
- Width applied to both `<th>` and `<td>` for stable alignment
- Double-click auto-fit using `scrollWidth`
- Saved views hydration and storage index (`rowakit-views-index`)
- URL sync validation and debounced column width writes

### Changed
- Resize interactions now use Pointer Events
- URL sync is more resilient and validates inputs

### Fixed
- Accidental sort triggered by resize interactions
- Column width truncation caused by CSS override
- Stuck resizing state after pointercancel

---

## [0.3.0] - 2026-01-03 (Advanced Features)
### Added
- **Column Resizing (C-01)**
  - Interactive drag-to-resize handles on column headers
  - `minWidth` and `maxWidth` configuration per column
  - In-memory state management with optional URL persistence
  - Smooth visual feedback with opacity transitions

- **Saved Views + URL State Sync (C-02)**
  - Automatic URL query string synchronization (page, pageSize, sort, filters, columnWidths)
  - Named saved views with localStorage persistence (optional)
  - Load/delete/reset UI buttons for view management
  - Share URLs to preserve exact table configuration

- **Advanced Number Range Filters (C-03)**
  - Number columns support min/max range filtering
  - New `filterTransform` escape hatch for filter value adaptation
  - Filter structure: `{ op: 'range', value: { from?: number; to?: number } }`

### New Props
- `enableColumnResizing?: boolean` - Enable drag-to-resize column handles
- `syncToUrl?: boolean` - Sync table state to URL query string
- `enableSavedViews?: boolean` - Show save/load view UI buttons

### New Column Properties
- `minWidth?: number` - Minimum column width (default 80px)
- `maxWidth?: number` - Maximum column width (optional)
- `filterTransform?: (value: number) => number` - Transform filter values before sending to fetcher

### Backward Compatibility
- ✅ All Stage C features are opt-in (default: false)
- ✅ No breaking changes to existing API
- ✅ Existing code continues to work unchanged

### Tests & Verification
- All 193 tests passing
- Build successful: ESM (30.84KB), CJS (31.69KB), Types (15.91KB)
- Demo updated with StageCDemo.tsx examples

---

## [0.2.1] - 2026-01-02 (Production Release)
### Fixed
- Number filter field comparison now properly coerces filter input string values to numeric type, allowing filters like `price = 12.99` to match numeric data fields correctly.
- Filter backend contract clarified in README with type coercion guidance.

### Notes
- **Production Ready**: This release is production-ready for internal applications.
- All tests passing (193 tests), build successful, dependencies hardened.

---

## [0.2.0] - 2026-01-02
### Added
- `col.badge` column type: render enum/status values as labeled badges with visual tones (neutral, success, warning, danger).
- `col.number` column type: numeric formatting support (Intl number options or custom formatter), right-aligned by default.
- Column modifiers: `width`, `align`, `truncate` for improved layout control.
- Server-side filter UI (header filter row) with type-specific inputs: text (`contains`), badge/enum (`equals`), boolean (`equals`), date range (`range`).
- Demo and docs updated with Stage B examples and usage.

### Fixed
- Numeric filter values are now sent as numbers (not strings) from the filter inputs — fixes incorrect "No data" results when filtering numeric columns.

### Tests
- Added tests covering badge, number, modifiers, and server-side filter behaviors (apply/clear/reset-page).

### Notes
- This is a backwards-compatible, focused release (see ROADMAP/Stage B docs). Filters remain server-side only; no client-side filtering, no URL sync, no advanced query builder.

---

For full Stage B design and constraints see: `../../docs/STAGE_B_FILTERS_SPEC.md` and `../../docs/ROWAKIT_STAGE_B_ISSUES.md`.
