# SmartTable Roadmap & Issues Pack

> Mục tiêu: phát triển **Smart Server Table** (Business-first Table) theo từng giai đoạn rõ ràng để Agent AI bám sát scope, tránh “lệch hướng”.
>
> Nguyên tắc: **Opinionated**, tối ưu cho **server-side**, **API gọn**, **core nhỏ + escape hatch** (`col.custom()`), không over-engineer.

---

## 0) Glossary

- **SmartTable**: React component hiển thị bảng dữ liệu (server-side paging/sort/filter).
- **Fetcher**: hàm lấy dữ liệu theo query chuẩn của SmartTable.
- **Column helpers**: `col.text`, `col.date`, `col.boolean`, `col.actions`, `col.custom`.
- **Actions**: thao tác theo row (view/edit/delete...), có confirm/disable/loading chuẩn.

---

## 1) Guardrails (Agent MUST follow)

### 1.1 MUST
- Server-side là **first-class**: mọi paging/sort/filter đều đi qua `fetcher`.
- API phải **ít props**, dễ đọc, ưu tiên convention.
- Có **escape hatch**: `col.custom(field, render)` để tránh phình API.
- Mọi behavior quan trọng phải test được: state transitions, query mapping, action callbacks.
- Output chính: **library + docs + examples** (không cần app demo lớn).

### 1.2 MUST NOT (trong MVP & v1)
- ❌ Virtualization / infinite scroll / Excel-like grid
- ❌ Inline editing phức tạp, cell editing, spreadsheet features
- ❌ Client-side data engine (filter/sort lớn) — chỉ hỗ trợ basic local formatting
- ❌ Query builder UI, column pinning, grouping, pivot
- ❌ Theme system phức tạp; chỉ cần CSS variables / minimal tokens

### 1.3 Definition of Done (mọi stage)
- Có `README` rõ ràng + 1–2 ví dụ chạy được.
- Có test tối thiểu cho core (unit + component).
- Có `CHANGELOG`/notes nội bộ cho breaking changes.

---

## 2) Phased Feature Plan

### Stage A — MVP 0.1 (Ship nhanh, đúng 80%)
**Mục tiêu:** Dùng được ngay cho internal app: server-side paging + 4 column types + actions + basic states.

#### A.1 Features (IN SCOPE)
1. `<SmartTable />` component core
2. Fetcher contract chuẩn:
   ```ts
   type Fetcher<T> = (query: {
     page: number
     pageSize: number
     sort?: { field: string; direction: "asc" | "desc" }
     filters?: Record<string, any>
   }) => Promise<{ items: T[]; total: number }>
   ```
3. Column types (MVP 4 + escape hatch):
   - `col.text(field, opts?)`
   - `col.date(field, opts?)`
   - `col.boolean(field, opts?)`
   - `col.actions(actions[])`
   - `col.custom(field, render)` (escape hatch — bắt buộc)
4. Table states:
   - Loading (skeleton)
   - Empty state
   - Error state (retry)
5. Pagination UI:
   - next/prev, page number
   - page size selector (default list: 10/20/50)
6. Sorting:
   - Single-column sort (toggle asc/desc/none)
7. Actions:
   - action click callback
   - optional confirm (delete)
   - disable while loading
8. Minimal styling:
   - CSS variables / basic tokens
   - sticky header (optional flag)

#### A.2 Non-goals (EXPLICITLY OUT)
- Multi-sort, advanced filters UI, export, column resizing, row selection bulk actions.

#### A.3 Deliverables
- `packages/smart-table` (library)
- `apps/example` (minimal example, optional but recommended)
- `docs/` hoặc `README.md` với API + examples

---

### Stage B — v1.0 (Sản xuất ổn định cho phần lớn team)
**Mục tiêu:** Làm cho table “đủ trưởng thành” cho production: filter cơ bản, column ergonomics, DX.

#### B.1 Features (IN SCOPE)
1. Thêm 2 column types (high ROI):
   - `col.badge(field, map?)` (enum/status)
   - `col.number(field, opts?)` (align, format)
2. Filters cơ bản (server-side):
   - Filter definition per column (simple: text contains, equals, boolean, date range minimal)
   - Filter bar nhẹ (optional): show applied filters + clear all
3. Column ergonomics:
   - `sortable()`, `filterable()`, `width()`, `align()`, `tooltip()`, `truncate()`
4. Row key:
   - `rowKey` prop hoặc auto by `id`
5. Empty state customization:
   - message, action button (e.g., “Create”)
6. Error handling:
   - pass-through error message + optional `onError`
7. Accessibility basics:
   - keyboard focus for header sort & action buttons
   - aria labels

#### B.2 Non-goals
- Column grouping, pinning, virtualization, drag-drop.

#### B.3 Deliverables
- “Upgrade guide” từ MVP → v1 (nếu breaking)
- More examples: server-side search, enum status, delete confirm

---

### Stage C — v1.5+ (Add-ons theo nhu cầu thật)
**Mục tiêu:** Chỉ làm khi có nhu cầu rõ ràng từ người dùng.

#### C.1 Candidates (CHỈ KHI CÓ DEMAND)
- Row selection + bulk actions (careful: API explode)
- Export CSV (server-side triggered)
- Persist table state to URL (page/sort/filter)
- Column visibility toggles

#### C.2 Still out (trừ khi pivot sản phẩm)
- Full data-grid features: spreadsheet editing, pivot, grouping.

---

## 3) Issue Pack (Detailed)

> Format mỗi issue: **Goal → Scope → Tasks → Acceptance Criteria → Out of scope**  
> Tag gợi ý: `stage:A`, `stage:B`, `stage:C`, `core`, `dx`, `ui`, `test`, `docs`

---

# Stage A — MVP 0.1 Issues

## A-01: Repo scaffold & package layout
**Tags:** stage:A, core, dx  
**Goal:** Tạo cấu trúc repo để phát triển & publish library ổn định.

**Scope**
- Monorepo (pnpm/npm/yarn) hoặc single package (tùy đội). Khuyến nghị monorepo.
- TypeScript, build (tsup/vite), lint/format, test runner.

**Tasks**
- Init workspace
- `packages/smart-table` với entry `index.ts`
- Setup build + types output
- Setup testing (vitest + testing-library/react)
- Add minimal CI (lint/test/build)

**Acceptance Criteria**
- `pnpm test` / `pnpm build` chạy pass
- Package build ra `dist` có type definitions

**Out of scope**
- Publishing lên npm (có thể làm sau)

---

## A-02: Define core types (Fetcher, Column, Action)
**Tags:** stage:A, core  
**Goal:** Chuẩn hoá contract để các phần khác bám vào.

**Scope**
- `Fetcher<T>`
- `ColumnDef<T>`
- `ActionDef<T>`

**Tasks**
- Define `FetcherQuery`, `FetcherResult`
- Define `ColumnKind` union
- Define `Action` interface: `id`, `label`, `icon?`, `confirm?`, `onClick(row)`

**Acceptance Criteria**
- Types compile, exported publicly
- Example usage in `README` compiles

**Out of scope**
- Advanced generics perfection; ưu tiên DX

---

## A-03: Column helper factory `col.*`
**Tags:** stage:A, core, dx  
**Goal:** Giảm boilerplate cho dev khi define columns.

**Scope**
- `col.text`, `col.date`, `col.boolean`, `col.actions`, `col.custom`

**Tasks**
- Implement helper functions returning `ColumnDef`
- Support basic options: `header?`, `sortable?`, `format?`
- `col.custom(field, render)` receives `(row) => ReactNode`

**Acceptance Criteria**
- Columns defined in example render đúng
- `col.custom` cho phép render Money/Badge tùy ý

**Out of scope**
- `col.number`, `col.badge` (Stage B)

---

## A-04: SmartTable component core rendering
**Tags:** stage:A, core, ui  
**Goal:** Render table với header/body, mapping columns to cells.

**Scope**
- Basic table layout (thead/tbody)
- Header labels, row rendering
- No fancy styling beyond basic

**Tasks**
- Props: `fetcher`, `columns`, `pageSizeOptions?`, `defaultPageSize?`, `rowKey?`
- Render header cells based on `ColumnDef`
- Render body rows, use `rowKey`

**Acceptance Criteria**
- Renders correctly with mocked data
- Column order stable
- `rowKey` works

**Out of scope**
- Row selection, grouping

---

## A-05: Data fetching state machine (loading/error/empty)
**Tags:** stage:A, core, test  
**Goal:** Fetch data theo query và xử lý states chuẩn.

**Scope**
- Internal state: `page`, `pageSize`, `sort`, `filters`
- Request lifecycle: idle → loading → success/error
- Retry action

**Tasks**
- Trigger fetch on mount & query changes
- Debounce? (NOT in MVP; keep simple)
- Ensure stale responses ignored (basic request id)

**Acceptance Criteria**
- Loading skeleton shown during fetch
- Error state shows retry; retry calls fetcher again
- Empty state when `items.length === 0`

**Out of scope**
- Caching layer

---

## A-06: Pagination UI + behavior
**Tags:** stage:A, ui, core, test  
**Goal:** Điều hướng page và đổi page size.

**Scope**
- Controls: prev/next, page indicator, page size select
- Resets page to 1 on pageSize change

**Tasks**
- Compute total pages from `total/pageSize`
- Disable prev/next at bounds
- `onPageChange` internal

**Acceptance Criteria**
- Changing page triggers fetcher with correct query
- Changing page size triggers fetcher with new pageSize and page=1

**Out of scope**
- Jump-to-page input

---

## A-07: Single-column sorting
**Tags:** stage:A, core, ui, test  
**Goal:** Toggle sort in header.

**Scope**
- Click header cycles: none → asc → desc → none
- Only if `column.sortable === true`

**Tasks**
- Add click handler on sortable columns
- Render sort indicator (simple arrow/up-down)

**Acceptance Criteria**
- Fetcher called with correct `sort.field` + direction
- Sorting resets page to 1

**Out of scope**
- Multi-sort

---

## A-08: Actions column (with confirm & loading disable)
**Tags:** stage:A, ui, core, test  
**Goal:** Standardize row actions.

**Scope**
- `col.actions([action.edit(), action.delete({confirm:true})])`
- Confirmation modal/simple confirm dialog
- Disabled when table loading

**Tasks**
- Define `action` helpers optional (or just ActionDef)
- Implement confirm flow
- Ensure `onClick(row)` called only after confirm

**Acceptance Criteria**
- Delete confirm appears and blocks until confirm
- While loading: action buttons disabled

**Out of scope**
- Permission-based actions

---

## A-09: Styling tokens + minimal theme
**Tags:** stage:A, ui  
**Goal:** Table nhìn “đủ đẹp” mà không nặng.

**Scope**
- CSS variables for spacing, border, font
- Basic responsive overflow (horizontal scroll)

**Tasks**
- Provide default CSS
- Allow `className` override

**Acceptance Criteria**
- Table usable in a basic app without extra CSS
- No layout break with long text (truncate optional future)

**Out of scope**
- Full theming system

---

## A-10: Documentation + minimal examples ✅ DONE
**Tags:** stage:A, docs  
**Goal:** Dev đọc là dùng được ngay.

**Status:** ✅ Complete (2024-12-31)

**Scope**
- README: quickstart, fetcher contract, columns, actions, states, styling
- Examples: Basic usage, mock server, custom columns, styling
- Contributing guidelines
- Changelog

**Delivered:**
- ✅ Comprehensive README with 5-minute quick start
- ✅ 4 complete examples with detailed comments:
  - `examples/basic-usage.tsx` - Complete user management table
  - `examples/mock-server.tsx` - Testing without backend (12 products mock)
  - `examples/custom-columns.tsx` - Advanced rendering with col.custom()
  - `examples/styling.tsx` - Theming and CSS customization
- ✅ Examples README with patterns and common use cases
- ✅ CHANGELOG.md with full v0.1.0 release notes
- ✅ CONTRIBUTING.md with development workflow, testing, coding standards
- ✅ Enhanced package.json metadata (keywords, links, author)
- ✅ Direct links from README to examples
- ✅ All acceptance criteria met

**Acceptance Criteria** ✅
- ✅ New dev can run example in <5 minutes (quick start guide)
- ✅ README code compiles and is type-safe
- ✅ Examples are runnable and well-documented
- ✅ Contributing guidelines cover all workflows

**Out of scope**
- Full docs site (future enhancement)

---

# Stage B — v1.0 Issues

## B-01: Add `col.badge` for enum/status
**Tags:** stage:B, core, ui  
**Goal:** Render status/enum đẹp và nhất quán.

**Scope**
- `col.badge(field, map?)` where map: value → {label, tone?}
- Default fallback label = String(value)

**Acceptance Criteria**
- Status values render as pill/badge
- Works with server-side sort/filter (if enabled)

---

## B-02: Add `col.number` with formatting
**Tags:** stage:B, core, ui  
**Goal:** Số hiển thị căn phải và format.

**Scope**
- Options: `format` (Intl), `precision`, `align`

**Acceptance Criteria**
- Numeric columns align right by default
- Formatting applied consistently

---

## B-03: Column modifiers API (ergonomics)
**Tags:** stage:B, dx, core  
**Goal:** API chainable: `col.text("email").sortable().width(240)`.

**Scope**
- `sortable()`, `filterable()`, `width(px)`, `align()`, `tooltip()`, `truncate()`

**Acceptance Criteria**
- Modifiers produce stable ColumnDef
- Backwards compatible with Stage A columns if possible

---

## B-04: Basic filters (server-side)
**Tags:** stage:B, core, ui, test  
**Goal:** Filter định nghĩa đơn giản, gửi về fetcher.

**Scope**
- Filter types:
  - text contains
  - equals (enum)
  - boolean
  - date range (min/max)
- Filter UI tối giản: popover per column OR filter row

**Acceptance Criteria**
- Applying filter triggers fetcher with `filters` object
- Clear filter resets and refetch
- Filter state visible to user

---

## B-05: URL state sync (optional, if requested)
**Tags:** stage:B, dx  
**Goal:** Persist page/sort/filter to URL for shareable links.

**Acceptance Criteria**
- Reload keeps state if query params exist

**Note**
- Nếu scope rủi ro, chuyển Stage C.

---

## B-06: A11y pass
**Tags:** stage:B, ui, test  
**Goal:** Keyboard/aria cho sort/action.

**Acceptance Criteria**
- Sort togglable via keyboard
- Buttons have aria-label

---

## B-07: Production docs + upgrade guide
**Tags:** stage:B, docs  
**Goal:** Docs đủ cho team dùng lâu dài.

**Acceptance Criteria**
- Upgrade guide from MVP
- Examples: status badge, number column, filters

---

# Stage C — v1.5+ (Candidates) Issues

## C-01: Row selection + bulk actions (careful)
**Tags:** stage:C, core, ui  
**Goal:** Select rows and apply bulk operations without API bloat.

**Acceptance Criteria**
- Selection state + bulk toolbar
- Does not break existing API

---

## C-02: Export CSV (server-trigger)
**Tags:** stage:C, ui  
**Goal:** Export based on current filters/sort, initiated from UI.

**Acceptance Criteria**
- Calls provided `exporter(query)` hook
- Works with large data (server handles)

---

## C-03: Column visibility toggles
**Tags:** stage:C, ui  
**Goal:** Toggle columns for user preferences.

**Acceptance Criteria**
- Visible columns persisted (localStorage optional)

---

## 4) Agent Execution Notes (How to not drift)

- Implement in order: **A-01 → A-10**. Do not start Stage B until Stage A passes.
- Whenever a “new feature” idea appears, first classify: `Stage A/B/C` or `Out of scope`.
- Keep `col.custom()` strong so Stage B doesn’t balloon.
- Prefer small, composable primitives over big frameworks.

---

## 5) Quick Checklist (MVP readiness)

- [ ] fetcher contract stable
- [ ] pagination works
- [ ] sorting works
- [ ] loading/error/empty states work
- [ ] actions confirm works
- [ ] docs + example works
- [ ] tests cover query mapping & state changes
