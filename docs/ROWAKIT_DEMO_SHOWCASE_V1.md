# RowaKit — Demo Showcase v1 (Replace “Stage B/C/D Demo”)

This plan replaces “Stage B/C/D demo” with **progressive demos** (simple → advanced) and adds an **in-page code viewer** (Bootstrap/MUI style).

Target location: `packages/demo`

---

## Goals

1. A **Demo Gallery** that teaches usage from basic to advanced.
2. Each demo includes:
   - **Live Preview**
   - **Code viewer** (copyable)
   - Short **Notes** (when to use + key ideas)
3. Must run reliably on **CodeSandbox** (single demo app, fixed port, host bind).
4. Keep library API stable: demos should not require breaking changes in `@rowakit/table`.

---

## Information Architecture

### Navigation
- Left sidebar: “Getting Started”, “Real-world”, “Advanced”
- Search/filter demos by keyword (optional v1.1)
- Routes: `/demos/:slug`

### Demo Page Layout
- Header: title + description + tags
- Tabs (default):
  - **Preview**
  - **Code**
  - **Notes**
- Or split view toggle (v1.1)

---

## Folder structure (proposed)

```
packages/demo/src/
  app/
    AppShell.tsx
    routes.tsx
    demoRegistry.ts
  components/
    DemoPage.tsx
    CodePanel.tsx
    CopyButton.tsx
    Tabs.tsx (or use existing UI)
  demos/
    01-basic/
      Demo.tsx
      Code.tsx
      meta.ts
    02-columns-formatting/
    03-row-actions/
    04-server-filters/
    05-url-sync/
    06-saved-views/
    07-column-resize/
    08-advanced-query/
```

### Code display approach (tight)
- Use Vite `?raw` to load code strings:
  - `import code from "./Code.tsx?raw";`
- Render syntax-highlighted code + copy button.
- Keep `Demo.tsx` focused on rendering; `Code.tsx` is the “clean docs snippet”.

---

## Demo set (v1)

### Getting Started
1. **Basic Table**
   - minimal columns + server pagination + sorting
2. **Columns & Formatting**
   - `col.text/date/boolean/number/badge`
   - align/width/format
3. **Row Actions**
   - `col.actions` + confirm + async loading state

### Real-world
4. **Server-side Filters**
   - simple text/select/date-range filters
   - optional `filterTransform` example
5. **URL Sync**
   - shareable link: sort/page/pageSize in URL
   - reset and “copy URL” hint
6. **Saved Views**
   - save/apply/delete view
   - robust hydration from localStorage

### Advanced (this is the “Stage D demo equivalent”)
7. **Column Resizing**
   - smooth drag, min/max
   - double-click auto-fit
   - must NOT trigger sort while resizing
8. **Advanced Query Pattern**
   - combine: sort + filters + url sync + saved views + resize
   - simulate latency + stale request handling
   - “Reset to default”, “Clear filters”

---

## PR Plan (agent-ready)

> Naming: **PR-DEMO-xx** to avoid confusion with product stages.

### PR-DEMO-01 — Demo App Shell + Routing + Registry
**Scope**
- Add `AppShell` layout (sidebar + main)
- Add router and `/demos/:slug` pages
- Add `demoRegistry` with ordering + grouping

**Files**
- `packages/demo/src/app/AppShell.tsx`
- `packages/demo/src/app/routes.tsx`
- `packages/demo/src/app/demoRegistry.ts`

**Acceptance**
- Visiting `/` redirects to first demo
- Sidebar links work
- Each demo page renders a placeholder preview + placeholder code

---

### PR-DEMO-02 — Code Viewer (Bootstrap/MUI style)
**Scope**
- Add `CodePanel` supporting:
  - syntax highlight
  - copy button
  - optional line numbers
- Load code via `?raw`
- Add `DemoPage` with tabs Preview/Code/Notes

**Files**
- `packages/demo/src/components/DemoPage.tsx`
- `packages/demo/src/components/CodePanel.tsx`
- `packages/demo/src/components/CopyButton.tsx`

**Implementation notes (tight)**
- Prefer `shiki` for highlight (nice look). If avoiding deps, use Prism.
- Make code block horizontally scrollable.

**Acceptance**
- Code tab shows correct `Code.tsx` content
- Copy button copies full snippet
- No build errors on CodeSandbox

---

### PR-DEMO-03 — Migrate existing demos into new structure
**Scope**
- Port any existing Stage B/C demos into:
  - `01-basic`
  - `02-columns-formatting`
  - `03-row-actions`
  - `04-server-filters`
- Ensure each has `Demo.tsx`, `Code.tsx`, `meta.ts`

**Acceptance**
- Demos run locally
- Code tab is readable and matches preview

---

### PR-DEMO-04 — Advanced demos (Resizing / URL Sync / Saved Views / Advanced Query)
**Scope**
- Implement demos:
  - `05-url-sync`
  - `06-saved-views`
  - `07-column-resize`
  - `08-advanced-query`
- Add Notes content:
  - why use, gotchas, recommended patterns
- Add small “edge case” buttons:
  - “Load broken URL params” (should not crash)
  - “Simulate slow network” (latency)

**Acceptance**
- Resizing demo:
  - resize does not trigger sort
  - cursor + smoothness acceptable
- URL sync demo:
  - invalid params don’t crash
- Saved views:
  - persists across reload
  - no prompt()

---

### PR-DEMO-05 — CodeSandbox Ready + README “Try it”
**Scope**
- Add `.codesandbox/tasks.json` to auto-run demo
- Ensure Vite config binds host + fixed port 5173
- Update README “Try it” section + link to sandbox

**Files**
- `.codesandbox/tasks.json`
- `packages/demo/vite.config.(ts|js)` (host, port, strictPort)
- `README.md` update

**Acceptance**
- Opening sandbox link shows running demo without manual steps
- No 502 proxy errors

---

## Definition of Done

- Demo gallery exists and is discoverable.
- Each demo has live preview + code + notes.
- Works on CodeSandbox out of the box.
- README has a single “Try it” link that just works.

---

## Optional v1.1 Enhancements (defer)
- Search box for demos
- Split view (preview + code side-by-side)
- “Copy link to this demo” button
- Dark mode toggle


# ISSUES — PR-DEMO-06 & PR-DEMO-07

This document defines **agent-ready issues** for fixing the Demo Gallery wiring and navigation.

---

## PR-DEMO-06 — Bind Code/Notes to Demo Folder (Remove Placeholder Wiring)

### Problem
- Code tab uses placeholder/loader instead of real source → code does not match preview.
- Notes tab renders placeholder text instead of real metadata.
- Easy drift between preview and code.

### Goal
Ensure **Preview / Code / Notes** are sourced from the same demo folder:
- `Demo.tsx` → preview
- `Code.tsx` (`?raw`) → code tab
- `meta.ts` → notes/tags/description

### Scope Lock
- No new dependencies.
- No UI redesign.
- No changes to `@rowakit/table`.
- Only wiring + rendering fixes.

### Required Changes
1. **demoRegistry**
   - Remove any placeholder or async fake code loader.
   - Import `Code.tsx?raw` per demo.
   - Expose `code: string` on each demo entry.
2. **DemoPage**
   - Render Code tab from `demo.code` directly.
   - Render Notes tab from real meta fields (`description`, `notes`, `learningOutcomes`, `tags`).
   - Fix any incorrect path hints (must reference `src/demos/...`).
3. **Fallback**
   - If `Code.tsx` is missing, show a friendly message instead of crashing.

### Acceptance Criteria
- Code tab always matches preview.
- Notes tab shows real content.
- No placeholder strings remain.
- App does not crash if a snippet is missing.

---

## PR-DEMO-07 — Fix Navigation, Remove Stage Branding, Ensure Completeness

### Problem
- Sidebar header shows hardcoded `Stage D`.
- Menu labels/groups can drift from actual demos.
- Some demos appear but have missing content.

### Goal
- Remove stage-based naming.
- Ensure navigation reflects actual demos and metadata.
- Make incomplete demos explicit.

### Scope Lock
- No major layout changes.
- No new dependencies.
- Demo-only changes.

### Required Changes
1. **Branding**
   - Remove `Stage D` text.
   - Display version from `package.json` (e.g. `v0.4.0 • Progressive Demos`).
2. **Navigation**
   - Sidebar labels come from `meta.title`.
   - Group by `meta.group` (getting-started / real-world / advanced).
3. **Completeness Guard**
   - If a demo lacks required files or meta, mark it as `incomplete`.
   - Show a friendly placeholder page explaining what’s missing.
4. **Slug Consistency**
   - Normalize slugs to match folder naming.

### Acceptance Criteria
- No “Stage” wording in UI.
- Sidebar shows correct demo names (01–08).
- Incomplete demos are handled gracefully.

