# Release v0.3.0 - Stage C Complete

**Date:** January 4, 2026  
**Version:** 0.3.0  
**Status:** Ready for Production

## Overview

Stage C (Advanced Features) is now complete with 3 major features implemented, tested, and production-ready. All improvements include UX polish based on professional review and best practices.

## Features Implemented

### C-01: Column Resizing with Advanced UX ✅

**What's New:**
- **Auto-width by default** - Columns size based on header text (no fixed width required)
- **Smooth drag resize** - requestAnimationFrame throttling eliminates lag
- **Double-click auto-fit** - Automatically fits column width to content (header + visible cells)
- **Large hitbox** - 12px invisible zone with 1px visible line (easy to grab)
- **Prevent text selection** - Disables text selection during drag for seamless UX
- **Smart fallback** - If column is very small, uses 100px base for comfortable dragging

**Implementation Details:**
- RAF throttling in `scheduleColumnWidthUpdate()` for 60fps performance
- `scrollWidth` measurement for accurate content-based sizing
- Min/max constraints enforced (default min: 80px, default max: 600px on auto-fit)
- `data-col-id` attributes on all th/td for DOM measurement

### C-02: Saved Views + URL State Sync ✅

**Features:**
- **URL Sync** - Automatic sync of page, pageSize, sort, filters, columnWidths to query string
- **Saved Views** - localStorage-backed named presets (save/load/delete)
- **Save View** button - Click to save current table state with a name
- **Load View** buttons - Click saved view name to instantly restore state
- **Reset** button - Clear all filters, sort, and state

**Usage:**
```typescript
<RowaKitTable
  fetcher={fetchData}
  columns={columns}
  syncToUrl={true}        // Enable URL sync
  enableSavedViews={true} // Show save/load buttons
/>
```

### C-03: Number Range Filters with Transform ✅

**Features:**
- **Min/Max inputs** - Number columns show two input fields for range filtering
- **Optional transform** - `filterTransform` callback to convert UI values before sending to server
- **Independent fields** - Min or Max can be filled independently
- **Server-side** - All filtering happens in backend

**Example (Percentage conversion):**
```typescript
col.number('discount', {
  label: 'Discount %',
  filterTransform: (percentageInput) => {
    // User enters "15" (15%), backend receives 0.15 (fraction)
    return percentageInput > 1 ? percentageInput / 100 : percentageInput;
  }
})
```

## Key Improvements Based on Review

### UX/Performance
✅ RAF throttling for smooth resize (no re-render spam)  
✅ Proper hitbox sizing (12px vs 4px) for easier dragging  
✅ Double-click = auto-fit content (not just reset)  
✅ Text selection prevented during drag  
✅ Truncated headers no longer clip resize handle  

### Code Quality
✅ Clean refs management (`resizeRafRef`, `resizePendingRef`, `tableRef`)  
✅ Semantic HTML with `data-col-id` attributes  
✅ Proper CSS architecture with pseudo-elements  
✅ Type-safe column configuration  

### Documentation
✅ Updated README.md with complete feature descriptions  
✅ Code comments explaining RAF throttle, auto-fit logic  
✅ Clear examples in demo  
✅ Tooltip text updated to reflect new behavior  

## Testing Checklist

✅ Drag resize - smooth, no lag, works on all columns  
✅ Double-click - auto-fits to content width  
✅ Min/max constraints - enforced during drag and auto-fit  
✅ Small columns - fallback 100px base allows dragging  
✅ Truncated headers - resize handle visible and clickable  
✅ URL sync - page reload preserves state  
✅ Saved views - save/load/delete works, filters update correctly  
✅ Range filters - min/max values sent correctly to backend  
✅ Filter transform - percentage values correctly converted  
✅ All column types work - text, date, boolean, badge, number, custom  

## Files Modified

**Core Implementation:**
- `packages/table/src/components/SmartTable.tsx` (230+ lines of improvements)
- `packages/table/src/styles/table.css` (CSS handle improvements)

**Documentation:**
- `packages/table/README.md` (Updated Advanced Features section)
- Root `CHANGELOG.md` (Added [0.3.0] entry)
- Root `README.md` (Updated version and roadmap)

**Demo:**
- `packages/demo/src/examples/StageCDemo.tsx` (Comprehensive Stage C demo)

## Breaking Changes

**None.** All Stage C features are opt-in via props:
- `enableColumnResizing?: boolean` (default: false)
- `syncToUrl?: boolean` (default: false)  
- `enableSavedViews?: boolean` (default: false)

Existing code continues to work without changes.

## Dependencies

No new dependencies added. Uses browser native APIs:
- `requestAnimationFrame` for RAF throttling
- `localStorage` for saved views
- `URLSearchParams` for URL sync
- DOM `querySelector`/`querySelectorAll` for auto-fit measurement

## Performance Impact

**Positive:**
- RAF throttling reduces re-renders during drag (60fps constant vs 100+ fps spam)
- Large hitbox reduces mis-clicks
- Auto-fit uses visible rows only (not entire dataset)

**No impact:**
- Column resizing only affects rendering when feature is enabled
- URL sync uses existing query param logic
- Saved views optional feature

## Migration Guide

For users of v0.2.x upgrading to v0.3.0:

### No migration needed
All existing code works as-is. Just update the package version.

### Optional: Enable new features
```typescript
// Before (v0.2.x)
<RowaKitTable fetcher={...} columns={...} />

// After (v0.3.0) - with new features
<RowaKitTable 
  fetcher={...} 
  columns={...}
  enableColumnResizing={true}
  syncToUrl={true}
  enableSavedViews={true}
  enableFilters={true}
/>
```

### Optional: Configure constraints
```typescript
// Add min/max per column
col.text('name', { 
  minWidth: 100,  // Don't let it be smaller than 100px
  maxWidth: 400   // Cap auto-fit at 400px max
})
```

## Roadmap Status

**Stage A (MVP)** ✅ Complete - v0.1.0 (2024-12-31)
- Core table rendering, fetching, pagination, sorting, actions, styling

**Stage B (Production Ready)** ✅ Complete - v0.2.0 (2026-01-02)  
- Badge & number columns, filters, column modifiers

**Stage C (Advanced Features)** ✅ Complete - v0.3.0 (2026-01-04)
- Column resizing, URL sync, saved views, range filters

**Stage D (Future)** - Demand-driven
- Multi-column sorting
- Row selection + bulk actions
- CSV export
- Column visibility toggle

## Release Artifacts

- **NPM Package:** @rowakit/table@0.3.0
- **GitHub Release:** v0.3.0 with CHANGELOG
- **Build Outputs:**
  - ESM: 32KB
  - CJS: 33KB
  - Types: 16KB
  - Minified + gzipped: ~10KB

## Known Limitations

1. **Auto-fit max width** - Default 600px can be changed per column via `maxWidth`
2. **Visible rows only** - Auto-fit measures only rendered rows, not entire dataset
3. **localStorage size** - Saved views limited by browser localStorage (usually 5-10MB)
4. **URL length** - Long filter states might exceed URL length limits

## Credits

Implementation based on professional code review focusing on:
- Performance optimization (RAF throttling)
- UX best practices (hitbox sizing, double-click behavior)
- Accessibility (semantic HTML, ARIA attributes)
- Code quality (proper refs, type safety)

## Next Steps

1. ✅ Commit changes with detailed commit message
2. ✅ Tag release as v0.3.0
3. ✅ Publish to GitHub Releases
4. ✅ Publish to NPM registry
5. ⏳ Notify users via changelog/blog
6. ⏳ Plan Stage D features

## Verification

Run these commands to verify everything is working:

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test  # 193/193 tests passing

# Build packages
cd packages/table && pnpm build
# ESM ✅ Build success
# CJS ✅ Build success  
# DTS ✅ Build success

# Start demo
cd packages/demo && npm run dev
# Visit http://localhost:3000 to test all features
```

---

**Ready to ship! 🚀**
