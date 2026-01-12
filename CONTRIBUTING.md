# Contributing to RowaKit

Thank you for your interest in contributing to **RowaKit**!

RowaKit is designed as a **stable, server-side-first table toolkit**. Contributions are welcome, but stability and predictability are the top priorities.

---

## 🎯 Guiding Principles

Before contributing, please keep these principles in mind:

1. **Stability over features**
2. **Server-side-first by design**
3. **No drift into data-grid territory**
4. **Backward compatibility is mandatory**

---

## 🧭 Project Structure

```
root/
  packages/table   # Core library (OSS)
  packages/demo    # Demo & playground (non-stable)
  docs/            # Roadmap, decisions, policies
```

Only `packages/table` is considered part of the stable API surface.

---

## 🔒 API Stability Rules (v1.0.0+)

- Public APIs are frozen starting from v1.0.0
- Breaking changes require a major version bump
- Internal refactors are allowed if behavior is preserved

See:
- `docs/API_STABILITY.md`
- `docs/API_FREEZE_SUMMARY.md`

---

## 🐛 Reporting Bugs

When reporting a bug:

- Use a minimal reproduction
- Specify RowaKit version
- Include expected vs actual behavior
- Screenshots or CodeSandbox links are appreciated

---

## ✨ Proposing Features

RowaKit is **demand-driven**.

Before proposing a feature:

- Check `docs/ROADMAP.md`
- Ensure it aligns with the server-side-first philosophy
- Avoid proposing spreadsheet-style features

Feature requests without real-world demand may be deferred.

---

## 🧩 Pull Requests

### Requirements

- Follow the PR template
- Respect scope locks for the current stage
- Include tests for all new behavior
- Do not break existing APIs

### Review Criteria

PRs are evaluated based on:

- API stability
- Behavioral correctness
- Test coverage
- Long-term maintainability

---

## 🧪 Tests

- All tests must pass
- New features require new tests
- Avoid snapshot-only tests for behavior changes

---

## 📚 Documentation

If your change affects behavior or API:

- Update relevant documentation
- Ensure examples remain correct

---

## 🤝 Code of Conduct

Please be respectful and constructive.

RowaKit values:
- Clear communication
- Thoughtful technical decisions
- Long-term project health

---

## 🙏 Thank You

Every contribution — code, documentation, issues, or feedback — helps make RowaKit better.

