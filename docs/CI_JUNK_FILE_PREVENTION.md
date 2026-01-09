# CI Junk File Prevention

**Status:** ✅ Implemented in PRD-E6 (v0.5.0)

## Overview

To maintain repository hygiene and prevent editor/merge artifacts from being committed, we enforce a strict policy against junk files in CI.

## Junk File Patterns

The following file extensions are blocked:
- `*.tmp` — Temporary editor files (e.g., VS Code auto-backup)
- `*.backup` — Manual editor backups
- `*.swp~` — vim swap file variants
- `*~` — Emacs backup files

All patterns are listed in `.gitignore` and verified via:

```bash
# Check for junk files before commit
git ls-files | grep -E '\.(tmp|backup|swp~)$|~$'
```

## CI Integration

**Recommended:** Add a pre-commit hook or CI job to reject commits containing junk files:

```bash
# .husky/pre-commit
git diff --cached --name-only | grep -E '\.(tmp|backup|swp~)$|~$' && {
  echo "Error: Junk files detected (*.tmp, *.backup, *.swp~, *~)"
  exit 1
}
```

Or in GitHub Actions:

```yaml
- name: Check for junk files
  run: |
    if git ls-files | grep -E '\.(tmp|backup|swp~)$|~$'; then
      echo "Error: Junk files detected"
      exit 1
    fi
```

## Cleanup Record

**v0.5.0 (PRD-E6):**
- Removed `packages/demo/src/demos/08-advanced-query/Demo.tsx.tmp`
- Removed `packages/demo/src/demos/02-columns-formatting/Demo.tsx.backup`
- Added junk file patterns to `.gitignore`
- Documented CI rule above

## Related

- `.gitignore` — Junk file exclusions
- GitHub/GitLab CI workflows — Enforce pre-commit checks
