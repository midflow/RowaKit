/**
 * RowaKitTable Component Tests (A-11)
 *
 * Tests core behaviors for Stage A completion:
 * - Pagination
 * - Page size changes
 * - Sorting cycles
 * - Error retry flow
 * - Action confirmation
 *
 * These tests ensure the table works correctly for production use.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SmartTable } from '../components/SmartTable';
import { col } from '../column-helpers';
import type { Fetcher } from '../types';

interface User {
  id: number;
  name: string;
  email: string;
}

describe('RowaKitTable Component (A-11)', () => {
  const mockUsers: User[] = [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' },
    { id: 3, name: 'Charlie', email: 'charlie@example.com' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Pagination', () => {
    it('renders table with mock fetcher', async () => {
      const fetcher: Fetcher<User> = vi.fn(async () => ({
        items: mockUsers,
        total: 3,
      }));

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name'), col.text<User>('email')]}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      expect(fetcher).toHaveBeenCalledWith({
        page: 1,
        pageSize: 20,
        sort: undefined,
        filters: undefined,
      });
    });

    it('calls fetcher with page 2 when next button is clicked', async () => {
      // Mock data with enough items to enable pagination
      const fetcher: Fetcher<User> = vi.fn(async (query) => {
        if (query.page === 1) {
          return { items: mockUsers, total: 25 };
        }
        return {
          items: [{ id: 11, name: 'User 11', email: 'user11@example.com' }],
          total: 25,
        };
      });

      const user = userEvent.setup();

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name'), col.text<User>('email')]}
        />
      );

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      // Find and click next button
      const nextButton = screen.getByLabelText('Next page');
      expect(nextButton).toBeDefined();
      expect(nextButton.hasAttribute('disabled')).toBe(false);

      await user.click(nextButton);

      // Verify fetcher was called with page 2
      await waitFor(() => {
        expect(fetcher).toHaveBeenCalledWith({
          page: 2,
          pageSize: 20,
          sort: undefined,
          filters: undefined,
        });
      });
    });

    it('disables next button on last page', async () => {
      const fetcher: Fetcher<User> = vi.fn(async () => ({
        items: mockUsers,
        total: 3, // Only 3 items, fits in one page (pageSize: 20)
      }));

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name')]}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      const nextButton = screen.getByLabelText('Next page');
      expect(nextButton.hasAttribute('disabled')).toBe(true);
    });

    it('disables previous button on first page', async () => {
      const fetcher: Fetcher<User> = vi.fn(async () => ({
        items: mockUsers,
        total: 25,
      }));

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name')]}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      const prevButton = screen.getByLabelText('Previous page');
      expect(prevButton.hasAttribute('disabled')).toBe(true);
    });
  });

  describe('Page Size Change', () => {
    it('calls fetcher with new page size and resets to page 1', async () => {
      const fetcher: Fetcher<User> = vi.fn(async () => ({
        items: mockUsers,
        total: 30,
      }));

      const user = userEvent.setup();

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name')]}
        />
      );

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      // Initial call should be with pageSize: 20
      expect(fetcher).toHaveBeenCalledWith({
        page: 1,
        pageSize: 20,
        sort: undefined,
        filters: undefined,
      });

      // Find page size selector
      const pageSizeSelect = screen.getByLabelText('Rows per page:');
      expect(pageSizeSelect).toBeDefined();

      // Change page size to 50
      await user.selectOptions(pageSizeSelect, '50');

      // Verify fetcher was called with new pageSize and page reset to 1
      await waitFor(() => {
        expect(fetcher).toHaveBeenCalledWith({
          page: 1,
          pageSize: 50,
          sort: undefined,
          filters: undefined,
        });
      });
    });
  });

  describe('Sorting', () => {
    it('cycles through sort states: none → asc → desc → none', async () => {
      const fetcher: Fetcher<User> = vi.fn(async () => ({
        items: mockUsers,
        total: 3,
      }));

      const user = userEvent.setup();

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name', { sortable: true })]}
        />
      );

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      // Initial state: no sort
      expect(fetcher).toHaveBeenLastCalledWith({
        page: 1,
        pageSize: 20,
        sorts: undefined,
        filters: undefined,
      });

      const nameHeader = screen.getByText('name');
      expect(nameHeader).toBeDefined();

      // First click: asc
      await user.click(nameHeader);

      await waitFor(() => {
        expect(fetcher).toHaveBeenLastCalledWith({
          page: 1,
          pageSize: 20,
          sorts: [{ field: 'name', direction: 'asc', priority: 0 }],
          filters: undefined,
        });
      });

      // Second click: desc
      await user.click(nameHeader);

      await waitFor(() => {
        expect(fetcher).toHaveBeenLastCalledWith({
          page: 1,
          pageSize: 20,
          sorts: [{ field: 'name', direction: 'desc', priority: 0 }],
          filters: undefined,
        });
      });

      // Third click: none (back to unsorted)
      await user.click(nameHeader);

      await waitFor(() => {
        expect(fetcher).toHaveBeenLastCalledWith({
          page: 1,
          pageSize: 20,
          sorts: undefined,
          filters: undefined,
        });
      });
    });

    it('resets page to 1 when sorting changes', async () => {
      const fetcher: Fetcher<User> = vi.fn(async (query) => {
        if (query.page === 2) {
          return {
            items: [{ id: 11, name: 'User 11', email: 'user11@example.com' }],
            total: 25,
          };
        }
        return { items: mockUsers, total: 25 };
      });

      const user = userEvent.setup();

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name', { sortable: true })]}
        />
      );

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      // Navigate to page 2
      const nextButton = screen.getByLabelText('Next page');
      await user.click(nextButton);

      await waitFor(() => {
        expect(fetcher).toHaveBeenLastCalledWith({
          page: 2,
          pageSize: 20,
          sort: undefined,
          filters: undefined,
        });
      });

      // Click sort - should reset to page 1
      const nameHeader = screen.getByText('name');
      await user.click(nameHeader);

      await waitFor(() => {
        expect(fetcher).toHaveBeenLastCalledWith({
          page: 1, // Back to page 1
          pageSize: 20,
          sorts: [{ field: 'name', direction: 'asc', priority: 0 }],
          filters: undefined,
        });
      });
    });
  });

  describe('Error → Retry', () => {
    it('shows error state and calls fetcher again on retry', async () => {
      let callCount = 0;
      const fetcher: Fetcher<User> = vi.fn(async () => {
        callCount++;
        if (callCount === 1) {
          throw new Error('Failed to fetch');
        }
        return { items: mockUsers, total: 3 };
      });

      const user = userEvent.setup();

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name')]}
        />
      );

      // Wait for error state
      await waitFor(() => {
        expect(screen.getByText('Failed to fetch')).toBeDefined();
      });

      // Verify retry button is rendered
      const retryButton = screen.getByText('Retry');
      expect(retryButton).toBeDefined();

      // Click retry
      await user.click(retryButton);

      // Wait for success after retry
      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      // Verify fetcher was called twice
      expect(fetcher).toHaveBeenCalledTimes(2);
    });
  });

  describe('Actions Confirm', () => {
    it('shows confirmation modal before calling onClick for delete action', async () => {
      const fetcher: Fetcher<User> = vi.fn(async () => ({
        items: mockUsers,
        total: 3,
      }));

      const onDelete = vi.fn();
      const user = userEvent.setup();

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[
            col.text<User>('name'),
            col.actions<User>([
              {
                id: 'delete',
                label: 'Delete',
                onClick: onDelete,
                confirm: true,
              },
            ]),
          ]}
        />
      );

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      // Find all delete buttons (one per row)
      const deleteButtons = screen.getAllByText('Delete');
      expect(deleteButtons.length).toBeGreaterThan(0);

      // Click first delete button
      await user.click(deleteButtons[0]);

      // Verify confirmation modal appears
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeDefined();
      });

      // At this point, onClick should NOT have been called yet
      expect(onDelete).not.toHaveBeenCalled();

      // Find and click confirm button
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);

      // Now onClick should be called with the correct row
      await waitFor(() => {
        expect(onDelete).toHaveBeenCalledWith(mockUsers[0]);
      });
    });

    it('does not call onClick when cancel is clicked', async () => {
      const fetcher: Fetcher<User> = vi.fn(async () => ({
        items: mockUsers,
        total: 3,
      }));

      const onDelete = vi.fn();
      const user = userEvent.setup();

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[
            col.text<User>('name'),
            col.actions<User>([
              {
                id: 'delete',
                label: 'Delete',
                onClick: onDelete,
                confirm: true,
              },
            ]),
          ]}
        />
      );

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      // Click delete button
      const deleteButtons = screen.getAllByText('Delete');
      await user.click(deleteButtons[0]);

      // Wait for modal
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeDefined();
      });

      // Click cancel
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      // Modal should close, onClick should not be called
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).toBeNull();
      });

      expect(onDelete).not.toHaveBeenCalled();
    });
  });

  describe('Empty State', () => {
    it('shows "No data" when fetcher returns empty array', async () => {
      const fetcher: Fetcher<User> = vi.fn(async () => ({
        items: [],
        total: 0,
      }));

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name')]}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('No data')).toBeDefined();
      });
    });
  });

  describe('Loading State', () => {
    it('shows loading state while fetching', async () => {
      const fetcher: Fetcher<User> = vi.fn(
        () => new Promise(() => {}) // Never resolves
      );

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name')]}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Loading...')).toBeDefined();
      });
    });
  });
});
