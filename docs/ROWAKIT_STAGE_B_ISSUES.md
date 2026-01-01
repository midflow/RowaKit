# RowaKit – Stage B Issues (v0.2.0)

Stage B focuses on improving real-world usability while keeping RowaKit Table small, predictable, and server-side first.

## Scope lock
- **NOT** a generic datagrid
- **NO** virtualization, grouping, pivot, column reordering, spreadsheet editing
- **NO** row selection / bulk actions
- **NO** query builder
- Filters are **server-side only** (the table does not filter data client-side)

---

## B-01: Add `col.badge`

**Goal**  
Display enum/status fields in a readable, compact way.

**API**
```ts
col.badge(field, map?)
```

**Map shape (optional)**
```ts
{
  active:   { label: "Active", tone: "success" },
  paused:   { label: "Paused", tone: "warning" },
  disabled: { label: "Disabled", tone: "danger" }
}
```

**Rules**
- Fallback label = `String(value)`
- `tone` limited to: `neutral | success | warning | danger`
- Styling via CSS classes only (no theming system)

**Acceptance criteria**
- Badge column renders with correct label + tone class
- Types are strict and ergonomic
- Demo shows a status column using `col.badge`

---

## B-02: Add `col.number`

**Goal**  
Display numeric values consistently and professionally.

**API**
```ts
col.number(field, options?)
```

**Options**
- `format`: `Intl.NumberFormatOptions` **or** `(value: number, row: T) => string`
- Default align right
- Optional: `precision?: number` (only if you keep it minimal)

**Acceptance criteria**
- Numbers align right by default
- Formatting works (Intl or custom)
- Demo includes numeric column (amount/count)

---

## B-03: Column modifiers (minimal)

**Goal**  
Improve column ergonomics without breaking v0.1.x.

**Example**
```ts
col.text("email")
  .sortable()
  .width(240)
  .truncate()
```

**Allowed modifiers**
- `.sortable()`
- `.width(px)`
- `.align("left" | "center" | "right")`
- `.truncate()` (CSS ellipsis)

**Rules**
- Backward compatible (existing column definitions keep working)
- Column definitions remain serializable (no hidden closures beyond the existing render hooks)

**Acceptance criteria**
- Modifiers work as expected
- Existing columns still work unchanged
- Tests cover at least one modifier per type

---

## B-04: Basic server-side filters (LOCKED SPEC)
Source of truth: docs/STAGE_B_FILTERS_SPEC.md. Do not deviate.

**Goal**  
Enable simple filtering while keeping all filtering logic server-side.

### ✅ Canonical types (MUST)
These types are the **single source of truth** for Stage B filters.

```ts
export type FilterValue =
  | { op: "contains"; value: string }
  | { op: "equals"; value: string | number | boolean | null }
  | { op: "in"; value: Array<string | number> }
  | { op: "range"; value: { from?: string; to?: string } };

export type Filters = Record<string, FilterValue | undefined>;
```

### ✅ FetcherQuery contract (MUST, backward-compatible)

```ts
type FetcherQuery = {
  page: number;
  pageSize: number;
  sort?: { field: string; direction: "asc" | "desc" };
  filters?: Filters; // omitted when empty
};
```

### ✅ Behavior rules (MUST)
- Any filter change **resets** `page = 1`
- Clear single filter
- Clear all filters
- The table **must not** filter rows client-side
- Filters are passed to `fetcher` **as-is** (no query builder / no transformation)

**Empty filters rule (LOCKED)**  
- When there are no active filters, `filters` must be **`undefined`** (not `{}`)

### ✅ Operator mapping rules (MUST)
- `text` columns → use `{ op: "contains", value: string }`
- `badge/enum` columns → use `{ op: "equals", value: string | number | null }`
- `boolean` columns → use `{ op: "equals", value: boolean | null }`
- `date` columns → use `{ op: "range", value: { from?: string; to?: string } }`

### ⛔ Forbidden (MUST NOT) in v0.2.0
- No extra operators (`startsWith`, `endsWith`, `regex`, `gt/lt`, etc.)
- No URL sync
- No saved views
- No advanced filter UI / query builder (keep UI minimal)

### UI (choose one)
**Recommended:** header filter row (simple + visible)
- Text input for text columns
- Select for badge/enum columns
- Boolean select: All / True / False
- Date range: from/to (minimal UI)

### Acceptance criteria
- `FetcherQuery` includes `filters?: Filters`
- Apply/clear filters triggers `fetcher` with correct `filters`
- Filter changes reset page to 1
- Demo shows filters working end-to-end
- Tests cover apply/clear/reset-page behavior

---

## B-05: Tests for Stage B features

**Coverage**
- `col.badge` mapping and fallback
- `col.number` formatting and alignment default
- Filters apply/clear triggers fetcher and resets page
- No regression for pagination/sorting (existing tests remain green)

**Rules**
- No snapshot tests
- Focus on behavior and fetcher calls

**Acceptance criteria**
- `pnpm -r test` passes on CI
- Meaningful coverage for new behaviors

---

## B-06: Docs & demo updates

**Docs**
- README: add sections for `badge`, `number`, `filters`
- Keep “What RowaKit is / is not” updated (avoid datagrid requests)

**Demo**
- Status column (badge)
- Amount/count column (number)
- Filters enabled (at least text + enum + boolean)

**Acceptance criteria**
- README snippets compile
- Demo reflects Stage B features accurately

---

## Completion criteria (Stage B DONE)
- B-01 → B-06 completed
- CI green
- Backward compatible with v0.1.x
- Ready to release **v0.2.0**
