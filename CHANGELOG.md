# Changelog

All notable changes to RowaKit will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- OSS public release preparation
  - MIT License
  - Contributing guidelines with scope lock enforcement
  - Contributor Covenant v2.1 Code of Conduct
  - Security vulnerability reporting policy
  - GitHub issue templates (bug report, feature request, question)
  - Pull request template with scope guard checklist
  - GitHub Sponsors integration via FUNDING.yml
  - Comprehensive public README with quick start
  - DECISIONS_SCOPE_LOCK.md explaining permanent philosophy
  - ROADMAP.md with Stage A/B/C evolution plan
  - RELEASE_CHECKLIST.md for maintainers

### Changed
- Enhanced CI workflow with typecheck step

---

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
