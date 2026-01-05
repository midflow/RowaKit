import type { DemoMeta } from '../../app/demoRegistry';

export const meta: DemoMeta = {
  id: '07-column-resize',
  title: 'Column Sizing',
  description:
    'Configure static column widths and alignment. Learn about column proportions, formatting numbers and dates with proper alignment.',
  difficulty: 'intermediate',
  keywords: ['columns', 'sizing', 'alignment', 'formatting', 'numbers'],
  learningOutcomes: [
    'Define columns with different data types (text, number)',
    'Format numbers with locale-aware formatting',
    'Align columns based on content type (right-align for numbers)',
    'Create semantic HTML with proper column headers',
    'Handle pagination and sorting on formatted columns',
  ],
  notes: `## Column Sizing & Formatting Patterns

### Number Formatting
Format numbers with locale-aware toLocaleString():
\`\`\`typescript
col.number<DataPoint>('q1', {
  header: 'Q1',
  align: 'right',
  format: (v) => v.toLocaleString()  // 10000 → "10,000"
})
\`\`\`

### Column Alignment
Align columns based on content type:
\`\`\`typescript
// Right-align for numbers
col.number('revenue', { align: 'right' })

// Left-align (default) for text
col.text('name', { align: 'left' })

// Center-align for status/badges
col.badge('status', { align: 'center' })
\`\`\`

### Column Proportions
Tables automatically distribute column widths. You can influence proportions with flex:
\`\`\`typescript
col.text('name', { flex: 1.5 })  // Takes 1.5x default width
col.text('email', { flex: 1 })   // Takes 1x default width
col.number('value', { flex: 0.8 })  // Takes 0.8x default width
\`\`\`

### Best Practices
- **Numeric Alignment**: Always right-align numbers for readability
- **Locale Formatting**: Use toLocaleString() for user's locale
- **Column Headers**: Use clear, meaningful headers
- **Responsive**: Columns adapt to container width automatically
- **Readable Line Height**: Data tables typically use 1.5x line height for readability

### Common Patterns
- **Metric Tables**: Mix text column (metric name) with numeric columns (Q1, Q2, Q3, Q4, Total)
- **Financial Data**: Right-align all amounts, format with thousands separator
- **Data Grid**: Sortable header, aligned data, consistent spacing
- **Fixed Proportions**: Use flex property to maintain column ratio
- **Summary Rows**: Highlight total/summary rows with different styling`,
  nextSteps: 'Try combining column sizing with filters and sorting for better data exploration',};