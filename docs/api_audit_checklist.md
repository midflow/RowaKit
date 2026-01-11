# API Audit Checklist — v1.0.0 Freeze

> **Project:** RowaKit  
> **Purpose:** Final API audit before tagging v1.0.0

---

## 🎯 Goal

Ensure all **public APIs** are explicitly reviewed, intentional, documented, and safe to freeze for v1.x.

This checklist must be completed **before tagging v1.0.0**.

---

## 0️⃣ Preconditions (MANDATORY)

- [ ] `docs/API_STABILITY.md` exists and is reviewed
- [ ] `docs/API_FREEZE_SUMMARY.md` exists and is reviewed

If any precondition fails → **NO-GO**.

---

## 1️⃣ Package Surface & Exports (MANDATORY)

### @rowakit/table

- [ ] Entry exports reviewed (`packages/table/src/index.ts`)
- [ ] No accidental/internal exports from entry
- [ ] All types required for userland integration are exported (no `any` required)

**Verify explicitly:**
- [ ] `RowaKitTable` export
- [ ] `col` factory export
- [ ] `Fetcher<T>` export
- [ ] Column-related types used by consumers
- [ ] Row selection types (if any)
- [ ] Bulk actions types (definitions used in props)
- [ ] Exporter types used in props
- [ ] Sorting query types used in `FetcherQuery`

---

## 2️⃣ Core Component Contract (MANDATORY)

### RowaKitTable

- [ ] Props are intentional and documented
- [ ] Defaults are stable
- [ ] Optional props remain optional
- [ ] No hidden side effects

---

## 3️⃣ Core Types & Contracts (MANDATORY)

### Fetcher<T>

- [ ] Query shape finalized
- [ ] Pagination semantics stable
- [ ] Sorting contract stable (single/multi if supported)
- [ ] Filters ownership is documented

### ColumnDef / col.*

- [ ] Column factory APIs are intentional
- [ ] `col.custom()` escape hatch is intentional and documented

---

## 4️⃣ Workflow APIs (MANDATORY)

### Row Selection

- [ ] `enableRowSelection` semantics frozen
- [ ] Page-scoped behavior documented
- [ ] Reset rules finalized

### Bulk Actions

- [ ] API shape reviewed
- [ ] Confirmation behavior stable
- [ ] Consumer-facing types are exported

### Exporter

- [ ] Exporter contract finalized
- [ ] Error handling semantics clear
- [ ] Consumer-facing types are exported

---

## 5️⃣ Behavioral Contracts (MANDATORY)

- [ ] Server-side-first data flow documented
- [ ] URL sync encoding stable
- [ ] Saved views schema frozen
- [ ] No undocumented behavior changes

---

## 6️⃣ Styling Boundaries

- [ ] CSS variables documented (if offered)
- [ ] Consumers are not expected to rely on internal class names

---

## 7️⃣ Experimental / Deferred Features

- [ ] Experimental features are clearly labeled
- [ ] Deferred features are visible in `docs/ROADMAP.md`

---

## 8️⃣ Audit Output (MANDATORY)

- [ ] Audit results recorded in a short note (PR comment or `docs/API_AUDIT_RESULTS.md`)
- [ ] Any potential breaking issue is flagged as **blocker**

---

## 🏁 Audit Decision

- [ ] READY to freeze API for v1.x
- [ ] NOT READY

**Decision:** READY / NOT READY

