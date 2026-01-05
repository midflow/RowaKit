/**
 * MockServerDemo Code - E-commerce products table
 * Shows: mock server fetching, pagination, sorting, stock status
 */

export const code = `import { RowaKitTable, col } from '@rowakit/table';
import type { Fetcher } from '@rowakit/table';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  inStock: boolean;
}

// Mock server response
const fetchProducts: Fetcher<Product> = async (query) => {
  const response = await fetch('/api/products', {
    body: JSON.stringify({
      page: query.page,
      pageSize: query.pageSize,
      sort: query.sort,
    }),
  });
  return response.json();
};

export default function ProductTable() {
  return (
    <RowaKitTable
      fetcher={fetchProducts}
      columns={[
        col.text<Product>('name', { header: 'Product Name', sortable: true }),
        col.text<Product>('category', { sortable: true }),
        col.number<Product>('price', {
          sortable: true,
          format: (v) => \`$\${v.toFixed(2)}\`,
        }),
        col.number<Product>('stock', { sortable: true }),
        col.boolean<Product>('inStock', { header: 'Available' }),
      ]}
      rowKey="id"
    />
  );
}`;
