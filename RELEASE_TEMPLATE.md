# Release Template (RowaKit)

This template is for maintainers preparing a release of **@rowakit/table**.

## 1) Scope & Version

- Target package(s): `@rowakit/table`
- Target version: `x.y.z`
- Release type:
  - Patch: bug fixes only (no breaking changes)
  - Minor: backward-compatible features only
  - Major: breaking changes (requires explicit design + migration)

## 2) Governance (v1.x rules)

- Confirm compliance with:
  - `docs/API_STABILITY.md`
  - `docs/API_FREEZE_SUMMARY.md`
- Public API surface changes:
  - [ ] No public exports removed/renamed (unless MAJOR)
  - [ ] Any deprecations include timeline and alternatives

## 3) Documentation

- [ ] Root `README.md` is accurate
- [ ] `packages/table/README.md` is accurate
- [ ] Root `CHANGELOG.md` updated
- [ ] `packages/table/CHANGELOG.md` updated
- [ ] If applicable: release notes created under `docs/RELEASE_NOTES_vX_Y_Z.md`

## 4) Validation (required)

- [ ] `pnpm test`
- [ ] `pnpm demo:harness`
- [ ] Consumer checks (if applicable):
  - [ ] `pnpm consumer:typecheck`
  - [ ] `pnpm consumer:build`

## 5) Packaging

- [ ] `packages/table/package.json` version matches release
- [ ] `pnpm -C packages/table build` succeeds
- [ ] Package exports verified (entry exports intentional)

## 6) Release Process (manual steps)

- [ ] Create git tag `vX.Y.Z`
- [ ] Publish to npm: `pnpm -C packages/table publish --access public`
- [ ] Attach/retain validation logs (CI artifacts preferred)
