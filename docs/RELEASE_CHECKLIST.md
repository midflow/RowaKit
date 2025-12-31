# Release Checklist

> This document outlines the manual steps required to publish a new version of `@rowakit/table` to npm.

---

## Pre-Release Checklist

### 1. Version Readiness
- [ ] All planned features/fixes completed
- [ ] All tests passing (`pnpm test`)
- [ ] CI green on main branch
- [ ] No open critical bugs
- [ ] CHANGELOG.md updated with version changes

### 2. Code Quality
- [ ] Run `pnpm lint` - no errors
- [ ] Run `pnpm build` - build successful
- [ ] Verify dist outputs exist:
  - `packages/table/dist/index.js` (ESM)
  - `packages/table/dist/index.cjs` (CJS)
  - `packages/table/dist/index.d.ts` (TypeScript definitions)
- [ ] Test package in example app
- [ ] Test package import in fresh React project

### 3. Documentation
- [ ] README.md up to date
- [ ] API changes documented
- [ ] Examples updated (if API changed)
- [ ] CHANGELOG.md follows [Keep a Changelog](https://keepachangelog.com/) format
- [ ] Migration guide written (if breaking changes)

### 4. Metadata
- [ ] `packages/table/package.json` version bumped
- [ ] `packages/table/package.json` has correct:
  - `name: @rowakit/table`
  - `license: MIT`
  - `repository` URL
  - `homepage` URL
  - `bugs` URL
  - `main`, `module`, `types` paths
  - `files` includes `dist/`

---

## Release Steps

### Step 1: Update Version

```bash
cd packages/table

# Bump version (choose one)
npm version patch   # 0.1.0 → 0.1.1 (bug fixes)
npm version minor   # 0.1.0 → 0.2.0 (new features, backward compatible)
npm version major   # 0.1.0 → 1.0.0 (breaking changes)
```

### Step 2: Update CHANGELOG

Edit `CHANGELOG.md` at the root:

```markdown
## [0.1.1] - 2024-12-31

### Fixed
- Fixed pagination bug when total < pageSize
- Fixed sort icon not updating on column click

### Changed
- Improved error messages

### Added
- None
```

### Step 3: Commit & Tag

```bash
# Commit version bump and changelog
git add packages/table/package.json CHANGELOG.md
git commit -m "chore: release v0.1.1"

# Create git tag
git tag v0.1.1

# Push commits and tags
git push origin main
git push origin v0.1.1
```

### Step 4: Build & Publish

```bash
# Navigate to table package
cd packages/table

# Clean and rebuild
rm -rf dist
pnpm build

# Verify build outputs
ls -la dist/

# Dry run (optional - check what will be published)
npm publish --dry-run

# Publish to npm (requires npm login + 2FA)
npm publish --access public
```

### Step 5: Create GitHub Release

1. Go to: https://github.com/<YOUR_USERNAME>/rowakit/releases/new
2. Choose tag: `v0.1.1`
3. Title: `v0.1.1`
4. Description: Copy from CHANGELOG.md
5. Click "Publish release"

### Step 6: Post-Release

- [ ] Verify package on npm: https://www.npmjs.com/package/@rowakit/table
- [ ] Test installing from npm: `npm install @rowakit/table@0.1.1`
- [ ] Update GitHub milestones (close current, create next)
- [ ] Announce on Twitter/LinkedIn/Discord (if applicable)
- [ ] Update documentation site (if exists)

---

## Versioning Strategy

We follow [Semantic Versioning](https://semver.org/):

### Major (x.0.0) - Breaking Changes
- API changes that break existing code
- Removed features
- Changed behavior that requires migration

**Example:** `1.0.0 → 2.0.0`

### Minor (0.x.0) - New Features
- New features (backward compatible)
- New column types
- New props (with defaults)
- Deprecations (not removals)

**Example:** `0.1.0 → 0.2.0`

### Patch (0.0.x) - Bug Fixes
- Bug fixes
- Performance improvements
- Documentation updates
- Internal refactoring

**Example:** `0.1.0 → 0.1.1`

---

## Version Schedule

### 0.x - Beta
- API may have minor breaking changes
- Use for internal apps, but be prepared to update
- Releases as needed (no fixed schedule)

### 1.0 - Stable
- API locked (semver guarantees)
- Breaking changes require 2.0
- Releases when Stage B features complete

### 1.x - Incremental
- Minor versions for new features
- Patch versions for bug fixes
- Aim for monthly minor releases (if changes exist)

---

## Pre-1.0 Breaking Changes

If we need to make breaking changes before 1.0:

1. **Document clearly** in CHANGELOG under `[BREAKING]`
2. **Provide migration guide** in CHANGELOG or separate doc
3. **Bump minor version** (0.1.0 → 0.2.0)
4. **Deprecate old API** first (if possible), remove in next version
5. **Announce in GitHub Discussions** and README

---

## npm Publishing

### First-Time Setup

```bash
# Login to npm (if not already)
npm login

# Verify authentication
npm whoami

# Enable 2FA (highly recommended)
npm profile enable-2fa
```

### Publishing Scoped Package

`@rowakit/table` is a scoped package. First publish requires `--access public`:

```bash
npm publish --access public
```

Subsequent publishes:

```bash
npm publish
```

### Revoking a Release (Emergency)

If you published a broken version:

```bash
# Deprecate the version (shows warning to users)
npm deprecate @rowakit/table@0.1.1 "Broken release, use 0.1.2 instead"

# Unpublish (only within 72 hours, use sparingly)
npm unpublish @rowakit/table@0.1.1
```

**Note:** Unpublishing is discouraged. Prefer deprecating + publishing a fix.

---

## Troubleshooting

### "You do not have permission to publish"
- Run `npm login` and verify credentials
- Check you're a maintainer of the package
- Check 2FA is working

### "Version already exists"
- Bump version in `package.json`
- Check you're not re-publishing the same version

### "Missing files in dist/"
- Run `pnpm build` first
- Check `files` field in `package.json` includes `dist/`

### "CI failing"
- Fix CI first before releasing
- Never release if tests are failing

---

## Automation (Future)

We **do not** currently use automated releases. All releases are manual.

**Future possibilities:**
- GitHub Actions for publish on tag push
- Semantic-release for automatic versioning
- Changesets for monorepo coordination

**For now:** Manual is fine. Keeps releases intentional.

---

## Support

Questions about releases?
- File an issue: https://github.com/<YOUR_USERNAME>/rowakit/issues
- Start a discussion: https://github.com/<YOUR_USERNAME>/rowakit/discussions

---

**Last Updated:** 2024-12-31  
**Release Authority:** Maintainers only
