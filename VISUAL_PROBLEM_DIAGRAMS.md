# Visual Test Isolation Problem Diagram

## The Problem: Tests Fail Together But Pass Alone

```
SCENARIO 1: Tests Run Individually (PASS ✅)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Process Start
    ↓
[Fresh jsdom Instance]
[Empty localStorage]
[Clean window.location]
    ↓
SmartTable.selection.test.tsx
├─ beforeEach: clear mocks
├─ render SmartTable
├─ assertions PASS ✅
└─ test ends
    ↓
Process Exits
[jsdom destroyed]
[localStorage destroyed]
[window destroyed]

Result: No pollution, no next test sees anything
═══════════════════════════════════════════════════


SCENARIO 2: Tests Run Together (FAIL ❌)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Process Start
    ↓
[Fresh jsdom Instance - THREAD 1]
[Empty localStorage - THREAD 1]
[Clean window.location - THREAD 1]
    ↓
SmartTable.saved-views.test.tsx
├─ beforeEach: clear localStorage ✅
├─ render SmartTable
├─ localStorage.setItem('rowakit-view-X', {...})  ← POLLUTES
├─ assertions pass
└─ afterEach: ❌ MISSING → localStorage NOT cleared
    ↓
[localStorage still has rowakit-view-X]
[window.location still has ?page=5]
[Ref state still has didHydrateUrlRef=true]
    ↓
SmartTable.selection.test.tsx
├─ beforeEach: clear mocks (but NOT localStorage/location)
├─ render SmartTable({ enableSavedViews: false })
├─ useSavedViews hook finds rowakit-view-X in localStorage  ← POLLUTION
├─ Component loads old page/sort/filter state
├─ Assertions expect default state
└─ ❌ ASSERTIONS FAIL - got page 5, expected page 1
    ↓
Process Continues...
[More tests affected by pollution]

Result: Tests fail due to leaked state from previous test
═══════════════════════════════════════════════════════════
```

---

## The Root Cause Tree

```
                        TESTS FAIL TOGETHER
                              │
                              ├─────────────────────────────────────────┐
                              │                                         │
                        Shared jsdom                          Missing afterEach
                       (pool: threads)                        cleanup hooks
                              │                                         │
                              │                                         │
                  ┌─────────────────────┬─────────────────┐            │
                  │                     │                 │            │
            localStorage         window.location    Vitest mocks  localStorage
            test pollution       test pollution      not cleared   not cleared
                  │                     │                 │            │
                  │                     │                 │            │
         ┌────────┴────────┐   ┌────────┴────────┐      │            │
         │                 │   │                 │      │            │
   useSavedViews      browserAPI   useUrlSync   browserAPI           │
    reads old data   reads old URL  reads old URL reads old data     │
         │                 │       reads old ref            │         │
         │                 │                 │              │         │
         │                 │                 │              │         │
    Component state   Component state  Ref state    localStorage
     corrupted with    initialized      persists      pollution
      wrong values     wrong page       across        propagates
         │                 │           component        to next
         │                 │           renders          test
         │                 │                │            │
         └─────────────────┴────────────────┴────────────┘
                           │
                        ❌ TEST FAILS
```

---

## The Data Flow: How Pollution Occurs

```
TEST FILE A: SmartTable.saved-views.test.tsx
════════════════════════════════════════════════════

beforeEach()
  └─ localStorage.clear() ✅

it('saves a view', async () => {
  render(<SmartTable enableSavedViews={true} />)
  
  User saves "My View"
  
  useSavedViews.saveCurrentView('My View')
    └─ localStorage.setItem('rowakit-views-index', [...])
    └─ localStorage.setItem('rowakit-view-My View', {...})
})

afterEach()
  ❌ MISSING → localStorage NOT CLEARED
  
Results in state:
┌───────────────────────────────┐
│ localStorage                  │
├───────────────────────────────┤
│ rowakit-views-index: [...]   │ ← POLLUTES NEXT TEST
│ rowakit-view-My View: {...}  │ ← POLLUTES NEXT TEST
└───────────────────────────────┘

                         ↓
                    ↓
                 ↓
TEST FILE B: SmartTable.selection.test.tsx
════════════════════════════════════════════════════

beforeEach()
  ├─ vi.clearAllMocks() ✅
  ├─ localStorage.clear() ❌ NOT HERE - only in TEST A
  └─ window.history.replaceState(...) ❌ NOT HERE - only in URL sync tests

it('selects a row', async () => {
  render(<SmartTable enableSavedViews={false} syncToUrl={false} />)
  
  useSavedViews hook initializes:
    useEffect(() => {
      if (!options.enableSavedViews) return;  ← Should skip
      setSavedViews(loadSavedViewsFromStorage());
    }, [options.enableSavedViews])
  
  BUT: loadSavedViewsFromStorage() reads from localStorage
  
  getSavedViewsIndex():
    └─ localStorage.getItem('rowakit-views-index')
    └─ Finds: ['My View'] from TEST A ← POLLUTION
    
  Loads:
    └─ localStorage.getItem('rowakit-view-My View')
    └─ Finds: { page: 5, pageSize: 50, sort: ... } ← STALE DATA
  
  Component state corrupted:
    ├─ query.page = 5 (expected 1)
    ├─ query.pageSize = 50 (expected 20)
    └─ query.sort = {...} (expected undefined)
})

expect(screen.queryByText('showing page 1')).toBeDefined()
  ❌ FAILS - shows "page 5" instead
```

---

## Before/After Fix Diagram

```
BEFORE FIX (Current State)
═════════════════════════════════════════════════════════════════

Test File A                         Shared jsdom             Test File B
(saved-views)                       (pool: threads)         (selection)
     │                                   │                        │
     ├─ beforeEach()          ┌──────────┴──────────┐              │
     │                        │                     │              │
     ├─ Test runs            │  Fresh jsdom        │              │
     │  (fills localStorage)  │  localStorage: {}   │              │
     │                        │  window.location: / │              │
     ├─ afterEach()          │                     │              │
     │  ❌ Missing            │                     │              │
     │                        │                     │              │
     └─ State: polluted       └──────────┬──────────┘              │
        localStorage: {                  │                         │
          rowakit-views...              │                         │
        }                               │                         │
                                        │   NO ISOLATION         │
        ════════════════════════════════╗                         │
                                        ║                         │
                                        ╚─────────────────────────┤
                                                                  ├─ beforeEach()
                                                                  │  ✅ Clears mocks
                                                                  │  ❌ NOT localStorage
                                                                  │
                                                                  ├─ Test runs
                                                                  │  (reads polluted
                                                                  │   localStorage)
                                                                  │  ❌ FAILS
                                                                  │
                                                                  ├─ afterEach()
                                                                  │  ❌ Missing


AFTER FIX (Proposed Solution)
═════════════════════════════════════════════════════════════════

Test File A                         Fresh jsdom Per File      Test File B
(saved-views)                       (pool: forks)            (selection)
     │                                   │                        │
     ├─ beforeEach()          ┌──────────┴──────────┐              │
     │                        │                     │              │
     ├─ Test runs            │  Fresh jsdom        │              │
     │  (fills localStorage)  │  localStorage: {}   │              │
     │                        │  window.location: / │              │
     ├─ afterEach()          │                     │              │
     │  ✅ localStorage.clear()                    │              │
     │  ✅ window.history.reset()                  │              │
     │  ✅ vi.clearAllMocks()                      │              │
     │                        │                     │              │
     └─ State: clean         │  AFTER A:            │              │
        localStorage: {}      │  localStorage: {}   │              │
                              │  window.location: / │              │
                              │  vi mocks: cleared  │              │
                              └──────────┬──────────┘              │
                                        │                         │
                                  ✅ ISOLATION               ✅ Clean Start
                                                                  ├─ beforeEach()
                                        │                        │  ✅ Clear mocks
                          Fresh jsdom  │                        │
                          for File B   │                        │
                                        └─ Fork #2          ✅ Clean localStorage
                              ┌──────────┐
                              │          │
                              │ localStorage: {}
                              │ window.location: /
                              │
                              └─────────────────┤
                                                 ├─ Test runs
                                                 │  (clean state)
                                                 │  ✅ PASSES
                                                 │
                                                 ├─ afterEach()
                                                 │  ✅ Clean up
```

---

## Vitest Pool Comparison

```
pool: 'threads' (CURRENT - PROBLEM)
═══════════════════════════════════════════════════

Thread 1 (shared jsdom)
├─ test-file-1.test.tsx
│  ├─ jsdom instance: shared
│  ├─ localStorage: shared
│  └─ window: shared
├─ test-file-2.test.tsx
│  ├─ jsdom instance: REUSED ← STATE LEAKS HERE
│  ├─ localStorage: REUSED ← POLLUTION HAPPENS
│  └─ window: REUSED ← URL STATE PERSISTS
└─ test-file-3.test.tsx
   └─ All state polluted from previous tests

Thread 2 (separate)
└─ Other tests run clean (different thread)

Result: Inconsistent failures, some tests fail when others run first


pool: 'forks' (RECOMMENDED FIX)
═══════════════════════════════════════════════════

Process 1 (Fork #1)              Process 2 (Fork #2)         Process 3 (Fork #3)
├─ Fresh jsdom                   ├─ Fresh jsdom              ├─ Fresh jsdom
├─ Empty localStorage            ├─ Empty localStorage       ├─ Empty localStorage
├─ Clean window                  ├─ Clean window             ├─ Clean window
│                                │                          │
├─ test-file-1.test.tsx         ├─ test-file-2.test.tsx    ├─ test-file-3.test.tsx
│  ├─ Runs clean                 │  ├─ Runs clean            │  ├─ Runs clean
│  ├─ Tests pass                 │  ├─ Tests pass            │  ├─ Tests pass
│  └─ afterEach cleanup          │  └─ afterEach cleanup     │  └─ afterEach cleanup
│                                │                          │
└─ Process exits                 └─ Process exits            └─ Process exits
   jsdom destroyed                  jsdom destroyed             jsdom destroyed
   localStorage destroyed           localStorage destroyed      localStorage destroyed
   window destroyed                 window destroyed           window destroyed

Result: Complete isolation, all tests pass regardless of order
```

---

## Test Execution Timeline Comparison

```
WITHOUT FIX: Tests Fail When Run Together
══════════════════════════════════════════════════════════════════════

T1: saved-views.test starts
    │
    ├─ beforeEach: clear localStorage ✅
    │
    ├─ Test: save view to localStorage
    │  │
    │  └─ localStorage.setItem('rowakit-view-X', {...})
    │
    └─ afterEach: ❌ MISSING - localStorage NOT cleared
       State: localStorage = { rowakit-view-X: {...} }

T2: selection.test starts (SAME THREAD)
    │
    ├─ beforeEach: clear mocks (NOT storage)
    │
    ├─ Test: render SmartTable
    │  │
    │  ├─ useSavedViews loads from localStorage
    │  │  └─ Finds rowakit-view-X ← POLLUTION from T1
    │  │
    │  └─ Component state = { page: 5, ... } (old values)
    │
    ├─ expect(page === 1).toBe(true)
    │  └─ ❌ FAILS: page = 5
    │
    └─ afterEach: ❌ MISSING


WITH FIX: Tests Pass Together
══════════════════════════════════════════════════════════════════════

T1: saved-views.test starts (FORK 1)
    │
    ├─ beforeEach: clear localStorage ✅
    │
    ├─ Test: save view to localStorage
    │  │
    │  └─ localStorage.setItem('rowakit-view-X', {...})
    │
    └─ afterEach: clear localStorage ✅
       State: localStorage = {} (cleaned)

─────────────────────────────────────────────────────────────────────

T2: selection.test starts (FORK 2 - FRESH PROCESS)
    │
    ├─ beforeEach: clear localStorage ✅
    │  State: Fresh jsdom, empty localStorage
    │
    ├─ Test: render SmartTable
    │  │
    │  ├─ useSavedViews loads from localStorage
    │  │  └─ Finds nothing (fresh instance)
    │  │
    │  └─ Component state = { page: 1, ... } (default)
    │
    ├─ expect(page === 1).toBe(true)
    │  └─ ✅ PASSES
    │
    └─ afterEach: clear localStorage ✅
```

---

## localStorage Pollution Mechanism

```
How localStorage Pollutes the Next Test
═══════════════════════════════════════════════════════════════════

Test A: Saved Views
┌──────────────────────────────────┐
│ localStorage = {                 │
│   'rowakit-views-index': [       │
│     { name: 'Old View',... }    │
│   ],                             │
│   'rowakit-view-Old View': {     │
│     page: 5,                     │
│     pageSize: 50,                │
│     sort: {...}                  │
│   }                              │
│ }                                │
└──────────────────────────────────┘
         ↓
    ❌ No afterEach
         ↓
         ├─ didHydrateUrlRef keeps state
         ├─ didSkipInitialUrlSyncRef keeps state
         └─ selectedKeys array not reset

Test B: Selection (Same Thread)
         ↓
┌──────────────────────────────────┐
│ Component.render() {             │
│   useSavedViews() {              │
│     useEffect(() => {            │
│       // Check enableSavedViews  │
│       if (!enableSavedViews)     │
│         return;  ← Should skip   │
│                                  │
│       // But this still runs:    │
│       setSavedViews(            │
│         loadSavedViewsFromStorage() ← Loads old data!
│       )                          │
│     })                           │
│   }                              │
│ }                                │
└──────────────────────────────────┘
         ↓
    Component State Corrupted:
    - page: 5 (should be 1)
    - pageSize: 50 (should be 20)
    - sort: {...} (should be undefined)
         ↓
    ❌ TEST FAILS


With Fix: Each Test Gets Fresh Storage
═══════════════════════════════════════════════════════════════════

Test A afterEach: localStorage.clear()
         ↓
┌──────────────────────────────────┐
│ localStorage = {}  ← CLEANED    │
└──────────────────────────────────┘
         ↓
Test B starts (new fork)
         ↓
┌──────────────────────────────────┐
│ Fresh jsdom                      │
│ Fresh localStorage               │
│ Fresh window.location            │
│ Fresh ref state                  │
└──────────────────────────────────┘
         ↓
    Component initializes correctly
         ↓
    ✅ TEST PASSES
```

---

## Summary

The visual shows:

1. **Why tests fail together** - Shared state pollution without afterEach cleanup
2. **Why tests pass alone** - Fresh jsdom instance per process
3. **The fix** - Using 'forks' pool + afterEach cleanup ensures isolation
4. **The mechanism** - How localStorage pollution flows from one test to the next
5. **Before/after** - Clear comparison of current vs fixed state

All diagrams illustrate the same core issue: **missing cleanup + shared resources = test pollution**

