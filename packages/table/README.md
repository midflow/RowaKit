# @rowakit/table

**Opinionated, server-side-first table component for internal/business apps**

RowaKit Table is a React table component designed for real-world internal applications. It prioritizes server-side operations, clean APIs, and developer experience over configuration complexity.

## Features

✅ **Server-side first** - Pagination, sorting, and filtering handled by your backend  
✅ **Type-safe** - Full TypeScript support with generics  
✅ **Minimal API** - Few props, convention over configuration  
✅ **Escape hatch** - `col.custom()` for any rendering need  
✅ **Action buttons** - Built-in support for row actions with confirmation  
✅ **7 column types** - Text, Date, Boolean, Badge, Number, Actions, Custom  
✅ **Column modifiers** - Width, align, truncate, minWidth, maxWidth (v0.2.0+)  
✅ **Server-side filters** - Type-specific filter UI with auto-generated inputs (v0.2.0+)  
✅ **Column resizing** - Drag-to-resize handles with constraints (v0.3.0+)  
✅ **Saved views** - Save/load table state with localStorage persistence (v0.3.0+)  
✅ **URL state sync** - Share URLs with exact table configuration (v0.3.0+)  
✅ **Number range filters** - Min/max filtering for numeric columns (v0.3.0+)  
✅ **State management** - Automatic loading, error, and empty states  
✅ **Smart fetching** - Retry on error, stale request handling

## Installation

```bash
npm install @rowakit/table
# or
pnpm add @rowakit/table
# or
yarn add @rowakit/table
```

## Quick Start (5 minutes)

### 1. Import the component and styles

```tsx
import { RowaKitTable, col } from '@rowakit/table';
import type { Fetcher } from '@rowakit/table';
import '@rowakit/table/styles'; // Import default styles

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  active: boolean;
}
```

### 2. Create a fetcher function

Your fetcher connects the table to your backend API:

```tsx
const fetchUsers: Fetcher<User> = async (query) => {
  const params = new URLSearchParams({
    page: query.page.toString(),
    pageSize: query.pageSize.toString(),
    ...(query.sort && {
      sortField: query.sort.field,
      sortDir: query.sort.direction,
    }),
  });

  const response = await fetch(`/api/users?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  return response.json(); // Must return: { items: User[], total: number }
};
```

### 3. Define your columns and render the table

```tsx
function UsersTable() {
  return (
    <RowaKitTable
      fetcher={fetchUsers}
      columns={[
        col.text('name', { header: 'Name', sortable: true }),
        col.text('email', { header: 'Email' }),
        col.date('createdAt', { header: 'Created' }),
        col.boolean('active', { header: 'Active' }),
        col.actions([
          { id: 'edit', label: 'Edit', onClick: (user) => console.log('Edit:', user) },
          { id: 'delete', label: 'Delete', confirm: true, onClick: (user) => console.log('Delete:', user) }
        ])
      ]}
      defaultPageSize={20}
      rowKey="id"
    />
  );
}
```

### That's it! 🎉

The table automatically handles:
- Fetches data on mount
- Shows loading state while fetching
- Displays error with retry button on failure
- Shows "No data" when empty
- Renders your data when successful

**Next Steps:**
- See [examples/](./examples/) for complete patterns (mock server, custom columns, styling)
- Read the [API Reference](#api-reference) below for all features
- Check [CONTRIBUTING.md](./CONTRIBUTING.md) to contribute

---

## API Reference

### `<RowaKitTable>`

Main table component.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `fetcher` | `Fetcher<T>` | ✅ Yes | - | Function to fetch data from server |
| `columns` | `ColumnDef<T>[]` | ✅ Yes | - | Array of column definitions |
| `rowKey` | `keyof T \| (row: T) => string` | No | `'id'` | Field or function to extract unique row key |
| `defaultPageSize` | `number` | No | `20` | Initial page size |
| `pageSizeOptions` | `number[]` | No | `[10, 20, 50]` | Available page size options |
| `className` | `string` | No | `''` | Additional CSS classes for the table container |

### Fetcher Contract

The `Fetcher` is the primary contract for loading data. It receives query parameters and returns paginated results.

**The fetcher is called automatically:**
- On component mount
- When query parameters change (page, pageSize, sort, filters)
- When retry button is clicked after an error

```typescript
type Fetcher<T> = (query: FetcherQuery) => Promise<FetcherResult<T>>;

interface FetcherQuery {
  page: number;           // Current page (1-based)
  pageSize: number;       // Items per page
  sort?: {
    field: string;        // Field to sort by
    direction: 'asc' | 'desc';
  };
  filters?: Record<string, unknown>;
}

interface FetcherResult<T> {
  items: T[];            // Array of items for current page
  total: number;         // Total number of items across all pages
}
```

**Error handling:**

Throw an error from your fetcher to trigger the error state with retry button:

```typescript
const fetchUsers: Fetcher<User> = async (query) => {
  const response = await fetch(`/api/users?page=${query.page}`);
  
  if (!response.ok) {
    throw new Error('Failed to load users');
  }
  
  return response.json();
};
```

**State Management:**

The table automatically manages these states:

- **Loading** - Shows "Loading..." while fetcher is executing
- **Success** - Renders table with data when items.length > 0
- **Empty** - Shows "No data" when items.length === 0
- **Error** - Shows error message with "Retry" button when fetcher throws

**Stale Request Handling:**

The table automatically ignores responses from outdated requests, ensuring the UI always shows data from the most recent query.

### Column Helpers

Use `col.*` helpers to define columns with minimal boilerplate.

#### `col.text(field, options?)`

Text column with optional formatting.

```typescript
col.text('name')
col.text('email', { header: 'Email Address', sortable: true })
col.text('status', { format: (val) => val.toUpperCase() })
```

**Options:**
- `header?: string` - Custom header label
- `sortable?: boolean` - Enable sorting
- `format?: (value: unknown) => string` - Custom formatter

#### `col.date(field, options?)`

Date column with optional formatting.

```typescript
col.date('createdAt')
col.date('updatedAt', { header: 'Last Modified', sortable: true })
col.date('birthday', { 
  format: (date) => new Date(date).toLocaleDateString('en-US')
})
```

**Options:**
- `header?: string` - Custom header label
- `sortable?: boolean` - Enable sorting
- `format?: (value: Date | string | number) => string` - Custom date formatter

**Default format:** `date.toLocaleDateString()`

#### `col.boolean(field, options?)`

Boolean column with optional formatting.

```typescript
col.boolean('active')
col.boolean('isPublished', { header: 'Published' })
col.boolean('enabled', { format: (val) => val ? '✓' : '✗' })
```

**Options:**
- `header?: string` - Custom header label
- `sortable?: boolean` - Enable sorting
- `format?: (value: boolean) => string` - Custom formatter

**Default format:** `'Yes'` / `'No'`

#### `col.badge(field, options?)` (v0.2.0+)

Badge column with visual tone mapping for status/enum values.

```typescript
col.badge('status', {
  header: 'Status',
  map: {
    active: { label: 'Active', tone: 'success' },
    pending: { label: 'Pending', tone: 'warning' },
    inactive: { label: 'Inactive', tone: 'neutral' },
    error: { label: 'Error', tone: 'danger' }
  }
})

col.badge('priority', {
  header: 'Priority',
  sortable: true,
  map: {
    high: { label: 'High', tone: 'danger' },
    medium: { label: 'Medium', tone: 'warning' },
    low: { label: 'Low', tone: 'success' }
  }
})
```

**Options:**
- `header?: string` - Custom header label
- `sortable?: boolean` - Enable sorting
- `map?: Record<string, { label: string; tone: BadgeTone }>` - Map values to badge labels and visual tones
- `width?: number` - Column width in pixels
- `align?: 'left' | 'center' | 'right'` - Text alignment
- `truncate?: boolean` - Truncate with ellipsis

**Badge Tones:**
- `'neutral'` - Gray (default)
- `'success'` - Green
- `'warning'` - Yellow/Orange
- `'danger'` - Red

#### `col.number(field, options?)` (v0.2.0+)

Number column with formatting support (currency, percentages, decimals).

```typescript
// Basic number
col.number('quantity')

// Currency formatting with Intl.NumberFormat
col.number('price', {
  header: 'Price',
  sortable: true,
  format: { style: 'currency', currency: 'USD' }
})

// Percentage
col.number('discount', {
  header: 'Discount',
  format: { style: 'percent', minimumFractionDigits: 1 }
})

// Custom formatter
col.number('score', {
  header: 'Score',
  format: (value) => `${value.toFixed(1)} pts`
})
```

**Options:**
- `header?: string` - Custom header label
- `sortable?: boolean` - Enable sorting
- `format?: Intl.NumberFormatOptions | ((value: number) => string)` - Formatting
  - `Intl.NumberFormatOptions`: e.g., `{ style: 'currency', currency: 'USD' }`
  - Function: Custom formatter like `(value) => value.toFixed(2)`
- `width?: number` - Column width in pixels
- `align?: 'left' | 'center' | 'right'` - Text alignment (defaults to 'right')
- `truncate?: boolean` - Truncate with ellipsis

**Default format:** Plain number with right alignment

#### `col.actions(actions)`

Actions column with buttons for row operations.

```typescript
col.actions([
  { id: 'edit', label: 'Edit', onClick: (row) => editItem(row) },
  { 
    id: 'delete', 
    label: 'Delete', 
    confirm: true, 
    icon: '🗑️',
    onClick: (row) => deleteItem(row) 
  }
])
```

**ActionDef properties:**
- `id: string` - Unique action identifier
- `label: string` - Button label
- `onClick: (row: T) => void | Promise<void>` - Action handler
- `icon?: string | ReactNode` - Optional icon
- `confirm?: boolean` - Show confirmation dialog
- `disabled?: boolean | ((row: T) => boolean)` - Disable button
- `loading?: boolean` - Show loading state

#### `col.custom(field, render)`

Custom column with full rendering control. **This is your escape hatch.**

```typescript
// Badge
col.custom('status', (row) => (
  <Badge color={row.status === 'active' ? 'green' : 'gray'}>
    {row.status}
  </Badge>
))

// Avatar + Name
col.custom('user', (row) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
    <img src={row.avatar} alt="" width={32} height={32} />
    <span>{row.name}</span>
  </div>
))

// Money formatting
col.custom('price', (row) => (
  <Money amount={row.price} currency={row.currency} />
))

// Complex logic
col.custom('summary', (row) => {
  const status = row.active ? 'Active' : 'Inactive';
  const lastSeen = formatDistanceToNow(row.lastSeenAt);
  return `${status} - ${lastSeen}`;
})
```

### Column Modifiers (v0.2.0+)

All column types (text, date, boolean, badge, number) support these optional modifiers:

```typescript
// Width: Set fixed column width in pixels
col.text('name', { width: 200 })

// Align: Control text alignment
col.text('status', { align: 'center' })
col.number('price', { align: 'right' }) // numbers default to 'right'

// Truncate: Enable text truncation with ellipsis
col.text('description', { truncate: true, width: 300 })

// Combine multiple modifiers
col.badge('status', {
  header: 'Status',
  width: 120,
  align: 'center',
  truncate: true,
  map: { active: 'success', inactive: 'neutral' }
})
```

**Modifiers:**
- `width?: number` - Column width in pixels
- `align?: 'left' | 'center' | 'right'` - Text alignment
- `truncate?: boolean` - Truncate long text with ellipsis (requires `width`)

**Notes:**
- Number columns default to `align: 'right'`
- Other columns default to `align: 'left'`
- Truncate works best with a fixed `width`

### Pagination

The table includes built-in pagination controls that appear automatically when data is loaded.

**Features:**
- **Page Size Selector** - Dropdown to change rows per page
- **Page Navigation** - Previous/Next buttons to navigate pages
- **Page Info** - Shows current page, total pages, and total items
- **Auto-disable** - Buttons disabled during loading or at boundaries

**Configuration:**

```typescript
<RowaKitTable
  fetcher={fetchUsers}
  columns={columns}
  defaultPageSize={20}              // Initial page size (default: 20)
  pageSizeOptions={[10, 20, 50]}    // Available sizes (default: [10, 20, 50])
  rowKey="id"
/>
```

**Behavior:**

1. **On Page Change**: Fetcher called with new `page` value
2. **On Page Size Change**: Fetcher called with new `pageSize` and resets to `page: 1`
3. **During Loading**: All pagination controls are disabled
4. **No Data/Error**: Pagination controls are hidden

**Example Fetcher with Pagination:**

```typescript
const fetchUsers: Fetcher<User> = async ({ page, pageSize }) => {
  const response = await fetch(
    `/api/users?page=${page}&limit=${pageSize}`
  );
  
  const data = await response.json();
  
  return {
    items: data.users,
    total: data.totalCount  // Required for page calculation
  };
};
```

**Pagination Math:**

- `totalPages = Math.ceil(total / pageSize)`
- Previous button disabled when `page === 1`
- Next button disabled when `page === totalPages`
- Changing page size resets to page 1 to avoid invalid page numbers

### Sorting

The table supports single-column sorting with automatic state management and visual indicators.

**Features:**
- **Click to Sort** - Click sortable column headers to toggle sort
- **Sort Indicators** - Visual arrows (↑ ↓) show current sort direction
- **Keyboard Accessible** - Sort with Enter or Space keys
- **Three-State Toggle** - None → Ascending → Descending → None
- **Auto Reset** - Page resets to 1 when sort changes

**Making Columns Sortable:**

Add `sortable: true` to column options:

```typescript
<RowaKitTable
  fetcher={fetchUsers}
  columns={[
    col.text('name', { sortable: true }),
    col.text('email', { sortable: true }),
    col.date('createdAt', { sortable: true, header: 'Created' }),
    col.boolean('active', { sortable: true }),
  ]}
  rowKey="id"
/>
```

**Sort Behavior:**

1. **First Click**: Sort ascending (↑)
2. **Second Click**: Sort descending (↓)
3. **Third Click**: Remove sort (back to default order)
4. **Different Column**: Switches to new column, starts with ascending

**Fetcher Integration:**

The fetcher receives sort information in the query:

```typescript
const fetchUsers: Fetcher<User> = async ({ page, pageSize, sort }) => {
  // sort is undefined when no sort is active
  // sort = { field: 'name', direction: 'asc' | 'desc' } when sorting
  
  const params = new URLSearchParams({
    page: String(page),
    limit: String(pageSize),
  });
  
  if (sort) {
    params.append('sortBy', sort.field);
    params.append('sortOrder', sort.direction);
  }
  
  const response = await fetch(`/api/users?${params}`);
  return response.json();
};
```

**Which Columns Can Be Sorted:**

- ✅ Text columns with `sortable: true`
- ✅ Date columns with `sortable: true`
- ✅ Boolean columns with `sortable: true`
- ✅ Badge columns with `sortable: true` (v0.2.0+)
- ✅ Number columns with `sortable: true` (v0.2.0+)
- ❌ Actions columns (never sortable)
- ❌ Custom columns (not sortable by default)

**Sort State:**

- Maintained when navigating pages
- Maintained when changing page size (but resets to page 1)
- Cleared when clicking a sorted column three times
- Replaced when clicking a different sortable column

### Filters (v0.2.0+)

Server-side filtering with type-specific filter inputs rendered in a header row.

**Features:**
- **Auto-Generated UI** - Filter inputs based on column type
- **Server-Side Only** - All filtering happens in your backend
- **Multiple Operators** - contains, equals, in, range
- **Clear Filters** - Individual and bulk filter clearing
- **Page Reset** - Resets to page 1 when filters change

**Enable Filters:**

```typescript
<RowaKitTable
  fetcher={fetchUsers}
  columns={columns}
  rowKey="id"
  enableFilters={true}  // Add this prop
/>
```

**Filter Types by Column:**

```typescript
// Text column: Text input with "contains" operator
col.text('name', { header: 'Name' })
// → User types "john" → filters: { name: { op: 'contains', value: 'john' } }

// Number column: Text input with "equals" operator
col.number('age', { header: 'Age' })
// → User types "25" → filters: { age: { op: 'equals', value: '25' } }

// Badge column: Select dropdown with "equals" operator
col.badge('status', {
  header: 'Status',
  map: { active: 'success', inactive: 'neutral', pending: 'warning' }
})
// → User selects "active" → filters: { status: { op: 'equals', value: 'active' } }

// Boolean column: Select dropdown (All/True/False) with "equals" operator
col.boolean('isVerified', { header: 'Verified' })
// → User selects "True" → filters: { isVerified: { op: 'equals', value: true } }

// Date column: Two date inputs with "range" operator
col.date('createdAt', { header: 'Created' })
// → User enters from/to dates → filters: { createdAt: { op: 'range', value: { from: '2024-01-01', to: '2024-12-31' } } }
```

**Fetcher Integration:**

```typescript
const fetchUsers: Fetcher<User> = async ({ page, pageSize, sort, filters }) => {
  // filters is undefined when no filters are active
  // filters = { fieldName: FilterValue, ... } when filtering
  
  const params = new URLSearchParams({
    page: String(page),
    limit: String(pageSize),
  });
  
  if (sort) {
    params.append('sortBy', sort.field);
    params.append('sortOrder', sort.direction);
  }
  
  if (filters) {
    // Example: Convert filters to query params
    for (const [field, filter] of Object.entries(filters)) {
      if (filter.op === 'contains') {
        params.append(`${field}_contains`, filter.value);
      } else if (filter.op === 'equals') {
        params.append(field, String(filter.value));
      } else if (filter.op === 'range') {
        if (filter.value.from) params.append(`${field}_from`, filter.value.from);
        if (filter.value.to) params.append(`${field}_to`, filter.value.to);
      }
    }
  }
  
  const response = await fetch(`/api/users?${params}`);
  return response.json();
};
```

**Filter Value Types:**

```typescript
type FilterValue =
  | { op: 'contains'; value: string }           // Text search
  | { op: 'equals'; value: string | number | boolean | null }  // Exact match
  | { op: 'in'; value: Array<string | number> } // Multiple values (future)
  | { op: 'range'; value: { from?: string; to?: string } };    // Date range

type Filters = Record<string, FilterValue>;
```

**Important Rules:**

1. **Undefined when empty**: `query.filters` is `undefined` when no filters are active (not `{}`)
2. **Page resets**: Changing any filter resets page to 1
3. **No client filtering**: All filtering must be handled by your backend
4. **Actions/Custom columns**: Not filterable (no filter input rendered)

**⚠️ Number Filter Behavior:**

Number filters use **exact match** semantics (`op: 'equals'`). The filter value is sent as a **number** (not a string), enabling direct numeric comparison:

```typescript
// If user types "15" in a number filter input
filters: { discount: { op: 'equals', value: 15 } }

// Your backend receives a numeric value and can compare directly:
// if (discount === 15) { /* match */ }
```

**Handling Percentage/Fraction Data:**

If your data uses decimals or percentages while displaying as whole numbers, ensure your backend coerces appropriately:

```typescript
// Example: Number filter for percentage discount
if (filters?.discount) {
  const filterValue = filters.discount.value;  // Already a number
  // If data is stored as fraction (0.15):
  const compareValue = filterValue / 100;  // Convert 15 → 0.15
  // Filter records where discount === compareValue
}
```

**Clear Filters:**

A "Clear all filters" button appears automatically when filters are active:

```typescript
// User applies filters
// → "Clear all filters" button appears above table
// → Click button → all filters cleared → page resets to 1
```

### Actions

The table provides built-in support for row actions with confirmation dialogs, loading states, and conditional disabling.

**Features:**
- **Action Buttons** - Render buttons for each row (edit, delete, view, etc.)
- **Confirmation Dialogs** - Built-in modal for destructive actions
- **Loading States** - Disable actions while table is loading
- **Conditional Disabling** - Disable actions based on row data
- **Icons** - Support for string or React component icons
- **Async Support** - Action handlers can be async/Promise-based

**Basic Actions:**

```typescript
<RowaKitTable
  fetcher={fetchUsers}
  columns={[
    col.text('name'),
    col.text('email'),
    col.actions([
      {
        id: 'edit',
        label: 'Edit',
        onClick: (row) => {
          console.log('Editing:', row);
          // Handle edit
        }
      },
      {
        id: 'view',
        label: 'View Details',
        icon: '👁️',
        onClick: (row) => {
          window.open(`/users/${row.id}`, '_blank');
        }
      }
    ])
  ]}
  rowKey="id"
/>
```

**Actions with Confirmation:**

Use `confirm: true` to show a confirmation dialog before executing the action:

```typescript
col.actions([
  {
    id: 'delete',
    label: 'Delete',
    icon: '🗑️',
    confirm: true, // Shows confirmation modal
    onClick: async (row) => {
      await deleteUser(row.id);
      // Refetch data to update table
    }
  }
])
```

When the user clicks "Delete", a modal appears asking for confirmation:
- **Title:** "Confirm Action"
- **Message:** "Are you sure you want to delete? This action cannot be undone."
- **Buttons:** "Cancel" (gray) and "Confirm" (red)

**Conditional Disabling:**

Disable actions based on row data:

```typescript
col.actions([
  {
    id: 'delete',
    label: 'Delete',
    confirm: true,
    // Disable for admin users
    disabled: (row) => row.role === 'admin',
    onClick: async (row) => {
      await deleteUser(row.id);
    }
  },
  {
    id: 'edit',
    label: 'Edit',
    // Always disabled
    disabled: true,
    onClick: (row) => editUser(row)
  }
])
```

**Loading States:**

Set `loading: true` to disable an action button and show loading state:

```typescript
const [deletingId, setDeletingId] = useState<string | null>(null);

col.actions([
  {
    id: 'delete',
    label: 'Delete',
    loading: deletingId === row.id, // Disable while deleting
    onClick: async (row) => {
      setDeletingId(row.id);
      await deleteUser(row.id);
      setDeletingId(null);
    }
  }
])
```

**Multiple Actions:**

You can combine multiple actions in one column:

```typescript
col.actions([
  {
    id: 'edit',
    label: 'Edit',
    icon: '✏️',
    onClick: (row) => editUser(row)
  },
  {
    id: 'view',
    label: 'View',
    icon: '👁️',
    onClick: (row) => viewUser(row)
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: '🗑️',
    confirm: true,
    disabled: (row) => row.role === 'admin',
    onClick: async (row) => {
      await deleteUser(row.id);
    }
  }
])
```

**Action Properties:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | ✅ Yes | Unique identifier for the action |
| `label` | `string` | ✅ Yes | Button label text |
| `onClick` | `(row: T) => void \| Promise<void>` | ✅ Yes | Action handler (called after confirmation if required) |
| `icon` | `string \| ReactNode` | No | Icon displayed before label (emoji or React component) |
| `confirm` | `boolean` | No | Show confirmation dialog before executing (default: `false`) |
| `disabled` | `boolean \| (row: T) => boolean` | No | Disable button (static or per-row function) |
| `loading` | `boolean` | No | Show loading state and disable button |

**Best Practices:**

1. **Use Confirmation for Destructive Actions** - Always set `confirm: true` for delete, remove, or irreversible actions
2. **Provide Visual Feedback** - Use icons to make actions more recognizable
3. **Handle Async Properly** - Mark action handlers as `async` and handle errors
4. **Disable Appropriately** - Use `disabled` function to prevent invalid actions
5. **Keep Actions Minimal** - Limit to 2-3 primary actions per row; use a dropdown menu for many actions

**Automatic Behavior:**

- All actions are disabled while the table is loading data
- Confirmation modal prevents accidental clicks on backdrop (must click Cancel or Confirm)
- Keyboard accessible (Tab to focus, Enter/Space to activate)
- Actions column is never sortable

---

## Advanced Features (v0.3.0+)

### Column Resizing (C-01)

Enable users to resize columns by dragging the right edge of column headers.

**Basic Usage:**

```typescript
<RowaKitTable
  fetcher={fetchData}
  columns={[
    col.text('name', { 
      minWidth: 100,   // Minimum width (default: 80)
      maxWidth: 400    // Maximum width (optional)
    }),
    col.number('price', { 
      minWidth: 80 
    })
  ]}
  enableColumnResizing={true}  // Enable resize feature
/>
```

**Features:**
- **Auto-width by default** - Columns automatically size based on header text
- **Drag to resize** - Drag the blue handle on the right edge of column headers
- **Double-click to auto-fit** - Double-click the resize handle to auto-fit content width (measures visible header + cells)
- **Min/max constraints** - Enforced in real-time during drag
- **Smooth performance** - RAF throttling prevents lag during resize
- **Large hitbox** - 12px wide invisible zone (1px visible line) makes dragging easy
- **State persistence** - Widths stored in-memory (or persisted via URL sync/saved views)

**Interaction:**
- **Hover** - Resize handle appears as a blue vertical line
- **Drag** - Click and drag to resize column width
- **Double-click** - Auto-fits to content (max 600px by default)
- Text selection is disabled during drag for smooth UX

### Saved Views + URL State Sync (C-02)

Save and restore table configurations, and share URLs with exact table state.

**Basic Usage:**

```typescript
<RowaKitTable
  fetcher={fetchData}
  columns={columns}
  syncToUrl={true}        // Sync to URL query string
  enableSavedViews={true} // Show save/load view buttons
/>
```

**Features:**

1. **URL Sync** - Automatically saves table state to URL query parameters:
   ```
   ?page=2&pageSize=20&sortField=name&sortDirection=asc&filters=...&columnWidths=...
   ```
   - Share URLs to preserve exact table configuration
   - State automatically restored on page load
   - Works with browser back/forward buttons

2. **Saved Views** - Save current table state as named presets:
   ```
   [Save View] button → Name your view → State saved to localStorage
   [My View] button → Click to restore saved state
   × button → Delete saved view
   [Reset] button → Clear all state
   ```

**Synced State:**
- Page number and size
- Sort field and direction
- All active filters
- Column widths (if resizing enabled)

**Example:**

```typescript
// User filters to "active users" and resizes columns
// They click "Save View" and name it "Active"
// Later, they apply different filters
// They click "Active" button to instantly restore previous state

// Or they copy the URL and send it to a colleague
// The colleague sees the exact same filters and layout
```

### Advanced Number Range Filters (C-03)

Number columns support min/max range filtering with optional value transformation.

**Basic Range Filter:**

```typescript
col.number('price', {
  label: 'Price',
  width: 100
})

// UI shows two inputs: [Min] [Max]
// User enters: min=100, max=500
// Backend receives: { op: 'range', value: { from: 100, to: 500 } }
```

**With Filter Transform:**

```typescript
col.number('discount', {
  label: 'Discount %',
  // Transform percentage input to fraction for backend
  filterTransform: (percentageInput) => {
    // User enters "15" (15%)
    // Backend receives "0.15" (fraction)
    if (percentageInput > 1) {
      return percentageInput / 100;
    }
    return percentageInput;
  }
})
```

**Features:**
- Min and max inputs can be filled independently
- Example: "at least 50" (min only), "up to 100" (max only), or "50-100" (both)
- Optional `filterTransform` to adapt filter values before sending to server
- Useful for unit conversion, percentage ↔ decimal, etc.

**Handling Range Filters in Fetcher:**

```typescript
const fetchProducts: Fetcher<Product> = async (query) => {
  let filtered = [...allProducts];

  if (query.filters) {
    for (const [field, filter] of Object.entries(query.filters)) {
      if (filter?.op === 'range') {
        const { from, to } = filter.value as { from?: number; to?: number };
        filtered = filtered.filter(item => {
          const val = item[field as keyof Product];
          if (from !== undefined && val < from) return false;
          if (to !== undefined && val > to) return false;
          return true;
        });
      }
    }
  }

  return {
    items: filtered.slice(0, query.pageSize),
    total: filtered.length
  };
};
```

## Examples

### Basic Table

```tsx
<RowaKitTable
  fetcher={fetchUsers}
  columns={[
    col.text('name'),
    col.text('email'),
    col.boolean('active')
  ]}
  rowKey="id"
/>
```

### With Sorting

```tsx
// Simple sortable columns
<RowaKitTable
  fetcher={fetchUsers}
  columns={[
    col.text('name', { sortable: true }),
    col.text('email', { sortable: true }),
    col.date('createdAt', { sortable: true, header: 'Created' })
  ]}
  rowKey="id"
/>

// Fetcher with sort handling
const fetchUsers: Fetcher<User> = async ({ page, pageSize, sort }) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(pageSize),
  });
  
  if (sort) {
    params.append('sortBy', sort.field);
    params.append('sortOrder', sort.direction);
  }
  
  const response = await fetch(`/api/users?${params}`);
  return response.json();
};
```

**Sort behavior:**
- Click header once: sort ascending (↑)
- Click again: sort descending (↓)
- Click third time: remove sort
- Sortable headers have pointer cursor and are keyboard accessible

### With Custom Formatting

```tsx
<RowaKitTable
  fetcher={fetchProducts}
  columns={[
    col.text('name'),
    col.text('category', { 
      format: (val) => String(val).toUpperCase() 
    }),
    col.date('createdAt', { 
      format: (date) => new Date(date).toLocaleDateString() 
    }),
    col.boolean('inStock', { 
      format: (val) => val ? '✓ In Stock' : '✗ Out of Stock' 
    })
  ]}
  rowKey="id"
/>
```

### With Actions

```tsx
<RowaKitTable
  fetcher={fetchUsers}
  columns={[
    col.text('name'),
    col.text('email'),
    col.actions([
      { 
        id: 'view', 
        label: 'View', 
        onClick: (user) => navigate(`/users/${user.id}`) 
      },
      { 
        id: 'edit', 
        label: 'Edit', 
        onClick: (user) => openEditModal(user) 
      },
      { 
        id: 'delete', 
        label: 'Delete', 
        confirm: true,
        onClick: async (user) => {
          await deleteUser(user.id);
          // Trigger refetch by updating query (A-06 will add this)
        }
      }
    ])
  ]}
  rowKey="id"
/>
```

**Note:** Action buttons are automatically disabled during table loading state.

### Error Handling and Retry

```tsx
// Fetcher with error handling
const fetchUsers: Fetcher<User> = async (query) => {
  try {
    const response = await fetch(`/api/users?page=${query.page}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    // Network error or parsing error
    throw new Error('Failed to connect to server');
  }
};

// The table will:
// 1. Show error message in the UI
// 2. Display a "Retry" button
// 3. Call the fetcher again with the same query when retry is clicked
```

### With Pagination

```tsx
// Basic pagination with defaults
<RowaKitTable
  fetcher={fetchUsers}
  columns={[
    col.text('name'),
    col.text('email'),
    col.date('createdAt')
  ]}
  rowKey="id"
  // Uses default: defaultPageSize={20}, pageSizeOptions={[10, 20, 50]}
/>

// Custom pagination settings
<RowaKitTable
  fetcher={fetchUsers}
  columns={columns}
  defaultPageSize={25}
  pageSizeOptions={[25, 50, 100, 200]}
  rowKey="id"
/>

// Fetcher receives page and pageSize
const fetchUsers: Fetcher<User> = async ({ page, pageSize }) => {
  const offset = (page - 1) * pageSize;
  const response = await fetch(
    `/api/users?offset=${offset}&limit=${pageSize}`
  );
  const data = await response.json();
  
  return {
    items: data.users,
    total: data.totalCount  // Required for pagination
  };
};
```

**Pagination automatically:**
- Hides when `total === 0` (no data or error)
- Disables controls during loading
- Resets to page 1 when page size changes
- Calculates total pages from `total / pageSize`

### With Custom Columns

```tsx
<RowaKitTable
  fetcher={fetchUsers}
  columns={[
    col.custom('user', (row) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Avatar src={row.avatar} size="sm" />
        <div>
          <div style={{ fontWeight: 600 }}>{row.name}</div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            {row.email}
          </div>
        </div>
      </div>
    )),
    col.custom('status', (row) => (
      <Badge color={row.active ? 'green' : 'gray'}>
        {row.active ? 'Active' : 'Inactive'}
      </Badge>
    )),
    col.text('role')
  ]}
  rowKey="id"
/>
```

### Custom Row Key

```tsx
// Using field name
<RowaKitTable
  fetcher={fetchUsers}
  columns={[...]}
  rowKey="id"
/>

// Using function
<RowaKitTable
  fetcher={fetchUsers}
  columns={[...]}
  rowKey={(user) => `user-${user.id}`}
/>
```

## Styling

RowaKit Table includes minimal, customizable styling through CSS variables and a className prop.

### Import Styles

Import the default styles in your app's entry point:

```tsx
// In your main.tsx or App.tsx
import '@rowakit/table/styles';
```

The table will now have sensible default styling with proper spacing, borders, hover states, and responsive behavior.

### Custom Styling via className

Override or extend styles using the `className` prop:

```tsx
<RowaKitTable
  fetcher={fetchUsers}
  columns={[...]}
  className="my-custom-table"
  rowKey="id"
/>
```

```css
/* Custom styles */
.my-custom-table table {
  font-size: 0.875rem;
}

.my-custom-table th {
  background: #f9fafb;
  text-transform: uppercase;
}
```

### Theming with CSS Variables

Customize the look and feel by overriding CSS variables (design tokens):

```css
:root {
  /* Colors */
  --rowakit-color-primary-600: #2563eb;     /* Primary buttons, links */
  --rowakit-color-gray-100: #f3f4f6;        /* Table header background */
  --rowakit-color-gray-200: #e5e7eb;        /* Borders */
  
  /* Spacing */
  --rowakit-spacing-md: 0.75rem;            /* Cell padding */
  --rowakit-spacing-lg: 1rem;               /* Pagination padding */
  
  /* Typography */
  --rowakit-font-size-sm: 0.875rem;         /* Small text */
  --rowakit-font-size-base: 1rem;           /* Default text */
  --rowakit-font-weight-semibold: 600;      /* Header weight */
  
  /* Borders */
  --rowakit-border-radius-md: 0.375rem;     /* Button radius */
  --rowakit-border-width: 1px;              /* Border thickness */
}
```

**Available Token Categories:**

- **Colors**: Neutral grays, primary blue, danger red, success green
- **Spacing**: xs, sm, md, lg, xl, 2xl (0.25rem to 2rem)
- **Typography**: Font families, sizes (xs to xl), weights (400-700), line heights
- **Borders**: Widths, radius (sm to lg)
- **Shadows**: sm, md, lg, xl for depth
- **Z-index**: Modal and dropdown layering

### Responsive Design

The table automatically handles responsive behavior:

**Horizontal Scrolling:**
- Tables wider than the viewport scroll horizontally
- Webkit touch scrolling enabled for smooth mobile experience
- Container uses `overflow-x: auto`

**Mobile Pagination:**
- Pagination controls wrap on narrow screens (<640px)
- Buttons and selectors stack vertically for better touch targets

```css
/* Responsive breakpoint */
@media (max-width: 640px) {
  .rowakit-table-pagination {
    flex-direction: column;
    gap: 1rem;
  }
}
```

### Dark Mode Support

Override tokens in a dark mode media query or class:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --rowakit-color-gray-50: #18181b;
    --rowakit-color-gray-100: #27272a;
    --rowakit-color-gray-200: #3f3f46;
    --rowakit-color-gray-800: #e4e4e7;
    --rowakit-color-gray-900: #f4f4f5;
  }
}

/* Or with a class */
.dark {
  --rowakit-color-gray-50: #18181b;
  /* ...other dark tokens */
}
```

### Advanced Customization

For complete control, you can skip the default styles and write your own:

```tsx
// Don't import default styles
// import '@rowakit/table/styles'; ❌

// Use your own styles with the base classes
import './my-table-styles.css';

<RowaKitTable
  fetcher={fetchUsers}
  columns={[...]}
  className="my-completely-custom-table"
  rowKey="id"
/>
```

The table uses semantic class names:
- `.rowakit-table` - Main container
- `.rowakit-table-loading` - Loading state
- `.rowakit-table-error` - Error state
- `.rowakit-table-empty` - Empty state
- `.rowakit-table-pagination` - Pagination container
- `.rowakit-button` - Action buttons
- `.rowakit-modal-backdrop` - Confirmation modal backdrop
- `.rowakit-modal` - Confirmation modal

### Style Imports

You can also import tokens and table styles separately:

```tsx
// Just tokens (CSS variables only)
import '@rowakit/table/styles/tokens.css';

// Just table styles (uses tokens)
import '@rowakit/table/styles/table.css';

// Both (same as '@rowakit/table/styles')
import '@rowakit/table/styles/tokens.css';
import '@rowakit/table/styles/table.css';
```

## TypeScript

All components and helpers are fully typed with generics.

```typescript
interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
}

// Fetcher is typed
const fetchProducts: Fetcher<Product> = async (query) => {
  // query is FetcherQuery
  // must return FetcherResult<Product>
};

// Columns are type-checked
<RowaKitTable<Product>
  fetcher={fetchProducts}
  columns={[
    col.text<Product>('name'),     // ✅ 'name' exists on Product
    col.text<Product>('invalid'),   // ❌ TypeScript error
  ]}
/>
```

## Principles

### Server-Side First

All data operations (pagination, sorting, filtering) go through your backend. The table doesn't manage data locally.

### Minimal API

Few props, strong conventions. Most configuration happens through column definitions.

### Escape Hatch

`col.custom()` gives you full rendering control. We don't bloat the API with every possible column type.

### Type Safety

Full TypeScript support. Your data model drives type checking throughout.

## Roadmap

**Stage A - MVP (v0.1)** ✅ Complete (2024-12-31)
- ✅ A-01: Repo scaffold
- ✅ A-02: Core types (Fetcher, ColumnDef, ActionDef)
- ✅ A-03: Column helpers (col.*)
- ✅ A-04: SmartTable component core rendering
- ✅ A-05: Data fetching state machine (loading/error/empty/retry)
- ✅ A-06: Pagination UI (page controls, page size selector)
- ✅ A-07: Single-column sorting (click headers, sort indicators)
- ✅ A-08: Actions with confirmation modal (confirm dialogs, disable, loading)
- ✅ A-09: Minimal styling tokens (CSS variables, responsive, className)
- ✅ A-10: Documentation & examples (4 complete examples, CHANGELOG, CONTRIBUTING)

**Stage B - Production Ready (v0.2.0-0.2.2)** ✅ Complete (2026-01-02)
- ✅ Badge column type with visual tones (neutral, success, warning, danger)
- ✅ Number column type with Intl formatting (currency, percentages, decimals)
- ✅ Server-side header filter UI (type-specific inputs)
- ✅ Column modifiers (width, align, truncate)
- ✅ Fixed numeric filter value coercion
- ✅ Production hardening and comprehensive documentation

**Stage C - Advanced Features (v0.3.0)** ✅ Complete (2026-01-03)
- ✅ C-01: Column resizing with drag handles (minWidth/maxWidth constraints)
- ✅ C-02: Saved views with localStorage persistence
- ✅ C-02: URL state sync (page, pageSize, sort, filters, columnWidths)
- ✅ C-03: Number range filters with optional filterTransform

**Stage D - Future** (Demand-Driven)
- Multi-column sorting
- Row selection + bulk actions
- Export CSV (server-triggered)
- Column visibility toggle

## Changelog

See the detailed changelog for release history and migration notes:

- [CHANGELOG.md](./CHANGELOG.md) — highlights and details for v0.2.2 and future releases.

### v0.2.2 - Hardening Release (2026-01-02)
- ✅ **Fixed**: Number filter type coercion for accurate field matching
- ✅ **Production Ready**: All 193 tests passing, dependencies hardened
- ✅ **Backwards Compatible**: No breaking changes from v0.2.0

### v0.2.0 - Stage B Features (2026-01-02)
- Added `col.badge` and `col.number` column types
- Column modifiers: `width`, `align`, `truncate`
- Server-side header filter UI with type-specific inputs
- Fixed numeric-filter value coercion bug (filter inputs now send numbers)

## Release Notes — v0.2.0 (2026-01-02)

This release introduces Stage B features and several hardening fixes to make `@rowakit/table` production-ready for internal apps.

- Release: `v0.2.0`
- Date: 2026-01-02
- Key additions:
  - `col.badge` — visual badge mapping for enum/status values with tone support
  - `col.number` — number column with Intl formatting and percentage/currency helpers
  - Column modifiers (`width`, `align`, `truncate`) supported across column types
  - Server-side filters: auto-generated, type-specific inputs in the header row
- Fixes & hardening:
  - Removed direct React dependencies (now peerDependencies only)
  - Resolved numeric filter coercion and clarified backend contract in README
  - Deduplicated release checklist and improved demo documentation

See the full changelog for migration notes and detailed descriptions: [CHANGELOG.md](./CHANGELOG.md)

## License

MIT

## Contributing

Contributions welcome! Please read our [contributing guidelines](CONTRIBUTING.md) first.

---

Made with ❤️ by the RowaKit team

