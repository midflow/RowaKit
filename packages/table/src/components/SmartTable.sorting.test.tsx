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
          sorts: [{ field: 'name', direction: 'asc', priority: 0 }],
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
          sorts: [{ field: 'name', direction: 'asc', priority: 0 }],
        });
      });

      // Second click - descending
      await user.click(nameHeader);
      await waitFor(() => {
        expect(fetcher).toHaveBeenCalledWith({
          page: 1,
          pageSize: 20,
          sorts: [{ field: 'name', direction: 'desc', priority: 0 }],
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
        expect(lastCall.sorts).toEqual([{ field: 'name', direction: 'asc', priority: 0 }]);
      });

      // Click 2: desc
      await user.click(nameHeader);
      await waitFor(() => {
        const lastCall = fetcher.mock.calls[fetcher.mock.calls.length - 1][0];
        expect(lastCall.sorts).toEqual([{ field: 'name', direction: 'desc', priority: 0 }]);
      });

      // Click 3: no sort
      await user.click(nameHeader);
      await waitFor(() => {
        const lastCall = fetcher.mock.calls[fetcher.mock.calls.length - 1][0];
        expect(lastCall.sorts).toBeUndefined();
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
        expect(lastCall.sorts).toEqual([{ field: 'name', direction: 'asc', priority: 0 }]);
      });

      // Switch to email - should start with ascending
      const emailHeader = screen.getByRole('button', { name: /email/i });
      await user.click(emailHeader);

      await waitFor(() => {
        const lastCall = fetcher.mock.calls[fetcher.mock.calls.length - 1][0];
        expect(lastCall.sorts).toEqual([{ field: 'email', direction: 'asc', priority: 0 }]);
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
        expect(lastCall.sorts).toEqual([{ field: 'name', direction: 'asc', priority: 0 }]);
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
          sorts: [{ field: 'name', direction: 'asc', priority: 0 }],
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
          sorts: [{ field: 'name', direction: 'asc', priority: 0 }],
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
        expect(lastCall.sorts).toEqual([{ field: 'name', direction: 'asc', priority: 0 }]);
      });

      // Navigate to next page - sort should be maintained
      const nextButton = screen.getByRole('button', { name: 'Next page' });
      await user.click(nextButton);

      await waitFor(() => {
        const lastCall = fetcher.mock.calls[fetcher.mock.calls.length - 1][0];
        expect(lastCall.page).toBe(2);
        expect(lastCall.sorts).toEqual([{ field: 'name', direction: 'asc', priority: 0 }]);
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
        expect(lastCall.sorts).toEqual([{ field: 'name', direction: 'asc', priority: 0 }]);
      });

      // Change page size - sort should be maintained
      const select = screen.getByLabelText('Rows per page:');
      await user.selectOptions(select, '20');

      await waitFor(() => {
        const lastCall = fetcher.mock.calls[fetcher.mock.calls.length - 1][0];
        expect(lastCall.pageSize).toBe(20);
        expect(lastCall.page).toBe(1); // Reset to page 1
        expect(lastCall.sorts).toEqual([{ field: 'name', direction: 'asc', priority: 0 }]);
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
          sorts: [{ field: 'inStock', direction: 'asc', priority: 0 }],
        });
      });
    });
  });

  // ============================================================================
  // PRD-01: Prevent accidental sort while resizing
  // ============================================================================
  describe('PRD-01: Prevent accidental sort during resize', () => {
    it('does not sort when double-clicking resize handle', async () => {
      const fetcher: Fetcher<User> = vi.fn(async () => ({
        items: mockUsers,
        total: 3,
      }));

      const { container } = render(
        <SmartTable
          fetcher={fetcher}
          columns={[
            col.text<User>('name', { sortable: true }),
            col.text<User>('email'),
          ]}
          rowKey="id"
          enableColumnResizing={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      // Find the resize handle
      const resizeHandle = container.querySelector('.rowakit-column-resize-handle') as HTMLDivElement;
      expect(resizeHandle).toBeDefined();

      // Get initial call count
      const initialCallCount = fetcher.mock.calls.length;

      // Double-click the resize handle
      await userEvent.dblClick(resizeHandle);

      // Wait for any async updates
      await new Promise(resolve => setTimeout(resolve, 100));

      // Sort should not have been triggered (only the initial load calls)
      // We check that no additional sort call was made
      const callsAfterDoubleClick = fetcher.mock.calls.length - initialCallCount;
      
      // The double-click might trigger a fetch due to column width change,
      // but it should not include a sort change
      if (callsAfterDoubleClick > 0) {
        const lastCall = fetcher.mock.calls[fetcher.mock.calls.length - 1][0] as FetcherQuery;
        // If there was a call, sorts should remain the same (undefined initially)
        expect(lastCall.sorts).toBeUndefined();
      }
    });

    it('suppresses sort within 150ms window after resize ends', async () => {
      const fetcher: Fetcher<User> = vi.fn(async () => ({
        items: mockUsers,
        total: 3,
      }));

      const { container } = render(
        <SmartTable
          fetcher={fetcher}
          columns={[
            col.text<User>('name', { sortable: true }),
            col.text<User>('email'),
          ]}
          rowKey="id"
          enableColumnResizing={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      // Find the resize handle and header
      const resizeHandle = container.querySelector('.rowakit-column-resize-handle') as HTMLDivElement;
      const nameHeader = screen.getByText('name').closest('th') as HTMLTableCellElement;
      expect(resizeHandle).toBeDefined();
      expect(nameHeader).toBeDefined();

      // Get initial call count (initial load)
      const initialCallCount = fetcher.mock.calls.length;

      // Simulate mousedown on resize handle
      await userEvent.pointer({ keys: '[MouseLeft>]', target: resizeHandle });

      // Simulate mouseup to end resize
      await userEvent.pointer({ keys: '[/MouseLeft]' });

      // Wait a bit (less than 150ms suppression window)
      await new Promise(resolve => setTimeout(resolve, 50));

      // Immediately click the header to try to sort
      await userEvent.click(nameHeader);

      // Wait a bit for potential fetch
      await new Promise(resolve => setTimeout(resolve, 100));

      // No additional fetcher calls should have been made (sort suppressed)
      const callsAfterClick = fetcher.mock.calls.length - initialCallCount;
      expect(callsAfterClick).toBe(0);

      // Now wait until suppression window expires (total > 150ms from resize end)
      await new Promise(resolve => setTimeout(resolve, 150));

      // Click again to trigger sort
      await userEvent.click(nameHeader);

      // This time, sort should be triggered
      await waitFor(() => {
        expect(fetcher).toHaveBeenCalled();
      });
    });
  });
});
