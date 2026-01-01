# B-04: Server-Side Filters Implementation

## Status: ✅ Complete (Implementation)

## Implementation Summary

The server-side filtering feature has been fully implemented according to the STAGE_B_FILTERS_SPEC.md specification.

### 1. Type System

Added to `types.ts`:
```typescript
// Filter operator types
export type FilterValue =
  | { op: 'contains'; value: string }
  | { op: 'equals'; value: string | number | boolean | null }
  | { op: 'in'; value: Array<string | number> }
  | { op: 'range'; value: { from?: string; to?: string } };

export type Filters = Record<string, FilterValue>;

// Updated FetcherQuery interface
export interface FetcherQuery<T> {
  page: number;
  pageSize: number;
  sort?: SortValue<T>;
  filters?: Filters; // undefined when no filters are active
}
```

### 2. Component State Management

Added to `SmartTable.tsx`:
- `filters` state: `Record<string, FilterValue | undefined>`
- `enableFilters` prop: boolean (default: false for backward compatibility)
- `useEffect` to sync filters to query:
  - Converts internal state to `Filters` object
  - Ensures `query.filters` is `undefined` when no filters are active (not `{}`)
  - Resets `page` to 1 when filters change

### 3. Filter Handlers

Three handler functions:
- `handleFilterChange(field, value)`: Updates filter for a specific column
- `handleClearFilter(field)`: Removes filter for a specific column
- `handleClearAllFilters()`: Clears all active filters

### 4. Filter UI

#### Filter Row
Added a filter row in `<thead>` that renders column-specific filter inputs:

**Text columns:**
- Text input with `contains` operator
- Placeholder: "Filter {column}..."

**Number columns:**
- Text input with `equals` operator
- Placeholder: "Filter {column}..."

**Badge columns:**
- Select dropdown with `equals` operator
- Options: "All" + keys from `badge.map`

**Boolean columns:**
- Select dropdown with `equals` operator
- Options: "All", "True", "False"

**Date columns:**
- Two date inputs for range filter
- "From" and "To" inputs side-by-side
- Uses `range` operator with `{from?, to?}` value

**Actions/Custom columns:**
- Empty `<th>` (not filterable)

#### Clear All Button
- Shown above table when any filters are active
- Calls `handleClearAllFilters()` on click
- Styled as secondary button

### 5. Styling

Added to `table.css`:
- `.rowakit-table-filter-controls`: Container for "Clear all" button
- `.rowakit-table-filter-row`: Filter row styling with gray background
- `.rowakit-filter-input`: Text/date input styling
- `.rowakit-filter-select`: Select dropdown styling
- `.rowakit-filter-date-range`: Flexbox container for date range inputs

### 6. API Exports

Updated `index.ts` to export:
- `FilterValue`
- `Filters`

## Spec Compliance Checklist

- ✅ `filters` is `undefined` when no filters are active (not `{}`)
- ✅ Filter changes reset `page` to 1
- ✅ No client-side filtering (purely server-side)
- ✅ Filter operators:
  - ✅ `contains` for text columns
  - ✅ `equals` for badge, boolean, and number columns
  - ✅ `range` for date columns
- ✅ `enableFilters` prop defaults to `false` (backward compatible)
- ✅ Filter UI follows recommended "header filter row" pattern

## Backward Compatibility

- ✅ No breaking changes to existing API
- ✅ Filters are opt-in via `enableFilters` prop
- ✅ Existing tables work without modification

## Testing Status

- ✅ All existing tests passing (178 tests)
- ⏳ **TODO**: Add tests for filter functionality (B-05)

## Next Steps

1. **B-05**: Add tests for Stage B features
   - Test badge/number rendering
   - Test filter state management
   - Test filter UI interactions
   - Test filter operator correctness
   - Test page reset on filter change
   - Test `filters: undefined` when empty

2. **B-06**: Update documentation and demo
   - Add filter examples to README
   - Create demo page showing filters
   - Document filter operators and usage
   - Add TypeScript examples

## Usage Example

```typescript
import { RowaKitTable, col, type FilterValue } from '@rowakit/table';

const columns = [
  col.text('name', { header: 'Name', sortable: true }),
  col.badge('status', { 
    header: 'Status', 
    map: { active: 'success', inactive: 'neutral', error: 'danger' }
  }),
  col.date('createdAt', { header: 'Created' }),
];

const fetcher = async (query: FetcherQuery<User>) => {
  // query.filters will be undefined or { fieldName: FilterValue }
  // Examples:
  // - { name: { op: 'contains', value: 'john' } }
  // - { status: { op: 'equals', value: 'active' } }
  // - { createdAt: { op: 'range', value: { from: '2024-01-01', to: '2024-12-31' } } }
  
  const response = await fetch(`/api/users?${buildQueryParams(query)}`);
  return response.json();
};

<RowaKitTable
  columns={columns}
  fetcher={fetcher}
  rowKey="id"
  enableFilters={true}  // Enable filter UI
/>
```
