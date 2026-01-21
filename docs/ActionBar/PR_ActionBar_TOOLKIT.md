# PR SPEC — ActionBar (OSS, Table Toolkit)

> ActionBar is a **table-adjacent selection component** inside `@rowakit/table`.

---

## Placement

```
packages/table/src/components/action-bar/
```

ActionBar is **not** a standalone npm package.

---

## Responsibility

- Display selection summary
- Host bulk action triggers
- Remain orchestration-free

---

## Standalone Usage

```tsx
<ActionBar
  selectedCount={selectedCount}
  actions={[...]}
/>
```

---

## Table Toolkit Usage

- Table manages row selection
- Consumer passes selectedCount
- ActionBar reacts visually

---

## Scope Locks

- ❌ No cross-page selection
- ❌ No background jobs
- ❌ No permission logic

---

## Deliverables

- Component
- Tests
- Standalone demo
- Combined demo
- Documentation

---

## Definition of Done

- Exported from `@rowakit/table`
- Tests pass
- Docs updated
