import type { DemoMeta } from '../../app/demoRegistry';

export const meta: DemoMeta = {
  id: '08-advanced-query',
  title: 'Advanced Query Patterns',
  description:
    'Master complex table scenarios by combining filtering, sorting, URL synchronization, saved views, and column resizing. Learn best practices for production tables.',
  difficulty: 'advanced',
  keywords: [
    'filters',
    'sorting',
    'URL sync',
    'persistence',
    'resizing',
    'stale requests',
    'latency',
    'production',
  ],
  learningOutcomes: [
    'Combine multiple table features (filters, sort, resize) in a single implementation',
    'Synchronize filter state with URL query parameters for shareable links',
    'Handle network latency and stale request scenarios gracefully',
    'Persist column widths and filter preferences across sessions',
    'Implement progressive enhancement patterns for production tables',
  ],
  notes: `## Advanced Query Patterns

### Combining Multiple Features
Build powerful tables by composing individual features:

\`\`\`typescript
const [filters, setFilters] = useState<Filters>({});
const [columnWidths, setColumnWidths] = useState({});

// Sync filters + widths to URL
useEffect(() => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined) params.set(k, String(v));
  });
  window.location.hash = params.toString();
}, [filters]);

// Fetch with filters
const fetcher: Fetcher<Order> = async (query) => {
  const response = await fetch('/api/orders', {
    body: JSON.stringify({
      ...query,
      filters, // Apply client-side or let server filter
    }),
  });
  return response.json();
};
\`\`\`

### Handling Stale Requests
When filters change rapidly, cancel previous requests:

\`\`\`typescript
const abortController = useRef<AbortController>(null);

const fetcher: Fetcher<Order> = async (query) => {
  // Cancel previous request
  abortController.current?.abort();
  abortController.current = new AbortController();

  try {
    const response = await fetch('/api/orders', {
      signal: abortController.current.signal,
      body: JSON.stringify({ ...query, filters }),
    });
    return response.json();
  } catch (err) {
    if (err.name === 'AbortError') return { items: [], count: 0 };
    throw err;
  }
};
\`\`\`

### Progressive Enhancement
Gracefully degrade when features are unavailable:

\`\`\`typescript
// Start with basic table
const enhancedTable = {
  // Feature 1: Pagination (always)
  pageSize: 20,
  
  // Feature 2: Sorting (if API supports)
  sortable: apiSupports.sorting,
  
  // Feature 3: Filtering (if API supports)
  filters: apiSupports.filtering ? filters : undefined,
  
  // Feature 4: URL sync (if client-side routing available)
  syncToUrl: typeof window !== 'undefined',
  
  // Feature 5: Column resize (if localStorage available)
  resizable: typeof window !== 'undefined' && localStorage,
};
\`\`\`

### Best Practices
- **Debounce Filters**: Wait 300ms after filter change before fetching
- **Show Loading State**: Display spinner while filters are being applied
- **Default Filters**: Start with sensible defaults (e.g., "active only")
- **Reset Function**: Provide "Clear All Filters" button for discoverability
- **Share Links**: Include all filter/sort params in URL for team collaboration
- **Accessibility**: Label filter controls, support keyboard navigation
- **Mobile**: Stack filters vertically, use select instead of multi-select on small screens

### Error Scenarios to Handle
1. **Network timeout**: Show retry button
2. **Invalid filters**: Validate on client before sending to server
3. **No results**: Display helpful message with clear filter suggestion
4. **Permission denied**: Show appropriate error, not raw 403 response
5. **Server error**: Log to monitoring, show generic "Something went wrong" message`,
  nextSteps: 'Consider adding saved queries, export to CSV, or conditional formatting based on data values',
};
