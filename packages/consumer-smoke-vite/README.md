# Consumer Smoke Test — Vite + React + TypeScript

**Purpose:** Validate RowaKit's TypeScript type safety and API compatibility in a real consumer app.

## What This Tests

✅ **Type Exports:** `Fetcher`, `BulkActionDef`, `Exporter`, `SortColumn`  
✅ **No `any` types:** All implementations use proper TypeScript inference  
✅ **API Coverage:** Row selection, bulk actions, export, multi-sort, filters  
✅ **Build & Typecheck:** Ensures no breaking changes in public API

## Commands

```bash
# Install dependencies (from monorepo root)
pnpm install

# TypeCheck
pnpm --filter @rowakit/consumer-smoke-vite typecheck

# Build
pnpm --filter @rowakit/consumer-smoke-vite build

# Dev server
pnpm --filter @rowakit/consumer-smoke-vite dev
```

## Validation Criteria

- ✅ `pnpm typecheck` must pass with **zero errors**
- ✅ `pnpm build` must complete successfully
- ✅ No TypeScript `any` types in consumer code
- ✅ All public API types must be importable

## What's Tested

### Fetcher Contract
- Implements `Fetcher<User>` with full type safety
- Handles `query.sorts` (multi-sort) and `query.sort` (fallback)
- Supports filtering and pagination

### Bulk Actions
- Typed as `BulkActionDef[]`
- Includes confirmation dialogs
- Receives selected row keys with proper typing

### Exporter
- Typed as `Exporter`
- Receives full query snapshot
- Returns URL for download

### Column Types
- `col.text()` with sortable/filterable
- `col.number()` with custom formatting
- `col.badge()` with tone mapping
- `col.boolean()` with filters
- `col.date()` with ISO strings
- `col.actions()` with confirmation

## Success Criteria

This consumer passes if:
1. TypeScript compilation succeeds
2. Vite build completes
3. No type errors in IDE
4. Table renders and is interactive
