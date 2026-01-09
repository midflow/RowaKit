/**
 * Demo 11: CSV Export
 * Metadata and documentation
 */

export const meta = {
  title: 'CSV Export',
  description: 'Export table data to CSV based on current filters and sorting (Stage E).',
  keywords: ['export', 'csv', 'download', 'integration', 'stage-e'],
  difficulty: 'intermediate',
  learningOutcomes: [
    'Implement exporter function to handle export requests',
    'Receive current query state (filters, sort, pagination)',
    'Return Blob or URL for download',
    'Handle export errors with inline error display',
    'Use ExportButton component in toolbar',
  ],
  notes: `
## Key Points

- **exporter**: Callback receiving FetcherQuery with current state
- **Query Snapshot**: Includes page, pageSize, sort, filters (respects current state)
- **Return Types**: \`{ url: string }\` for server-provided URL or Blob for client-generated data
- **Loading State**: ExportButton shows loading indicator during export
- **Error Handling**: Failures display inline in the button area
- **Non-blocking**: Doesn't interrupt table interaction

## Example

\`\`\`typescript
const handleExport = async (query: FetcherQuery) => {
  const response = await fetch('/api/export/csv', {
    method: 'POST',
    body: JSON.stringify({ query })
  });
  
  if (!response.ok) throw new Error('Export failed');
  
  return { url: await response.text() };
};

<SmartTable
  fetcher={fetcher}
  columns={columns}
  exporter={handleExport}
/>
\`\`\`

## Server-Side Export Advantages

- Query sent to server (filters, sort, pagination state)
- Server can apply same logic and generate export
- Large datasets don't need client-side processing
  `,
};
