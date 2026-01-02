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
  // Note: discount is stored as a fraction (0.15 = 15%, 0.1 = 10%, etc.)
  // When filtering discount, you can enter either "0.15" (fraction) or "15" (percentage)
  // The filter will automatically convert percentage to fraction
  { id: 1, name: 'Laptop Pro 15"', category: 'Electronics', status: 'in_stock', price: 1299.99, quantity: 45, discount: 0.15, lastUpdated: '2024-01-15', featured: true },
  { id: 2, name: 'Wireless Mouse', category: 'Accessories', status: 'in_stock', price: 29.99, quantity: 120, discount: 0, lastUpdated: '2024-01-20', featured: false },
  { id: 3, name: 'USB-C Cable', category: 'Accessories', status: 'low_stock', price: 12.99, quantity: 8, discount: 0.1, lastUpdated: '2024-02-01', featured: false },
  { id: 4, name: 'Monitor 27"', category: 'Electronics', status: 'in_stock', price: 399.99, quantity: 32, discount: 0.2, lastUpdated: '2024-01-25', featured: true },
  { id: 5, name: 'Keyboard Mechanical', category: 'Accessories', status: 'out_of_stock', price: 89.99, quantity: 0, discount: 0, lastUpdated: '2024-02-10', featured: false },
  { id: 6, name: 'Headphones Noise-Canceling', category: 'Audio', status: 'in_stock', price: 249.99, quantity: 67, discount: 0.25, lastUpdated: '2024-01-18', featured: true },
  { id: 7, name: 'Webcam HD', category: 'Electronics', status: 'low_stock', price: 79.99, quantity: 5, discount: 0, lastUpdated: '2024-02-05', featured: false },
  { id: 8, name: 'Desk Lamp LED', category: 'Office', status: 'in_stock', price: 34.99, quantity: 89, discount: 0.1, lastUpdated: '2024-01-22', featured: false },
];

export default function StageBDemo() {
  const fetchProducts: Fetcher<Product> = async ({ page, pageSize, sort, filters }) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    let filtered = [...mockProducts];

    // Apply filters
    if (filters) {
      for (const [field, filter] of Object.entries(filters)) {
        if (filter.op === 'contains') {
          filtered = filtered.filter((item) =>
            String(item[field as keyof Product])
              .toLowerCase()
              .includes(filter.value.toLowerCase())
          );
        } else if (filter.op === 'equals') {
          // Coerce filter value to match data type (handle string → number conversion)
          filtered = filtered.filter((item) => {
            const itemValue = item[field as keyof Product];
            let filterValueCoerced: any = filter.value;
            
            if (typeof itemValue === 'number') {
              const parsedValue = parseFloat(String(filter.value));
              // Special case: discount is stored as fraction (0.15 = 15%)
              // If filtering discount and value is > 1, assume user entered percentage
              if (field === 'discount' && parsedValue > 1) {
                filterValueCoerced = parsedValue / 100;
              } else {
                filterValueCoerced = parsedValue;
              }
            }
            
            return itemValue === filterValueCoerced;
          });
        } else if (filter.op === 'range') {
          if (filter.value.from) {
            filtered = filtered.filter(
              (item) => item[field as keyof Product] >= filter.value.from!
            );
          }
          if (filter.value.to) {
            filtered = filtered.filter(
              (item) => item[field as keyof Product] <= filter.value.to!
            );
          }
        }
      }
    }

    // Apply sorting
    if (sort) {
      filtered.sort((a, b) => {
        const aVal = a[sort.field as keyof Product];
        const bVal = b[sort.field as keyof Product];

        if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // Pagination
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const items = filtered.slice(start, end);

    return {
      items,
      total: filtered.length,
    };
  };

  const columns = [
    col.text<Product>('name', {
      header: 'Product Name',
      sortable: true,
      width: 200,
      truncate: true,
    }),
    col.text<Product>('category', {
      header: 'Category',
      sortable: true,
    }),
    col.badge<Product>('status', {
      header: 'Stock Status',
      sortable: true,
      align: 'center',
      width: 120,
      map: {
        in_stock: { label: 'In Stock', tone: 'success' },
        low_stock: { label: 'Low Stock', tone: 'warning' },
        out_of_stock: { label: 'Out of Stock', tone: 'danger' },
      },
    }),
    col.number<Product>('price', {
      header: 'Price',
      sortable: true,
      format: { style: 'currency', currency: 'USD' },
      width: 120,
    }),
    col.number<Product>('quantity', {
      header: 'Stock',
      sortable: true,
      width: 80,
      align: 'center',
    }),
    col.number<Product>('discount', {
      header: 'Discount',
      sortable: true,
      format: { style: 'percent' },
      width: 100,
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
    col.boolean<Product>('featured', {
      header: 'Featured',
      sortable: true,
      align: 'center',
      width: 90,
    }),
    col.actions<Product>([
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
    ]),
  ];

  return (
    <div>
      <div className="example-header">
        <h2>Stage B Features Demo (v0.2.2)</h2>
        <p>
          This demo showcases all Stage B features: Badge columns, Number columns with
          formatting, Column modifiers (width, align, truncate), and Server-side filters.
        </p>
      </div>

      <div className="example-info">
        <h3>Features Demonstrated:</h3>
        <ul>
          <li>
            <strong>Badge Column:</strong> "Stock Status" shows color-coded badges (success/warning/danger)
          </li>
          <li>
            <strong>Number Columns:</strong> "Price" (currency), "Discount" (percentage), "Stock" (plain number)
          </li>
          <li>
            <strong>Column Modifiers:</strong> Fixed widths, text alignment, and truncation on long text
          </li>
          <li>
            <strong>Server-Side Filters:</strong> Try filtering by product name, category, status, price, stock, discount, date, or featured
          </li>
        </ul>
        <p className="note">
          <strong>Note:</strong> Filtering is demonstrated with mock data. In a real app, your backend
          would handle the filtering logic.
        </p>
      </div>

      <RowaKitTable
        fetcher={fetchProducts}
        columns={columns}
        rowKey="id"
        defaultPageSize={5}
        pageSizeOptions={[5, 10, 20]}
        enableFilters={true}
      />

      <div className="example-footer">
        <h3>Try These:</h3>
        <ul>
          <li>Filter by product name (e.g., "Laptop")</li>
          <li>Filter by status dropdown (In Stock / Low Stock / Out of Stock)</li>
          <li>Filter by featured (True / False)</li>
          <li>Filter by date range</li>
          <li>Combine multiple filters and observe page reset to 1</li>
          <li>Sort columns while filters are active</li>
          <li>Click "Clear all filters" to reset</li>
        </ul>
      </div>
    </div>
  );
}
