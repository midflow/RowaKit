# PR SPEC — QueryToolbar (OSS, Table Toolkit)

> QueryToolbar is a **table-adjacent component** inside `@rowakit/table`.

---

## Placement

```
packages/table/src/components/query-toolbar/
```

QueryToolbar is **not** a standalone npm package.

---

## Responsibility

- Control and visualize **query state**
- Not responsible for data fetching
- Not responsible for persistence

---

## Standalone Usage

QueryToolbar must be usable without mounting a Table.

```tsx
<QueryToolbar
  query={query}
  onQueryChange={setQuery}
/>
```

---

## Table Toolkit Usage

When used with Table, QueryToolbar:
- Receives query state from consumer
- Emits query changes back to consumer
- Table reacts via existing fetcher logic

---

## Scope Locks

- ❌ No FilterPanel implementation
- ❌ No jobs or workflows
- ❌ No auto-connection to table internals

---

## Deliverables

- Component implementation
- Unit + integration tests
- Standalone demo
- Combined demo with Table + ActionBar
- Documentation page

---

## Definition of Done

- Exported from `@rowakit/table`
- Tests pass
- Docs updated
