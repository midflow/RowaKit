# Changelog

All notable changes to this package will be documented in this file.

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
