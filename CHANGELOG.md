# Changelog

All notable changes to RowaKit will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-01-12 (OSS 1.0 Stable Release)

### Added
- **Stability & governance**
  - API stability contract: `docs/API_STABILITY.md`
  - API freeze summary: `docs/API_FREEZE_SUMMARY.md`
  - Canonical release decision: `docs/V1_0_0_FINAL_GO_NO_GO_REPORT.md`
  - Executive decision summary: `docs/V1_0_0_RELEASE_DECISION.md`

### Changed
- Released `@rowakit/table` as **stable v1.0.0**.

### Validation
- Production-like harness validation: `docs/PRODUCTION_LIKE_VALIDATION.md` (PASS)
- Consumer compatibility validation: `docs/CONSUMER_COMPAT_MATRIX.md` (PASS)

---

## [0.6.0] - 2026-01-11 (Stage F - API Completeness & Release Candidate)

### Added
- **Stage F: Missing Type Exports**
  - Exported `SortColumn` type for proper TypeScript typing of multi-sort queries
  - Exported `BulkActionDef` type for bulk action configuration
  - Enables full IDE autocomplete and type safety for power users

- **Stage F: Multi-Sort Documentation**
  - Documented Ctrl/Cmd+Click behavior for multi-column sorting
  - Added `sorts` array format with priority-based ordering
  - Migration guide from deprecated `sort` field (removal in v2.0.0)

- **Stage F: Production Validation Template**
  - Created `docs/PRODUCTION_USAGE.md` for Phase 2 tracking
  - Blueprint for real-world deployment metrics and feedback

### Changed
- All package versions bumped to 0.6.0 (monorepo consistency)
- README updated to reflect Stage F RC status
- ROADMAP updated with Stage F details

### Status
- ✅ All 246 tests passing
- ✅ TypeScript compilation clean
- ✅ Build successful (ESM, CJS, DTS)
- ✅ Ready for production validation (Phase 2)

---

## [0.5.0] - 2026-01-09 (Core Features + a11y)

### Added
- **Stage E: Hook Refactor (E-01)**
  - Extracted 5 composable hooks: `useFetcherState`, `useSortingState`, `useColumnResizing`, `useUrlSync`, `useSavedViews`
  - New `useFocusTrap` hook for modal keyboard navigation
  - SmartTable refactored from god component to composition-based architecture
  - All existing behavior preserved; no breaking changes
  - Improved testability and future extensibility

- **Stage E: Row Selection (E-02)**
  - Page-scoped row selection with checkboxes (header + body rows)
  - Selection state module with helpers: `toggleSelectionKey`, `selectAll`, `clearSelection`, `isAllSelected`, `isIndeterminate`
  - Header checkbox with indeterminate state for partial selection
  - `enableRowSelection` prop to enable feature
  - `onSelectionChange` callback for selection changes
  - Automatic selection reset on page change (prevents user confusion)

- **Stage E: Bulk Actions (E-03)**
  - `BulkActionBar` component displaying selected count and action buttons
  - `bulkActions` prop: array of action definitions with callbacks
  - Confirmation modal support for destructive actions
  - Reuses existing modal styling for consistency
  - Snapshot of selected row keys passed to action handlers

- **Stage E: CSV Export (E-04)**
  - `ExportButton` component with loading and error states
  - `Exporter` type: callback receiving FetcherQuery, returning Promise<{url} | Blob>
  - `ExporterResult` type exported for typing
  - Error handling with inline error display in UI
  - Current query snapshot passed to exporter (includes filters, sort, pagination)

- **Stage E: Version Automation (E-05)**
  - Version injected from `package.json` at build time via tsup define plugin
  - `__ROWAKIT_TABLE_VERSION__` constant defined at build time
  - Works seamlessly in built artifacts and test environments
  - Fallback to `0.4.0` for development environments

- **Stage E: Repo Hygiene (E-06)**
  - Removed junk files (.tmp, .backup) from demo folder
  - Added `.gitignore` patterns: `*.tmp`, `*.backup`, `*.swp~`, `*~`
  - Created [CI_JUNK_FILE_PREVENTION.md](./docs/CI_JUNK_FILE_PREVENTION.md) documentation
  - Pre-commit hook example for automatic enforcement

- **Stage E: Accessibility Baseline (E-07)**
  - `aria-sort` attributes on sortable headers (ascending/descending/none)
  - Modal focus trap: Tab/Shift+Tab cycles within modal
  - ESC key closes all dialogs
  - Auto-focus first focusable element in modals on open
  - Proper dialog semantics: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` on all modals
  - Keyboard-safe column resizing (works with pointer capture)

### Changed
- SmartTable component now composes hooks instead of inline logic
- Version constant no longer hardcoded in source code
- Modal styling unified and documented

### Testing
- 246 tests passing (18 test files)
- All existing behavior preserved (backward compatible)
- New feature coverage: row selection (3 tests), bulk actions (2 tests), export (2 tests)

### Build & Performance
- ESM bundle: 56.37 KB (gzipped: ~16 KB)
- CJS bundle: 57.73 KB (gzipped: ~17 KB)
- DTS: 16.67 KB
- No performance regressions in existing features
- Tree-shakeable exports preserved

---

## [0.4.0] - 2026-01-05 (Polish + Correctness)

### Added
- **Stage D: Column Resizing Hardening (D-01, D-02)**
  - Pointer Events support (mouse, touch, pen input)
  - Event propagation control to prevent accidental sort while resizing
  - Sort suppression window (150ms grace period after resize ends)
  - Applied `.resizing` CSS class to active column header
  - Pointer capture for reliable drag-to-end tracking
  - Primary button gating for mouse pointers
  - Proper cleanup on `pointercancel` (avoids stuck resizing state)

- **Stage D: Column Width Model Hardening (D-03)**
  - Width applied to both `<th>` and `<td>` (stable column alignment)
  - `table-layout: fixed` scoped via `.rowakit-layout-fixed` class
  - Re-enabled `.rowakit-cell-truncate` for body cells when `column.truncate: true`
  - RAF-throttled resize updates with change guards
  - Double-click auto-fit using `scrollWidth` calculation
  - `data-col-id` attribute on all body cells for consistent reference

- **Stage D: Saved Views Persistence (D-04)**
  - Storage index (`rowakit-views-index`) tracks saved view names and timestamps
  - Hydration on mount: reads index or scans localStorage for existing views
  - Replaced blocking `window.prompt()` with inline form UI
  - Optional overwrite confirmation for duplicate names
  - Safe JSON parsing with try/catch error handling
  - Views persist across browser reload and session

- **Stage D: URL Sync Hardening (D-05)**
  - Pure parse/serialize helper functions with validation
  - Page validation (≥ 1), pageSize validation (in options list)
  - Sort direction validation (asc|desc only)
  - Debounced columnWidths writes during resize (150-250ms)
  - Backward compatible with old URL formats
  - Safe defaults for invalid values

### Changed
- Resize interactions now use Pointer Events (replaces MouseEvent)
- Column width state respects per-column min/max bounds
- URL sync avoids repeated writes during rapid resize events
- Improved visual feedback during column resize with `.resizing` class

### Fixed
- Accidental sort trigger when dragging column resize handle
- Column width alignment issues with large content
- Sticky resizing state after canceled operations
- Corrupted localStorage views breaking hydration
- URL query string with invalid values

### Backward Compatibility
- ✅ All Stage D changes are fully backward compatible
- ✅ Existing saved views automatically migrated
- ✅ Old URLs remain compatible with safe parsing
- ✅ No breaking changes to public API
- ✅ Event types updated internally (no impact on consumers)

### Tests
- 239 tests passing (15 test files)
- Added comprehensive tests for:
  - Pointer Events and double-click resize
  - Sort suppression during/after resize
  - Column width persistence and URL sync
  - Saved views persistence and hydration
  - URL validation and safe parsing
- All edge cases covered: corrupted data, invalid URLs, state collisions

### Docs
- Updated ROADMAP.md with Stage D features and completion
- Updated README.md with resizing behavior and saved views information
- Added Stage D documentation sections to feature list

---

## [0.3.0] - 2026-01-03 (Advanced Features)

### Added
- **Stage C: Column Resizing (C-01)**
  - Interactive drag-to-resize handles on column headers
  - `minWidth` and `maxWidth` configuration per column
  - In-memory state management with optional URL persistence
  - Smooth visual feedback with opacity transitions

- **Stage C: Saved Views + URL State Sync (C-02)**
  - Automatic URL query string synchronization (page, pageSize, sort, filters, columnWidths)
  - Named saved views with localStorage persistence (optional)
  - Load/delete/reset UI buttons for view management
  - Share URLs to preserve exact table configuration

- **Stage C: Advanced Number Range Filters (C-03)**
  - Number columns support min/max range filtering
  - New `filterTransform` escape hatch for filter value adaptation (e.g., percentage → fraction)
  - Filter structure: `{ op: 'range', value: { from?: number; to?: number } }`

### New Props
- `enableColumnResizing?: boolean` - Enable drag-to-resize column handles
- `syncToUrl?: boolean` - Sync table state to URL query string
- `enableSavedViews?: boolean` - Show save/load view UI buttons

### New Column Properties
- `minWidth?: number` - Minimum column width (default 80px)
- `maxWidth?: number` - Maximum column width (optional)
- `filterTransform?: (value: number) => number` - Transform filter values before sending to fetcher

### Changed
- Updated `FilterValue` type to support numbers in range operators
- Enhanced number column filter UI with min/max inputs

### Backward Compatibility
- ✅ All Stage C features are opt-in (default: false)
- ✅ No breaking changes to existing API
- ✅ Existing code continues to work unchanged
- ✅ All new props optional with sensible defaults

---

## [0.2.1] - 2026-01-02 (Production Release)
### Fixed
- Number filter type coercion: filter inputs now properly coerce to numeric type for matching

For package-specific details, see `packages/table/CHANGELOG.md`.

---

## [0.2.0] - 2026-01-02
### Added
- Stage B features for `@rowakit/table`:
  - `col.badge` and `col.number` column types
  - Column modifiers: `width`, `align`, `truncate`
  - Server-side header filter UI with type-specific inputs
  - Demo and documentation updates

### Fixed
- Numeric filter value coercion for table filters
- Removed direct React runtime dependencies from package (moved to peerDependencies)

For package-specific details, see `packages/table/CHANGELOG.md`.


## [0.1.0] - 2024-12-31

### Added
- Initial MVP release (Stage A complete)
- `@rowakit/table` package with server-side first React table component
- Column helper functions: `col.text()`, `col.date()`, `col.boolean()`, `col.actions()`, `col.custom()`
- Built-in data fetching state machine (loading, error, empty, success)
- Pagination UI with configurable page sizes
- Single-column sorting (ascending, descending, none)
- Row actions with confirmation modal support
- Action states: confirm, loading, disabled (boolean or function)
- Minimal styling system with CSS design tokens
- Responsive table layout with horizontal scrolling
- TypeScript support with full type safety
- Comprehensive test suite (166 tests)
- Complete documentation and examples

### Core Philosophy
- **Server-side first**: Designed for server-side pagination, sorting, and filtering
- **Small core + escape hatch**: Minimal API with `col.custom()` for flexibility
- **Opinionated**: Convention over configuration for internal/business apps
- **NOT a data grid**: No virtualization, grouping, pivot, or spreadsheet editing

### What's In Scope
✅ Server-side pagination, sorting, filtering  
✅ Column types: text, date, boolean, actions, custom  
✅ Data states: loading, error, empty, success  
✅ Row-level actions with confirmation modals  
✅ TypeScript support and type safety  
✅ Minimal styling with CSS design tokens  

### What's Out of Scope
❌ Virtualization (use TanStack Virtual)  
❌ Grouping, pivot, aggregations (use AG Grid or Cube.js)  
❌ Spreadsheet-style cell editing (use Handsontable)  
❌ Client-side engines (use TanStack Table)  
❌ Column pinning, resizing, drag-and-drop (use AG Grid)  

### Stability
- ⚠️ **Beta stability**: v0.1.x API is stable but may have breaking changes in minor versions
- 🎯 **Production-ready for internal apps**: Safe to use in internal/business applications
- 🚧 **Stage B planned**: Next features shipped only when real demand exists

### Package Details
- Name: `@rowakit/table`
- Version: `0.1.0`
- License: MIT
- Repository: https://github.com/midflow/RowaKit
- Documentation: See README.md and packages/table/README.md

---

For detailed package-specific changes, see `packages/table/CHANGELOG.md`.
