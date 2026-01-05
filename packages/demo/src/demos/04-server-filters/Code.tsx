import { RowaKitTable, col } from '@rowakit/table';
import type { Fetcher } from '@rowakit/table';
import { useState } from 'react';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
}

interface Filters {
  category?: string;
  minPrice?: number;
}

const makeProductFetcher = (filters: Filters): Fetcher<Product> => {
  return async (query) => {
    const response = await fetch('/api/products/filtered', {
      body: JSON.stringify({ ...query, filters }),
    });
    return response.json();
  };
};

export default function MyTable() {
  const [filters, setFilters] = useState<Filters>({});

  return (
    <div>
      <select
        value={filters.category || ''}
        onChange={(e) =>
          setFilters({ ...filters, category: e.target.value || undefined })
        }
      >
        <option value="">All Categories</option>
        <option value="Electronics">Electronics</option>
      </select>

      <RowaKitTable
        fetcher={makeProductFetcher(filters)}
        columns={[
          col.text<Product>('name', { sortable: true }),
          col.text<Product>('category'),
          col.number<Product>('price', { format: (v) => `$${v}` }),
        ]}
        rowKey="id"
      />
    </div>
  );
}
