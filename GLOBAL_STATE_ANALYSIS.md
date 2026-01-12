# Global State & Context Analysis - RowaKit Table Component

## Global State Summary Table

| State Type | Location | Used By | Scope | Cleanup |
|-----------|----------|---------|-------|---------|
| **localStorage** | Browser API | `useSavedViews` hook | Application-wide | ❌ Missing in afterEach |
| **window.location** | Browser API | `useUrlSync` hook | Application-wide | ❌ Missing in afterEach |
| **window.history** | Browser API | `useUrlSync` hook | Application-wide | ❌ Missing in afterEach |
| **useRef (didHydrateUrlRef)** | useUrlSync | URL sync logic | Component instance | ⚠️ May persist if not reset |
| **useRef (didSkipInitialUrlSyncRef)** | useUrlSync | URL sync logic | Component instance | ⚠️ May persist if not reset |
| **useState (selectedKeys)** | SmartTable | Row selection | Component instance | ✅ Resets on page/items change |
| **useState (query)** | SmartTable | Pagination/sort | Component instance | ✅ Resets on dependency change |
| **useState (filters)** | SmartTable | Filtering | Component instance | ✅ Resets on prop change |

---

## No React Context Found

✅ **Good News:** The component does NOT use React Context or Context Providers, so there's no global React context state to manage.

The component is fully component-based using hooks and local state.

---

## Singleton Patterns Found

### ✅ None Found

The codebase does NOT use:
- Static variables
- Module-level global objects (except localStorage which is browser API)
- Singleton classes
- Module-level memoization caches
- Global refs

---

## Custom Hooks Analysis

### useSavedViews
- **File:** packages/table/src/hooks/useSavedViews.ts
- **Side Effects:** YES - directly manipulates localStorage
- **State:** Multiple useState hooks for UI state
- **Refs:** None
- **Issue:** No cleanup of localStorage after tests

### useUrlSync
- **File:** packages/table/src/hooks/useUrlSync.ts
- **Side Effects:** YES - directly manipulates window.location via window.history.replaceState()
- **State:** Only refs (didHydrateUrlRef, didSkipInitialUrlSyncRef, urlSyncDebounceRef)
- **Refs:** 8 refs total (see below)
- **Issue:** Refs may not reset when syncToUrl toggles; window.location pollutes global state

### useFetcherState
- **File:** packages/table/src/hooks/useFetcherState.ts
- **Side Effects:** YES - calls fetcher function which may have network side effects
- **State:** useState for dataState, useRef for requestIdRef
- **Refs:** 1 ref (requestIdRef)
- **Issue:** None - state is component-local

### useColumnResizing
- **File:** packages/table/src/hooks/useColumnResizing.ts
- **Side Effects:** Minimal - local pointer event handling
- **State:** useState for columnWidths, multiple useRefs
- **Refs:** 5 refs (tableRef, isResizingRef, lastResizeEndTsRef, resizingColIdRef, startEventRef)
- **Issue:** Refs are component-scoped, cleanup on unmount

### useSortingState
- **File:** packages/table/src/hooks/useSortingState.ts
- **Side Effects:** None
- **State:** No state - just functions
- **Refs:** None
- **Issue:** None

### useFocusTrap
- **File:** packages/table/src/hooks/useFocusTrap.ts
- **Side Effects:** YES - manages focus and keyboard events
- **State:** No useState (stateless)
- **Refs:** 2 refs for tracking focusable elements
- **Issue:** None - component-scoped

---

## Component Initialization Analysis

### SmartTable Component

**Location:** packages/table/src/components/SmartTable.tsx

**Props that affect state initialization:**

```typescript
interface SmartTableProps<T> {
  enableRowSelection?: boolean;      // Affects selectedKeys initialization
  enableColumnResizing?: boolean;    // Affects columnWidths initialization
  syncToUrl?: boolean;              // Affects URL sync behavior
  enableSavedViews?: boolean;       // Affects saved views loading
  enableFilters?: boolean;          // Affects filters initialization
  defaultPageSize?: number;         // Initial query state
  pageSizeOptions?: number[];       // Query validation
  // ... others
}
```

**Critical Line 376-382 (Row Selection Reset Logic):**

```typescript
useEffect(() => {
  if (!enableRowSelection) return;
  setSelectedKeys(clearSelection());  // Only runs when enableRowSelection is TRUE
}, [enableRowSelection, query.page, dataState.items]);
```

**Problem:** 
- If `enableRowSelection` goes from true→false, selectedKeys is NOT reset
- The state remains in component memory
- Next time component renders with `enableRowSelection=true`, old selection might persist

**Better approach:**

```typescript
useEffect(() => {
  // Always reset on these changes, regardless of enableRowSelection
  setSelectedKeys([]);
}, [query.page]);  // Clear on page change always

useEffect(() => {
  // Reset when feature is toggled off
  if (!enableRowSelection) {
    setSelectedKeys([]);
  }
}, [enableRowSelection]);
```

---

## Vitest Configuration Issues

**Current Config:** packages/table/vitest.config.ts

```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}', 'src/__tests__/**/*.test.{ts,tsx}'],
    pool: 'threads',              // ⚠️ PROBLEM: Limited isolation
    define: {
      __ROWAKIT_TABLE_VERSION__: JSON.stringify(pkg.version),
    },
  },
});
```

**Issues with `pool: 'threads'`:**

| Feature | threads | forks | vmThreads |
|---------|---------|-------|-----------|
| Isolation | Low | High | Medium |
| Speed | Fast | Slower | Medium |
| DOM reuse | Yes (⚠️) | No (✅) | Per-file |
| localStorage isolation | Per-thread (⚠️) | Per-fork (✅) | Per-thread |
| Memory overhead | Low | High | Medium |

**Recommended:** Change to `pool: 'forks'` for test isolation, or `pool: 'vmThreads'` for balance.

---

## Test Failure Chain Analysis

### When Tests Fail Together (Order Matters)

```
Order 1: saved-views.test.tsx → selection.test.tsx
├── saved-views writes to localStorage
│   └── Key: "rowakit-views-index"
│   └── Key: "rowakit-view-..." (multiple)
│
├── beforeEach in selection.test.tsx runs
│   └── Does NOT clear localStorage
│   └── Only clears vi mocks
│
└── selection test render
    ├── Renders SmartTable({ enableSavedViews: false })
    ├── useSavedViews hook checks enableSavedViews
    ├── But loadSavedViewsFromStorage() is called somewhere
    └── Finds stale data in localStorage
    └── ❌ TEST FAILS
```

### Order 2: url-sync.test.tsx → selection.test.tsx

```
Order 2: url-sync.test.tsx → selection.test.tsx
├── url-sync pollutes window.location.search
│   └── Example: "?page=5&pageSize=50"
│
├── beforeEach in selection.test.tsx runs
│   └── Does NOT reset window.location
│
└── selection test render
    ├── Renders SmartTable({ syncToUrl: false })
    ├── useUrlSync hook checks syncToUrl
    ├── Component mounts, refs are in stale state from previous test
    └── ❌ TEST FAILS due to URL pollution
```

### Order 3: selection.test.tsx → saved-views.test.tsx → selection.test.tsx

```
Order 3: selection.test.tsx → saved-views.test.tsx → selection.test.tsx (again)
├── First selection.test.tsx runs cleanly
├── saved-views.test.tsx fills localStorage
├── beforeEach in second selection.test.tsx
│   ├── ✅ HAS localStorage.clear()
│   └── Clears saved views data
└── Second selection test might pass (because beforeEach cleared it)
    BUT ONLY if localStorage.clear() exists
```

---

## Caches and Memoization

### Found

1. **useMemo in useSavedViews**
   - Location: packages/table/src/hooks/useSavedViews.ts, line 202
   - Purpose: Calculate `shouldShowReset` based on table state
   - Issue: None - dependency array is properly set

2. **No other memoization patterns found**
   - No React.memo() wrapping components
   - No useMemo() for column definitions
   - No caching layer for fetcher results

---

## localStorage Keys Inventory

**All localStorage keys used by RowaKit Table:**

```
rowakit-views-index              // Index of saved views
rowakit-view-{viewName}          // Each saved view config
```

These are the ONLY keys that need to be cleared between tests.

---

## window Object Pollution Inventory

**All window properties modified by RowaKit Table:**

```
window.location.href             // Not directly modified, but...
window.location.search           // Read by useUrlSync
window.location.pathname         // Read by useUrlSync
window.location.hash             // Read by useUrlSync
window.history.replaceState()    // MODIFIED by useUrlSync
```

Must reset to clean state:
```javascript
window.history.replaceState(null, '', window.location.pathname);
```

---

## Ref-Based State Leakage

### useUrlSync Refs (CRITICAL)

```typescript
export function useUrlSync<T>({...}) {
  // Hydration tracking refs
  const didHydrateUrlRef = useRef(false);           // ⚠️ Never reset if syncToUrl becomes false
  const didSkipInitialUrlSyncRef = useRef(false);   // ⚠️ Never reset if syncToUrl becomes false
  const urlSyncDebounceRef = useRef<NodeJS.Timeout | null>(null);
  
  // Props caching refs
  const defaultPageSizeRef = useRef(defaultPageSize);
  const pageSizeOptionsRef = useRef(pageSizeOptions);
  const enableColumnResizingRef = useRef(enableColumnResizing);
  const columnsRef = useRef(columns);
  
  // Updates refs (these are fine)
  defaultPageSizeRef.current = defaultPageSize;
  pageSizeOptionsRef.current = pageSizeOptions;
  enableColumnResizingRef.current = enableColumnResizing;
  columnsRef.current = columns;
  
  // Problem: hydration refs are NEVER reset!
  useEffect(() => {
    if (!syncToUrl) {
      didHydrateUrlRef.current = false;  // ← MISSING in code
      didSkipInitialUrlSyncRef.current = false;  // ← MISSING in code
      return;
    }
    // ...
  }, [syncToUrl]);  // ← MISSING dependency array
}
```

**Impact:** If test A enables URL sync (refs = true) and test B disables it, the refs stay true and cause incorrect behavior on re-mount.

---

## Summary: What's Global, What's Not

### ✅ NOT Global (Safe)
- Component state (useState hooks)
- Component refs (scoped to component instance)
- Component internal variables
- Hooks state

### ❌ GLOBAL (Causes Test Pollution)
- localStorage
- window.location & window.history
- Vitest's global mock counters (if not cleared with vi.clearAllMocks())

### ⚠️ Semi-Global (Ref State That Persists)
- Refs in useUrlSync that don't reset when prop changes
- These persist across unmount/remount if not explicitly cleared

---

## Test Isolation Checklist

Use this to verify fixes:

- [ ] All test files have `beforeEach(() => { localStorage.clear(); })`
- [ ] All test files have `afterEach(() => { localStorage.clear(); })`
- [ ] All test files have `beforeEach(() => { window.history.replaceState(...); })`
- [ ] All test files have `afterEach(() => { window.history.replaceState(...); })`
- [ ] All test files have `beforeEach(() => { vi.clearAllMocks(); })`
- [ ] All test files have `afterEach(() => { vi.clearAllMocks(); })`
- [ ] Vitest config uses `pool: 'forks'` or appropriate isolation
- [ ] useUrlSync resets refs when `syncToUrl` changes
- [ ] Selection reset logic handles prop toggling
- [ ] Tests pass when run in random order
- [ ] Tests pass when run individually
- [ ] Tests pass when run together

