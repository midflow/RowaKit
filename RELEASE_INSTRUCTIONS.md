# Release Instructions for v0.3.0

## Step 1: Commit Changes

```bash
cd c:\Working\Projects\Trung\RowaKit

# Stage all changes
git add -A

# Create commit
git commit -m "feat(stage-c): Column resizing, saved views, and URL sync (v0.3.0)

BREAKING CHANGE: None. All Stage C features are opt-in.

Features:
- C-01: Column resizing with RAF throttle, auto-fit, improved hitbox
- C-02: Saved views with localStorage persistence  
- C-02: URL state sync for page, filters, sort, columnWidths
- C-03: Number range filters with optional filterTransform

Improvements:
- Use requestAnimationFrame throttle for smooth resize
- Double-click to auto-fit column to content width
- Improve resize handle: 12px hitbox, 1px visible line
- Prevent text selection during drag
- Fix truncated header clipping resize handle
- Add data-col-id attributes for content measurement
- Simplified drag logic with 100px fallback

Based on code review: docs/_internal/review.md"
```

## Step 2: Create Git Tag

```bash
# Create annotated tag
git tag -a v0.3.0 -m "Release v0.3.0 - Stage C Complete

Stage C features:
✅ C-01: Column Resizing (MVP) - Drag handles, min/max, double-click auto-fit
✅ C-02: Saved Views - localStorage persistence + URL state sync
✅ C-03: Number Range Filters - Min/max with optional filterTransform

All features opt-in and backward compatible.
Build outputs: ESM 32KB, CJS 33KB, Types 16KB

See RELEASE_v0.3.0.md for complete details."

# Verify tag was created
git tag -l | grep v0.3
```

## Step 3: Push to GitHub

```bash
# Push commit and tags
git push origin feat/stageC
git push origin v0.3.0

# Or push all tags at once
git push origin --tags
```

## Step 4: Create GitHub Release

Go to: https://github.com/[owner]/RowaKit/releases/new

**Tag version:** v0.3.0  
**Release title:** Release v0.3.0 - Stage C Complete

**Description:**
```markdown
# RowaKit Table v0.3.0 - Stage C Complete

## 🎉 What's New

### C-01: Column Resizing with Advanced UX
- **Auto-width by default** - No need to set fixed width
- **Smooth drag resize** - RAF throttling for 60fps performance
- **Double-click auto-fit** - Fit to content width automatically
- **Large hitbox** - 12px invisible zone for easy dragging
- **Prevent text selection** - Seamless drag experience
- **Min/max constraints** - Configurable limits (default min 80px, max 600px)

### C-02: Saved Views + URL State Sync
- **URL Sync** - Automatic sync of page, sort, filters, columnWidths
- **Saved Views** - Save/load/delete table state via localStorage
- **Share URLs** - Copy URL to share exact table configuration
- **Browser history** - Back/forward buttons restore state

### C-03: Number Range Filters
- **Min/Max inputs** - Two inputs for range filtering
- **Optional transform** - Convert values before sending to server
- **Server-side** - All filtering in backend
- **Example:** Percentage conversion (15% ↔ 0.15 fraction)

## 🚀 Performance Improvements
- ✅ RAF throttling eliminates re-render spam during resize
- ✅ Improved hitbox (12px vs 4px) reduces mis-clicks
- ✅ Only measures visible rows for auto-fit (not entire dataset)
- ✅ Zero impact on existing features (opt-in only)

## 📝 Breaking Changes
**None.** All Stage C features are opt-in:
- `enableColumnResizing?: boolean` (default: false)
- `syncToUrl?: boolean` (default: false)
- `enableSavedViews?: boolean` (default: false)

## 📦 Package Info
- **Version:** 0.3.0
- **NPM:** @rowakit/table@0.3.0
- **Build:**
  - ESM: 32KB
  - CJS: 33KB
  - Types: 16KB
  - Gzipped: ~10KB
- **Tests:** 193/193 passing
- **Browser Support:** All modern browsers (React 18+)

## 🔄 Migration
No migration needed. Just update the version:
```bash
npm install @rowakit/table@0.3.0
```

Then optionally enable new features:
```tsx
<RowaKitTable
  fetcher={fetchData}
  columns={columns}
  enableColumnResizing={true}  // NEW
  syncToUrl={true}              // NEW
  enableSavedViews={true}       // NEW
/>
```

## 📚 Documentation
- [CHANGELOG](./CHANGELOG.md) - Detailed changes
- [README](./packages/table/README.md) - Usage guide
- [RELEASE_v0.3.0.md](./RELEASE_v0.3.0.md) - Complete release notes

## ✅ Testing
All features thoroughly tested:
- ✅ Column resize (drag, double-click, constraints)
- ✅ URL sync (page reload, back/forward)
- ✅ Saved views (save/load/delete)
- ✅ Range filters (min/max, transform)
- ✅ All column types (text, date, boolean, badge, number, custom)

## 🙏 Thanks
Implementation based on professional code review with focus on:
- Performance (RAF throttling, smart defaults)
- UX (larger hitbox, double-click auto-fit, text selection prevention)
- Code quality (proper refs, type safety, semantic HTML)

---

**Ready for production!** 🎊
```

**Release type:** Release  
**Set as latest release:** Yes

## Step 5: Publish to NPM (if applicable)

```bash
cd c:\Working\Projects\Trung\RowaKit\packages\table

# Check version in package.json (should be 0.3.0)
cat package.json | grep '"version"'

# Publish to NPM
npm publish --access public

# Verify published
npm view @rowakit/table versions
```

## Step 6: Verify Release

```bash
# Check tag was pushed
git ls-remote --tags origin | grep v0.3.0

# Check GitHub release was created
# Visit: https://github.com/[owner]/RowaKit/releases/tag/v0.3.0

# Check NPM package
# Visit: https://www.npmjs.com/package/@rowakit/table
```

## Done! 🎉

Your v0.3.0 release is now:
- ✅ Tagged in git
- ✅ Pushed to GitHub
- ✅ Visible in GitHub Releases
- ✅ Published on NPM (if applicable)
- ✅ Ready for users to install

## Optional: Create PR for Documentation

```bash
# Switch to main branch
git checkout main

# Create docs branch
git checkout -b docs/update-for-v0.3.0

# Update docs if needed
# Then create PR for review
git push origin docs/update-for-v0.3.0
```

---

**Questions?** Check [RELEASE_v0.3.0.md](./RELEASE_v0.3.0.md) for complete details.
