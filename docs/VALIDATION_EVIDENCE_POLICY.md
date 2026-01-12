# Validation Evidence Policy (Alternative to Production Usage)

> **Project:** RowaKit  
> **Scope:** Pre-1.0 release readiness  
> **Status:** Active (optional path)

---

## Purpose

RowaKit prefers validating v1.0.0 readiness through at least one real production/internal application usage.

However, when no production application exists yet, RowaKit may use **production-like validation evidence** as an alternative trust signal.

This policy defines that alternative path.

---

## When This Policy Applies

This policy may be used **only if**:
- There is **no** production/internal application currently using `@rowakit/table`, **and**
- Maintainers still want to validate v1.0.0 readiness with strong evidence.

If production usage exists, **production usage remains the preferred evidence**.

---

## Required Evidence (ALL REQUIRED)

To qualify as a production-like substitute, **all** evidence items below must be satisfied.

### 1) Demo Harness Validation

- `docs/PRODUCTION_LIKE_VALIDATION.md` exists
- Result is **PASS**
- Includes:
  - dataset size and latency/error simulation
  - scenario list with pass/fail
  - soak/stress results

### 2) Consumer Compatibility Validation

- `docs/CONSUMER_COMPAT_MATRIX.md` exists
- Result is **PASS**
- Includes:
  - at minimum a Vite+React consumer
  - (recommended) Next.js consumer
  - install/typecheck/build results

### 3) CI Evidence

CI must successfully run:
- harness command(s)
- consumer typecheck/build command(s)

The exact commands must be documented in the two reports.

---

## Failure Rule

If **any** of the required evidence items is missing or **FAIL**, the decision must be **NO-GO** for v1.0.0.

---

## Notes

This policy is designed to preserve the meaning of v1.0.0 as a **trust signal**.
It is a substitute for production usage only when necessary, and it requires strong automated and documented validation.

