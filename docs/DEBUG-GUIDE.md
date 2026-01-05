# RowaKit Demo Gallery - Debugging Guide

## Current Status

Dev server is running on: **http://localhost:5173/**

## How to Test the Fixes

### Step 1: Check Version Display
1. Open browser to http://localhost:5173/
2. Look at **left sidebar header**
3. **Expected**: `RowaKit Demo Gallery` with `v0.1.0 • Progressive Demos` below it
4. **Should NOT contain**: "Stage D" or any word "Stage"

### Step 2: Check Browser Console for Debug Logs
1. Press `F12` to open Developer Tools
2. Click **Console** tab
3. **Expected logs to see**:
   - `[Version] VITE_APP_VERSION env: 0.1.0`
   - `[Version] APP_VERSION: 0.1.0`
   - `[AppShell] APP_VERSION: 0.1.0`
   - `[AppShell] currentDemo: Basic Table`

### Step 3: Check Column Sizing Demo
1. Click **"Column Sizing"** in sidebar (under ADVANCED section)
2. Should see a table with columns: **Metric, Q1, Q2, Q3, Q4, Total**
3. Data should show: Revenue, Users, Engagement rows with quarterly numbers
4. Click **Notes** tab
5. **Expected content**:
   - Should show "Column Sizing & Formatting Patterns"
   - Should NOT mention "Column Resizing" or "resizable: true"
   - Should show patterns about number formatting and alignment

### Step 4: Test Advanced Query Patterns Routing
1. Look at browser console to clear it first
2. Click **"Advanced Query Patterns"** in sidebar (under ADVANCED section)
3. **Expected console logs**:
   - `[Select] Demo selected: 08-advanced-query advanced-query`
   - `[Select] Hash set to: advanced-query`
   - `[Route] Hash: advanced-query Slug: advanced-query`
   - `[Route] Demo found: 08-advanced-query Advanced Query Patterns`
4. **Expected UI change**:
   - Main content should change to show Advanced Query Patterns demo
   - URL should show `#advanced-query`
   - Sidebar button for "Advanced Query Patterns" should be highlighted
5. **Should NOT jump back to Basic Table**

### Step 5: Test Navigation Between Demos
1. Click different demos from sidebar
2. Each one should:
   - Update URL hash to correct slug
   - Highlight the active nav item
   - Display correct demo content
   - Show correct title and description

### Step 6: All Menu Items
Verify all 8 demos are visible:

**GETTING STARTED (3)**
- Basic Table
- Columns & Formatting
- Row Actions

**REAL-WORLD EXAMPLES (3)**
- Server-side Filters
- URL Synchronization
- Saved Views

**ADVANCED (2)**
- Column Sizing
- Advanced Query Patterns

## Files Modified to Fix Issues

### Issue #1: npx vite command not working
- **Solution**: Use `pnpm dev` instead
- **File**: package.json already has "dev" script

### Issue #2: Column Sizing demo had wrong content
- **Fixed**: packages/demo/src/demos/07-column-resize/meta.ts
- **Changes**: Rewrote to match actual demo (column sizing, not resizing)

### Issue #3: Advanced Query Patterns causes routing issue
- **Investigating**: Added console.log statements to track routing
- **Expected**: Hash should change to #advanced-query when clicked

### Issue #4: Version header incorrect
- **Fixed**: packages/demo/vite.config.ts
- **Changes**: Proper ES module path resolution using fileURLToPath

## Console Logs to Watch For

When opening http://localhost:5173/:
```
[Version] VITE_APP_VERSION env: 0.1.0
[Version] APP_VERSION: 0.1.0
[AppShell] APP_VERSION: 0.1.0
[AppShell] currentDemo: Basic Table
[Route] Hash:  Slug: basic-usage
[Route] Demo found: 01-basic Basic Table
```

When clicking Advanced Query Patterns:
```
[Select] Demo selected: 08-advanced-query advanced-query
[Select] Hash set to: advanced-query
[Route] Hash: advanced-query Slug: advanced-query
[Route] Demo found: 08-advanced-query Advanced Query Patterns
```

## Troubleshooting

### If version shows as "undefined" or "0.1.0" not injected:
1. Hard refresh browser: `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)
2. Check vite.config.ts is using proper path resolution
3. Check console for version injection logs

### If routing to Advanced Query Patterns fails:
1. Check console for `[Select]` and `[Route]` logs
2. Verify slug is "advanced-query" (not "advanced-query-patterns")
3. Check getDemoBySlug returns correct demo

### If Column Sizing content is still wrong:
1. Hard refresh to clear cache
2. Check meta.ts file has been updated
3. Verify demo folder is 07-column-resize

## Next Steps for User

1. Run `pnpm dev` in packages/demo folder
2. Open http://localhost:5173/ in browser
3. Press F12 for developer console
4. Test steps 1-6 above
5. Report any remaining issues with console log outputs

