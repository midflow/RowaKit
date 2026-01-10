# v1.0.0 GO / NO-GO Checklist

> **Project:** RowaKit  
> **Decision scope:** Release readiness for v1.0.0  
> **Owner:** Maintainers / Core Team

---

## 🎯 Purpose

This checklist defines the **objective criteria** to decide whether RowaKit is ready to release **v1.0.0**.

Version **1.0.0** represents:
- API stability guarantee
- Production trust signal
- Long-term support commitment

If any **GO** item is not satisfied, the release must be delayed.

---

## 1️⃣ API Stability (MANDATORY)

- [ ] `API_STABILITY.md` exists and is reviewed
- [ ] Public APIs are clearly defined and documented
- [ ] No known breaking changes planned for the next MINOR release
- [ ] All experimental APIs are explicitly marked

**Decision:** GO / NO-GO

---

## 2️⃣ Feature Completeness (MANDATORY)

The following **core business workflows** must be complete:

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

## 5️⃣ Test Coverage & Reliability

- [ ] All tests pass in CI
- [ ] Core table behaviors are covered by tests
- [ ] Workflow features (selection, bulk, export) are tested
- [ ] No flaky or disabled tests

**Decision:** GO / NO-GO

---

## 6️⃣ Documentation Readiness

- [ ] Root `README.md` is accurate and up to date
- [ ] `packages/table/README.md` matches implementation
- [ ] Roadmap reflects post-1.0 direction
- [ ] Breaking change policy is documented

**Decision:** GO / NO-GO

---

## 7️⃣ Demo & Developer Experience

- [ ] Demo builds and runs
- [ ] Demo showcases all core workflows
- [ ] No demo-only hacks leaking into library code
- [ ] Getting started experience is under 5 minutes

**Decision:** GO / NO-GO

---

## 8️⃣ Release Confidence

- [ ] At least one real production usage exists
- [ ] Maintainers are willing to support v1.x API for 12–24 months
- [ ] Clear plan exists for handling bugs and security issues

**Decision:** GO / NO-GO

---

## 🏁 Final Decision

> **Release v1.0.0:**  
> ☐ GO  
> ☐ NO-GO

### Notes

(Record any blockers or follow-up actions here)

---

## 📌 Architect Note

If this checklist feels strict, it is intentional.
v1.0.0 is not about features — it is about **trust**.

