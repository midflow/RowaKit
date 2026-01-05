/**
 * Demo 04: Server Filters
 * Shows how to build filter UI and pass filters to the fetcher
 */

import { RowaKitTable, col } from '@rowakit/table';
import type { Fetcher } from '@rowakit/table';
import { useState } from 'react';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  inStock: boolean;
}

const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Laptop Pro', category: 'Electronics', price: 1299, inStock: true },
  { id: '2', name: 'Mouse Wireless', category: 'Accessories', price: 29, inStock: true },
  { id: '3', name: 'USB-C Cable', category: 'Accessories', price: 19, inStock: true },
  { id: '4', name: 'Monitor 27"', category: 'Electronics', price: 349, inStock: true },
  { id: '5', name: 'Keyboard', category: 'Accessories', price: 89, inStock: false },
  { id: '6', name: 'Chair', category: 'Furniture', price: 299, inStock: true },
  { id: '7', name: 'Desk', category: 'Furniture', price: 599, inStock: false },
  { id: '8', name: 'Monitor Arm', category: 'Accessories', price: 59, inStock: true },
];

const CATEGORIES = ['Electronics', 'Accessories', 'Furniture'];

interface Filters {
  category?: string;
  inStock?: boolean;
  minPrice?: number;
}

const makeProductFetcher = (filters: Filters): Fetcher<Product> => {
  return async (query) => {
    await new Promise((r) => setTimeout(r, 300));

    let data = [...MOCK_PRODUCTS];

    // Apply filters
    if (filters.category) {
      data = data.filter((p) => p.category === filters.category);
    }
    if (filters.inStock !== undefined) {
      data = data.filter((p) => p.inStock === filters.inStock);
    }
    if (filters.minPrice !== undefined) {
      data = data.filter((p) => p.price >= filters.minPrice!);
    }

    // Apply sorting
    if (query.sort) {
      data.sort((a, b) => {
        const av = a[query.sort!.field as keyof Product];
        const bv = b[query.sort!.field as keyof Product];
        const cmp = av < bv ? -1 : av > bv ? 1 : 0;
        return query.sort!.direction === 'asc' ? cmp : -cmp;
      });
    }

    const start = (query.page - 1) * query.pageSize;
    return {
      items: data.slice(start, start + query.pageSize),
      total: data.length,
    };
  };
};

export default function ServerFiltersDemo() {
  const [filters, setFilters] = useState<Filters>({});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ backgroundColor: '#f0f9ff', padding: '12px', borderRadius: '6px', fontSize: '13px' }}>
        <strong>Demo Notes:</strong> Filters are passed to the fetcher function, which applies them before returning data.
      </div>

      <div style={{ display: 'flex', gap: '12px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
        <select
          value={filters.category || ''}
          onChange={(e) => setFilters({ ...filters, category: e.target.value || undefined })}
          style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ddd' }}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <input
            type="checkbox"
            checked={filters.inStock === true}
            onChange={(e) => setFilters({ ...filters, inStock: e.target.checked ? true : undefined })}
          />
          In Stock Only
        </label>

        <button
          onClick={() => setFilters({})}
          style={{
            padding: '6px 12px',
            backgroundColor: '#f0f0f0',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Clear
        </button>
      </div>

      <RowaKitTable
        fetcher={makeProductFetcher(filters)}
        columns={[
          col.text<Product>('name', { sortable: true }),
          col.text<Product>('category', { sortable: true }),
          col.number<Product>('price', {
            format: (v) => `$${v}`,
            align: 'right',
            sortable: true,
          }),
          col.boolean<Product>('inStock', { header: 'In Stock', sortable: true }),
        ]}
        rowKey="id"
        defaultPageSize={10}
      />
    </div>
  );
}
