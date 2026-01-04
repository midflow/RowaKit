import React from 'react';
import { RowaKitTable, col } from '@rowakit/table';
import type { Fetcher } from '@rowakit/table';

interface Product {
  id: number;
  name: string;
  category: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  price: number;
  quantity: number;
  discount: number;  // Stored as fraction (0.15 = 15%)
  lastUpdated: string;
  featured: boolean;
}

const mockProducts: Product[] = [
  { id: 1, name: 'Laptop Pro 15"', category: 'Electronics', status: 'in_stock', price: 1299.99, quantity: 45, discount: 0.15, lastUpdated: '2024-01-15', featured: true },
  { id: 2, name: 'Wireless Mouse', category: 'Accessories', status: 'in_stock', price: 29.99, quantity: 120, discount: 0, lastUpdated: '2024-01-20', featured: false },
  { id: 3, name: 'USB-C Cable', category: 'Accessories', status: 'low_stock', price: 12.99, quantity: 8, discount: 0.1, lastUpdated: '2024-02-01', featured: false },
  { id: 4, name: 'Monitor 27"', category: 'Electronics', status: 'in_stock', price: 399.99, quantity: 32, discount: 0.2, lastUpdated: '2024-01-25', featured: true },
  { id: 5, name: 'Keyboard Mechanical', category: 'Accessories', status: 'out_of_stock', price: 89.99, quantity: 0, discount: 0, lastUpdated: '2024-02-10', featured: false },
  { id: 6, name: 'Headphones Noise-Canceling', category: 'Audio', status: 'in_stock', price: 249.99, quantity: 67, discount: 0.25, lastUpdated: '2024-01-18', featured: true },
  { id: 7, name: 'Webcam HD', category: 'Electronics', status: 'low_stock', price: 79.99, quantity: 5, discount: 0, lastUpdated: '2024-02-05', featured: false },
  { id: 8, name: 'Desk Lamp LED', category: 'Office', status: 'in_stock', price: 34.99, quantity: 89, discount: 0.1, lastUpdated: '2024-01-22', featured: false },
  { id: 9, name: 'Standing Desk', category: 'Office', status: 'in_stock', price: 599.99, quantity: 12, discount: 0.05, lastUpdated: '2024-01-28', featured: false },
  { id: 10, name: 'Monitor Arm', category: 'Office', status: 'low_stock', price: 99.99, quantity: 3, discount: 0.08, lastUpdated: '2024-02-02', featured: false },
];

export default function StageCDemo() {
  const fetchProducts: Fetcher<Product> = async ({ page, pageSize, sort, filters }) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    let filtered = [...mockProducts];

    // Apply filters
    if (filters) {
      for (const [field, filter] of Object.entries(filters)) {
        if (!filter) continue;

        if (filter.op === 'contains') {
          filtered = filtered.filter((item) =>
            String(item[field as keyof Product])
              .toLowerCase()
              .includes(filter.value.toLowerCase())
          );
        } else if (filter.op === 'equals') {
          filtered = filtered.filter((item) => {
            const itemValue = item[field as keyof Product];
            let filterValueCoerced: any = filter.value;
            
            if (typeof itemValue === 'number') {
              const parsedValue = parseFloat(String(filter.value));
              filterValueCoerced = parsedValue;
            }
            return itemValue === filterValueCoerced;
          });
        } else if (filter.op === 'range') {
          // Range filter for numbers (e.g., price range)
          const { from, to } = filter.value as { from?: number; to?: number };
          filtered = filtered.filter((item) => {
            const itemValue = Number(item[field as keyof Product]);
            if (from !== undefined && itemValue < from) return false;
            if (to !== undefined && itemValue > to) return false;
            return true;
          });
        }
      }
    }

    // Apply sorting
    if (sort) {
      filtered.sort((a, b) => {
        const aVal = a[sort.field as keyof Product];
        const bVal = b[sort.field as keyof Product];

        if (aVal < bVal) {
          return sort.direction === 'asc' ? -1 : 1;
        }
        if (aVal > bVal) {
          return sort.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    // Apply pagination
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    return {
      items,
      total: filtered.length,
    };
  };

  const columns = [
    col.text('id', { label: '#', width: 60, align: 'center', minWidth: 50, maxWidth: 80 }),
    col.text('name', { label: 'Product Name', width: 180, truncate: true, minWidth: 120 }),
    col.text('category', { label: 'Category', width: 100, minWidth: 80 }),
    col.badge('status', {
      label: 'Status',
      width: 120,
      minWidth: 100,
      map: {
        in_stock: 'success',
        low_stock: 'warning',
        out_of_stock: 'danger',
      },
    }),
    col.number('price', {
      label: 'Price',
      width: 100,
      align: 'right',
      minWidth: 80,
      format: (val) => `$${val.toFixed(2)}`,
    }),
    col.number('quantity', {
      label: 'Stock',
      width: 80,
      align: 'center',
      minWidth: 70,
    }),
    col.number('discount', {
      label: 'Discount',
      width: 100,
      align: 'right',
      minWidth: 80,
      format: (val) => `${(val * 100).toFixed(0)}%`,
      // Stage C: filterTransform to convert percentage to fraction
      filterTransform: (percentageInput) => {
        // If user enters > 1 (like 15), convert to fraction (0.15)
        if (percentageInput > 1) {
          return percentageInput / 100;
        }
        return percentageInput;
      },
    }),
    col.date('lastUpdated', {
      label: 'Last Updated',
      width: 120,
      align: 'center',
      minWidth: 100,
    }),
    col.boolean('featured', {
      label: 'Featured',
      width: 80,
      align: 'center',
      minWidth: 70,
    }),
    col.actions('actions', {
      label: 'Actions',
      width: 100,
      minWidth: 90,
      actions: [
        {
          id: 'view',
          label: 'View',
          onClick: (product) => alert(`View: ${product.name}`),
        },
        {
          id: 'edit',
          label: 'Edit',
          onClick: (product) => alert(`Edit: ${product.name}`),
        },
        {
          id: 'delete',
          label: 'Delete',
          confirm: true,
          onClick: (product) => alert(`Delete: ${product.name}`),
        },
      ],
    }),
  ];

  return (
    <div>
      <div className="example-header">
        <h2>Stage C Features Demo (v0.3.0)</h2>
        <p>
          This demo showcases all Stage C features: Column resizing, URL state sync, saved views,
          and advanced number range filters with filterTransform.
        </p>
      </div>

      <div className="example-info">
        <h3>Stage C Features Demonstrated:</h3>
        <ul>
          <li>
            <strong>Column Resizing (C-01):</strong> Drag column header edges to resize. Widths
            are stored in table state (in-memory only). Min width: 50px, max width: 200px (varies by column).
          </li>
          <li>
            <strong>URL State Sync (C-02):</strong> All table state (page, pageSize, sort, filters,
            column widths) is synced to the URL query string. Share the URL to preserve the exact
            table state.
          </li>
          <li>
            <strong>Saved Views (C-02):</strong> Save your current table state as a named view
            (e.g., "High Value Products", "Electronics"), then quickly switch between views.
            Views are stored in localStorage.
          </li>
          <li>
            <strong>Number Range Filters (C-03):</strong> The "Price" and "Discount" columns
            support range filtering. Enter Min and/or Max values. Supports optional
            filterTransform (see Discount column).
          </li>
          <li>
            <strong>Filter Transform (C-03):</strong> The "Discount" column demonstrates
            filterTransform: users enter percentage (15), backend sees fraction (0.15).
          </li>
        </ul>
      </div>

      <RowaKitTable
        fetcher={fetchProducts}
        columns={columns}
        rowKey="id"
        defaultPageSize={5}
        pageSizeOptions={[5, 10, 20]}
        enableFilters={true}
        enableColumnResizing={true}
        syncToUrl={true}
        enableSavedViews={true}
      />

      <div className="example-footer">
        <h3>Try These:</h3>
        <ul>
          <li><strong>Column Resizing:</strong> Hover over column headers and drag the edge to resize</li>
          <li><strong>URL Sync:</strong> Change filters, sort, or resize columns, then copy the URL and share it</li>
          <li><strong>Saved Views:</strong> Click "Save View", name it (e.g., "High Price Items"), then apply a price range filter (500-1500). Click your saved view to restore.</li>
          <li><strong>Price Range Filter:</strong> Filter by Min price (500) or Max price (100), or both</li>
          <li><strong>Discount Range Filter:</strong> Enter 10-20 to find products with 10-20% discount. Note: filterTransform converts percentage input to fraction.</li>
          <li>Combine multiple filters and saved views</li>
          <li>Click "Reset" button to clear all filters and state</li>
          <li>Try resizing columns then save a view to preserve the layout</li>
        </ul>
      </div>
    </div>
  );
}
