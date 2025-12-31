/**
 * @fileoverview Tests for SmartTable sorting functionality (A-07)
 * Tests single-column sorting, sort indicators, and sort state management
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SmartTable } from './SmartTable';
import { col } from '../column-helpers';
import type { Fetcher, FetcherQuery } from '../types';

// ============================================================================
// TEST DATA
// ============================================================================

interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  createdAt: Date;
}

const mockUsers: User[] = [
  { id: '1', name: 'Alice', email: 'alice@example.com', age: 30, createdAt: new Date('2023-01-15') },
  { id: '2', name: 'Bob', email: 'bob@example.com', age: 25, createdAt: new Date('2023-02-20') },
  { id: '3', name: 'Charlie', email: 'charlie@example.com', age: 35, createdAt: new Date('2023-01-10') },
];

// ============================================================================
// SORTING TESTS
// ============================================================================

describe('SmartTable - Sorting (A-07)', () => {
  describe('Sortable Column Detection', () => {
    it('marks text columns as sortable when sortable: true', async () => {
      const fetcher: Fetcher<User> = vi.fn(async () => ({
        items: mockUsers,
        total: 3,
      }));

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[
            col.text<User>('name', { sortable: true }),
            col.text<User>('email'),
          ]}
          rowKey="id"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      // Sortable column should have pointer cursor and be clickable
      const nameHeader = screen.getByRole('button', { name: /name/i });
      expect(nameHeader).toBeDefined();

      // Non-sortable column should not be a button
      const emailHeaders = screen.getAllByText('email');
      const emailHeader = emailHeaders[0]; // Get the header (not cell content)
      expect(emailHeader.getAttribute('role')).not.toBe('button');
    });

    it('marks date columns as sortable when sortable: true', async () => {
      const fetcher: Fetcher<User> = vi.fn(async () => ({
        items: mockUsers,
        total: 3,
      }));

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[
            col.text<User>('name'),
            col.date<User>('createdAt', { sortable: true, header: 'Created' }),
          ]}
          rowKey="id"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      const createdHeader = screen.getByRole('button', { name: /Created/i });
      expect(createdHeader).toBeDefined();
    });

    it('does not mark actions columns as sortable', async () => {
      const fetcher: Fetcher<User> = vi.fn(async () => ({
        items: mockUsers,
        total: 3,
      }));

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[
            col.text<User>('name'),
            col.actions<User>([
              { id: 'view', label: 'View', onClick: () => {} },
            ]),
          ]}
          rowKey="id"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      // Actions column header should not be clickable
      const actionsHeader = screen.getByText('actions');
      expect(actionsHeader.getAttribute('role')).not.toBe('button');
    });

    it('does not mark custom columns as sortable', async () => {
      const fetcher: Fetcher<User> = vi.fn(async () => ({
        items: mockUsers,
        total: 3,
      }));

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[
            col.text<User>('name'),
            col.custom<User>('age', (row) => <span>{row.age} years</span>),
          ]}
          rowKey="id"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      // Custom column header should not be clickable
      const ageHeader = screen.getByText('age');
      expect(ageHeader.getAttribute('role')).not.toBe('button');
    });
  });

  describe('Sort State Management', () => {
    it('sorts ascending on first click', async () => {
      const user = userEvent.setup();
      const fetcher: Fetcher<User> = vi.fn(async ({ sort: _sort }: FetcherQuery) => ({
        items: mockUsers,
        total: 3,
      }));

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name', { sortable: true })]}
          rowKey="id"
        />
      );

      await waitFor(() => {
        expect(fetcher).toHaveBeenCalledWith({ page: 1, pageSize: 20 });
      });

      const nameHeader = screen.getByRole('button', { name: /name/i });
      await user.click(nameHeader);

      await waitFor(() => {
        expect(fetcher).toHaveBeenCalledWith({
          page: 1,
          pageSize: 20,
          sort: { field: 'name', direction: 'asc' },
        });
      });
    });

    it('toggles to descending on second click', async () => {
      const user = userEvent.setup();
      const fetcher: Fetcher<User> = vi.fn(async () => ({
        items: mockUsers,
        total: 3,
      }));

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name', { sortable: true })]}
          rowKey="id"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      const nameHeader = screen.getByRole('button', { name: /name/i });
      
      // First click - ascending
      await user.click(nameHeader);
      await waitFor(() => {
        expect(fetcher).toHaveBeenCalledWith({
          page: 1,
          pageSize: 20,
          sort: { field: 'name', direction: 'asc' },
        });
      });

      // Second click - descending
      await user.click(nameHeader);
      await waitFor(() => {
        expect(fetcher).toHaveBeenCalledWith({
          page: 1,
          pageSize: 20,
          sort: { field: 'name', direction: 'desc' },
        });
      });
    });

    it('removes sort on third click', async () => {
      const user = userEvent.setup();
      const fetcher: Fetcher<User> = vi.fn(async () => ({
        items: mockUsers,
        total: 3,
      }));

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name', { sortable: true })]}
          rowKey="id"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      const nameHeader = screen.getByRole('button', { name: /name/i });
      
      // Click 1: asc
      await user.click(nameHeader);
      await waitFor(() => {
        const lastCall = fetcher.mock.calls[fetcher.mock.calls.length - 1][0];
        expect(lastCall.sort).toEqual({ field: 'name', direction: 'asc' });
      });

      // Click 2: desc
      await user.click(nameHeader);
      await waitFor(() => {
        const lastCall = fetcher.mock.calls[fetcher.mock.calls.length - 1][0];
        expect(lastCall.sort).toEqual({ field: 'name', direction: 'desc' });
      });

      // Click 3: no sort
      await user.click(nameHeader);
      await waitFor(() => {
        const lastCall = fetcher.mock.calls[fetcher.mock.calls.length - 1][0];
        expect(lastCall.sort).toBeUndefined();
      });
    });

    it('switches to new field when clicking different sortable column', async () => {
      const user = userEvent.setup();
      const fetcher: Fetcher<User> = vi.fn(async () => ({
        items: mockUsers,
        total: 3,
      }));

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[
            col.text<User>('name', { sortable: true }),
            col.text<User>('email', { sortable: true }),
          ]}
          rowKey="id"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      // Sort by name ascending
      const nameHeader = screen.getByRole('button', { name: /name/i });
      await user.click(nameHeader);

      await waitFor(() => {
        const lastCall = fetcher.mock.calls[fetcher.mock.calls.length - 1][0];
        expect(lastCall.sort).toEqual({ field: 'name', direction: 'asc' });
      });

      // Switch to email - should start with ascending
      const emailHeader = screen.getByRole('button', { name: /email/i });
      await user.click(emailHeader);

      await waitFor(() => {
        const lastCall = fetcher.mock.calls[fetcher.mock.calls.length - 1][0];
        expect(lastCall.sort).toEqual({ field: 'email', direction: 'asc' });
      });
    });

    it('resets to page 1 when sorting changes', async () => {
      const user = userEvent.setup();
      const fetcher: Fetcher<User> = vi.fn(async ({ page, pageSize }) => {
        const start = (page - 1) * pageSize;
        return {
          items: mockUsers.slice(start, start + pageSize),
          total: 30,
        };
      });

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name', { sortable: true })]}
          defaultPageSize={10}
          rowKey="id"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      // Navigate to page 2
      const nextButton = screen.getByRole('button', { name: 'Next page' });
      await user.click(nextButton);

      await waitFor(() => {
        expect(fetcher).toHaveBeenCalledWith({ page: 2, pageSize: 10 });
      });

      // Sort - should reset to page 1
      const nameHeader = screen.getByRole('button', { name: /name/i });
      await user.click(nameHeader);

      await waitFor(() => {
        const lastCall = fetcher.mock.calls[fetcher.mock.calls.length - 1][0];
        expect(lastCall.page).toBe(1);
        expect(lastCall.sort).toEqual({ field: 'name', direction: 'asc' });
      });
    });
  });

  describe('Sort Indicators', () => {
    it('shows ascending indicator (↑) when sorted ascending', async () => {
      const user = userEvent.setup();
      const fetcher: Fetcher<User> = vi.fn(async () => ({
        items: mockUsers,
        total: 3,
      }));

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name', { sortable: true })]}
          rowKey="id"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      const nameHeader = screen.getByRole('button', { name: /name/i });
      await user.click(nameHeader);

      await waitFor(() => {
        expect(nameHeader.textContent).toContain('\u2191'); // Up arrow
      });
    });

    it('shows descending indicator (↓) when sorted descending', async () => {
      const user = userEvent.setup();
      const fetcher: Fetcher<User> = vi.fn(async () => ({
        items: mockUsers,
        total: 3,
      }));

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name', { sortable: true })]}
          rowKey="id"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      const nameHeader = screen.getByRole('button', { name: /name/i });
      
      // Click twice to get descending
      await user.click(nameHeader);
      await user.click(nameHeader);

      await waitFor(() => {
        expect(nameHeader.textContent).toContain('\u2193'); // Down arrow
      });
    });

    it('removes indicator when sort is cleared', async () => {
      const user = userEvent.setup();
      const fetcher: Fetcher<User> = vi.fn(async () => ({
        items: mockUsers,
        total: 3,
      }));

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name', { sortable: true })]}
          rowKey="id"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      const nameHeader = screen.getByRole('button', { name: /name/i });
      
      // Sort ascending
      await user.click(nameHeader);
      await waitFor(() => {
        expect(nameHeader.textContent).toContain('\u2191');
      });

      // Click 2 more times to clear sort
      await user.click(nameHeader);
      await user.click(nameHeader);

      await waitFor(() => {
        expect(nameHeader.textContent).not.toContain('\u2191');
        expect(nameHeader.textContent).not.toContain('\u2193');
      });
    });

    it('shows indicator only on sorted column', async () => {
      const user = userEvent.setup();
      const fetcher: Fetcher<User> = vi.fn(async () => ({
        items: mockUsers,
        total: 3,
      }));

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[
            col.text<User>('name', { sortable: true }),
            col.text<User>('email', { sortable: true }),
          ]}
          rowKey="id"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      const nameHeader = screen.getByRole('button', { name: /name/i });
      const emailHeader = screen.getByRole('button', { name: /email/i });

      // Sort by name
      await user.click(nameHeader);

      await waitFor(() => {
        expect(nameHeader.textContent).toContain('\u2191');
        expect(emailHeader.textContent).not.toContain('\u2191');
        expect(emailHeader.textContent).not.toContain('\u2193');
      });
    });
  });

  describe('Keyboard Accessibility', () => {
    it('sorts when Enter key is pressed on sortable header', async () => {
      const user = userEvent.setup();
      const fetcher: Fetcher<User> = vi.fn(async () => ({
        items: mockUsers,
        total: 3,
      }));

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name', { sortable: true })]}
          rowKey="id"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      const nameHeader = screen.getByRole('button', { name: /name/i });
      nameHeader.focus();
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(fetcher).toHaveBeenCalledWith({
          page: 1,
          pageSize: 20,
          sort: { field: 'name', direction: 'asc' },
        });
      });
    });

    it('sorts when Space key is pressed on sortable header', async () => {
      const user = userEvent.setup();
      const fetcher: Fetcher<User> = vi.fn(async () => ({
        items: mockUsers,
        total: 3,
      }));

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name', { sortable: true })]}
          rowKey="id"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      const nameHeader = screen.getByRole('button', { name: /name/i });
      nameHeader.focus();
      await user.keyboard(' ');

      await waitFor(() => {
        expect(fetcher).toHaveBeenCalledWith({
          page: 1,
          pageSize: 20,
          sort: { field: 'name', direction: 'asc' },
        });
      });
    });

    it('has proper ARIA attributes for sorted columns', async () => {
      const user = userEvent.setup();
      const fetcher: Fetcher<User> = vi.fn(async () => ({
        items: mockUsers,
        total: 3,
      }));

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name', { sortable: true })]}
          rowKey="id"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      const nameHeader = screen.getByRole('button', { name: /name/i });

      // No sort initially
      expect(nameHeader.getAttribute('aria-sort')).toBeNull();

      // Sort ascending
      await user.click(nameHeader);
      await waitFor(() => {
        expect(nameHeader.getAttribute('aria-sort')).toBe('ascending');
      });

      // Sort descending
      await user.click(nameHeader);
      await waitFor(() => {
        expect(nameHeader.getAttribute('aria-sort')).toBe('descending');
      });
    });
  });

  describe('Integration with Pagination', () => {
    it('maintains sort when changing pages', async () => {
      const user = userEvent.setup();
      const fetcher: Fetcher<User> = vi.fn(async ({ page: _page, pageSize, sort: __sort }) => ({
        items: mockUsers.slice(0, pageSize),
        total: 30,
      }));

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name', { sortable: true })]}
          defaultPageSize={10}
          rowKey="id"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      // Sort by name
      const nameHeader = screen.getByRole('button', { name: /name/i });
      await user.click(nameHeader);

      await waitFor(() => {
        const lastCall = fetcher.mock.calls[fetcher.mock.calls.length - 1][0];
        expect(lastCall.sort).toEqual({ field: 'name', direction: 'asc' });
      });

      // Navigate to next page - sort should be maintained
      const nextButton = screen.getByRole('button', { name: 'Next page' });
      await user.click(nextButton);

      await waitFor(() => {
        const lastCall = fetcher.mock.calls[fetcher.mock.calls.length - 1][0];
        expect(lastCall.page).toBe(2);
        expect(lastCall.sort).toEqual({ field: 'name', direction: 'asc' });
      });
    });

    it('maintains sort when changing page size', async () => {
      const user = userEvent.setup();
      const fetcher: Fetcher<User> = vi.fn(async () => ({
        items: mockUsers,
        total: 30,
      }));

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name', { sortable: true })]}
          defaultPageSize={10}
          rowKey="id"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      // Sort by name
      const nameHeader = screen.getByRole('button', { name: /name/i });
      await user.click(nameHeader);

      await waitFor(() => {
        const lastCall = fetcher.mock.calls[fetcher.mock.calls.length - 1][0];
        expect(lastCall.sort).toEqual({ field: 'name', direction: 'asc' });
      });

      // Change page size - sort should be maintained
      const select = screen.getByLabelText('Rows per page:');
      await user.selectOptions(select, '20');

      await waitFor(() => {
        const lastCall = fetcher.mock.calls[fetcher.mock.calls.length - 1][0];
        expect(lastCall.pageSize).toBe(20);
        expect(lastCall.page).toBe(1); // Reset to page 1
        expect(lastCall.sort).toEqual({ field: 'name', direction: 'asc' });
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles multiple sortable columns independently', async () => {
      const user = userEvent.setup();
      const fetcher: Fetcher<User> = vi.fn(async () => ({
        items: mockUsers,
        total: 3,
      }));

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[
            col.text<User>('name', { sortable: true }),
            col.text<User>('email', { sortable: true }),
            col.text<User>('id', { sortable: true, header: 'ID' }),
          ]}
          rowKey="id"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      const nameHeader = screen.getByRole('button', { name: /name/i });
      const emailHeader = screen.getByRole('button', { name: /email/i });
      const idHeader = screen.getByRole('button', { name: /ID/i });

      // Sort by name
      await user.click(nameHeader);
      await waitFor(() => {
        expect(nameHeader.textContent).toContain('\u2191');
      });

      // Sort by email - name indicator should disappear
      await user.click(emailHeader);
      await waitFor(() => {
        expect(nameHeader.textContent).not.toContain('\u2191');
        expect(emailHeader.textContent).toContain('\u2191');
      });

      // Sort by ID - email indicator should disappear
      await user.click(idHeader);
      await waitFor(() => {
        expect(emailHeader.textContent).not.toContain('\u2191');
        expect(idHeader.textContent).toContain('\u2191');
      });
    });

    it('does not break with no sortable columns', async () => {
      const fetcher: Fetcher<User> = vi.fn(async () => ({
        items: mockUsers,
        total: 3,
      }));

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[
            col.text<User>('name'), // Not sortable
            col.text<User>('email'), // Not sortable
          ]}
          rowKey="id"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      // Should render without any clickable headers
      const buttons = screen.queryAllByRole('button');
      // Only pagination buttons should exist
      expect(buttons.length).toBeGreaterThan(0); // Pagination buttons
      expect(screen.queryByRole('button', { name: /name/i })).toBeNull();
    });

    it('handles sort with boolean columns', async () => {
      interface Product {
        id: string;
        name: string;
        inStock: boolean;
      }

      const products: Product[] = [
        { id: '1', name: 'Product A', inStock: true },
        { id: '2', name: 'Product B', inStock: false },
      ];

      const user = userEvent.setup();
      const fetcher: Fetcher<Product> = vi.fn(async () => ({
        items: products,
        total: 2,
      }));

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[
            col.text<Product>('name'),
            col.boolean<Product>('inStock', { sortable: true, header: 'In Stock' }),
          ]}
          rowKey="id"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Product A')).toBeDefined();
      });

      const inStockHeader = screen.getByRole('button', { name: /In Stock/i });
      await user.click(inStockHeader);

      await waitFor(() => {
        expect(fetcher).toHaveBeenCalledWith({
          page: 1,
          pageSize: 20,
          sort: { field: 'inStock', direction: 'asc' },
        });
      });
    });
  });
});
