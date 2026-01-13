# RowaKit Documentation Index

This guide helps you navigate RowaKit documentation by audience and purpose.

---

## 📖 User Documentation

**For developers using RowaKit in their applications.**

- **[API_STABILITY.md](docs/API_STABILITY.md)** — API stability policy for v1.0.0 and beyond
- **[API_FREEZE_SUMMARY.md](docs/API_FREEZE_SUMMARY.md)** — Changes frozen for v1.0.0 release
- **[ROADMAP.md](docs/ROADMAP.md)** — Feature roadmap and release timeline

---

## 🔬 Release & Governance (v1.0.0)

**For understanding the v1.0.0 release decision and validation.**

- **[V1_0_0_FINAL_GO_NO_GO_REPORT.md](docs/V1_0_0_FINAL_GO_NO_GO_REPORT.md)** — Canonical GO decision (final authority)
- **[V1_0_0_RELEASE_DECISION.md](docs/V1_0_0_RELEASE_DECISION.md)** — Executive summary of v1.0.0 readiness
- **[PRODUCTION_LIKE_VALIDATION.md](docs/PRODUCTION_LIKE_VALIDATION.md)** — Test evidence and validation results (308 tests passing)
- **[CONSUMER_COMPAT_MATRIX.md](docs/CONSUMER_COMPAT_MATRIX.md)** — Consumer package compatibility validation

---

## 🛠 Contributor & Developer Guides

**For contributing to RowaKit.**

- **[README.md](README.md)** — Quick start and development setup
- **[CONTRIBUTING.md](CONTRIBUTING.md)** — Contribution guidelines
- **[CHANGELOG.md](CHANGELOG.md)** — Version history and breaking changes
- **[SECURITY.md](SECURITY.md)** — Security policy and vulnerability disclosure
- **[RELEASE_TEMPLATE.md](RELEASE_TEMPLATE.md)** — Release checklist template

---

## 📚 Internal & Maintainer Docs

**For project maintainers and internal reference (archive).**

Located in [docs/_internal/archive/](docs/_internal/archive/):

- Investigation reports (debugging sessions, root cause analysis)
- Test artifacts and isolation studies
- Implementation checklists and state analysis
- Historical release notes (v0.x)
- Workflow backups and CI/CD documentation

---

## Package Documentation

### @rowakit/table

- **Installation & API**: See [README.md](README.md) → Installation & Quick Start
- **TypeScript types**: `packages/table/src/types.ts`
- **API reference**: Code comments in `packages/table/src/index.ts`

### @rowakit/demo

- **Live playground**: CodeSandbox integration in README
- **Local development**: `pnpm dev` (starts dev server on port 3000)
- **UI harness tests**: `pnpm demo:harness` (opt-in, requires `ROWAKIT_DEBUG_HARNESS=1`)

### @rowakit/consumer-smoke-vite

- **Consumer test package**: `packages/consumer-smoke-vite/`
- **Purpose**: Validates @rowakit/table works in external projects
- **Run**: `pnpm demo:smoke-vite`

---

## Quick Navigation

| Task | Document |
|------|----------|
| I want to use RowaKit | [README.md](README.md) |
| I want to contribute | [CONTRIBUTING.md](CONTRIBUTING.md) |
| I need the roadmap | [docs/ROADMAP.md](docs/ROADMAP.md) |
| I need API guarantees | [docs/API_STABILITY.md](docs/API_STABILITY.md) |
| I need release justification | [docs/V1_0_0_FINAL_GO_NO_GO_REPORT.md](docs/V1_0_0_FINAL_GO_NO_GO_REPORT.md) |
| I need test results | [docs/PRODUCTION_LIKE_VALIDATION.md](docs/PRODUCTION_LIKE_VALIDATION.md) |
| I need to file a security issue | [SECURITY.md](SECURITY.md) |
| I need historical context | [docs/_internal/archive/](docs/_internal/archive/) |

---

## Directory Map

```
root/
├── README.md                    ← Start here
├── DOCUMENTATION_INDEX.md       ← You are here
├── CONTRIBUTING.md
├── CHANGELOG.md
├── SECURITY.md
├── LICENSE
├── RELEASE_TEMPLATE.md
├── .github/
│   └── workflows/               (CI/CD)
├── packages/
│   ├── table/                   (@rowakit/table main package)
│   ├── demo/                    (Live playground)
│   └── consumer-smoke-vite/     (Consumer validation)
└── docs/
    ├── *.md                     (User-facing docs)
    ├── ROADMAP.md
    ├── API_STABILITY.md
    ├── V1_0_0_*.md             (Release governance)
    └── _internal/
        ├── archive/             (Investigation, analysis, historical docs)
        ├── workflows/           (Workflow backups)
        └── milestones/          (Version-specific planning)
```

---

## Development Commands

```bash
# Setup
pnpm install

# Testing
pnpm test                        # Run unit tests (246 tests)
ROWAKIT_DEBUG_HARNESS=1 pnpm demo:harness  # UI tests (62 tests, opt-in)
pnpm demo:smoke-vite            # Consumer package test

# Development
pnpm dev                         # Start dev server
pnpm build                       # Build all packages
pnpm lint                        # Lint code
pnpm format                      # Format code with Prettier
```

---

**Last Updated**: Post-1.0.0 Release (v1.1 Planning)  
**Package Manager**: pnpm (official)  
**TypeScript**: Strict mode required

