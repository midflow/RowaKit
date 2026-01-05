/**
 * Demo 04: Server-side Filters
 * Metadata and documentation
 */

export const meta = {
  title: 'Server-side Filters',
  description: 'Filter data with server-side filtering.',
  keywords: ['filters', 'server-side', 'search', 'advanced-query'],
  difficulty: 'intermediate',
  learningOutcomes: [
    'Create custom filter UI',
    'Pass filter parameters to fetcher',
    'Combine multiple filter conditions',
    'Manage filter state independently from table state',
  ],
  notes: `
## Server-side Filtering Pattern

Build a fetcher factory that accepts filter parameters:

\`\`\`typescript
interface FilterParams {
  category?: string;
  inStock?: boolean;
  minPrice?: number;
}

const fetchProducts = (filters: FilterParams): Fetcher<Product> => {
  return async (query) => {
    const response = await fetch('/api/products/filtered', {
      body: JSON.stringify({
        page: query.page,
        pageSize: query.pageSize,
        sort: query.sort,
        filters,
      }),
    });
    return response.json();
  };
};
\`\`\`

## Managing Filter State

Keep filters separate from table state:

\`\`\`typescript
const [filters, setFilters] = useState<FilterParams>({});

const handleCategoryChange = (category: string) => {
  setFilters({ ...filters, category });
};

// When filter changes, fetcher is recreated
<RowaKitTable
  fetcher={fetchProducts(filters)}
  columns={[...]}
/>
\`\`\`

## Best Practices

- Reset filters to defaults with a "Clear Filters" button
- Preserve filter state across pagination
- Disable sorting/filtering on expensive fields if needed
- Show active filter count to user

## Next Steps

Learn about URL synchronization for shareable, bookmarkable filters in the next demo.
  `,
};
