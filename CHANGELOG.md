# Changelog

All notable changes to RowaKit will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
