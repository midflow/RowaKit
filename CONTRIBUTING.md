# Contributing to RowaKit

Thank you for your interest in contributing to RowaKit! 🎉

## Before You Start

**Important:** RowaKit is an **opinionated, server-side-first table library**. We follow a strict scope lock:

✅ **We welcome:**
- Bug fixes
- Performance improvements
- Documentation improvements
- Stage B features (when we're ready): badges, number formatting, basic filters
- Tests and type improvements

❌ **We will reject:**
- Features that turn RowaKit into a generic data grid (virtualization, grouping, pivot, spreadsheet editing)
- Client-side data engines
- Over-engineering that conflicts with our "core small + escape hatch" philosophy

Please read [docs/DECISIONS_SCOPE_LOCK.md](docs/DECISIONS_SCOPE_LOCK.md) to understand our design philosophy.

## Development Workflow

### 1. Setup

```bash
# Clone the repo
git clone https://github.com/Midflow/rowakit.git
cd rowakit

# Install dependencies (we use pnpm)
pnpm install

# Run tests
pnpm test

# Build packages
pnpm build
```

### 2. Making Changes

1. **Fork** the repository
2. **Create a branch**: `git checkout -b fix/issue-123` or `feat/stage-b-badges`
3. **Make your changes** following our coding standards (see `packages/table/CONTRIBUTING.md`)
4. **Add tests** for new functionality
5. **Run tests**: `pnpm test`
6. **Lint**: `pnpm lint` (if available)
7. **Build**: `pnpm build`
8. **Commit** with clear messages: `fix: resolve pagination edge case`

### 3. Submitting a Pull Request

- Fill out the PR template completely
- Check all boxes (scope guard, tests, docs)
- Link related issues
- Ensure CI passes

### How to open a PR

1. Fork the repository and create a descriptive branch name:

```bash
git checkout -b feat/<short-description>  # or fix/<issue-number>
```

2. Make incremental, focused commits with clear messages (one logical change per commit).

3. Run the full validation locally before pushing:

```bash
pnpm install
pnpm -w -r lint --if-present
pnpm -w -r test --if-present
pnpm -w -r build --if-present
```

4. Push your branch to your fork and open a Pull Request against `main` on the upstream repository.

5. In the PR description:
- Describe the problem and the proposed change.
- Include reproduction steps or a minimal example if applicable.
- List which tests were added/updated and any manual verification steps.
- Reference related issues (e.g., `Closes #123`).

6. Confirm the PR checklist:
- PR template completed and scope-guard checked.
- Tests pass and CI is green.
- Documentation updated if the API changed.

7. Address review feedback promptly and squash/rebase as requested by maintainers.

8. Once approved, a maintainer will merge and create a release if appropriate.

## Code Style

- Follow the existing code style
- TypeScript strict mode
- Prefer composition over inheritance
- Keep components small and focused
- Use `col.custom()` for one-offs rather than adding new column types

## Testing

- Write tests for all new features
- Update tests when fixing bugs
- Use `vitest` and `@testing-library/react`
- See `packages/table/src/components/*.test.tsx` for examples

## Documentation

- Update README if API changes
- Add JSDoc comments for public APIs
- Update examples if behavior changes
- Keep docs concise

## Questions?

- Open a [Discussion](https://github.com/Midflow/rowakit/discussions)
- File an issue using the "question" template

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold this code.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
