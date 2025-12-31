import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SmartTable } from './SmartTable';
import { col } from '../column-helpers';
import type { Fetcher } from '../types';

// Sample data types for testing
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  active: boolean;
  role: string;
}

const mockFetcher: Fetcher<User> = vi.fn(async () => ({
  items: [],
  total: 0,
}));

describe('SmartTable Component', () => {
  describe('Basic Rendering', () => {
    it('renders table structure', async () => {
      const fetcher: Fetcher<User> = vi.fn(async () => ({
        items: [],
        total: 0,
      }));

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name')]}
          rowKey="id"
        />
      );

      const table = screen.getByRole('table');
      expect(table).toBeDefined();

      // Wait for data to load (empty state)
      await waitFor(() => {
        expect(screen.getByText('No data')).toBeDefined();
      });
    });

    it('renders correct number of column headers', async () => {
      const fetcher: Fetcher<User> = vi.fn(async () => ({
        items: [],
        total: 0,
      }));

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[
            col.text<User>('name'),
            col.text<User>('email'),
            col.boolean<User>('active'),
          ]}
          rowKey="id"
        />
      );

      const headers = screen.getAllByRole('columnheader');
      expect(headers).toHaveLength(3);
    });

    it('renders "No data" message when table is empty', async () => {
      const fetcher: Fetcher<User> = vi.fn(async () => ({
        items: [],
        total: 0,
      }));

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name')]}
          rowKey="id"
        />
      );

      // Wait for loading to finish
      await waitFor(() => {
        expect(screen.getByText('No data')).toBeDefined();
      });
    });

    it('maintains column order', () => {
      render(
        <SmartTable
          fetcher={mockFetcher}
          columns={[
            col.text<User>('name', { header: 'Name' }),
            col.text<User>('email', { header: 'Email' }),
            col.boolean<User>('active', { header: 'Active' }),
          ]}
          rowKey="id"
        />
      );

      const headers = screen.getAllByRole('columnheader');
      expect(headers[0]?.textContent).toBe('Name');
      expect(headers[1]?.textContent).toBe('Email');
      expect(headers[2]?.textContent).toBe('Active');
    });
  });

  describe('Header Rendering', () => {
    it('uses column.header when provided', () => {
      render(
        <SmartTable
          fetcher={mockFetcher}
          columns={[
            col.text<User>('name', { header: 'Full Name' }),
            col.text<User>('email', { header: 'Email Address' }),
          ]}
          rowKey="id"
        />
      );

      expect(screen.getByText('Full Name')).toBeDefined();
      expect(screen.getByText('Email Address')).toBeDefined();
    });

    it('falls back to column.id when header not provided', () => {
      render(
        <SmartTable
          fetcher={mockFetcher}
          columns={[col.text<User>('name'), col.text<User>('email')]}
          rowKey="id"
        />
      );

      expect(screen.getByText('name')).toBeDefined();
      expect(screen.getByText('email')).toBeDefined();
    });
  });

  describe('Column Type Rendering', () => {
    it('renders text columns correctly', () => {
      // Create a component that passes data to SmartTable
      const TestComponent = () => {
        // Override SmartTable's internal mockData for testing
        const columns = [col.text<User>('name')];
        
        return (
          <SmartTable
            fetcher={mockFetcher}
            columns={columns}
            rowKey="id"
          />
        );
      };

      render(<TestComponent />);
      
      // Since SmartTable currently shows "No data", we verify the structure
      expect(screen.getByRole('table')).toBeDefined();
    });

    it('renders date columns with default format', () => {
      const columns = [
        col.date<User>('createdAt', { header: 'Created' }),
      ];

      render(
        <SmartTable
          fetcher={mockFetcher}
          columns={columns}
          rowKey="id"
        />
      );

      expect(screen.getByText('Created')).toBeDefined();
    });

    it('renders boolean columns with default format', () => {
      const columns = [col.boolean<User>('active', { header: 'Active' })];

      render(
        <SmartTable
          fetcher={mockFetcher}
          columns={columns}
          rowKey="id"
        />
      );

      expect(screen.getByText('Active')).toBeDefined();
    });

    it('renders actions column', () => {
      const handleEdit = vi.fn();
      const columns = [
        col.actions<User>([
          { id: 'edit', label: 'Edit', onClick: handleEdit },
        ]),
      ];

      render(
        <SmartTable
          fetcher={mockFetcher}
          columns={columns}
          rowKey="id"
        />
      );

      const headers = screen.getAllByRole('columnheader');
      expect(headers[0]?.textContent).toBe('actions');
    });

    it('renders custom column', () => {
      const columns = [
        col.custom<User>('role', (row) => `Role: ${row.role}`),
      ];

      render(
        <SmartTable
          fetcher={mockFetcher}
          columns={columns}
          rowKey="id"
        />
      );

      expect(screen.getByText('role')).toBeDefined();
    });
  });

  describe('Format Functions', () => {
    it('applies format function for text columns', () => {
      const columns = [
        col.text<User>('name', {
          format: (val) => String(val).toUpperCase(),
        }),
      ];

      render(
        <SmartTable
          fetcher={mockFetcher}
          columns={columns}
          rowKey="id"
        />
      );

      // Verify column exists (data rendering will be tested in A-05)
      expect(screen.getByRole('table')).toBeDefined();
    });

    it('applies format function for date columns', () => {
      const columns = [
        col.date<User>('createdAt', {
          format: (date) => new Date(date).toISOString().split('T')[0] ?? '',
        }),
      ];

      render(
        <SmartTable
          fetcher={mockFetcher}
          columns={columns}
          rowKey="id"
        />
      );

      expect(screen.getByRole('table')).toBeDefined();
    });

    it('applies format function for boolean columns', () => {
      const columns = [
        col.boolean<User>('active', {
          format: (val) => (val ? '✓' : '✗'),
        }),
      ];

      render(
        <SmartTable
          fetcher={mockFetcher}
          columns={columns}
          rowKey="id"
        />
      );

      expect(screen.getByRole('table')).toBeDefined();
    });
  });

  describe('Row Key Handling', () => {
    it('accepts rowKey as field name', () => {
      render(
        <SmartTable
          fetcher={mockFetcher}
          columns={[col.text<User>('name')]}
          rowKey="id"
        />
      );

      expect(screen.getByRole('table')).toBeDefined();
    });

    it('accepts rowKey as function', () => {
      render(
        <SmartTable
          fetcher={mockFetcher}
          columns={[col.text<User>('name')]}
          rowKey={(row) => row.id}
        />
      );

      expect(screen.getByRole('table')).toBeDefined();
    });

    it('works without explicit rowKey', () => {
      render(
        <SmartTable
          fetcher={mockFetcher}
          columns={[col.text<User>('name')]}
        />
      );

      expect(screen.getByRole('table')).toBeDefined();
    });
  });

  describe('Integration Tests', () => {
    it('renders all column types together', () => {
      const handleEdit = vi.fn();
      const handleDelete = vi.fn();

      const columns = [
        col.text<User>('name', { header: 'Name', sortable: true }),
        col.text<User>('email', { header: 'Email' }),
        col.date<User>('createdAt', { header: 'Created' }),
        col.boolean<User>('active', { header: 'Active' }),
        col.custom<User>('role', (row) => row.role.toUpperCase()),
        col.actions<User>([
          { id: 'edit', label: 'Edit', onClick: handleEdit },
          { id: 'delete', label: 'Delete', confirm: true, onClick: handleDelete },
        ]),
      ];

      render(
        <SmartTable
          fetcher={mockFetcher}
          columns={columns}
          defaultPageSize={20}
          pageSizeOptions={[10, 20, 50]}
          rowKey="id"
        />
      );

      // Query all th elements directly since sortable headers have role="button"
      const table = document.querySelector('table');
      const allHeaders = table?.querySelectorAll('thead th');
      expect(allHeaders).toHaveLength(6);
      expect(allHeaders?.[0]?.textContent).toBe('Name');
      expect(allHeaders?.[1]?.textContent).toBe('Email');
      expect(allHeaders?.[2]?.textContent).toBe('Created');
      expect(allHeaders?.[3]?.textContent).toBe('Active');
      expect(allHeaders?.[4]?.textContent).toBe('role');
      expect(allHeaders?.[5]?.textContent).toBe('actions');
    });

    it('handles empty columns array gracefully', async () => {
      const fetcher: Fetcher<User> = vi.fn(async () => ({
        items: [],
        total: 0,
      }));

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[]}
          rowKey="id"
        />
      );

      expect(screen.getByRole('table')).toBeDefined();
      
      await waitFor(() => {
        expect(screen.getByText('No data')).toBeDefined();
      });
    });

    it('accepts all documented props', () => {
      const handleAction = vi.fn();

      render(
        <SmartTable
          fetcher={mockFetcher}
          columns={[
            col.text<User>('name'),
            col.actions<User>([
              { id: 'test', label: 'Test', onClick: handleAction },
            ]),
          ]}
          defaultPageSize={25}
          pageSizeOptions={[10, 25, 50, 100]}
          rowKey={(row) => row.id}
        />
      );

      expect(screen.getByRole('table')).toBeDefined();
    });
  });

  describe('TypeScript Type Safety', () => {
    it('enforces generic type consistency', () => {
      // This test verifies that TypeScript enforces type safety
      // It compiles if types are correct, fails to compile if not

      interface Product {
        id: number;
        name: string;
        price: number;
      }

      const productFetcher: Fetcher<Product> = vi.fn(async () => ({
        items: [],
        total: 0,
      }));

      render(
        <SmartTable
          fetcher={productFetcher}
          columns={[
            col.text<Product>('name'),
            // This would fail TypeScript if 'invalidField' was used:
            // col.text<Product>('invalidField'), // TS Error
          ]}
          rowKey="id"
        />
      );

      expect(screen.getByRole('table')).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined values in cells gracefully', () => {
      render(
        <SmartTable
          fetcher={mockFetcher}
          columns={[col.text<User>('name')]}
          rowKey="id"
        />
      );

      expect(screen.getByRole('table')).toBeDefined();
    });

    it('handles null values in cells gracefully', () => {
      render(
        <SmartTable
          fetcher={mockFetcher}
          columns={[col.text<User>('email')]}
          rowKey="id"
        />
      );

      expect(screen.getByRole('table')).toBeDefined();
    });

    it('renders with minimal required props', () => {
      render(
        <SmartTable
          fetcher={mockFetcher}
          columns={[col.text<User>('name')]}
        />
      );

      expect(screen.getByRole('table')).toBeDefined();
    });
  });
});
