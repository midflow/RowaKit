# API Stability Policy

> **Project:** RowaKit
> **Applies from:** v1.0.0
> **Status:** Active

---

## 1. Purpose

This document defines the **API stability contract** for RowaKit starting from version **1.0.0**.

Its goals are:

* Provide **predictability and trust** for users adopting RowaKit in production
* Clearly define what is considered **stable**, **unstable**, and **internal** API
* Establish clear rules for **breaking changes**, **deprecations**, and **versioning**

From v1.0.0 onward, RowaKit commits to this policy.

---

## 2. Versioning Model

RowaKit follows **Semantic Versioning (SemVer)**:

```
MAJOR.MINOR.PATCH
```

### Meaning

* **MAJOR**: Breaking API changes
* **MINOR**: Backward-compatible feature additions
* **PATCH**: Backward-compatible bug fixes

> From **v1.0.0**, breaking changes will only occur in **MAJOR** releases.

---

## 3. Definition of Public API (STABLE)

The following are considered **public and stable APIs** starting from v1.0.0:

### 3.1 Package Exports

* `@rowakit/table`
* Named exports from the package entry point

### 3.2 React Components

* `RowaKitTable`

### 3.3 Props & Contracts

* `SmartTableProps` / `RowaKitTableProps`
* `ColumnDef`
* `Fetcher<T>` contract
* Sorting, pagination, filtering query shapes
* Row selection props
* Bulk action definitions
* Exporter contract

### 3.4 Behavioral Contracts

* Server-side-first data flow
* Page-scoped row selection semantics
* URL sync encoding format
* Saved views schema (localStorage)

These behaviors are part of the public contract.

---

## 4. Internal / Non-Stable APIs

The following are **not part of the public API** and may change at any time:

* Internal hooks (`use*`)
* Internal state modules
* File structure under `src/`
* CSS class names (unless explicitly documented)
* Test utilities
* Demo-only code (`packages/demo`)

Users **must not depend** on these APIs.

---

## 5. What Counts as a Breaking Change

A breaking change includes (but is not limited to):

* Removing or renaming public exports
* Changing required props or their types
* Changing default behavior that alters runtime semantics
* Changing query shapes passed to `Fetcher`
* Changing URL sync or saved-view encoding
* Changing row selection or bulk action semantics

Any breaking change **requires a MAJOR version bump**.

---

## 6. Deprecation Policy

### 6.1 Deprecation Rules

* Deprecated APIs will be clearly marked in documentation
* A deprecation notice will include:

  * Reason for deprecation
  * Suggested alternative
  * Planned removal version

### 6.2 Deprecation Timeline

* Deprecated APIs will remain available for **at least one MINOR release cycle**
* Removal will only happen in the **next MAJOR release**

---

## 7. Backward Compatibility Guarantees

From v1.0.0 onward, RowaKit guarantees:

* No breaking changes in PATCH releases
* No breaking changes in MINOR releases
* Additive features will be opt-in
* Existing behavior remains the default

---

## 8. Experimental Features

Some features may be marked as **Experimental**.

Characteristics:

* Clearly labeled in documentation
* Subject to change without deprecation guarantees
* Not covered by the stability contract

Experimental features will never be promoted to stable without:

* Documentation update
* Explicit release note callout

---

## 9. Security & Bug Fixes

* Security issues will be addressed as PATCH or MINOR releases depending on impact
* Fixes will preserve backward compatibility whenever possible
* Critical fixes may be backported

---

## 10. Governance & Changes to This Policy

* This policy itself is versioned
* Changes to the policy require a documented decision
* Major changes to the policy will be announced

---

## 11. Summary

Starting from **v1.0.0**, RowaKit provides:

* A stable, well-defined public API
* Predictable versioning
* Clear boundaries between stable and internal APIs
* A professional-grade contract suitable for production use

This stability policy is a **core trust signal** for RowaKit users.
