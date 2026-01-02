# Release Checklist

> This document outlines the manual steps required to publish a new version of `@rowakit/table` to npm.

---

## Pre-Release Verification
- Confirm repository state: branch is up-to-date and CI is green for the release branch.
- Confirm `packages/table/package.json` version matches intended release and `CHANGELOG.md` entry exists.
- Run tests and build locally:

```bash
pnpm install
pnpm -w test
pnpm -w build
```

- Verify `LICENSE` exists at repository root and `package.json.license` is set to `MIT`.
- Confirm `packages/table/package.json` `files` whitelist contains only intended assets (e.g., `dist`, `src/styles`).
- Ensure no sensitive files are committed (check for `.npmrc`, `.env`, or private keys in the repo).

## Build and package inspection
1. Build the package:

```bash
cd packages/table
pnpm build
```

2. Review what will be published:

```bash
npm pack --dry-run
```

3. Optionally create a tarball and inspect contents:

```bash
npm pack
tar -tf @rowakit-table-0.1.0.tgz
```

## Publishing
- Ensure authentication and registry:

```bash
npm whoami
npm config get registry
```

- If publishing a scoped package, ensure the npm organization or user scope exists and you have publish permissions.
- Publish (scoped packages require `--access public` on first publish):

```bash
npm publish --access public
```

## Post-publish steps
- Verify the package is visible on npm and installable:

```bash
npm view @rowakit/table version
npm install @rowakit/table
```

- Create a Git tag and GitHub Release using changelog notes:

```bash
git tag vX.Y.Z
git push origin vX.Y.Z
```

- Update repository milestones and announce the release as appropriate.

## Rollback and emergency notes
- Prefer `npm deprecate` over unpublishing for published versions. Unpublishing has constraints and is discouraged.

## Helpful commands

```bash
# Show what would be published
npm pack --dry-run

# Check package owners
npm owner ls @rowakit/table
```

---

Keep this checklist up to date as the release process evolves.

**Last Updated:** 2024-12-31
**Release Authority:** Maintainers only
ls -la dist/
