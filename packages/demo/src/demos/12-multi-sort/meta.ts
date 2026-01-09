/**
 * Demo 12: Multi-Column Sorting
 * Metadata and documentation
 */

export const meta = {
  title: 'Multi-Column Sorting',
  description: 'Sort by multiple columns with Ctrl/Cmd+Click for secondary sorts (Stage E).',
  keywords: ['multi-sort', 'sorting', 'advanced', 'keyboard', 'stage-e'],
  difficulty: 'advanced',
  learningOutcomes: [
    'Use Ctrl/Cmd+Click to add secondary sorts',
    'Understand sort priority indicators [1], [2], etc.',
    'Toggle sort direction while maintaining multi-sort',
    'URL sync preserves multi-sort state',
    'Backward compatible with single-sort clients',
  ],
  notes: `
## Key Points

- **Default Click**: Single sort (primary, clears secondary sorts)
- **Ctrl/Cmd + Click**: Add or toggle secondary sort
- **Shift + Space**: Keyboard equivalent for multi-sort in accessible mode
- **Priority Indicator**: Shows sort order as [2], [3], etc.
- **URL Sync**: Multi-sort saved in URL via \`sorts\` parameter
- **Server Compatibility**: Fetch query includes all sorts in order

## Example Interaction

1. Click "Name" → Sort by Name (ascending)
2. Ctrl+Click "Role" → Now sorted by Name, then Role
3. Ctrl+Click "Email" → Now sorted by Name, then Role, then Email
4. Click "Name" → Back to Name only (secondary sorts cleared)

## URL Representation

\`\`\`
?sorts=[{"field":"name","direction":"asc","priority":0},{"field":"role","direction":"asc","priority":1}]
\`\`\`

## Server Implementation

Your fetcher will receive:
\`\`\`typescript
query.sorts = [
  { field: 'name', direction: 'asc', priority: 0 },
  { field: 'role', direction: 'asc', priority: 1 }
]
\`\`\`
  `,
};
