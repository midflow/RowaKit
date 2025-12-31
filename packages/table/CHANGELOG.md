# Changelog

All notable changes to @rowakit/table will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2024-12-31

### Added
- Initial MVP release (Stage A complete)
- `SmartTable` component with server-side data fetching
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

### Features

#### Core Components
- **SmartTable**: Main table component with server-side first approach
- **Fetcher Contract**: Standardized interface for data fetching with pagination, sorting, and filters
- **Column System**: Type-safe column definitions with flexible rendering options

#### Column Types
- **Text Columns**: `col.text()` for string data with optional formatting
- **Date Columns**: `col.date()` with customizable date formatting
- **Boolean Columns**: `col.boolean()` with custom true/false representations  
- **Actions Column**: `col.actions()` for row-level actions with confirmation dialogs
- **Custom Columns**: `col.custom()` escape hatch for complete rendering control

#### Data States
- Loading state with visual feedback
- Error state with retry button
- Empty state for no data
- Success state with rendered data

#### Pagination
- Next/Previous navigation
- Page size selector (configurable options)
- Page info display (current page, total pages, total items)
- Server-side pagination support

#### Sorting
- Single-column sort toggle (asc → desc → none)
- Sortable column indicator
- Sort state passed to fetcher
- Keyboard accessible sort headers

#### Actions
- Row-level action buttons
- Optional confirmation modal for destructive actions
- Conditional disabling based on row data
- Loading state support
- Icon support (string or React component)
- Async action handler support

#### Styling
- CSS design tokens (colors, spacing, typography, borders, shadows)
- Customizable via CSS variables (`--rowakit-*` prefix)
- `className` prop for per-instance customization
- Responsive design with mobile breakpoints
- Dark mode ready

#### Developer Experience
- Full TypeScript support with generics
- Intuitive column helper API
- Minimal required props
- Comprehensive documentation
- 4 complete usage examples
- 166 passing tests

### Package Exports
- Main module: `@rowakit/table`
- Styles: `@rowakit/table/styles`
- Granular style imports: `@rowakit/table/styles/tokens.css`, `@rowakit/table/styles/table.css`

### Documentation
- Comprehensive README with API reference
- Quick start guide
- 4 detailed examples (basic usage, mock server, custom columns, styling)
- Examples directory with README
- TypeScript usage guide
- Styling and theming guide

## Roadmap

### Stage B - v1.0 (Production Ready) - Planned
- Column visibility toggle
- Bulk actions and row selection
- Search/text filter
- Export functionality (CSV, Excel)
- Dense/comfortable view modes
- Additional column types: `col.badge()`, `col.number()`
- Basic filter UI

### Stage C - Advanced (Demand-Driven) - Future
- Multi-column sorting
- Advanced filters
- Column resizing
- Saved views/preferences
- Virtual scrolling for large datasets

## Breaking Changes

None yet - this is the initial release.

## Migration Guides

### To v0.1.0 (Initial Release)
This is the first release. To get started:

```bash
npm install @rowakit/table
```

Import styles:
```tsx
import '@rowakit/table/styles';
```

Use the component:
```tsx
import { SmartTable, col } from '@rowakit/table';

<SmartTable
  fetcher={fetchData}
  columns={[
    col.text('name'),
    col.text('email'),
  ]}
  rowKey="id"
/>
```

See the [README](./README.md) for full documentation.

## Contributors

Built with ❤️ by the RowaKit team.

[unreleased]: https://github.com/rowakit/table/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/rowakit/table/releases/tag/v0.1.0
