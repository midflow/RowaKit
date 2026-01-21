# RowaKit — Long-term Roadmap (Exploratory)

> ⚠️ This roadmap is **directional, not a promise**.
> It exists to communicate product thinking, not delivery dates.
> Priorities may change based on real-world usage and feedback.

---

## Product Vision

RowaKit aims to become a **workflow-oriented data interaction toolkit**
for admin and business applications.

Core principles:
- Server-side-first
- Small, opinionated core
- OSS-first, Pro for orchestration
- Framework-agnostic concepts
- Long-term maintainability over feature count

---

## Current State (Baseline)

### OSS (React)
- Table (stable v1.x)
- Pagination, sorting, filtering
- URL-synced state
- Saved views (local)
- CSV export hooks

This forms the **entry point** for adoption.

---

## Phase 1 — Data Interaction Layer (OSS, React)

> Goal: Move beyond “just a table” while staying tightly scoped.

### Planned OSS Components
- **QueryToolbar**
  - Filters, search, sort indicators
  - Query visibility & control
- **ActionBar**
  - Row selection summary
  - Bulk action triggers (no orchestration)

### Characteristics
- No background jobs
- No business logic
- No Pro dependency

📌 Checkpoint:
> Are users building admin tables with Table + Toolbar + ActionBar in real apps?

---

## Phase 2 — Workflow-aware OSS (React)

> Goal: Prepare for workflows without introducing commercial features.

### Focus
- Clarify extension points
- Stabilize query & action lifecycles
- Public documentation of workflows

### Deliverables
- `docs/workflows.md`
- Documented lifecycle hooks
- Clear OSS vs Pro boundaries

📌 Checkpoint:
> Do users start asking about bulk operations, exports, or long-running tasks?

---

## Phase 3 — Pro MVP (Commercial, React-only)

> Goal: Validate willingness to pay.

### Initial Pro Workflows
- **Bulk Operation Orchestration**
  - Cross-page selection
  - Background jobs
  - Progress, retry, audit
- **Background Export Jobs**
  - Query snapshot
  - Async export
  - Download / notification

### Notes
- Pro depends on OSS
- OSS does not depend on Pro
- React-only support initially

📌 Checkpoint:
> Are teams willing to pay for workflow orchestration?

---

## Phase 4 — Component Expansion (OSS-first)

> Goal: Strengthen ecosystem once Pro signal exists.

### Potential OSS Components
- FilterPanel / FilterPresets
- ExportButton (lightweight)
- Empty / NoResults state
- SelectionSummary
- SavedViewsManager (basic)

📌 Checkpoint:
> Do these components increase OSS adoption and Pro value?

---

## Phase 5 — Framework Expansion (OSS core)

> Goal: Expand reach without multiplying complexity too early.

### Strategy
- Port **concepts**, not just code
- OSS-only at first
- Pro remains React-only

### Candidate Frameworks
- Vue
- Svelte
- Solid

📌 Checkpoint:
> Does a new framework bring meaningful users back to RowaKit?

---

## Phase 6 — Selective Pro Expansion (Framework-specific)

> Goal: Support Pro only where demand exists.

- Pro workflows ported selectively
- Higher pricing due to complexity
- Limited framework support

---

## What This Roadmap Is Not

- ❌ A delivery schedule
- ❌ A promise of features
- ❌ A commitment to any specific framework

---

## Guiding Rule

> **OSS drives adoption.  
> Workflows drive revenue.  
> Frameworks follow demand.**

---

RowaKit evolves based on **real usage**, not assumptions.
