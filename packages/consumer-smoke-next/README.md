# Consumer Smoke Test — Next.js App Router

**Purpose:** Validate RowaKit Table compatibility with Next.js 14+ App Router and verify SSR/hydration safety.

---

## What This Tests

✅ **Next.js App Router Compatibility** — `'use client'` directives, SSR, hydration  
✅ **Server-Side Data Fetching** — Pagination, sorting, multi-sort from mock backend  
✅ **Client-Side Interactivity** — Row selection, bulk actions, export  
✅ **Type Safety** — Full TypeScript inference, no `any` types  
✅ **No Hydration Mismatches** — SSR state matches client-side render  
✅ **Build Success** — `next build` completes without warnings/errors  

---

## Architecture

```
app/
├── layout.tsx           ← Root layout with metadata
├── page.tsx             ← Page component (server-side)
├── table.tsx            ← Table component (client-side, 'use client')
└── globals.css          ← Minimal styling
```

### Component Boundaries

- **page.tsx** (Server Component)
  - Renders layout
  - Passes props to client components
  - No interactivity

- **table.tsx** (Client Component)
  - `'use client'` directive
  - RowaKitTable component
  - Handles state, callbacks, interactivity

This pattern avoids hydration mismatches by keeping interactive logic in client components.

---

## Commands

### From Monorepo Root

```bash
# Install dependencies (installs all packages)
pnpm install

# TypeCheck this consumer
pnpm --filter @rowakit/consumer-smoke-next typecheck

# Build this consumer
pnpm --filter @rowakit/consumer-smoke-next build

# Start dev server
pnpm --filter @rowakit/consumer-smoke-next dev
```

### Direct (from this directory)

```bash
# Install monorepo first from root
cd ../../..
pnpm install

# Then dev from this directory
cd packages/consumer-smoke-next
pnpm dev

# Or typecheck
pnpm typecheck

# Or build
pnpm build
```

---

## Validation Criteria

- ✅ `pnpm build` completes without warnings/errors
- ✅ `pnpm typecheck` passes with zero errors
- ✅ `pnpm dev` starts and serves on http://localhost:3000
- ✅ No console warnings about hydration mismatches
- ✅ Table renders, sorting works, selection works
- ✅ All types properly imported from `@rowakit/table`

---

## What's Tested

### 1. SSR + Hydration

- Initial HTML generated on server includes table markup
- Client hydrates without mismatch warnings
- Interactive features (sorting, selection) work post-hydration

### 2. Data Fetching

- Fetcher function simulates API call with 500ms delay
- Pagination: `page` and `pageSize` work correctly
- Sorting: Single sort and multi-sort (Ctrl/Cmd+Click)
- Returns proper `{ items: T[], total: number }` format

### 3. Client-Side Features

- Row selection toggles individual and page-level select
- Bulk actions (delete) trigger with selected row keys
- Sorting updates table without page reload
- URL state syncs with table state (pagination, sorting)

### 4. TypeScript

- Fetcher typed as `Fetcher<User>`
- Columns use full type inference (`col.text<User>(...)`)
- BulkActionDef properly typed
- No `any` types in component code

---

## Expected Output

When running `pnpm dev`:

```
 ▲ Next.js 14.1.0
 - Local:        http://localhost:3000
 - Environments: .env.local

 ✓ Ready in 1500ms
```

Navigate to http://localhost:3000 and verify:

1. **Table renders** with 20 users per page
2. **Column headers are clickable** for sorting
3. **Pagination controls work** (prev/next buttons)
4. **Row selection checkbox** appears on hover/focus
5. **Ctrl+Click on column headers** enables multi-sort
6. **No console errors** about hydration or missing modules

---

## Build Artifacts

```
.next/              ← Next.js build output
├── server/
├── static/
└── ...
```

Production build can be started with:

```bash
pnpm build
pnpm start
```

---

## CI Integration

This consumer is validated in CI by:

```bash
pnpm --filter @rowakit/consumer-smoke-next build
```

If this step fails, RowaKit has a breaking change or incompatibility with Next.js.

---

## Debugging

### Hydration Mismatch Errors

If you see: `Hydration failed because the initial UI does not match what was rendered on the server.`

**Cause:** Likely that server and client render different HTML.

**Fix:** Check that:
1. All stateful logic is in `table.tsx` (client component)
2. `page.tsx` is purely server-side
3. No dynamic renders based on `typeof window`

### Build Failures

If `pnpm build` fails:

```bash
# Check TypeScript
pnpm typecheck

# Clean Next.js cache
rm -rf .next

# Try again
pnpm build
```

### Type Errors

If TypeScript complains about `@rowakit/table`:

```bash
# Ensure monorepo is built
cd ../../..
pnpm build

# Then typecheck consumer
cd packages/consumer-smoke-next
pnpm typecheck
```

---

## Performance Notes

- **Initial render:** Uses server-side rendering (fast)
- **Fetcher calls:** Simulated with 500ms delay (realistic)
- **Bundle size:** Next.js auto-code-splits, RowaKit lazy-loads
- **Hydration:** Fast because table data is minimal (first 20 rows)

---

## Further Reading

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Next.js Server vs Client Components](https://nextjs.org/docs/getting-started/react-essentials)
- [@rowakit/table Quick Start](../../docs/quickstart.md)
- [@rowakit/table README](../table/README.md)

---

**Status:** ✅ Ready for validation  
**Last Updated:** January 2026  
**Maintained By:** RowaKit Contributors
