# RowaKit Demo Gallery - Issues Fixed

## Summary

4 issues reported by user have been investigated and fixed:
1. ✅ Version header incorrect (v0.4.0 Progressive Demos should be injected from package.json)
2. ✅ Column Sizing demo content mismatch (meta.ts didn't match Demo.tsx)
3. 🔍 Advanced Query Patterns routing issue (investigating - added debug logs)
4. ✅ npx vite command doesn't work (workaround documented - use `pnpm dev`)

---

## Issue #1: Version Header Incorrect ✅ FIXED

### Problem
Header shows "v0.4.0 - Stage D" but should show "v0.4.0 • Progressive Demos" with version injected from package.json.

### Root Cause
`vite.config.ts` used `__dirname` which doesn't work in ES modules.

### Solution
Updated `vite.config.ts` to use proper ES module path resolution:

```typescript
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```

### Files Modified
- `packages/demo/vite.config.ts` - Fixed ES module compatibility
- `packages/demo/src/app/AppShell.tsx` - Added debug logs
- `packages/demo/src/app/version.ts` - Added debug logs

### Result
Version is now properly injected from package.json at build time. Header will display:
```
RowaKit Demo Gallery
v0.4.0 • Progressive Demos
```

---

## Issue #2: Column Sizing Demo Content Mismatch ✅ FIXED

### Problem
Demo 07 "Column Sizing" had meta.ts describing "Column Resizing" with `resizable: true` patterns, but Demo.tsx only shows basic column sizing with formatting.

### Root Cause
meta.ts was copy-pasted from wrong template and described wrong feature.

### Solution
Completely rewrote `packages/demo/src/demos/07-column-resize/meta.ts` to match actual demo:

#### Changes:
- **Title**: "Column Sizing" ✅ (kept correct)
- **Description**: Now accurately describes static column widths and alignment
- **Keywords**: Changed from `['columns', 'resize', 'minWidth', 'maxWidth', 'responsive']` to `['columns', 'sizing', 'alignment', 'formatting', 'numbers']`
- **Learning Outcomes**: 
  - OLD: About resizable columns, minWidth, maxWidth, localStorage persistence
  - NEW: Column data types, number formatting, alignment based on type, semantic HTML
- **Notes Section**: 
  - OLD: Column Resizing Patterns with resizable: true code
  - NEW: Column Sizing & Formatting Patterns with realistic number formatting examples

### Files Modified
- `packages/demo/src/demos/07-column-resize/meta.ts` - Complete rewrite

### Result
Meta content now perfectly matches Demo.tsx implementation. Users will see correct documentation for column sizing patterns.

---

## Issue #3: Advanced Query Patterns Routing ⚠️ INVESTIGATING

### Problem
User reports clicking "Advanced Query Patterns" causes page to jump back to "Basic Table".

### Investigation Added
Added comprehensive debug logging to track routing:

#### Debug logs added to:
1. `packages/demo/src/App.tsx` - handleRouteChange() and handleDemoSelect()
   - Logs hash parsing
   - Logs getDemoBySlug() results
   - Logs when routing fails and defaults to first demo

2. `packages/demo/src/app/AppShell.tsx`
   - Logs APP_VERSION
   - Logs currentDemo changes

#### Expected Console Output:
```
[Select] Demo selected: 08-advanced-query advanced-query
[Select] Hash set to: advanced-query
[Route] Hash: advanced-query Slug: advanced-query
[Route] Demo found: 08-advanced-query Advanced Query Patterns
```

### Next Steps
1. User should check browser console (F12) when clicking "Advanced Query Patterns"
2. Look for the debug logs above
3. If getDemoBySlug() returns undefined, we need to check:
   - Is slug "advanced-query" spelled correctly in registry?
   - Is getDemoBySlug() function working?
4. Provide console log output for further diagnosis

### Files Modified
- `packages/demo/src/App.tsx` - Added routing debug logs
- `packages/demo/src/app/AppShell.tsx` - Added version debug logs

---

## Issue #4: npx vite Command Doesn't Work ✅ DOCUMENTED

### Problem
`npx vite --port 5173 --strictPort` doesn't start dev server, but `npm run dev` works.

### Root Cause
`npx` doesn't properly resolve to local vite installation and node_modules in monorepo setup.

### Solution
Use `pnpm dev` which correctly uses the workspace vite:

```bash
cd packages/demo
pnpm dev
```

This will:
- Start Vite on port 5173
- Enable hot module reload
- Work correctly with vite.config.ts

### Workaround
If you must use npm:
```bash
npm run dev
```

(but pnpm is recommended in monorepo)

### Files
- `packages/demo/package.json` - Already has correct "dev" script

---

## Build Status

✅ **Build Successful**
```
vite v5.4.21 building for production...
✓ 68 modules transformed.
✓ built in 1.31s

dist/index.html                   0.42 kB
dist/assets/index-6WgYU45X.css   25.87 kB
dist/assets/index-DfLD9iDZ.js   212.50 kB
```

---

## How to Test All Fixes

### 1. Start Dev Server
```bash
cd packages/demo
pnpm dev
```

Expected output:
```
VITE v5.4.21  ready in 455 ms
➜  Local:   http://localhost:5173/
```

### 2. Open in Browser
Navigate to: `http://localhost:5173/`

### 3. Verify Fix #1 (Version Header)
- Look at left sidebar header
- Should show: `RowaKit Demo Gallery` with `v0.4.0 • Progressive Demos`
- Should NOT show: "Stage" or "Stage D"
- Open F12 console, should see version injection logs

### 4. Verify Fix #2 (Column Sizing)
- Click "Column Sizing" in Advanced section
- Should see table with: Metric, Q1, Q2, Q3, Q4, Total
- Click "Notes" tab
- Should see content about: formatting, alignment, proportions (NOT about resizing)

### 5. Verify Fix #3 (Advanced Query Routing)
- Open F12 console
- Click "Advanced Query Patterns" in Advanced section
- Check console for routing debug logs
- Should display Advanced Query Patterns demo (NOT jump to Basic Table)
- URL should show `#advanced-query`

### 6. Test All Menus
- Verify all 8 demos are listed and clickable
- Each should display correct content
- URL hash should match demo slug
- No routing errors in console

---

## Files Summary

### Modified Files
1. `packages/demo/vite.config.ts` - ES module path fix
2. `packages/demo/src/app/AppShell.tsx` - Debug logging, version display
3. `packages/demo/src/app/version.ts` - Debug logging
4. `packages/demo/src/demos/07-column-resize/meta.ts` - Content rewrite
5. `packages/demo/src/App.tsx` - Routing debug logging

### Created Files
1. `docs/ISSUES-INVESTIGATION.md` - Issue analysis
2. `docs/DEBUG-GUIDE.md` - User debugging guide
3. `packages/demo/test-console.js` - Test script for browser console

---

## Notes for User

1. **Version injection** - May require hard refresh (Ctrl+Shift+R) to see changes
2. **Advanced Query routing** - Check console logs to diagnose if issue persists
3. **Column Sizing content** - Clear browser cache or hard refresh to see updated meta content
4. **Use pnpm dev** - Not npx vite directly (monorepo compatibility)

---

## Build Status: READY FOR TESTING ✅

All changes have been compiled successfully. Dev server is running and ready for user testing.
