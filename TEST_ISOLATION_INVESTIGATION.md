# Test Isolation Investigation: RowaKit Table Component

## Executive Summary

Found **CRITICAL TEST ISOLATION ISSUES** that cause tests to fail when run together but pass individually:

1. **localStorage persistence** - Saved Views tests leave data in localStorage
2. **window.location** pollution - URL sync tests don't fully reset window state
3. **Missing cleanup in selection tests** - No beforeEach/afterEach for page state
4. **Vitest pool configuration** - Using 'threads' pool which doesn't isolate DOM between tests

---

## Root Causes Found

### 1. **localStorage Pollution (CRITICAL)**

**Location:** [packages/table/src/hooks/useSavedViews.ts](packages/table/src/hooks/useSavedViews.ts)

**Issue:** The saved views feature directly manipulates localStorage:
```typescript
localStorage.setItem(`rowakit-view-${name}`, JSON.stringify(viewState));
localStorage.setItem('rowakit-views-index', JSON.stringify(index));
```

**Test File:** [packages/table/src/components/SmartTable.saved-views.test.tsx](packages/table/src/components/SmartTable.saved-views.test.tsx)

**Current Cleanup:**
```tsx
beforeEach(() => {
  localStorage.clear();
});
```

**Problem:** 
- `beforeEach` only clears BEFORE each test
- If a test creates localStorage data, it persists to subsequent tests
- Tests running in parallel may see stale data
- The cleanup doesn't run after the last test in a file

**Example Failure Scenario:**
1. Test "A" saves a view to localStorage with key `rowakit-view-Old Data`
2. Test "B" (from selection.test.tsx) tries to initialize with clean state
3. Test "B"'s SmartTable component loads saved views from localStorage (from test A)
4. Unexpected state causes test B to fail

### 2. **window.location Pollution**

**Location:** [packages/table/src/hooks/useUrlSync.ts](packages/table/src/hooks/useUrlSync.ts)

**Issue:** The URL sync feature directly manipulates window.location:
```typescript
window.history.replaceState(null, '', `${window.location.pathname}${qs}${window.location.hash}`);
```

**Test File:** [packages/table/src/components/SmartTable.url-sync.test.tsx](packages/table/src/components/SmartTable.url-sync.test.tsx)

**Current Cleanup:**
```tsx
beforeEach(() => {
  window.history.replaceState(null, '', window.location.pathname);
});
```

**Problem:**
- `beforeEach` cleanup only runs BEFORE next test, not after current test
- Last test in the file leaves window.location modified
- If URL-sync test runs before selection test, selection test inherits polluted URL
- The `useUrlSync` hook reads `window.location.search` on component mount, pulling in URL params from previous tests

**Example Failure Scenario:**
1. URL sync test sets `window.location.search = "?page=5&pageSize=50"`
2. URL sync test completes but cleanup runs in next test's beforeEach
3. Selection test renders SmartTable with syncToUrl=false
4. useUrlSync still exists in dependencies and hydrates from polluted window.location
5. Component initializes with wrong page/pageSize

### 3. **No Cleanup in Selection Tests**

**Location:** [packages/table/src/components/SmartTable.selection.test.tsx](packages/table/src/components/SmartTable.selection.test.tsx)

**Issue:** No `beforeEach`/`afterEach` hooks at all:
```tsx
describe('SmartTable - Row Selection (PRD-E1)', () => {
  it('selects and unselects a single row', async () => {
    // No cleanup before or after
```

**Problem:**
- Tests that modify internal state (selection, page, sorting) don't reset
- If selection tests run after saved-views tests, the SmartTable might have stale selectedKeys state
- No cleanup of vi.fn() mocks between tests

### 4. **Vitest Pool Configuration**

**Location:** [packages/table/vitest.config.ts](packages/table/vitest.config.ts)

**Current Config:**
```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    pool: 'threads',  // ← PROBLEM: Uses thread pool
  },
});
```

**Problem with `pool: 'threads'`:**
- Each test file runs in its own thread
- Threads share the jsdom DOM instance ACROSS tests in same file
- localStorage persists within a thread across all tests in that file
- When multiple files run, threads may reuse DOM state

**Better Alternative:** `pool: 'forks'` or `pool: 'vmThreads'` provide better isolation

---

## State Persisting Across Tests

### Global State Found:

1. **localStorage (Browser Storage)**
   - Keys: `rowakit-views-index`, `rowakit-view-*`
   - Used by: `useSavedViews` hook
   - Affected tests: SmartTable.saved-views.test.tsx → others

2. **window.location (URL State)**
   - Properties: `window.location.search`, `window.location.pathname`, `window.location.hash`
   - Used by: `useUrlSync` hook
   - Affected tests: SmartTable.url-sync.test.tsx → others

3. **Component Internal State**
   - selectedKeys (row selection)
   - query (pagination, page, pageSize)
   - filters
   - columnWidths
   - Affected by: State from previous test's render not being cleaned up

### Refs That Persist:

In [packages/table/src/hooks/useUrlSync.ts](packages/table/src/hooks/useUrlSync.ts):
```typescript
const didHydrateUrlRef = useRef(false);           // Never reset
const didSkipInitialUrlSyncRef = useRef(false);   // Never reset
const urlSyncDebounceRef = useRef<NodeJS.Timeout | null>(null);
```

These refs maintain state across unmount/remount cycles if the hook isn't fully cleaned up.

---

## SmartTable Component Analysis

### Row Selection Initialization

**Location:** [packages/table/src/components/SmartTable.tsx](packages/table/src/components/SmartTable.tsx), lines 376-382

```tsx
const [selectedKeys, setSelectedKeys] = useState<Array<string | number>>([]);

// ...

useEffect(() => {
  if (!enableRowSelection) return;
  setSelectedKeys(clearSelection());
}, [enableRowSelection, query.page, dataState.items]);
```

**Issue:**
- Selection resets when `query.page` or `dataState.items` changes
- But relies on `enableRowSelection` prop to even run the effect
- If previous test enabled row selection, the state might linger

### enableRowSelection Prop Handling

**Location:** [packages/table/src/components/SmartTable.tsx](packages/table/src/components/SmartTable.tsx), lines 305-380

```tsx
export interface SmartTableProps<T> {
  enableRowSelection?: boolean;
  onSelectionChange?: (keys: Array<string | number>) => void;
  // ...
}

// In component:
const [selectedKeys, setSelectedKeys] = useState<Array<string | number>>([]);

useEffect(() => {
  if (!enableRowSelection) return;
  setSelectedKeys(clearSelection());
}, [enableRowSelection, query.page, dataState.items]);
```

**Problem:** 
- State initialized to `[]` on component mount
- Only resets when `enableRowSelection` becomes true
- If test A enables it (true) and test B disables it (false), state might not reset properly

---

## Test File Analysis

### Saved Views Tests
- ✅ Has `beforeEach(() => { localStorage.clear(); })`
- ❌ Missing `afterEach` to clean up after test completes
- ❌ No window.location cleanup
- ❌ No vi.clearAllMocks()

### URL Sync Tests  
- ✅ Has `beforeEach(() => { window.history.replaceState(...) })`
- ❌ Missing `afterEach` to clean up after test completes
- ❌ No localStorage cleanup
- ❌ No vi.clearAllMocks()

### Selection Tests
- ❌ NO beforeEach/afterEach at all
- ❌ No localStorage cleanup
- ❌ No window.location cleanup
- ❌ No vi.clearAllMocks()

### General Tests (RowaKitTable.test.tsx)
- ✅ Has `beforeEach(() => { vi.clearAllMocks(); })`
- ❌ Missing localStorage cleanup
- ❌ Missing window.location cleanup
- ❌ Missing afterEach for complete cleanup

---

## How Tests Fail When Run Together

### Scenario: Selection Test Fails After Saved Views Test

```
1. SmartTable.saved-views.test.tsx runs:
   - Test saves view to localStorage
   - beforeEach clears localStorage BEFORE next test
   - But current test completes with localStorage still populated
   
2. SmartTable.selection.test.tsx runs:
   - beforeEach ONLY runs before selection tests (not after saved-views)
   - Selection test renders SmartTable({ enableSavedViews: false, ... })
   - useSavedViews hook checks enableSavedViews and runs:
     
     useEffect(() => {
       if (!options.enableSavedViews) return;  // ← Should skip
       setSavedViews(loadSavedViewsFromStorage());
     }, [options.enableSavedViews]);
   
   - BUT: loadSavedViewsFromStorage reads from localStorage
   - It finds 'rowakit-views-index' from previous test
   - Tries to hydrate old views even though feature is disabled
   - Unexpected state causes subsequent assertions to fail
```

### Scenario: Selection Test Fails After URL Sync Test

```
1. SmartTable.url-sync.test.tsx runs:
   - Test sets window.location.search = "?page=5&pageSize=50"
   - beforeEach (cleanup) only runs in next test's beforeEach
   
2. SmartTable.selection.test.tsx runs:
   - beforeEach doesn't clear window.location
   - Selection test renders SmartTable({ syncToUrl: false, ... })
   - useUrlSync hook checks syncToUrl:
   
     useEffect(() => {
       if (!syncToUrl) {
         didHydrateUrlRef.current = false;
         return;
       }
       // hydrate from URL
     }, [syncToUrl, ...]);
   
   - Component mounts with syncToUrl=false
   - But didHydrateUrlRef might have been set to true from previous test
   - On next effect, ref state causes incorrect behavior
   - OR: window.location.search still contains old query params
```

---

## Fix Recommendations

### 1. **Add Comprehensive beforeEach/afterEach Hooks**

All test files should have:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('SmartTable - Feature', () => {
  beforeEach(() => {
    // Clear ALL global state BEFORE test runs
    localStorage.clear();
    window.history.replaceState(null, '', window.location.pathname);
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up AFTER test completes
    localStorage.clear();
    window.history.replaceState(null, '', window.location.pathname);
    vi.clearAllMocks();
  });

  it('test case', () => {
    // test code
  });
});
```

### 2. **Update Vitest Configuration**

Change [packages/table/vitest.config.ts](packages/table/vitest.config.ts):

```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    pool: 'forks',  // Better isolation than 'threads'
    poolOptions: {
      forks: {
        singleFork: false,  // Parallel execution with isolation
      },
    },
    isolate: true,  // Ensure DOM isolation between test files
  },
});
```

### 3. **Fix useUrlSync Ref State Leaking**

In [packages/table/src/hooks/useUrlSync.ts](packages/table/src/hooks/useUrlSync.ts):

```typescript
export function useUrlSync<T>({
  syncToUrl,
  // ...
}: {
  // ...
}) {
  const didHydrateUrlRef = useRef(false);
  const didSkipInitialUrlSyncRef = useRef(false);
  
  // Reset refs when syncToUrl toggles off
  useEffect(() => {
    if (!syncToUrl) {
      didHydrateUrlRef.current = false;
      didSkipInitialUrlSyncRef.current = false;
    }
  }, [syncToUrl]);  // Add dependency
  
  // ... rest of hook
}
```

### 4. **Add afterEach to All Selection Tests**

In [packages/table/src/components/SmartTable.selection.test.tsx](packages/table/src/components/SmartTable.selection.test.tsx):

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('SmartTable - Row Selection (PRD-E1)', () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState(null, '', window.location.pathname);
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    window.history.replaceState(null, '', window.location.pathname);
    vi.clearAllMocks();
  });

  it('selects and unselects a single row', async () => {
    // test code
  });
});
```

### 5. **Add Test Setup File**

Create [packages/table/vitest.setup.ts](packages/table/vitest.setup.ts):

```typescript
import { afterEach } from 'vitest';

// Global cleanup after each test to ensure isolation
afterEach(() => {
  // Clear all browser APIs
  localStorage.clear();
  sessionStorage.clear();
  
  // Reset URL to clean state
  window.history.replaceState(null, '', window.location.pathname);
  
  // Clear all timers
  vi.clearAllTimers();
});
```

Then update [packages/table/vitest.config.ts](packages/table/vitest.config.ts):

```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    // ...
  },
});
```

---

## Implementation Priority

### 🔴 **Critical (Do First)**
1. Add `afterEach` with localStorage.clear() to ALL test files
2. Add `afterEach` with window.history.replaceState() to ALL test files
3. Add `afterEach` with vi.clearAllMocks() to ALL test files
4. Change Vitest pool to 'forks'

### 🟡 **High**
5. Fix useUrlSync ref state leaking
6. Create vitest.setup.ts for global cleanup

### 🟢 **Medium**
7. Add isolation: true to Vitest config
8. Review all other hooks for similar state leakage

---

## Files to Modify

1. [packages/table/src/components/SmartTable.selection.test.tsx](packages/table/src/components/SmartTable.selection.test.tsx) - Add beforeEach/afterEach
2. [packages/table/src/components/SmartTable.saved-views.test.tsx](packages/table/src/components/SmartTable.saved-views.test.tsx) - Add afterEach
3. [packages/table/src/components/SmartTable.url-sync.test.tsx](packages/table/src/components/SmartTable.url-sync.test.tsx) - Add afterEach
4. [packages/table/src/components/SmartTable.test.tsx](packages/table/src/components/SmartTable.test.tsx) - Add afterEach for storage/location
5. [packages/table/vitest.config.ts](packages/table/vitest.config.ts) - Update pool and add setupFiles
6. [packages/table/src/hooks/useUrlSync.ts](packages/table/src/hooks/useUrlSync.ts) - Fix ref state leaking (optional)

---

## Verification

After fixes, run:
```bash
# Run tests in parallel (catch isolation issues)
npm test

# Run specific test file last to verify no pollution from others
npm test -- SmartTable.selection.test.tsx

# Run URL sync tests after selection to verify no location pollution
npm test -- SmartTable.url-sync.test.tsx SmartTable.selection.test.tsx
```

If tests still fail together, the state persists and fix is incomplete.

