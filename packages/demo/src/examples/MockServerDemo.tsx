import React from 'react';
import { SmartTable, col } from '@rowakit/table';
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
  { id: '1', name: 'Laptop Pro', category: 'Electronics', price: 1299, stock: 15, inStock: true },
  { id: '2', name: 'Wireless Mouse', category: 'Accessories', price: 29, stock: 50, inStock: true },
  { id: '3', name: 'USB-C Cable', category: 'Accessories', price: 19, stock: 100, inStock: true },
  { id: '4', name: 'Monitor 27"', category: 'Electronics', price: 349, stock: 8, inStock: true },
  { id: '5', name: 'Keyboard Mechanical', category: 'Accessories', price: 89, stock: 0, inStock: false },
  { id: '6', name: 'Desk Chair', category: 'Furniture', price: 299, stock: 12, inStock: true },
  { id: '7', name: 'Desk Lamp', category: 'Furniture', price: 45, stock: 25, inStock: true },
  { id: '8', name: 'Webcam HD', category: 'Electronics', price: 79, stock: 20, inStock: true },
  { id: '9', name: 'Headphones', category: 'Audio', price: 149, stock: 30, inStock: true },
  { id: '10', name: 'Microphone', category: 'Audio', price: 99, stock: 0, inStock: false },
  { id: '11', name: 'Standing Desk', category: 'Furniture', price: 599, stock: 5, inStock: true },
  { id: '12', name: 'Tablet', category: 'Electronics', price: 449, stock: 18, inStock: true },
];

const fetchProducts: Fetcher<Product> = async (query) => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const data = [...MOCK_PRODUCTS];

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
  const items = data.slice(start, end);

  return {
    items,
    total: data.length,
  };
};

export default function MockServerDemo() {
  const handleView = (product: Product) => {
    alert(`Viewing product: ${product.name}`);
  };

  const handleRestock = (product: Product) => {
    alert(`Restocking: ${product.name}`);
  };

  return (
    <>
      <h2>Mock Server Example</h2>
      <p>Testing without backend - simulated server-side pagination and sorting</p>
      
      <SmartTable
        fetcher={fetchProducts}
        columns={[
          col.text<Product>('name', { header: 'Product Name', sortable: true }),
          col.text<Product>('category', { sortable: true }),
          col.text<Product>('price', {
            sortable: true,
            format: (price) => `$${price.toFixed(2)}`,
          }),
          col.text<Product>('stock', { sortable: true }),
          col.boolean<Product>('inStock', { header: 'Available' }),
          col.actions<Product>([
            { id: 'view', label: 'View', onClick: handleView },
            {
              id: 'restock',
              label: 'Restock',
              onClick: handleRestock,
              disabled: (product) => product.inStock,
            },
          ]),
        ]}
        rowKey="id"
      />
    </>
  );
}
