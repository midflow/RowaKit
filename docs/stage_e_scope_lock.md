# Stage E – Scope Lock (v0.5.0)

> **Project:** RowaKit  
> **Stage:** E – Workflow & Extensibility  
> **Target version:** 0.5.0

---

## 🎯 Stage E Intent

Stage E is a **contractual stage**.
Its purpose is to:
- Complete core **business workflows**
- Reduce architectural risk before API freeze
- Prepare RowaKit for **1.0.0 readiness & commercialization**

This scope lock is **strict** and must be respected by both humans and AI Agents.

---

## ✅ IN SCOPE (ALLOWED)

### Core Features
- Row selection (page-scoped)
- Bulk actions based on selection
- Export CSV (server-triggered)

### Engineering & Quality
- Internal refactor (hooks/modules)
- Test coverage improvements
- Repo hygiene & documentation fixes
- Accessibility baseline (A11y)

### Versioning
- Target release: **0.5.0**
- No public API breaking changes

---

## ❌ OUT OF SCOPE (FORBIDDEN)

### Feature Expansion
- Virtual scrolling
- Infinite scrolling
- Cross-page selection
- Shift / range selection
- Data-grid–level features

### API & UX
- Breaking changes to public APIs
- New theming or design systems
- UI redesign beyond required components

### Platform
- Backend implementations
- SaaS or hosted services

---

## 🔒 Scope Enforcement Rules

1. **If a feature is not explicitly listed in IN SCOPE → it is OUT OF SCOPE**
2. No exceptions without starting a new Stage
3. Stability > features
4. Backward compatibility is mandatory

---

## 📌 Architect Note

Stage E is the **last flexible stage** before API freeze.
After this stage:
- API contracts are expected to stabilize
- Only additive changes allowed before 1.0.0
- Commercial extensions can safely diverge

