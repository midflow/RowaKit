/**
 * Demo 05: URL Synchronization
 * Metadata and documentation
 */

export const meta = {
  title: 'URL Synchronization',
  description: 'Sync table state (page, sort) to URL for shareable, bookmarkable links.',
  keywords: ['url', 'sync', 'shareable', 'bookmarkable', 'query-params'],
  difficulty: 'intermediate',
  learningOutcomes: [
    'Sync table state to URL query parameters',
    'Load state from URL on component mount',
    'Enable shareable and bookmarkable links',
    'Handle invalid URL parameters gracefully',
  ],
  notes: `
## URL Sync Pattern

Use useState for table state and useEffect to sync:

\`\`\`typescript
const [state, setState] = useState<TableState>({ 
  page: 1, 
  pageSize: 10 
});

// Sync to URL when state changes
useEffect(() => {
  const params = new URLSearchParams();
  params.set('page', String(state.page));
  if (state.sort) {
    params.set('sortBy', state.sort.field);
    params.set('sortDir', state.sort.direction);
  }
  window.history.replaceState(null, '', \`?\${params}\`);
}, [state]);

// Load from URL on mount
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  setState({
    page: parseInt(params.get('page') || '1'),
    pageSize: parseInt(params.get('pageSize') || '10'),
  });
}, []);
\`\`\`

## Safe Parameter Handling

Always validate URL parameters to avoid errors:

\`\`\`typescript
const page = Math.max(1, parseInt(params.get('page') || '1'));
const pageSize = [10, 25, 50].includes(pageSize) ? pageSize : 10;
\`\`\`

## Sharing Links

Add a "Copy Link" button for easy sharing:

\`\`\`typescript
const handleCopyUrl = () => {
  navigator.clipboard.writeText(window.location.href);
};
\`\`\`

## Next Steps

Learn about persisting views to localStorage in the next demo.
  `,
};
