/**
 * Demo 02: Columns & Formatting
 * Metadata and documentation
 */

export const meta = {
  title: 'Columns & Formatting',
  description: 'Different column types, formatting, and badge variants.',
  keywords: ['columns', 'number', 'date', 'badge', 'formatting', 'currency'],
  difficulty: 'beginner',
  learningOutcomes: [
    'Use different column types (text, number, date, badge)',
    'Format numbers as currency, locale strings, decimals',
    'Format dates with locale options',
    'Display badges with color variants',
    'Align column content (left, right, center)',
  ],
  notes: `
## Column Types

### Number Formatting
\`\`\`typescript
// Currency
col.number<T>('price', {
  format: (v) => \`\$\${v.toFixed(2)}\`,
})

// Locale string
col.number<T>('count', {
  format: (v) => v.toLocaleString(),
})

// Custom format
col.number<T>('rating', {
  format: (v) => \`\${v.toFixed(1)} ⭐\`,
})
\`\`\`

### Date Formatting
\`\`\`typescript
col.date<T>('createdAt', {
  format: (d) => d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }),
})
\`\`\`

### Badges
\`\`\`typescript
col.badge<T>('status', {
  variants: {
    active: { bg: '#d4edda', color: '#155724' },
    archived: { bg: '#e2e3e5', color: '#383d41' },
  },
})
\`\`\`

## Best Practices

- Use **col.number** with currency format for prices
- Use **col.date** for timestamps to ensure proper sorting
- Use **col.badge** for status fields with clear color coding
- Always set **align: 'right'** for numbers to improve readability

## Next Steps

Learn about custom column rendering and row actions in the next demo.
  `,
};
