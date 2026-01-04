# Stage D Scope Lock (v0.4.0)

Stage D is about **polish + correctness** for Stage C. No new major product features.

## In scope

- Column resizing UX hardening (no accidental sort; better drag feel; predictable widths)
- Pointer Events support (mouse + touch + pen)
- Saved views persistence (hydrate list on mount; remove prompt-based UI)
- URL sync resilience (safe parsing, validation, clamping)
- A11y and small UX fixes directly related to the above
- Tests for all Stage D changes
- Docs cleanup: ROADMAP dedupe, README correctness, package docs updates

## Out of scope (do not implement)

- Multi-column sorting
- Column pinning, column reordering, drag-and-drop columns
- Virtualization, grouping, pivot, aggregation, tree grids
- Spreadsheet editing / inline cell editing
- Client-side data engines (filter/sort on client)
- Export/CSV, row selection, bulk actions (these are potential future Stage E)

## Non-negotiable rules

1. **No breaking API changes** without an explicit migration note.
2. Keep `RowaKitTable` props minimal; prefer internal changes and sane defaults.
3. No new runtime dependencies for Stage D.
4. Maintain server-side-first contract. No hidden client-side filtering/sorting.
5. Add tests for every behavior change.

## Definition of Done (PR-level)

- Implementation matches the PR acceptance criteria
- Tests added/updated and passing
- Docs updated where relevant
- No unrelated refactors

