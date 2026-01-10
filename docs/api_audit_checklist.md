# API Audit Checklist — v1.0.0 Freeze

> **Project:** RowaKit  
> **Purpose:** Final API audit before v1.0.0

---

## 🎯 Goal

Ensure all **public APIs** are explicitly reviewed, intentional, documented, and safe to freeze for v1.x.

This checklist must be completed **before tagging v1.0.0**.

---

## 1️⃣ Package Exports

### @rowakit/table

- [ ] Entry exports reviewed (`index.ts`)
- [ ] No accidental/internal exports
- [ ] Export names are stable and intentional

---

## 2️⃣ Core Components

### RowaKitTable

- [ ] Component name finalized
- [ ] Props shape reviewed
- [ ] Defaults documented
- [ ] Optional props remain optional

---

## 3️⃣ Core Types & Contracts

### Fetcher<T>

- [ ] Query shape finalized
- [ ] Pagination semantics stable
- [ ] Sorting contract stable
- [ ] Filters ownership clearly documented

### ColumnDef

- [ ] Column factory APIs finalized
- [ ] Custom column escape hatch intentional

---

## 4️⃣ Workflow APIs (Stage E)

### Row Selection

- [ ] `enableRowSelection` semantics frozen
- [ ] Page-scoped behavior documented
- [ ] Reset rules finalized

### Bulk Actions

- [ ] API shape reviewed
- [ ] Confirmation behavior stable

### Exporter

- [ ] Exporter contract finalized
- [ ] Error handling semantics clear

---

## 5️⃣ Behavioral Contracts

- [ ] Server-side-first data flow documented
- [ ] URL sync encoding stable
- [ ] Saved views schema frozen
- [ ] No hidden side effects

---

## 6️⃣ Styling & Theming

- [ ] CSS variables documented
- [ ] No reliance on internal class names

---

## 7️⃣ Experimental / Deferred Features

- [ ] Experimental features clearly labeled
- [ ] Deferred features documented in roadmap

---

## 🏁 Audit Result

- [ ] All items reviewed
- [ ] Ready to freeze API for v1.x

**Decision:** READY / NOT READY

