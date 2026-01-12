# Test Isolation Root Cause Summary

## The Problem in One Sentence

**Tests pass individually but fail together because localStorage, window.location, and Vitest's thread pool are shared across test files without cleanup, causing state from one test to leak into the next.**

---

## Root Causes (Ranked by Severity)

### 🔴 CRITICAL: Missing `afterEach` Cleanup

**Problem:** Tests clean up BEFORE execution (beforeEach) but NOT AFTER (afterEach)

**Impact:** The last test in a file leaves the system dirty for the next file

**Example:**
```
Test A (saved-views.test.tsx) → fills localStorage
Test A's afterEach doesn't exist → localStorage NOT cleared
Test B (selection.test.tsx) starts → sees stale localStorage data
Test B reads saved views from localStorage → loads old state
Test B FAILS because component state is corrupted
```

**Files Affected:**
- SmartTable.selection.test.tsx ❌ NO afterEach
- SmartTable.saved-views.test.tsx ❌ Has beforeEach but NO afterEach
- SmartTable.url-sync.test.tsx ❌ Has beforeEach but NO afterEach
- SmartTable.test.tsx ❌ Has beforeEach but NO afterEach

**Fix Effort:** 5 minutes - add 6 lines to each file

---

### 🔴 CRITICAL: Vitest Pool Configuration

**Problem:** `pool: 'threads'` reuses DOM/localStorage within a thread

**Impact:** All tests in same thread share jsdom instance and storage

**Example:**
```
Thread 1:
├─ SmartTable.saved-views.test.tsx → fills localStorage
├─ SmartTable.selection.test.tsx → sees same localStorage (in same thread)
├─ window.location pollution → affects all following tests
└─ ❌ TESTS FAIL due to shared state

Thread 2 (separate):
├─ Different tests start fresh
└─ ✅ May pass (thread isolation)
```

**Better Alternatives:**
- `pool: 'forks'` - Separate process per test file (HIGH isolation)
- `pool: 'vmThreads'` - Separate VM per test file (MEDIUM isolation)

**Fix Effort:** 2 minutes - change one line in vitest.config.ts

---

### 🟡 HIGH: No Global Test Setup File

**Problem:** No centralized place to ensure cleanup between ALL tests

**Impact:** Even with beforeEach/afterEach, edge cases slip through

**Example:**
- Test file A forgets to clear localStorage
- Test file B doesn't have afterEach either
- State leaks across projects' test boundaries
- No safety net

**Solution:** Create vitest.setup.ts with global afterEach hook

**Fix Effort:** 5 minutes - create new file

---

### 🟡 HIGH: localStorage Not Cleaned Between Tests

**Problem:** Saved views feature directly uses localStorage keys

**Impact:** Old saved view data persists, new tests load stale state

**Keys Leaked:**
- `rowakit-views-index`
- `rowakit-view-{name}` (multiple)

**Example Failure:**
```
Test 1: Saves view "My View" → localStorage["rowakit-view-My View"] = {...}
Test 2: Loads saved views → finds "My View" from Test 1
Test 2: Clicks saved view → loads wrong page/sort state
Test 2: ❌ FAILS - assertion doesn't match expected state
```

**How useSavedViews Reads Storage:**
```typescript
function loadSavedViewsFromStorage(): SavedViewEntry[] {
  const index = getSavedViewsIndex();  // Reads from localStorage
  // Finds old views from previous tests
  for (const entry of index) {
    const viewStr = localStorage.getItem(`rowakit-view-${entry.name}`);
    // ❌ Loads stale data
```

**Fix Effort:** 3 minutes - add localStorage.clear() to afterEach

---

### 🟡 HIGH: window.location Not Cleaned Between Tests

**Problem:** URL sync feature directly reads/writes window.location and window.history

**Impact:** URL query params from one test leak into the next

**Example Failure:**
```
Test 1 (url-sync.test.tsx):
├─ Sets window.location.search = "?page=5&pageSize=50"
├─ Test completes
└─ window.location.search STILL "?page=5&pageSize=50"

Test 2 (selection.test.tsx):
├─ Renders SmartTable({ syncToUrl: false })
├─ useUrlSync hook initializes
├─ Reads window.location.search = "?page=5&pageSize=50"
├─ Sets query = { page: 5, pageSize: 50 }
└─ ❌ FAILS - expected page 1, got page 5
```

**How useUrlSync Reads URL:**
```typescript
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  // ❌ Reads polluted URL from previous test
  const parsed = parseUrlState(params, ...);
  setQuery(parsed);
}, [syncToUrl, ...]);
```

**Fix Effort:** 3 minutes - add window.history.replaceState() to afterEach

---

### 🟠 MEDIUM: Ref State Not Reset in useUrlSync

**Problem:** Hydration tracking refs don't reset when syncToUrl toggles

**Impact:** Component may skip initialization or hydrate wrong state

**Refs That Leak:**
```typescript
const didHydrateUrlRef = useRef(false);           // Set to true, never reset
const didSkipInitialUrlSyncRef = useRef(false);   // Set to true, never reset
```

**Example Scenario:**
```
Test 1: Enables syncToUrl
├─ didHydrateUrlRef becomes true
└─ Test completes

Test 2: Disables syncToUrl (or re-enables)
├─ useUrlSync still has didHydrateUrlRef = true from Test 1
├─ Component skips URL hydration incorrectly
└─ ❌ FAILS - wrong initial state
```

**Fix Effort:** 5 minutes - add useEffect to reset refs when syncToUrl changes

---

### 🟠 MEDIUM: Selection State Not Reset on enableRowSelection Toggle

**Problem:** selectedKeys array only resets when enableRowSelection is TRUE, not when toggled OFF

**Impact:** If test A enables selection, test B might inherit selectedKeys state

**Current Code:**
```typescript
useEffect(() => {
  if (!enableRowSelection) return;  // ← Returns without clearing state
  setSelectedKeys(clearSelection());
}, [enableRowSelection, query.page, dataState.items]);
```

**Example Scenario:**
```
Test 1: Enables row selection
├─ selectedKeys = []
└─ User selects rows
└─ selectedKeys = ['1', '2']

Test 2: Disables row selection ({ enableRowSelection: false })
├─ useEffect checks !enableRowSelection → returns early
├─ selectedKeys still = ['1', '2']
└─ Next time enableRowSelection=true
    └─ selectedKeys carries old data from Test 1
    └─ ❌ TEST FAILS
```

**Fix Effort:** 5 minutes - split effect into two, or add reset when toggling off

---

## Test Execution Flow Showing The Problem

### Sequential Execution (How Vitest Runs Tests)

```
START
│
├─ SmartTable.selection.test.tsx
│  ├─ beforeEach (clear mocks only)
│  │  └─ localStorage STILL has data from previous file
│  │
│  ├─ it('selects a row')
│  │  └─ useSavedViews loads stale data from localStorage ❌
│  │
│  └─ afterEach (NONE - test pollution persists)
│     └─ selectedKeys state remains
│
├─ SmartTable.saved-views.test.tsx
│  ├─ beforeEach (clear localStorage - too late!)
│  │  └─ OLD data was already loaded by selection test
│  │
│  ├─ it('saves view')
│  │  └─ Creates new localStorage entry
│  │
│  └─ afterEach (NONE in original code)
│     └─ NEW data left in localStorage
│
├─ SmartTable.url-sync.test.tsx
│  ├─ beforeEach (clear location - doesn't help)
│  │  └─ NEXT test will see new window.location pollution
│  │
│  ├─ it('syncs to URL')
│  │  └─ Sets window.location.search = "?page=5"
│  │
│  └─ afterEach (NONE)
│     └─ window.location pollution persists
│
└─ END
   └─ Next test file starts with polluted state
```

### The Exact Failure Chain

```
SmartTable.selection.test.tsx starts
├─ beforeEach() {
│  └─ vi.clearAllMocks()  ← Only clears mocks, NOT storage/URL
│
├─ render(<SmartTable enableSavedViews={false} syncToUrl={false} ... />)
│  │
│  ├─ useSavedViews hook executes
│  │  ├─ Checks if (options.enableSavedViews) → false
│  │  ├─ BUT: loadSavedViewsFromStorage() called in useEffect!
│  │  │  └─ localStorage.getItem('rowakit-views-index')
│  │  │  └─ Finds index from PREVIOUS test ← POLLUTION
│  │  │
│  │  ├─ setSavedViews loads old views
│  │  └─ Component state is now corrupted
│  │
│  ├─ useUrlSync hook executes
│  │  ├─ Checks if (syncToUrl) → false
│  │  ├─ But window.location.search = "?page=5&pageSize=50" ← POLLUTION
│  │  ├─ didHydrateUrlRef from previous test = true ← POLLUTION
│  │  └─ Component initialization is wrong
│  │
│  └─ Component renders with corrupted state
│
├─ expect(/* something */).toBe(/* something else */)
└─ ❌ TEST FAILS - assertion mismatch
```

---

## Why Tests Pass Individually

When you run ONE test file in isolation:

```
SmartTable.selection.test.tsx (RUN ALONE)
├─ Jest/Vitest creates fresh jsdom instance
├─ localStorage is empty (new instance)
├─ window.location is clean (new instance)
├─ beforeEach runs (clears mocks)
├─ Test renders SmartTable
├─ useSavedViews finds NO data in localStorage
├─ useUrlSync finds NO query params in URL
├─ Component initializes correctly
├─ Test assertions PASS ✅
└─ (afterEach doesn't matter because no next test)
```

---

## Key Insights

### 1. beforeEach Cleanup Doesn't Help Later Tests
```
Test A's beforeEach cleans up (before Test A runs)
Test A runs and pollutes localStorage
Test A's afterEach DOESN'T EXIST
Test B's beforeEach clears storage (before Test B runs)
BUT: Test A already loaded pollution into React state
TEST B STILL FAILS even though beforeEach cleaned storage
```

### 2. Vitest Doesn't Isolate Between Test Files Automatically
```
pool: 'threads' ← Each thread reuses jsdom
Test File 1 ─┐
            └─ Thread 1 (SHARED jsdom, SHARED localStorage)
Test File 2 ─┘

Result: State leaks between files!
```

### 3. Browser APIs Are Truly Global
```
window.location       ← Global across all tests
localStorage         ← Global across all tests
window.history       ← Global across all tests
React component state ← Component-local (safe)
useRef               ← Component-local (safe)
useState             ← Component-local (safe)
```

---

## The Fix in Order of Importance

| Priority | Fix | Impact | Time |
|----------|-----|--------|------|
| 🔴 #1 | Add `afterEach` to all test files | Stops pollution leaking to next test | 5 min |
| 🔴 #2 | Change Vitest pool to 'forks' | Ensures true test isolation | 2 min |
| 🔴 #3 | Add localStorage.clear() in afterEach | Saves views don't leak | 2 min |
| 🔴 #4 | Add window.history cleanup in afterEach | URL params don't leak | 2 min |
| 🟡 #5 | Create vitest.setup.ts | Global safety net | 5 min |
| 🟡 #6 | Fix useUrlSync ref state | Prevents subtle bugs | 5 min |
| 🟡 #7 | Improve selection reset logic | Handles edge cases | 5 min |

**Total Time:** ~26 minutes for complete fix

---

## Files Needing Changes

1. **packages/table/vitest.config.ts** - Pool config
2. **packages/table/vitest.setup.ts** - NEW file for global cleanup
3. **packages/table/src/components/SmartTable.selection.test.tsx** - Add beforeEach/afterEach
4. **packages/table/src/components/SmartTable.saved-views.test.tsx** - Add afterEach
5. **packages/table/src/components/SmartTable.url-sync.test.tsx** - Add afterEach
6. **packages/table/src/components/SmartTable.test.tsx** - Enhance beforeEach, add afterEach
7. **packages/table/src/hooks/useUrlSync.ts** - Fix ref state (optional)
8. **packages/table/src/components/SmartTable.tsx** - Improve selection logic (optional)

---

## Success Criteria

After fixes, all of these should PASS:

```bash
npm test                                    # All tests together
npm test -- --shuffle                       # Random order
npm test -- SmartTable.selection.test.tsx   # Single file
npm test -- --bail                          # Stop on first failure
```

If any of these fail, test isolation is incomplete.

