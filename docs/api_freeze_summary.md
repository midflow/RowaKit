# API Freeze Summary — v1.0.0

> **Project:** RowaKit  
> **Effective from:** v1.0.0  
> **Status:** API Frozen

---

## 🎯 Purpose

This document provides a **one-page, human-readable summary** of what is **frozen** starting from **RowaKit v1.0.0**.

It exists to:
- Make the API freeze explicit
- Remove ambiguity for contributors and users
- Act as a reference during reviews and future development

This summary complements (but does not replace) `API_STABILITY.md`.

---

## 🔒 What Is Frozen (Public API)

Starting from **v1.0.0**, the following are considered **stable and frozen**:

### 1️⃣ Public Package Surface

- Package: `@rowakit/table`
- Public exports from the package entry point

No public export will be removed or renamed without a **major version bump**.

---

### 2️⃣ Core Component

- `RowaKitTable`

The component name, signature, and high-level behavior are frozen.

---

### 3️⃣ Props & Type Contracts

The following contracts are frozen:

- `RowaKitTableProps`
- `ColumnDef`
- Column factory APIs (`col.*`)
- `Fetcher<T>` contract
- Sorting, pagination, filtering query shapes
- Row selection props
- Bulk action definitions
- Exporter contract

Any incompatible change requires **v2.0.0**.

---

### 4️⃣ Behavioral Semantics

The following behaviors are part of the frozen contract:

- Server-side-first data flow
- Page-scoped row selection semantics
- Bulk action triggering rules
- URL sync encoding format
- Saved views persistence schema

Changing these behaviors in a backward-incompatible way is forbidden in v1.x.

---

## ⚙️ What Is NOT Frozen

The following are explicitly **not frozen** and may change without notice:

- Internal hooks (`use*`)
- Internal state management
- File/folder structure under `src/`
- Demo application (`packages/demo`)
- Internal CSS class names
- Test utilities

Consumers must not depend on these details.

---

## 🧪 Experimental & Deferred Features

- Experimental features are labeled explicitly
- Experimental APIs are not covered by the freeze
- Deferred features are documented in the roadmap

Only documented, non-experimental APIs are frozen.

---

## 🚦 Enforcement

From v1.0.0 onward:

- All PRs must respect this freeze
- Any proposed breaking change must be rejected or deferred to v2.0.0
- PR reviewers are expected to reference this document

---

## 📌 Summary

> If it is documented, exported, and not explicitly marked experimental — **it is frozen**.

This freeze is a **trust contract** with RowaKit users.

