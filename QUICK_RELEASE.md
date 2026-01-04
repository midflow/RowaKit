# Quick Release Guide - v0.3.0

## TL;DR - Git Commands to Run

```bash
cd c:\Working\Projects\Trung\RowaKit

# 1. Stage and commit
git add -A
git commit -m "feat(stage-c): Column resizing, saved views, URL sync (v0.3.0)

Stage C complete with advanced UX improvements:
- C-01: Column resizing with RAF throttle, auto-fit, improved hitbox
- C-02: Saved views + URL state sync  
- C-03: Number range filters with transform

Features: 193 tests ✅ | Demo working ✅ | Production ready ✅
Breaking changes: None (all opt-in)

See STAGE_C_COMPLETE.md for details."

# 2. Create tag
git tag -a v0.3.0 -m "Release v0.3.0 - Stage C Complete
Stage C advanced features with production-ready UX.
See RELEASE_v0.3.0.md for complete details."

# 3. Verify
git log --oneline -1
git tag -l | grep v0.3

# 4. Push to GitHub
git push origin feat/stageC
git push origin v0.3.0

# Or in one command
git push origin --all --tags
```

## GitHub Release Steps

1. Go to: https://github.com/[owner]/RowaKit/releases/new
2. Select tag: **v0.3.0**
3. Set title: **Release v0.3.0 - Stage C Complete**
4. Paste description from: RELEASE_v0.3.0.md (copy "Release Artifacts" section and up)
5. Click "Publish release"

## Publish to NPM (if needed)

```bash
cd packages/table
npm publish --access public
```

## Verify Everything

```bash
# Check commit
git log --oneline -1

# Check tag
git tag -l v0.3.0

# Check GitHub
# Open: https://github.com/[owner]/RowaKit/releases

# Check NPM (after publishing)
# Open: https://www.npmjs.com/package/@rowakit/table
```

## Files to Reference

- 📄 `RELEASE_v0.3.0.md` - Full release notes  
- 📄 `RELEASE_INSTRUCTIONS.md` - Detailed steps
- 📄 `STAGE_C_COMPLETE.md` - Implementation summary
- 📄 `CHANGELOG.md` - Version history
- 🎬 Demo: http://localhost:3000

## What's Included

✅ **Features:**
- Column resizing (drag, double-click auto-fit)
- Saved views (localStorage + URL sync)
- Number range filters with transform

✅ **Quality:**
- 193 tests passing
- Zero breaking changes
- All features opt-in
- Production-ready UX
- Performance optimized

✅ **Documentation:**
- README updated
- CHANGELOG added
- Release notes complete
- Demo provided

## Status: 🟢 READY TO RELEASE

All code is complete, tested, and ready for GitHub + NPM!
