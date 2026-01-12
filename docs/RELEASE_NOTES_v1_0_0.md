# Release Notes — v1.0.0

> **Project:** RowaKit / `@rowakit/table`
> **Release:** v1.0.0
> **Date:** 2026-01-12

---

## What RowaKit is

RowaKit is an opinionated, **server-side-first** React table component designed for internal tools and business applications.

---

## What v1.0.0 guarantees

Starting from v1.0.0:

- The public API surface of `@rowakit/table` is considered **stable** and governed by `docs/API_STABILITY.md`.
- The frozen surface (exports, contracts, and behavioral semantics) is summarized in `docs/API_FREEZE_SUMMARY.md`.
- Breaking changes are only allowed in a future **major** release.

Canonical decision record:
- `docs/V1_0_0_FINAL_GO_NO_GO_REPORT.md`

---

## What v1.0.0 does NOT promise

RowaKit is explicitly not a generic data-grid. In particular, v1.0.0 does not promise:

- Virtualization / infinite scroll
- Pivoting / grouping
- Spreadsheet-style editing
- A client-side query engine

(These remain out of scope unless explicitly added via a future roadmap decision.)

---

## Validation evidence

This release is backed by documented production-like and consumer-compat evidence:

- Production-like validation (B): `docs/PRODUCTION_LIKE_VALIDATION.md` (PASS)
- Consumer compatibility (C): `docs/CONSUMER_COMPAT_MATRIX.md` (PASS)
- Evidence policy: `docs/VALIDATION_EVIDENCE_POLICY.md`

---

## Upgrade notes

- If you were using `@rowakit/table@0.6.x`, upgrading to `1.0.0` is intended to be **non-breaking**.
- Multi-sort is supported via `query.sorts`. The older `query.sort` field remains for backward compatibility (with removal planned for v2.0.0).

---

## For maintainers

- Release checklist template: `RELEASE_TEMPLATE.md`
