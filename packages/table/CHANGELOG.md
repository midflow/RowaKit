# Changelog

All notable changes to this package will be documented in this file.

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
