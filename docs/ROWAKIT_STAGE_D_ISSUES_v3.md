# RowaKit — Stage D Issues Pack (repo v0.4.0 tag) — Path-accurate & Tight

This pack is based on reviewing the source zip tag **v0.4.0**.
Primary implementation touchpoints are in:

- `packages/table/src/components/SmartTable.tsx`
- `packages/table/src/styles/table.css`
- (docs) `README.md`, `docs/ROADMAP.md`, `CHANGELOG.md`

Stage D goal: **polish + correctness + resilience** for Stage C features (resize, url sync, saved views).  
No “big new features”. Prefer small, well-tested deltas.

---

## PRD-00 — Stage D scope lock (non-negotiable)

**Do not break public API.** Any new prop must be optional with safe defaults.  
**No new dependencies** unless clearly justified in PR description.

### Must-have regressions guards
- Every behavior change below must have tests in `packages/table/src/components/*test.tsx` or `packages/table/src/__tests__/*`.
- New tests must fail on v0.4.0 and pass after the PR.

---

## PRD-01 — Prevent accidental sort while resizing (bubbling + click-after-drag)

### Why (current behavior)
In `SmartTable.tsx`, the resize handle is a `div` inside a sortable `<th>`:

- `<th onClick={...handleSort...}> ... <div className="rowakit-column-resize-handle" onMouseDown=... onDoubleClick=... /> </th>`
- `startColumnResize()` calls `e.preventDefault()` but **does not stop event propagation**.
- Result: drag-start / drag-end / double-click can still trigger the `<th>` click (sort).

**Exact locations**
- Handle rendered: `packages/table/src/components/SmartTable.tsx` around the `<th>` mapping (~lines 840–900).
- Drag logic: `startColumnResize` (~line 564).
- Double click: `handleColumnResizeDoubleClick` (~line 602).

### Scope
- Resize interactions must NEVER sort.
- Header clicks (outside the handle) must still sort.

### Required implementation (tight; do all)
1) **Stop propagation on handle events**
   - In the handle JSX:
     - Replace `onMouseDown` with `onPointerDown` in PRD-02; for this PR you can keep mouse but must add stopPropagation now.
     - Add wrappers that do **both**:
       - `e.preventDefault()`
       - `e.stopPropagation()`
   - Same for `onDoubleClick`: it must stop propagation too.

2) **Add a “sort suppression window”**
   - Add refs in `SmartTable.tsx`:
     - `const isResizingRef = useRef(false);`
     - `const lastResizeEndTsRef = useRef(0);`
   - In `startColumnResize`:
     - set `isResizingRef.current = true` on start.
   - In mouseup/end:
     - set `isResizingRef.current = false`
     - set `lastResizeEndTsRef.current = Date.now()`
   - In `<th onClick>` handler (currently inline `() => handleSort(...)`):
     - wrap with a guard:
       - if `isResizingRef.current` return
       - if `Date.now() - lastResizeEndTsRef.current < 150` return

3) **Apply `.resizing` class to the active `<th>`**
   - CSS already expects `.rowakit-table thead th.resizing ...` in `table.css` (~line 467).
   - Add `const resizingColIdRef = useRef<string | null>(null);`
   - On start: `resizingColIdRef.current = columnId`
   - On end: set it back to null
   - In render for `<th>`: add `className` merge to include `resizing` when `resizingColIdRef.current === column.id`

4) Keep existing `document.body.classList.add('rowakit-resizing')` behavior.

### Acceptance criteria
- Drag resize handle does not change sort, ever.
- Double-click handle auto-fits without sorting.
- Clicking header label sorts as before.
- Visual “resizing” state works (handle stays visible while resizing).

### Tests (must)
Add tests in `packages/table/src/components/SmartTable.sorting.test.tsx` (or new `SmartTable.resizing-sorting.test.tsx`):
- Resize drag sequence then assert sort not triggered:
  - fire `mouseDown` on `.rowakit-column-resize-handle`, `mouseMove`, `mouseUp`, then `click` on `<th>` if needed to reproduce click-after-drag.
- Double click handle does not trigger sort.
- Normal click on `<th>` header text triggers sort.

**Pitfall to avoid:** only adding `preventDefault()` is insufficient because bubbling still triggers `<th>` click.

---

## PRD-02 — Pointer Events resizing (mouse + touch + pen) with capture

### Why (current behavior)
`startColumnResize` uses document `mousemove/mouseup`, so touch doesn’t work and capture is not used.

### Scope
- Migrate resizing to Pointer Events **without changing public API**.

### Required implementation (tight; path-specific)
In `packages/table/src/components/SmartTable.tsx`:

1) **Change handle props**
- Replace:
  - `onMouseDown={(e) => startColumnResize(e, column.id)}`
  - with `onPointerDown={(e) => startColumnResize(e, column.id)}`
- Update `startColumnResize` signature:
  - from `React.MouseEvent<HTMLDivElement>`
  - to `React.PointerEvent<HTMLDivElement>`

2) **Pointer capture**
- Inside `startColumnResize`:
  - `e.currentTarget.setPointerCapture(e.pointerId);`
  - Register `pointermove`, `pointerup`, `pointercancel` listeners on `e.currentTarget` (preferred), not on document.
  - On end/cancel: `try { e.currentTarget.releasePointerCapture(pointerId); } catch {}`

3) **Button gating**
- If `e.pointerType === 'mouse'`, require primary button:
  - `if (e.buttons !== 1) return;`

4) **Keep `touch-action: none`**
- Already present in `packages/table/src/styles/table.css` under `.rowakit-column-resize-handle` (~line 447).
- Do not remove it.

5) **Cleanup**
- Ensure all listeners are removed on `pointerup` and `pointercancel`.
- Ensure `rowakit-resizing` body class is removed on cancel as well.

### Acceptance criteria
- Works with mouse + touch.
- Touch drag doesn’t scroll page while resizing.
- No listener leaks.

### Tests (must)
In a new test file (e.g. `SmartTable.pointer-resize.test.tsx`):
- fire `pointerDown` (pointerType `mouse`), `pointerMove`, `pointerUp` and assert width updated.
- fire `pointerCancel` and assert resizing flags + body class reset.

**Pitfall:** forgetting `pointercancel` cleanup causes stuck “resizing” state.

---

## PRD-03 — Column width model hardening + smoother drag + optional fixed layout

### Why (current behavior)
- Width is applied only via `<th style={{ width: ... }}>` but `<td>` alignment relies on browser layout; can feel “fight-y”.
- CSS defines `.rowakit-cell-truncate` but truncation is disabled for resizable columns to avoid conflicts, reducing UX.
- There is no explicit table layout strategy in `table.css` (`table-layout` not set).

### Scope
- Make resizing feel stable and predictable.
- Keep API stable. (If adding a prop, it must be optional and default safe.)

### Required implementation (tight, minimal)
1) **Apply widths to both header and body cells**
- In render of `<td>` (search for `data-col-id` usage), ensure each cell includes:
  - `style={{ width: actualWidth ? \`\${actualWidth}px\` : undefined }}` OR CSS var on column id.
- If body cells don’t currently have `data-col-id`, add it consistently (header already has `data-col-id`).

2) **Introduce a layout mode (internal default OK)**
- In `packages/table/src/styles/table.css`:
  - Add:
    - `.rowakit-table table { table-layout: fixed; }`
  - Only if it doesn’t break non-resizable tables:
    - If you’re worried, scope it:
      - `.rowakit-table.rowakit-layout-fixed table { table-layout: fixed; }`
      - Then in component, add that class only when `enableColumnResizing`.

3) **Bring back truncation safely**
- If using fixed layout, re-enable truncation for resizable columns in body cells:
  - Use a dedicated class on `<td>` like `rowakit-cell-truncate` when column.truncate.
  - Keep handle free since handle is in `<th>` only.

4) **Smooth drag**
- You already RAF-throttle via `scheduleColumnWidthUpdate`.
- Add a guard: do not schedule updates if width unchanged after clamp to avoid extra renders.

### Acceptance criteria
- Columns remain aligned after resize.
- Resize feels stable even with long text.
- Truncation works for body cells when enabled.
- No layout regressions for non-resizable tables.

### Tests (must)
- After resizing, verify a body cell for the same column has the width applied (DOM style).
- Verify truncation class present on body cells when `truncate: true`.

**Pitfall:** applying width only to `<th>` often leaves `<td>` reflowing, creating perceived jank.

---

## PRD-04 — Saved Views v1.1 (hydrate on mount + safer UX)

### Why (current behavior)
- `saveCurrentView()` writes to `localStorage` key `rowakit-view-${name}`.
- But `savedViews` state is initialized empty and **never hydrated** from storage.
- UI uses blocking `window.prompt()` in render (comment acknowledges it is placeholder).

**Exact locations**
- UI: `packages/table/src/components/SmartTable.tsx` in saved views block (~lines 780–835).
- Storage write: `saveCurrentView` (~line 626).
- No storage read exists.

### Scope
- Saved views persist across reload.
- Replace `prompt()` with non-blocking UI (minimal modal/inline form).

### Required implementation (tight)
1) **Add storage index**
- Add an index key:
  - `rowakit-views-index` => JSON array of `{ name, updatedAt }`
- On save:
  - Update the index (dedupe, update timestamp), then write view.
- On delete:
  - Remove view key and remove from index.

2) **Hydrate on mount**
- Add `useEffect` gated by `enableSavedViews`:
  - Read index, parse safely.
  - If missing index, **scan** localStorage keys for `rowakit-view-` prefix and rebuild index.
  - Populate `savedViews` state with `{ name, state }` by reading each view key (ignore parse failures).

3) **Replace prompt**
- Minimal, dependency-free UI:
  - Toggle an inline panel: input + Save/Cancel.
  - Validate name: trim, 1–40 chars, reject control chars and `/\?%*:|"<>`.
  - If name exists: show “Overwrite?” confirm UI (not `window.confirm`, prefer inline).

4) **Corruption safety**
- Any JSON.parse must be try/catch.
- If a stored view is invalid, skip it.

### Acceptance criteria
- Saved views list survives reload.
- No blocking browser prompt.
- Corrupt storage never breaks the table.

### Tests (must)
- LocalStorage pre-populated with `rowakit-view-foo` and missing index => component loads it.
- Index present => hydrates list.
- Delete removes from list and storage.

**Pitfall:** without an index, scanning every time can be slow; only scan when index missing.

---

## PRD-05 — URL sync hardening (parse/validate + throttle widths)

### Why (current behavior)
- URL write occurs in effect that depends on `query` and `columnWidths`:
  - `window.history.replaceState(... ?page=...&filters=...&columnWidths=... )`
- On mount, URL load parses page/pageSize/sort/filters/columnWidths with minimal validation.

**Exact locations**
- URL write effect: `packages/table/src/components/SmartTable.tsx` (~lines 340–375).
- URL read effect: (~lines 380–420).

### Scope
- Never crash on bad URL.
- Clamp invalid values.
- Reduce URL churn during resize.

### Required implementation (tight)
1) **Extract pure parse helpers**
- Create functions in `SmartTable.tsx` (or new file `packages/table/src/url-state.ts` and export tests):
  - `parseUrlState(params, defaultPageSize, enableColumnResizing)`
  - `serializeUrlState(query, filters, columnWidths, enableColumnResizing)`
- Parsing rules:
  - `page >= 1`
  - `pageSize` must be one of `pageSizeOptions` (if available), else clamp to `defaultPageSize`
  - `sortDirection` only `asc|desc`; otherwise ignore sort.
  - `filters` must be object; else ignore.
  - `columnWidths`: object of numbers; ignore invalid entries.

2) **Throttle URL updates for resize**
- Keep query/sort/filter updates immediate.
- For `columnWidths`, debounce serialize (e.g. 150–250ms) while resizing:
  - Use `setTimeout` stored in ref, cleared on new change.
  - Or only write widths on resize end (preferred if you implement resizing refs in PRD-01/02).

3) **Do not spam history**
- Keep `replaceState` (good).
- Ensure serialized params omit empty defaults to keep URL short.

### Acceptance criteria
- Invalid URL does not break table.
- Resizing does not rewrite URL on every frame (observable by fewer `replaceState` calls in test spies).
- Old URLs remain compatible.

### Tests (must)
- Bad JSON in `filters` and `columnWidths` => ignored.
- Invalid `page=-5` => becomes 1.
- While resizing (simulate multiple width updates), `replaceState` called <= N times (debounce).

---

## PRD-06 — Docs sweep (path-correct, consistent)

### Scope
- Fix `docs/ROADMAP.md` duplication/unpolished bits.
- Update README to reflect Stage D behaviors:
  - Resizing: pointer-based, no accidental sort, optional fixed layout, double-click auto-fit behavior.
  - Saved Views persistence (localStorage keys and index).
  - URL sync validation rules.

### Files
- Root: `README.md`, `CHANGELOG.md`
- Docs: `docs/ROADMAP.md` (+ optionally add `docs/FAQ.md` if you want to move the unfinished FAQ)

---

## PRD-07 — Tests & CI guardrails

### Scope
Add tests specifically for the edge cases fixed in PRD-01..05.

### Files
- Tests live in:
  - `packages/table/src/components/*.test.tsx`
  - `packages/table/src/__tests__/*`
- Ensure CI runs `pnpm -r test` and fails on regressions.

---

## Out of scope (Stage D)
- Multi-column sorting, reordering, pinning, virtualization, advanced filtering UI, inline edit.
