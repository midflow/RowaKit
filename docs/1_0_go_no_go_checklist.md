# v1.0.0 GO / NO-GO Checklist

> **Project:** RowaKit  
> **Decision scope:** Release readiness for v1.0.0  
> **Owner:** Maintainers / Core Team

---

## 🎯 Purpose

This checklist defines **objective criteria** to decide whether RowaKit is ready to release **v1.0.0**.

Version **1.0.0** represents:
- API stability guarantee
- Production trust signal
- Long-term support commitment

If any **MANDATORY** item is not satisfied, the release must be **NO-GO**.

---

## 1️⃣ API Stability (MANDATORY)

- [ ] `docs/API_STABILITY.md` exists and is reviewed
- [ ] `docs/API_FREEZE_SUMMARY.md` exists and is reviewed
- [ ] Public APIs are clearly defined and documented
- [ ] Experimental APIs are explicitly labeled
- [ ] No known breaking changes planned for the next MINOR release

**Decision:** GO / NO-GO

---

## 2️⃣ Feature Completeness (MANDATORY)

The following core workflows must be complete:

- [ ] Server-side pagination
- [ ] Server-side sorting
- [ ] Filtering support
- [ ] Column resizing
- [ ] URL sync
- [ ] Saved views
- [ ] Row selection (page-scoped)
- [ ] Bulk actions
- [ ] Export (CSV via exporter)

**Decision:** GO / NO-GO

---

## 3️⃣ Backward Compatibility (MANDATORY)

- [ ] No breaking changes since v0.5.x
- [ ] All new features are opt-in
- [ ] Existing demos run without modification
- [ ] Existing user code compiles without changes

**Decision:** GO / NO-GO

---

## 4️⃣ Code Quality & Architecture

- [ ] No "God components" remaining
- [ ] Internal logic separated into hooks/modules
- [ ] Clear boundary between public and internal code
- [ ] No TODOs indicating architectural risk

**Decision:** GO / NO-GO

---

## 5️⃣ Test Coverage & Reliability (MANDATORY)

- [ ] All tests pass in CI
- [ ] Core behaviors are covered by tests
- [ ] Workflow features (selection, bulk, export) are tested
- [ ] No flaky or skipped tests

**Decision:** GO / NO-GO

---

## 6️⃣ Documentation Readiness (MANDATORY)

- [ ] Root `README.md` is accurate
- [ ] `packages/table/README.md` matches implementation
- [ ] `docs/ROADMAP.md` reflects post-1.0 direction
- [ ] No over-claims in docs (features must match code)

**Decision:** GO / NO-GO

---

## 7️⃣ Demo & Developer Experience

- [ ] Demo builds and runs
- [ ] Demo showcases core workflows
- [ ] No demo-only hacks leaking into the library
- [ ] Getting started is under 5 minutes

**Decision:** GO / NO-GO

---

## 8️⃣ Validation Evidence (MANDATORY)

v1.0.0 requires **strong real-world validation evidence**.

### Option A — Production/Internal Usage (Preferred)
- [ ] At least one real internal/production usage exists
- [ ] Evidence is recorded in `docs/PRODUCTION_USAGE.md`

### Option B — Production-like Evidence (Alternative)
Only allowed if production/internal usage does not exist.

- [ ] `docs/VALIDATION_EVIDENCE_POLICY.md` exists and is accepted by maintainers
- [ ] `docs/PRODUCTION_LIKE_VALIDATION.md` exists with **PASS**
- [ ] `docs/CONSUMER_COMPAT_MATRIX.md` exists with **PASS**
- [ ] CI runs harness + consumer checks successfully

> If Option A is not satisfied, Option B must be fully satisfied.

**Decision:** GO / NO-GO

---

## 🏁 Final Decision

> **Release v1.0.0:**

- [ ] GO
- [ ] NO-GO

### Notes

(Record blockers and follow-up actions here)

---

## 📌 Architect Note

v1.0.0 is not about features — it is about **trust**.
If validation evidence is weak, the correct decision is **NO-GO**.

