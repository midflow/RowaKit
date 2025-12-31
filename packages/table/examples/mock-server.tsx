/**
 * Mock Server Example - Testing Without a Real Backend
 * 
 * This example demonstrates:
 * - Creating a mock server-side fetcher
 * - Simulating pagination, sorting, and delays
 * - Testing table behavior without a real API
 */

/* eslint-disable no-console */

import React from 'react';
import { RowaKitTable, col } from '@rowakit/table';
import type { Fetcher, FetcherQuery } from '@rowakit/table';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  inStock: boolean;
  lastUpdated: Date;
}

// Mock data
const MOCK_PRODUCTS: Product[] = [
  { id: 1, name: 'Laptop Pro', category: 'Electronics', price: 1299, inStock: true, lastUpdated: new Date('2024-01-15') },
  { id: 2, name: 'Wireless Mouse', category: 'Accessories', price: 29, inStock: true, lastUpdated: new Date('2024-02-20') },
  { id: 3, name: 'USB-C Hub', category: 'Accessories', price: 49, inStock: false, lastUpdated: new Date('2024-01-10') },
  { id: 4, name: 'Monitor 27"', category: 'Electronics', price: 399, inStock: true, lastUpdated: new Date('2024-03-05') },
  { id: 5, name: 'Keyboard Mechanical', category: 'Accessories', price: 129, inStock: true, lastUpdated: new Date('2024-02-28') },
  { id: 6, name: 'Webcam HD', category: 'Electronics', price: 89, inStock: false, lastUpdated: new Date('2024-01-25') },
  { id: 7, name: 'Desk Lamp', category: 'Office', price: 45, inStock: true, lastUpdated: new Date('2024-03-10') },
  { id: 8, name: 'Ergonomic Chair', category: 'Furniture', price: 299, inStock: true, lastUpdated: new Date('2024-02-15') },
  { id: 9, name: 'Standing Desk', category: 'Furniture', price: 599, inStock: false, lastUpdated: new Date('2024-01-30') },
  { id: 10, name: 'Headphones', category: 'Audio', price: 199, inStock: true, lastUpdated: new Date('2024-03-01') },
  { id: 11, name: 'Speakers', category: 'Audio', price: 149, inStock: true, lastUpdated: new Date('2024-02-10') },
  { id: 12, name: 'Microphone', category: 'Audio', price: 119, inStock: false, lastUpdated: new Date('2024-01-20') },
];

// Mock fetcher with realistic server behavior
const fetchProducts: Fetcher<Product> = async (query: FetcherQuery) => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Copy data for manipulation
  const data = [...MOCK_PRODUCTS];

  // Apply sorting
  if (query.sort) {
    data.sort((a, b) => {
      const aVal = a[query.sort!.field as keyof Product];
      const bVal = b[query.sort!.field as keyof Product];

      if (aVal < bVal) return query.sort!.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return query.sort!.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Calculate pagination
  const start = (query.page - 1) * query.pageSize;
  const end = start + query.pageSize;
  const paginatedData = data.slice(start, end);

  return {
    items: paginatedData,
    total: data.length,
  };
};

export function ProductsTableWithMockServer() {
  const handleView = (product: Product) => {
    alert(`Viewing product: ${product.name}`);
  };

  const handleRestock = async (product: Product) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log('Restocking:', product.name);
  };

  return (
    <div>
      <h1>Products Inventory</h1>
      <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
        This example uses a mock server with simulated delays and sorting.
      </p>
      
      <RowaKitTable
        fetcher={fetchProducts}
        columns={[
          col.text<Product>('name', {
            header: 'Product Name',
            sortable: true,
          }),
          col.text<Product>('category', {
            header: 'Category',
            sortable: true,
          }),
          col.text<Product>('price', {
            header: 'Price',
            sortable: true,
            format: (price) => `$${price.toFixed(2)}`,
          }),
          col.boolean<Product>('inStock', {
            header: 'Availability',
            format: (inStock) => (inStock ? '✅ In Stock' : '❌ Out of Stock'),
          }),
          col.date<Product>('lastUpdated', {
            header: 'Last Updated',
            sortable: true,
            format: (date) => new Date(date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            }),
          }),
          col.actions<Product>([
            {
              id: 'view',
              label: 'View',
              icon: '👁️',
              onClick: handleView,
            },
            {
              id: 'restock',
              label: 'Restock',
              icon: '📦',
              disabled: (product) => product.inStock,
              confirm: true,
              onClick: handleRestock,
            },
          ]),
        ]}
        rowKey="id"
        defaultPageSize={5}
        pageSizeOptions={[5, 10, 20]}
      />
    </div>
  );
}
