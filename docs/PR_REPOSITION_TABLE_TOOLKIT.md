# PR — Reposition @rowakit/table as a Table Toolkit (OSS)

## Purpose

Reposition **@rowakit/table** from “just a table component” to a
**Server-side Table Toolkit** that includes table-adjacent components.

This PR is **documentation & metadata only**.
No code behavior changes.

---

## Background

RowaKit started from a table component, but is evolving toward a
**data interaction toolkit** for admin/business applications.

New OSS components:
- QueryToolbar
- ActionBar

These components are:
- Standalone (controlled)
- Table-adjacent (query/selection domain)
- Not generic UI components

Therefore, the correct positioning is **Table Toolkit**, not “Table only”.

---

## Scope (IN)

### 1. Update package description

**packages/table/package.json**
- Update `description`
- Update `keywords`

Suggested description:
> Server-side-first table toolkit for React. Includes table, query toolbar, and action bar for admin and business apps.

Suggested keywords:
```
react
table
data-table
server-side
admin
query
filters
toolbar
bulk-actions
```

---

### 2. Update packages/table/README.md

#### Change title
```
# RowaKit Table Toolkit
```

#### Add “What’s included” section
- Table
- QueryToolbar
- ActionBar

Clarify:
> QueryToolbar and ActionBar are table-adjacent components designed for data interaction workflows.

---

### 3. Update root README / docs index

- Clarify that `@rowakit/table` is a toolkit
- Add Components section with short descriptions

---

### 4. Documentation index update

**DOCUMENTATION_INDEX.md**
- Add entries:
  - QueryToolbar
  - ActionBar

---

## Scope (OUT)

- ❌ No renaming of npm package
- ❌ No breaking changes
- ❌ No new exports
- ❌ No folder restructuring

---

## Definition of Done

- README updated
- package.json metadata updated
- Documentation index updated
- No code changes

---

## Reviewer Checklist

- Messaging is clear and consistent
- No misleading claims
- No technical changes
