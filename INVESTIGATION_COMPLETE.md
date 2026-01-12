# RowaKit Table Component - Test Isolation Investigation Results

**Investigation Date:** January 12, 2026  
**Status:** ✅ ROOT CAUSE IDENTIFIED  
**Severity:** 🔴 CRITICAL  
**Estimated Fix Time:** 26 minutes

---

## Executive Summary

Tests fail when run together but pass individually because **shared global state (localStorage, window.location) and the Vitest thread pool configuration allow state from one test file to leak into the next without cleanup**.

**Root Cause:** Missing `afterEach` hooks in test files combined with `pool: 'threads'` configuration that shares jsdom instances across tests.

---

## What Was Found

### ✅ No React Context (Good News)
The table component does NOT use React Context, preventing context provider pollution. All state is component-local.

### ❌ Three Global State Sources Found
1. **localStorage** - Used by `useSavedViews` hook
2. **window.location** - Used by `useUrlSync` hook  
3. **Vitest thread pool** - Shares jsdom/DOM across tests

### ❌ Missing Test Cleanup
- SmartTable.selection.test.tsx - NO beforeEach/afterEach
- SmartTable.saved-views.test.tsx - Has beforeEach, missing afterEach
- SmartTable.url-sync.test.tsx - Has beforeEach, missing afterEach
- SmartTable.test.tsx - Has beforeEach, missing afterEach

### ⚠️ Ref State Leakage
useUrlSync has refs that don't reset when the `syncToUrl` prop toggles, allowing stale state to persist across test cycles.

---

## How Tests Fail Together

```
Test A (saved-views)         Test B (selection)
└─ Fills localStorage   ──→  └─ Reads stale data from localStorage
   ↓                              ↓
   afterEach missing              Component loads old saved views
                                  ↓
                                  ❌ TEST FAILS
```

### Example Failure Scenario

1. `SmartTable.saved-views.test.tsx` saves a view to localStorage
2. Test completes but `afterEach` doesn't clear localStorage
3. `SmartTable.selection.test.tsx` starts
4. `useSavedViews` hook loads old data from localStorage
5. Component state is corrupted with old page/sort/filter values
6. Subsequent assertions expect default state but get polluted state
7. Test fails with "expected page 1, got page 5"

---

## Impacted Test Files

| File | Issue | Severity |
|------|-------|----------|
| SmartTable.selection.test.tsx | NO beforeEach/afterEach at all | 🔴 CRITICAL |
| SmartTable.saved-views.test.tsx | Has beforeEach, missing afterEach | 🔴 CRITICAL |
| SmartTable.url-sync.test.tsx | Has beforeEach, missing afterEach | 🔴 CRITICAL |
| SmartTable.test.tsx | Has beforeEach, missing afterEach | 🟡 HIGH |

---

## Quick Fix (5 minutes)

Add this to ALL test files:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('...', () => {
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

  it('test', () => {});
});
```

And change [packages/table/vitest.config.ts](packages/table/vitest.config.ts):

```typescript
pool: 'forks',  // Changed from 'threads'
```

---

## Detailed Investigation Documents

Three comprehensive documents were created:

### 1. **[TEST_ISOLATION_INVESTIGATION.md](TEST_ISOLATION_INVESTIGATION.md)** (Most Important)
- Complete root cause analysis
- How tests fail together vs individually
- All global state sources identified
- Specific file locations and line numbers
- Fix recommendations with implementation priority

### 2. **[GLOBAL_STATE_ANALYSIS.md](GLOBAL_STATE_ANALYSIS.md)** (Reference)
- Detailed table of all global state
- Hook analysis (side effects, refs, state)
- Vitest configuration issues
- Test failure chain analysis
- Verification checklist

### 3. **[TEST_ISOLATION_FIXES.md](TEST_ISOLATION_FIXES.md)** (Implementation Guide)
- Exact code changes needed
- Step-by-step implementation
- Before/after code examples
- Verification steps
- Implementation checklist

### 4. **[ROOT_CAUSE_ANALYSIS.md](ROOT_CAUSE_ANALYSIS.md)** (Educational)
- Problem explanation in simple terms
- Why tests pass individually
- Visual flow diagrams
- Key insights
- Success criteria

---

## Key Findings Summary

### Global State Found
| State Type | Location | Problem |
|-----------|----------|---------|
| localStorage | `useSavedViews` hook | Not cleared between tests |
| window.location | `useUrlSync` hook | Not reset between tests |
| Vitest mocks | Global | Not cleared in afterEach |
| Ref state | `useUrlSync` | Doesn't reset when prop changes |

### No Global State Found
✅ No React Context  
✅ No singleton instances  
✅ No module-level caches  
✅ No global refs outside hooks  

### Test Files Status
- 🟠 4 files missing comprehensive cleanup
- 🟠 0 files have proper isolation setup

---

## Recommended Action Plan

### Phase 1: Critical Fixes (10 minutes)
1. Add `afterEach` with localStorage.clear() to all 4 test files
2. Add `afterEach` with window.history reset to all 4 test files
3. Change vitest.config.ts pool from 'threads' to 'forks'

### Phase 2: Hardening (16 minutes)
4. Create vitest.setup.ts with global cleanup
5. Fix useUrlSync ref state leaking
6. Improve SmartTable selection reset logic
7. Add proper beforeEach to all files

### Phase 3: Verification (5+ minutes)
8. Run tests individually - all pass ✅
9. Run tests together - all pass ✅
10. Run tests in random order - all pass ✅

---

## Success Indicators

After implementation, verify with:

```bash
# Should all PASS
npm test
npm test -- --shuffle
npm test -- SmartTable.selection.test.tsx
npm test -- SmartTable.saved-views.test.tsx SmartTable.selection.test.tsx
```

---

## Key Facts

- **No React Context:** This is actually good - avoids provider pollution
- **No Singleton Caches:** No complex state management layer to debug
- **Three Pollution Sources:** localStorage, window.location, Vitest thread pool
- **Missing Cleanup:** Every test file needs afterEach hooks
- **Pool Configuration:** 'threads' doesn't isolate - need 'forks'
- **Fix Complexity:** Medium - straightforward to implement, high confidence in solution

---

## Additional Resources Created

1. **This file** - Executive summary and navigation guide
2. **TEST_ISOLATION_INVESTIGATION.md** - 400+ lines of detailed analysis
3. **GLOBAL_STATE_ANALYSIS.md** - 300+ lines of reference material
4. **TEST_ISOLATION_FIXES.md** - 350+ lines of implementation code
5. **ROOT_CAUSE_ANALYSIS.md** - 400+ lines of explanation

**Total Investigation:** ~1500 lines of detailed documentation

---

## Questions Answered

### 1. Are there global state/context providers maintaining state? 
**Answer:** No React Context found. Only browser APIs (localStorage, window.location) maintain global state.

### 2. Are there custom hooks with side effects?
**Answer:** Yes - `useSavedViews` and `useUrlSync` both have side effects but they're not the problem themselves; the problem is tests don't clean up after them.

### 3. How does SmartTable handle enableRowSelection prop?
**Answer:** State is component-local, resets when page changes, but NOT when prop toggles off (minor issue).

### 4. Are there singleton instances or caches?
**Answer:** No - all state is either component-local or browser APIs.

### 5. What's the root cause of test isolation failure?
**Answer:** Missing `afterEach` cleanup combined with Vitest's 'threads' pool that doesn't isolate between test files.

---

## Next Steps

1. **Read** TEST_ISOLATION_INVESTIGATION.md for full details
2. **Review** TEST_ISOLATION_FIXES.md for exact code changes
3. **Implement** the fixes using the step-by-step guide
4. **Verify** with the test commands provided
5. **Commit** and merge to prevent regression

---

## Questions?

Refer to the detailed documents:
- **"Why are tests failing?"** → ROOT_CAUSE_ANALYSIS.md
- **"What global state exists?"** → GLOBAL_STATE_ANALYSIS.md
- **"How do I fix this?"** → TEST_ISOLATION_FIXES.md
- **"Show me everything"** → TEST_ISOLATION_INVESTIGATION.md

---

**Investigation Complete** ✅  
All findings documented and ready for implementation.

