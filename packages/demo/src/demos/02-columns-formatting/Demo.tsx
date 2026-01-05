/**
 * Demo 02: Columns & Formatting
 * Shows different column types and formatting options
 */

import { RowaKitTable, col } from '@rowakit/table';
import type { Fetcher } from '@rowakit/table';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  inStock: boolean;
}

const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Laptop Pro', category: 'Electronics', price: 1299.99, stock: 15, inStock: true },
  { id: '2', name: 'Wireless Mouse', category: 'Accessories', price: 29.99, stock: 150, inStock: true },
  { id: '3', name: 'USB-C Cable', category: 'Accessories', price: 19.99, stock: 500, inStock: true },
  { id: '4', name: 'Monitor 27"', category: 'Electronics', price: 349.99, stock: 0, inStock: false },
  { id: '5', name: 'Mechanical Keyboard', category: 'Accessories', price: 89.99, stock: 35, inStock: true },
];

const fetchProducts: Fetcher<Product> = async (query) => {
  await new Promise((r) => setTimeout(r, 300));
  let data = [...MOCK_PRODUCTS];

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

export default function ColumnsFormattingDemo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ backgroundColor: '#f0f9ff', padding: '12px', borderRadius: '6px', fontSize: '13px' }}>
        <strong>Demo Notes:</strong> Different column types:
        <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
          <li><code>col.text()</code> — Basic text with sortable</li>
          <li><code>col.number()</code> — Format as currency, decimals, locale</li>
          <li><code>col.boolean()</code> — True/False display</li>
        </ul>
      </div>

      <RowaKitTable
        fetcher={fetchProducts}
        columns={[
          col.text<Product>('name', { header: 'Product Name', sortable: true }),
          col.text<Product>('category', { sortable: true }),
          col.number<Product>('price', {
            header: 'Price',
            sortable: true,
            format: (v) => `$${v.toFixed(2)}`,
            align: 'right',
          }),
          col.number<Product>('stock', {
            header: 'Stock',
            sortable: true,
            format: (v) => v.toLocaleString(),
            align: 'right',
          }),
          col.boolean<Product>('inStock', { header: 'Available', sortable: true }),
        ]}
        rowKey="id"
        defaultPageSize={10}
      />
    </div>
  );
}
