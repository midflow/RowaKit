import { RowaKitTable, col } from '@rowakit/table';
import type { Fetcher } from '@rowakit/table';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

const fetcher: Fetcher<Product> = async (query) => {
  const response = await fetch('/api/products', {
    body: JSON.stringify(query),
  });
  return response.json();
};

export default function MyTable() {
  return (
    <RowaKitTable
      fetcher={fetcher}
      columns={[
        col.text<Product>('name', { sortable: true }),
        col.number<Product>('price', {
          format: (v) => `$${v.toFixed(2)}`,
          align: 'right',
        }),
        col.number<Product>('stock', {
          format: (v) => v.toLocaleString(),
        }),
      ]}
      rowKey="id"
    />
  );
}
