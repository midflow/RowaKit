# OSS vs Pro Boundary

> **Project:** RowaKit  
> **Applies from:** v1.0.0  
> **Status:** Strategic guideline

---

## 🎯 Purpose

This document defines the **clear boundary** between:
- **Open Source (OSS)** RowaKit
- **Commercial / Pro extensions**

The goal is to:
- Keep OSS valuable and trustworthy
- Enable sustainable commercialization
- Avoid bait-and-switch perception

---

## 1️⃣ Core Principle

> **OSS must be complete enough to be genuinely useful.**

Commercial offerings should:
- Save time
- Reduce operational burden
- Add enterprise-level workflows

They must **not** cripple the open-source core.

---

## 2️⃣ What Belongs to OSS (Always Free)

### Core Table Foundation
- Server-side pagination, sorting, filtering
- Column resizing
- URL sync
- Saved views
- Typed `Fetcher<T>` contract

### Workflow Basics
- Row selection (page-scoped)
- Bulk actions (basic)
- Export hook (CSV via `exporter`)

### UX & Quality
- Accessibility baseline
- Core documentation
- Bug fixes

---

## 3️⃣ What Belongs to Pro / Commercial

### Advanced Workflows
- Cross-page selection helpers
- Bulk operation orchestration (progress, retry, undo)
- Background export jobs with status UI

### Enterprise Features
- Audit logging helpers
- Role-based row/action visibility
- Compliance-focused UX patterns

### Integrations
- Backend adapters (REST patterns, RBAC helpers)
- Opinionated enterprise workflows

### Support & SLA
- Priority issue handling
- Private roadmap access
- Commercial support agreements

---

## 4️⃣ Packaging Strategy

Recommended structure:

```
@rowakit/table        # OSS core
@rowakit/pro-*        # Commercial extensions
```

- Pro packages must depend on OSS core
- OSS core must not depend on Pro

---

## 5️⃣ Governance Rules

- No artificial limitations in OSS
- No "paywall" for bug fixes
- Pro features must provide **clear, additional value**
- OSS roadmap remains public

---

## 6️⃣ Communication Guidelines

- Be explicit about what is OSS vs Pro
- Avoid vague marketing language
- Publish boundary docs publicly

Transparency builds trust.

---

## 📌 Architect Note

A healthy OSS + Pro boundary:
- Attracts users
- Converts serious teams
- Keeps maintainers sane

This document is a **long-term guardrail**, not a pricing document.

