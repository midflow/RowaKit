# Test Isolation Fixes - Implementation Guide

## Overview

This document provides exact code changes needed to fix test isolation issues in RowaKit table component.

---

## Fix #1: Add Global Test Setup File

**Create:** `packages/table/vitest.setup.ts`

```typescript
import { afterEach, beforeEach } from 'vitest';

/**
 * Global test setup for RowaKit Table
 * Ensures complete isolation between tests by clearing all shared state
 */

beforeEach(() => {
  // Reset URL to clean state BEFORE each test
  if (typeof window !== 'undefined') {
    window.history.replaceState(null, '', window.location.pathname);
  }
});

afterEach(() => {
  // Comprehensive cleanup AFTER each test to ensure isolation
  
  // Clear localStorage (used by saved views)
  if (typeof localStorage !== 'undefined') {
    localStorage.clear();
  }
  
  // Clear sessionStorage
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.clear();
  }
  
  // Reset URL to clean state (used by URL sync)
  if (typeof window !== 'undefined') {
    window.history.replaceState(null, '', window.location.pathname);
  }
  
  // Clear all timers
  vi.clearAllTimers();
});
```

---

## Fix #2: Update Vitest Configuration

**File:** `packages/table/vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import { readFileSync } from 'fs';
import { join } from 'path';

const pkg = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf8')) as { version: string };

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}', 'src/__tests__/**/*.test.{ts,tsx}'],
    
    // ✅ FIXED: Changed from 'threads' to 'forks' for better isolation
    // 'threads' reuses DOM state within a thread, causing test pollution
    // 'forks' creates a new process for each test file
    pool: 'forks',
    
    // ✅ NEW: Global setup file to clean state between tests
    setupFiles: ['./vitest.setup.ts'],
    
    // ✅ NEW: Ensure tests don't interfere with each other
    isolate: true,
    
    // ✅ NEW: Provide better error messages for async issues
    testTimeout: 10000,
    hookTimeout: 10000,
    
    // Define global variables
    define: {
      __ROWAKIT_TABLE_VERSION__: JSON.stringify(pkg.version),
    },
    
    // Coverage configuration
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['**/*.test.{ts,tsx}', '**/__tests__/**'],
    },
  },
});
```

---

## Fix #3: Update SmartTable.selection.test.tsx

**File:** `packages/table/src/components/SmartTable.selection.test.tsx`

**Change from:**
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SmartTable } from './SmartTable';
import { col } from '../column-helpers';
import type { Fetcher } from '../types';

interface User {
	id: string;
	name: string;
}

const users: User[] = [
	{ id: '1', name: 'Alice' },
	{ id: '2', name: 'Bob' },
	{ id: '3', name: 'Charlie' },
	{ id: '4', name: 'Diana' },
];

describe('SmartTable - Row Selection (PRD-E1)', () => {
	it('selects and unselects a single row', async () => {
		// ... test code
	});
});
```

**Change to:**
```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SmartTable } from './SmartTable';
import { col } from '../column-helpers';
import type { Fetcher } from '../types';

interface User {
	id: string;
	name: string;
}

const users: User[] = [
	{ id: '1', name: 'Alice' },
	{ id: '2', name: 'Bob' },
	{ id: '3', name: 'Charlie' },
	{ id: '4', name: 'Diana' },
];

describe('SmartTable - Row Selection (PRD-E1)', () => {
	// ✅ NEW: Ensure clean state before each test
	beforeEach(() => {
		localStorage.clear();
		window.history.replaceState(null, '', window.location.pathname);
		vi.clearAllMocks();
	});

	// ✅ NEW: Clean up after each test completes
	afterEach(() => {
		localStorage.clear();
		window.history.replaceState(null, '', window.location.pathname);
		vi.clearAllMocks();
	});

	it('selects and unselects a single row', async () => {
		// ... test code
	});
});
```

---

## Fix #4: Update SmartTable.url-sync.test.tsx

**File:** `packages/table/src/components/SmartTable.url-sync.test.tsx`

**Change from:**
```tsx
describe('SmartTable - URL sync hardening (PRD-05)', () => {
  beforeEach(() => {
    // Clear URL params before each test
    window.history.replaceState(null, '', window.location.pathname);
  });

  describe('URL parameter parsing and validation', () => {
    // ... tests
  });
});
```

**Change to:**
```tsx
describe('SmartTable - URL sync hardening (PRD-05)', () => {
  beforeEach(() => {
    // Clear URL params before each test
    window.history.replaceState(null, '', window.location.pathname);
    localStorage.clear();
    vi.clearAllMocks();
  });

  // ✅ NEW: Ensure complete cleanup after each test
  afterEach(() => {
    window.history.replaceState(null, '', window.location.pathname);
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('URL parameter parsing and validation', () => {
    // ... tests
  });
});
```

---

## Fix #5: Update SmartTable.saved-views.test.tsx

**File:** `packages/table/src/components/SmartTable.saved-views.test.tsx`

**Change from:**
```tsx
describe('SmartTable - Saved Views v1.1 (PRD-04)', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('Storage index and persistence', () => {
    // ... tests
  });
});
```

**Change to:**
```tsx
describe('SmartTable - Saved Views v1.1 (PRD-04)', () => {
  beforeEach(() => {
    // Clear localStorage and URL state before each test
    localStorage.clear();
    window.history.replaceState(null, '', window.location.pathname);
    vi.clearAllMocks();
  });

  // ✅ NEW: Ensure complete cleanup after each test
  afterEach(() => {
    localStorage.clear();
    window.history.replaceState(null, '', window.location.pathname);
    vi.clearAllMocks();
  });

  describe('Storage index and persistence', () => {
    // ... tests
  });
});
```

---

## Fix #6: Update SmartTable.test.tsx (Main Test File)

**File:** `packages/table/src/components/SmartTable.test.tsx`

**Add imports:**
```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
```

**Add after describe block opens:**
```tsx
describe('RowaKitTable Component (A-11)', () => {
  const mockUsers: User[] = [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' },
    { id: 3, name: 'Charlie', email: 'charlie@example.com' },
  ];

  beforeEach(() => {
    // ✅ ENHANCED: Add storage cleanup alongside mock cleanup
    vi.clearAllMocks();
    localStorage.clear();
    window.history.replaceState(null, '', window.location.pathname);
  });

  // ✅ NEW: Add afterEach for complete cleanup
  afterEach(() => {
    localStorage.clear();
    window.history.replaceState(null, '', window.location.pathname);
    vi.clearAllMocks();
  });

  describe('Pagination', () => {
    // ... existing tests
  });
});
```

---

## Fix #7: Optional - Fix useUrlSync Ref Leakage

**File:** `packages/table/src/hooks/useUrlSync.ts`

**Location:** Around line 180, add effect to reset refs when syncToUrl changes

**Current code:**
```typescript
export function useUrlSync<T>({
	syncToUrl,
	enableColumnResizing,
	defaultPageSize,
	pageSizeOptions,
	columns,
	query,
	setQuery,
	filters,
	setFilters,
	columnWidths,
	setColumnWidths,
}: {
	syncToUrl: boolean;
	// ... rest of params
}) {
	const didHydrateUrlRef = useRef(false);
	const didSkipInitialUrlSyncRef = useRef(false);
	const urlSyncDebounceRef = useRef<NodeJS.Timeout | null>(null);
	
	// Store props in refs to avoid unnecessary effect re-runs during hydration
	const defaultPageSizeRef = useRef(defaultPageSize);
	const pageSizeOptionsRef = useRef(pageSizeOptions);
	const enableColumnResizingRef = useRef(enableColumnResizing);
	const columnsRef = useRef(columns);
	
	// Keep refs updated
	defaultPageSizeRef.current = defaultPageSize;
	pageSizeOptionsRef.current = pageSizeOptions;
	enableColumnResizingRef.current = enableColumnResizing;
	columnsRef.current = columns;

	useEffect(() => {
		if (!syncToUrl) {
			didSkipInitialUrlSyncRef.current = false;
			return;
		}
		// ... rest of effect
	}, [/* dependencies */]);
```

**Change to:**
```typescript
export function useUrlSync<T>({
	syncToUrl,
	enableColumnResizing,
	defaultPageSize,
	pageSizeOptions,
	columns,
	query,
	setQuery,
	filters,
	setFilters,
	columnWidths,
	setColumnWidths,
}: {
	syncToUrl: boolean;
	// ... rest of params
}) {
	const didHydrateUrlRef = useRef(false);
	const didSkipInitialUrlSyncRef = useRef(false);
	const urlSyncDebounceRef = useRef<NodeJS.Timeout | null>(null);
	
	// Store props in refs to avoid unnecessary effect re-runs during hydration
	const defaultPageSizeRef = useRef(defaultPageSize);
	const pageSizeOptionsRef = useRef(pageSizeOptions);
	const enableColumnResizingRef = useRef(enableColumnResizing);
	const columnsRef = useRef(columns);
	
	// Keep refs updated
	defaultPageSizeRef.current = defaultPageSize;
	pageSizeOptionsRef.current = pageSizeOptions;
	enableColumnResizingRef.current = enableColumnResizing;
	columnsRef.current = columns;

	// ✅ NEW: Reset hydration refs when syncToUrl toggles
	// This ensures refs don't carry state from previous renders
	useEffect(() => {
		if (!syncToUrl) {
			didHydrateUrlRef.current = false;
			didSkipInitialUrlSyncRef.current = false;
		}
	}, [syncToUrl]);

	useEffect(() => {
		if (!syncToUrl) {
			didSkipInitialUrlSyncRef.current = false;
			return;
		}
		// ... rest of effect
	}, [/* dependencies */]);
```

---

## Fix #8: Optional - Improve SmartTable Selection Reset Logic

**File:** `packages/table/src/components/SmartTable.tsx`

**Current code (lines ~376-382):**
```typescript
useEffect(() => {
  if (!enableRowSelection) return;
  setSelectedKeys(clearSelection());
}, [enableRowSelection, query.page, dataState.items]);
```

**Improved code:**
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

**Why?** 
- The first effect always resets on page/items change (regardless of whether feature is enabled)
- The second effect resets when the feature is toggled off
- Together they ensure selectedKeys never carries stale state

---

## Implementation Checklist

Run these commands in order:

```bash
# 1. Create the setup file
touch packages/table/vitest.setup.ts

# 2. Update each test file with beforeEach/afterEach
# (Use the code examples above)

# 3. Update vitest.config.ts
# (Use the code example above)

# 4. Optional: Update useUrlSync refs
# (Use the code example above)

# 5. Optional: Improve selection reset logic
# (Use the code example above)

# 6. Run tests to verify isolation
npm test

# 7. Run tests in different orders to ensure no pollution
npm test -- SmartTable.selection.test.tsx
npm test -- SmartTable.saved-views.test.tsx
npm test -- SmartTable.url-sync.test.tsx

# 8. Run all tests together
npm test
```

---

## Verification Steps

After implementing fixes, verify with:

### Test 1: Run Selection Tests Alone
```bash
npm test -- SmartTable.selection.test.tsx
# ✅ Should PASS
```

### Test 2: Run URL Sync, Then Selection
```bash
npm test -- SmartTable.url-sync.test.tsx SmartTable.selection.test.tsx
# ✅ Should PASS (even after URL sync pollution)
```

### Test 3: Run Saved Views, Then Selection
```bash
npm test -- SmartTable.saved-views.test.tsx SmartTable.selection.test.tsx
# ✅ Should PASS (even after localStorage pollution)
```

### Test 4: Run All Tests Together
```bash
npm test
# ✅ ALL should PASS
```

### Test 5: Run Tests in Random Order
```bash
npm test -- --shuffle
# ✅ ALL should PASS (proves isolation works)
```

---

## Expected Results After Fixes

| Scenario | Before | After |
|----------|--------|-------|
| Selection tests alone | ✅ PASS | ✅ PASS |
| URL sync then selection | ❌ FAIL | ✅ PASS |
| Saved views then selection | ❌ FAIL | ✅ PASS |
| All tests together | ❌ FAIL | ✅ PASS |
| Tests in random order | ❌ FAIL | ✅ PASS |

---

## Minimal vs Comprehensive Fix

### Minimal (Gets Tests Passing)
1. Add `afterEach(() => { localStorage.clear(); })` to all test files
2. Add `afterEach(() => { window.history.replaceState(...); })` to all test files
3. Change Vitest pool to 'forks'

### Comprehensive (Best Practices)
1. Create vitest.setup.ts with global cleanup
2. Update Vitest config with setupFiles and proper pool config
3. Add beforeEach/afterEach to all test files
4. Fix useUrlSync ref state leakage
5. Improve SmartTable selection reset logic

**Recommendation:** Implement comprehensive fix for long-term stability.

