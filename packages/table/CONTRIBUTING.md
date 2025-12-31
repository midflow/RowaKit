# Contributing to @rowakit/table

Thank you for your interest in contributing to RowaKit Table! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Project Structure](#project-structure)
- [Testing Guidelines](#testing-guidelines)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Roadmap and Issues](#roadmap-and-issues)

## Code of Conduct

This project follows a professional code of conduct. Be respectful, collaborative, and constructive in all interactions.

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm >= 8

### Setup

1. Clone the repository:
```bash
git clone https://github.com/rowakit/table.git
cd table
```

2. Install dependencies:
```bash
pnpm install
```

3. Run tests:
```bash
pnpm test
```

4. Build the package:
```bash
cd packages/table
pnpm build
```

## Development Workflow

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### Building

```bash
# Build the package
cd packages/table
pnpm build

# The build outputs to dist/:
# - dist/index.js (ESM)
# - dist/index.cjs (CommonJS)
# - dist/index.d.ts (TypeScript definitions)
```

### Linting

```bash
# Run ESLint
pnpm lint

# Fix auto-fixable issues
pnpm lint:fix
```

### Type Checking

```bash
# Run TypeScript compiler check
cd packages/table
pnpm tsc --noEmit
```

## Project Structure

```
packages/table/
├── src/
│   ├── types/           # TypeScript type definitions
│   ├── column-helpers/  # Column helper functions (col.*)
│   ├── components/      # React components
│   │   └── SmartTable.tsx
│   ├── styles/          # CSS files
│   │   ├── tokens.css   # Design tokens
│   │   ├── table.css    # Table styles
│   │   └── index.css    # Entry point
│   └── index.ts         # Public API exports
├── examples/            # Usage examples
├── __tests__/           # Unit tests
├── README.md            # Package documentation
├── CHANGELOG.md         # Version history
└── package.json
```

## Testing Guidelines

### Test Organization

- **Unit tests**: In `src/__tests__/` for types, helpers
- **Component tests**: In `src/components/*.test.tsx` for React components
- **Feature tests**: Grouped by feature (e.g., `SmartTable.sorting.test.tsx`)

### Writing Tests

We use **Vitest** and **React Testing Library**.

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SmartTable } from './SmartTable';
import { col } from '../column-helpers';

describe('SmartTable', () => {
  it('renders table with data', async () => {
    const fetcher = vi.fn(async () => ({
      items: [{ id: '1', name: 'Test' }],
      total: 1,
    }));

    render(
      <SmartTable
        fetcher={fetcher}
        columns={[col.text('name')]}
        rowKey="id"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Test')).toBeDefined();
    });
  });
});
```

### Test Coverage

- Aim for >80% coverage for core logic
- All public APIs must be tested
- Edge cases and error paths should be covered
- Visual/styling tests are optional but appreciated

## Coding Standards

### TypeScript

- Use strict TypeScript (`strict: true`)
- Prefer explicit types over inference for public APIs
- Use generics for reusable components
- Avoid `any` - use `unknown` if type is truly unknown

```tsx
// Good
interface User {
  id: string;
  name: string;
}

function getUser<T extends User>(id: string): Promise<T> {
  // ...
}

// Avoid
function getUser(id: any): any {
  // ...
}
```

### React

- Use functional components with hooks
- Prefer named exports over default exports
- Keep components focused and single-responsibility
- Extract complex logic into custom hooks

```tsx
// Good
export function SmartTable<T>(props: SmartTableProps<T>) {
  const [state, setState] = useState<DataState<T>>({ status: 'loading' });
  // ...
}

// Avoid
export default function Table(props: any) {
  // ...
}
```

### Naming Conventions

- **Components**: PascalCase (`SmartTable.tsx`)
- **Hooks**: camelCase with `use` prefix (`useDataFetching.ts`)
- **Types/Interfaces**: PascalCase (`ColumnDef`, `FetcherQuery`)
- **Functions**: camelCase (`formatDate`, `buildQuery`)
- **Constants**: UPPER_SNAKE_CASE for true constants

### CSS

- Use CSS variables for theming (`--rowakit-*` prefix)
- Mobile-first responsive design
- Avoid inline styles except for dynamic values
- Use semantic class names (`.rowakit-table-header`)

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat(table): add className prop for custom styling

Add optional className prop to SmartTable component to allow
per-instance customization while preserving base styles.

Closes #42
```

```
fix(actions): prevent duplicate action execution

Action handlers were being called multiple times due to event
bubbling. Added event.stopPropagation() to prevent this.

Fixes #56
```

## Pull Request Process

### Before Submitting

1. **Run all checks locally:**
   ```bash
   pnpm test
   pnpm lint
   pnpm build
   ```

2. **Update documentation** if needed:
   - README.md for API changes
   - CHANGELOG.md for user-facing changes
   - Examples if adding new features

3. **Add tests** for new features or bug fixes

### PR Guidelines

- **Title**: Use conventional commit format
- **Description**: 
  - What: Describe the change
  - Why: Explain the motivation
  - How: Summarize the approach
  - Testing: How to test the change
- **Keep it focused**: One feature/fix per PR
- **Small is better**: Easier to review, less likely to introduce bugs

### PR Template

```markdown
## What
Brief description of changes

## Why
Motivation and context

## How
Technical approach and key decisions

## Testing
- [ ] Added unit tests
- [ ] Added component tests
- [ ] Manual testing performed
- [ ] Updated documentation

## Checklist
- [ ] Tests pass (`pnpm test`)
- [ ] Lint passes (`pnpm lint`)
- [ ] Build succeeds (`pnpm build`)
- [ ] CHANGELOG.md updated
- [ ] Documentation updated
```

### Review Process

1. Automated checks must pass (tests, lint, build)
2. At least one maintainer approval required
3. Address review feedback promptly
4. Squash commits before merge (maintainer will handle)

## Roadmap and Issues

### Current Stage: A (MVP 0.1)

See [SMART_TABLE_ROADMAP_ISSUES.md](../../docs/SMART_TABLE_ROADMAP_ISSUES.md) for detailed roadmap.

**Completed (Stage A):**
- ✅ A-01: Monorepo scaffold
- ✅ A-02: Core types
- ✅ A-03: Column helpers
- ✅ A-04: SmartTable rendering
- ✅ A-05: Data fetching state machine
- ✅ A-06: Pagination UI
- ✅ A-07: Single-column sorting
- ✅ A-08: Actions with confirmation
- ✅ A-09: Minimal styling tokens
- ✅ A-10: Documentation & examples

**Next (Stage B - v1.0):**
- Column visibility toggle
- Bulk actions
- Search/filter UI
- Export functionality

### Finding Issues

- Check GitHub Issues for open tasks
- Look for `good first issue` label for beginner-friendly tasks
- Check roadmap document for planned features

### Proposing Features

1. Check if feature aligns with project philosophy (server-side first, minimal API)
2. Open an issue with:
   - Use case and motivation
   - Proposed API design
   - Examples
   - Implementation approach
3. Get feedback before implementing
4. Consider if it fits in Stage B, C, or beyond

## Questions?

- Open an issue for questions
- Tag maintainers for urgent matters
- Check existing documentation first

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License.

---

Thank you for contributing to RowaKit Table! 🎉
