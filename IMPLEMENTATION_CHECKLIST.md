# Test Isolation Fix - Implementation Checklist

**Start Date:** ___________  
**Target Completion:** Within 26 minutes  
**Status:** Ready to implement

---

## 📋 Pre-Implementation

### Understanding Phase (5 minutes)
- [ ] Read INVESTIGATION_COMPLETE.md (executive summary)
- [ ] Read ROOT_CAUSE_ANALYSIS.md (understand why)
- [ ] Skim VISUAL_PROBLEM_DIAGRAMS.md (see the problem)
- [ ] Review team understanding of root causes
- [ ] Verify team agrees on solution approach

### Preparation Phase (2 minutes)
- [ ] Ensure you have packages/table directory writable
- [ ] Create backup of vitest.config.ts
- [ ] Create backup of all test files being modified
- [ ] Open TEST_ISOLATION_FIXES.md for reference
- [ ] Open code editor to packages/table directory

---

## 🔧 Implementation Tasks

### Task 1: Create vitest.setup.ts (2 minutes)

**File:** `packages/table/vitest.setup.ts`

- [ ] Create new file in packages/table/
- [ ] Copy code from TEST_ISOLATION_FIXES.md → Fix #1
- [ ] Verify imports are correct (import from 'vitest')
- [ ] Verify global afterEach has all cleanup:
  - [ ] localStorage.clear()
  - [ ] sessionStorage.clear()
  - [ ] window.history.replaceState()
  - [ ] vi.clearAllTimers()
- [ ] Save file

**Verification:** File should be ~40 lines

---

### Task 2: Update vitest.config.ts (2 minutes)

**File:** `packages/table/vitest.config.ts`

- [ ] Open existing vitest.config.ts
- [ ] Find line with `pool: 'threads'`
- [ ] Change to `pool: 'forks'` (or copy from Fix #2)
- [ ] Add `setupFiles: ['./vitest.setup.ts']` to test object
- [ ] Add `isolate: true` to test object
- [ ] Verify structure matches example from Fix #2
- [ ] Save file

**Verification:**
```typescript
test: {
  pool: 'forks',  // ← Changed
  setupFiles: ['./vitest.setup.ts'],  // ← Added
  isolate: true,  // ← Added
  // ... rest of config
}
```

---

### Task 3: Fix SmartTable.selection.test.tsx (3 minutes)

**File:** `packages/table/src/components/SmartTable.selection.test.tsx`

- [ ] Open file
- [ ] Update import statement:
  ```typescript
  import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
  ```
  - [ ] Add `beforeEach` to imports
  - [ ] Add `afterEach` to imports

- [ ] Find `describe('SmartTable - Row Selection`, block
- [ ] Add beforeEach hook (copy from Fix #3):
  ```typescript
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState(null, '', window.location.pathname);
    vi.clearAllMocks();
  });
  ```
  - [ ] Place immediately after describe line
  - [ ] Verify indentation

- [ ] Add afterEach hook (copy from Fix #3):
  ```typescript
  afterEach(() => {
    localStorage.clear();
    window.history.replaceState(null, '', window.location.pathname);
    vi.clearAllMocks();
  });
  ```
  - [ ] Place after beforeEach
  - [ ] Verify indentation

- [ ] Save file
- [ ] Verify file still has all tests intact

**Verification:** beforeEach and afterEach should be first things in describe block

---

### Task 4: Fix SmartTable.url-sync.test.tsx (3 minutes)

**File:** `packages/table/src/components/SmartTable.url-sync.test.tsx`

- [ ] Open file
- [ ] Find existing `beforeEach` block
- [ ] Compare with version in Fix #4
- [ ] Update beforeEach to include all three cleanup lines:
  ```typescript
  beforeEach(() => {
    window.history.replaceState(null, '', window.location.pathname);
    localStorage.clear();  // ← Add if missing
    vi.clearAllMocks();    // ← Add if missing
  });
  ```

- [ ] Add afterEach hook after beforeEach:
  ```typescript
  afterEach(() => {
    window.history.replaceState(null, '', window.location.pathname);
    localStorage.clear();
    vi.clearAllMocks();
  });
  ```

- [ ] Save file

**Verification:** beforeEach has 3 lines, new afterEach has 3 lines

---

### Task 5: Fix SmartTable.saved-views.test.tsx (3 minutes)

**File:** `packages/table/src/components/SmartTable.saved-views.test.tsx`

- [ ] Open file
- [ ] Find existing `beforeEach` block
- [ ] Current beforeEach should only have:
  ```typescript
  beforeEach(() => {
    localStorage.clear();
  });
  ```

- [ ] Enhance beforeEach to match Fix #5:
  ```typescript
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState(null, '', window.location.pathname);
    vi.clearAllMocks();
  });
  ```
  - [ ] Add window.history.replaceState line
  - [ ] Add vi.clearAllMocks line

- [ ] Add afterEach hook after beforeEach:
  ```typescript
  afterEach(() => {
    localStorage.clear();
    window.history.replaceState(null, '', window.location.pathname);
    vi.clearAllMocks();
  });
  ```

- [ ] Save file

**Verification:** beforeEach has 3 lines, new afterEach has 3 lines

---

### Task 6: Fix SmartTable.test.tsx (3 minutes)

**File:** `packages/table/src/components/SmartTable.test.tsx`

- [ ] Open file
- [ ] Update imports to include afterEach if missing
- [ ] Find existing `beforeEach` block
- [ ] Current beforeEach should have:
  ```typescript
  beforeEach(() => {
    vi.clearAllMocks();
  });
  ```

- [ ] Enhance beforeEach to match Fix #6:
  ```typescript
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    window.history.replaceState(null, '', window.location.pathname);
  });
  ```
  - [ ] Add localStorage.clear() line
  - [ ] Add window.history.replaceState line

- [ ] Add afterEach hook after beforeEach:
  ```typescript
  afterEach(() => {
    localStorage.clear();
    window.history.replaceState(null, '', window.location.pathname);
    vi.clearAllMocks();
  });
  ```

- [ ] Save file

**Verification:** beforeEach has 3 lines, new afterEach has 3 lines

---

### Task 7 (OPTIONAL): Fix useUrlSync Ref State (5 minutes)

**File:** `packages/table/src/hooks/useUrlSync.ts`

**Skip this if critical path only - add later if needed**

- [ ] Open file
- [ ] Find `useUrlSync` function definition (around line 150)
- [ ] Find where refs are created:
  ```typescript
  const didHydrateUrlRef = useRef(false);
  const didSkipInitialUrlSyncRef = useRef(false);
  ```

- [ ] Add new useEffect after the refs refs update section:
  ```typescript
  // Reset hydration refs when syncToUrl toggles
  useEffect(() => {
    if (!syncToUrl) {
      didHydrateUrlRef.current = false;
      didSkipInitialUrlSyncRef.current = false;
    }
  }, [syncToUrl]);
  ```
  - [ ] Insert before first existing useEffect
  - [ ] Verify indentation matches other effects

- [ ] Save file

**Verification:** New effect should have syncToUrl in dependency array

---

### Task 8 (OPTIONAL): Improve Selection Reset Logic (5 minutes)

**File:** `packages/table/src/components/SmartTable.tsx`

**Skip this if critical path only - add later if needed**

- [ ] Open file
- [ ] Find around line 376-382, the useEffect:
  ```typescript
  useEffect(() => {
    if (!enableRowSelection) return;
    setSelectedKeys(clearSelection());
  }, [enableRowSelection, query.page, dataState.items]);
  ```

- [ ] Replace with two separate effects:
  ```typescript
  // Clear selection when page changes (always)
  useEffect(() => {
    setSelectedKeys(clearSelection());
  }, [query.page, dataState.items]);

  // Reset selection when row selection feature is toggled off
  useEffect(() => {
    if (!enableRowSelection) {
      setSelectedKeys(clearSelection());
    }
  }, [enableRowSelection]);
  ```

- [ ] Save file

**Verification:** Two separate effects, first has no conditions

---

## ✅ Testing & Verification

### Phase 1: Individual File Testing (5 minutes)

- [ ] Run: `npm test -- SmartTable.selection.test.tsx`
  - Result: __________ (should be PASS)
  - Time taken: __________ seconds

- [ ] Run: `npm test -- SmartTable.saved-views.test.tsx`
  - Result: __________ (should be PASS)
  - Time taken: __________ seconds

- [ ] Run: `npm test -- SmartTable.url-sync.test.tsx`
  - Result: __________ (should be PASS)
  - Time taken: __________ seconds

- [ ] Run: `npm test -- SmartTable.test.tsx`
  - Result: __________ (should be PASS)
  - Time taken: __________ seconds

**Checkpoint:** All individual tests should PASS ✅

---

### Phase 2: Combined Testing (5 minutes)

- [ ] Run: `npm test -- SmartTable.selection.test.tsx SmartTable.saved-views.test.tsx`
  - Result: __________ (should be PASS)
  - Time taken: __________ seconds

- [ ] Run: `npm test -- SmartTable.url-sync.test.tsx SmartTable.selection.test.tsx`
  - Result: __________ (should be PASS)
  - Time taken: __________ seconds

- [ ] Run: `npm test -- SmartTable.saved-views.test.tsx SmartTable.selection.test.tsx`
  - Result: __________ (should be PASS)
  - Time taken: __________ seconds

**Checkpoint:** Combined tests should PASS ✅

---

### Phase 3: Full Test Suite (5 minutes)

- [ ] Run: `npm test`
  - Result: __________ (should be PASS)
  - Time taken: __________ seconds
  - Total tests: __________ 
  - Passed: __________
  - Failed: __________

**Checkpoint:** All tests should PASS ✅

---

### Phase 4: Randomized Order (5 minutes)

- [ ] Run: `npm test -- --shuffle`
  - Attempt 1: __________
  - Attempt 2: __________
  - Attempt 3: __________
  - All attempts PASS: [ ] Yes [ ] No

**Checkpoint:** Randomized tests should PASS ✅

---

## 📝 Summary & Sign-Off

### Implementation Completion

- [ ] Task 1: vitest.setup.ts created
- [ ] Task 2: vitest.config.ts updated
- [ ] Task 3: SmartTable.selection.test.tsx fixed
- [ ] Task 4: SmartTable.url-sync.test.tsx fixed
- [ ] Task 5: SmartTable.saved-views.test.tsx fixed
- [ ] Task 6: SmartTable.test.tsx fixed
- [ ] Task 7 (OPTIONAL): useUrlSync refs fixed
- [ ] Task 8 (OPTIONAL): Selection reset logic improved

### Testing Completion

- [ ] Phase 1: Individual tests PASS
- [ ] Phase 2: Combined tests PASS
- [ ] Phase 3: Full suite PASS
- [ ] Phase 4: Random order tests PASS

### Code Review

- [ ] Code follows project style
- [ ] No syntax errors
- [ ] All cleanup functions present
- [ ] No unintended changes
- [ ] Comments/documentation clear

### Documentation

- [ ] Changes documented
- [ ] Team notified
- [ ] Commit message written
- [ ] PR created (if applicable)

---

## 📊 Implementation Results

**Start Time:** __________  
**End Time:** __________  
**Total Time:** __________ minutes  
(Target: 26 minutes)

**Files Modified:** __________  
**Tests Fixed:** __________  

**Results:**
- [ ] All tests passing individually
- [ ] All tests passing together
- [ ] No regressions found
- [ ] Test isolation verified

---

## 🎉 Post-Implementation

### Immediate (After Implementation)
- [ ] Commit changes to version control
- [ ] Push to feature branch
- [ ] Create pull request
- [ ] Update team channel with results

### Follow-up (Within 1 week)
- [ ] Merge to main branch
- [ ] Update CI/CD if needed
- [ ] Document in team wiki
- [ ] Schedule team review/training

### Long-term (Best Practices)
- [ ] Monitor for test isolation issues
- [ ] Add to pre-commit hooks
- [ ] Include in developer onboarding
- [ ] Establish test guidelines

---

## 📞 Support Contacts

**Questions during implementation:**
- Check: TEST_ISOLATION_FIXES.md → Fix section referenced
- Check: TEST_ISOLATION_INVESTIGATION.md → Detailed analysis
- Check: GLOBAL_STATE_ANALYSIS.md → Technical details
- Check: VISUAL_PROBLEM_DIAGRAMS.md → Visual explanations

**If tests still fail after implementation:**
1. Verify all 6 required files were modified
2. Check that afterEach cleanup is in EVERY test file
3. Verify vitest.config.ts pool is set to 'forks'
4. Verify vitest.setup.ts exists and is referenced in config
5. Check for typos in cleanup code (localStorage vs localStorage, etc.)
6. Run individual test files to isolate the issue

---

## ✨ Success Criteria

- [x] Root cause understood by team
- [x] Implementation plan clear
- [x] All files identified and prepared
- [x] Verification steps documented
- [x] Timeline defined (26 minutes)
- [x] Rollback plan understood (revert from backup)

**Ready to implement:** YES ✅

---

**Checklist Version:** 1.0  
**Last Updated:** January 12, 2026  
**Status:** Ready for implementation

Use this checklist to track progress and ensure nothing is missed.

