# Stage B Filters Spec (v0.2.0) — RowaKit Table

This document **locks** the filters API for Stage B.  
Anything not described here is **out of scope** for v0.2.0.

---

## 1) Canonical types (single source of truth)

```ts
export type FilterValue =
  | { op: "contains"; value: string }
  | { op: "equals"; value: string | number | boolean | null }
  | { op: "in"; value: Array<string | number> }
  | { op: "range"; value: { from?: string; to?: string } };

export type Filters = Record<string, FilterValue | undefined>;
```

---

## 2) Fetcher contract

`filters` is optional and must be omitted when empty.

```ts
type FetcherQuery = {
  page: number;
  pageSize: number;
  sort?: { field: string; direction: "asc" | "desc" };
  filters?: Filters; // omitted when empty
};
```

### Empty filters rule (LOCKED)
- When there are no active filters, `filters` must be **`undefined`** (not `{}`)

---

## 3) Behavior rules (LOCKED)

- Any filter change **resets** `page = 1`
- Clear single filter
- Clear all filters
- The table **must not** filter rows client-side
- Filters are passed to `fetcher` **as-is**
  - no query builder
  - no operator expansion
  - no transformation

---

## 4) Operator mapping rules (LOCKED)

- Text columns → `{ op: "contains", value: string }`
- Badge/Enum columns → `{ op: "equals", value: string | number | null }`
- Boolean columns → `{ op: "equals", value: boolean | null }`
- Date columns → `{ op: "range", value: { from?: string; to?: string } }`

---

## 5) Forbidden in v0.2.0

- No extra operators (`startsWith`, `endsWith`, `regex`, `gt/lt`, etc.)
- No URL sync
- No saved views
- No advanced filter UI / query builder

---

## 6) Minimal UI guidance

Recommended UI: **header filter row**

- Text input for text columns
- Select for badge/enum columns
- Boolean select: All / True / False
- Date range: from/to (minimal UI)

---

## 7) Required tests

- Apply filter calls `fetcher` with correct `filters`
- Any filter change resets page to 1
- Clear single filter updates `filters` (removed or undefined)
- Clear all filters makes `filters` become `undefined`
