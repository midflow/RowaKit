import { RowaKitTable, col } from '@rowakit/table';
import type { Fetcher } from '@rowakit/table';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  rating: number;
  status: 'active' | 'archived' | 'draft';
  releaseDate: string; // Store as ISO string to avoid Date type issues
}

const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Laptop Pro',
    category: 'Electronics',
    price: 1299.99,
    stock: 15,
    rating: 4.8,
    status: 'active',
    releaseDate: '2023-01-15',
  },
  {
    id: '2',
    name: 'Wireless Mouse',
    category: 'Accessories',
    price: 29.99,
    stock: 150,
    rating: 4.3,
    status: 'active',
    releaseDate: '2022-06-10',
  },
  {
    id: '3',
    name: 'USB-C Cable',
    category: 'Accessories',
    price: 19.99,
    stock: 500,
    rating: 4.5,
    status: 'active',
    releaseDate: '2022-03-20',
  },
];

const fetchProducts: Fetcher<Product> = async (query) => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  let data = [...MOCK_PRODUCTS];

  if (query.sort) {
    data.sort((a, b) => {
      const aVal = a[query.sort!.field as keyof Product];
      const bVal = b[query.sort!.field as keyof Product];
      const result = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return query.sort!.direction === 'asc' ? result : -result;
    });
  }

  const start = (query.page - 1) * query.pageSize;
  const end = start + query.pageSize;

  return {
    items: data.slice(start, end),
    total: data.length,
  };
};

export default function ColumnsFormattingDemo() {
  return (
    <div>
      <h2>Columns & Formatting</h2>
      <p>Explore different column types and formatting options.</p>
      <RowaKitTable
        fetcher={fetchProducts}
        columns={[
          col.text<Product>('name', { header: 'Product', sortable: true }),
          col.text<Product>('category', { sortable: true }),

          // Number with currency format
          col.number<Product>('price', {
            header: 'Price',
            sortable: true,
            format: (v) => `$${v.toFixed(2)}`,
            align: 'right',
          }),

          // Number with locale formatting
          col.number<Product>('stock', {
            header: 'Stock',
            sortable: true,
            format: (v) => v.toLocaleString(),
            align: 'right',
          }),

          // Number with decimal places
          col.number<Product>('rating', {
            header: 'Rating',
            sortable: true,
            format: (v) => `${v.toFixed(1)} ⭐`,
          }),

          // Date formatting (from string)
          col.date<Product>('releaseDate', {
            header: 'Released',
            sortable: true,
            format: (d) => {
              const dateObj = new Date(d as any);
              return dateObj.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });
            },
          }),

          // Badge column  
          col.badge<Product>('status', {
            sortable: true,
          }),
        ]}
        rowKey="id"
      />
    </div>
  );
}
