/**
 * @fileoverview Tests for SmartTable pagination functionality (A-06)
 * Tests page navigation, page size changes, and pagination UI behavior
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SmartTable } from './SmartTable';
import { col } from '../column-helpers';
import type { Fetcher } from '../types';

// ============================================================================
// TEST DATA
// ============================================================================

interface User {
  id: string;
  name: string;
  email: string;
}

const mockUsers: User[] = Array.from({ length: 50 }, (_, i) => ({
  id: String(i + 1),
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
}));

// ============================================================================
// PAGINATION TESTS
// ============================================================================

describe('SmartTable - Pagination (A-06)', () => {
  describe('Page Size Selector', () => {
    it('renders page size selector with default options', async () => {
      const fetcher: Fetcher<User> = vi.fn(async () => ({
        items: mockUsers.slice(0, 20),
        total: 50,
      }));

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name')]}
          rowKey="id"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('User 1')).toBeDefined();
      });

      const select = screen.getByLabelText('Rows per page:') as HTMLSelectElement;
      expect(select).toBeDefined();
      expect(select.value).toBe('20'); // default

      // Check options
      const options = Array.from(select.options).map((opt) => opt.value);
      expect(options).toEqual(['10', '20', '50']);
    });

    it('uses custom pageSizeOptions when provided', async () => {
      const fetcher: Fetcher<User> = vi.fn(async () => ({
        items: mockUsers.slice(0, 25),
        total: 50,
      }));

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name')]}
          pageSizeOptions={[25, 50, 100]}
          defaultPageSize={25}
          rowKey="id"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('User 1')).toBeDefined();
      });

      const select = screen.getByLabelText('Rows per page:') as HTMLSelectElement;
      expect(select.value).toBe('25');

      const options = Array.from(select.options).map((opt) => opt.value);
      expect(options).toEqual(['25', '50', '100']);
    });

    it('changes page size and resets to page 1', async () => {
      const user = userEvent.setup();
      const fetcher: Fetcher<User> = vi.fn(async ({ page, pageSize }) => {
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        return {
          items: mockUsers.slice(start, end),
          total: 50,
        };
      });

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name')]}
          defaultPageSize={10}
          rowKey="id"
        />
      );

      // Wait for initial load (page 1, size 10)
      await waitFor(() => {
        expect(fetcher).toHaveBeenCalledWith({ page: 1, pageSize: 10 });
      });

      // Navigate to page 2
      const nextButton = screen.getByRole('button', { name: 'Next page' });
      await user.click(nextButton);

      await waitFor(() => {
        expect(fetcher).toHaveBeenCalledWith({ page: 2, pageSize: 10 });
      });

      // Change page size to 20
      const select = screen.getByLabelText('Rows per page:');
      await user.selectOptions(select, '20');

      // Should reset to page 1 with new page size
      await waitFor(() => {
        expect(fetcher).toHaveBeenCalledWith({ page: 1, pageSize: 20 });
      });
    });

    it('disables page size selector during loading', async () => {
      const user = userEvent.setup();
      let callCount = 0;
      let _slowResolve: ((result: FetcherResult<User>) => void) | null = null;

      const fetcher: Fetcher<User> = vi.fn(async () => {
        callCount++;
        
        if (callCount === 1) {
          // First load - resolve immediately
          return { items: mockUsers.slice(0, 10), total: 50 };
        }
        
        // Second load (after page size change) - hang
        return new Promise<FetcherResult<User>>((resolve) => {
          _slowResolve = resolve;
        });
      });

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name')]}
          defaultPageSize={10}
          rowKey="id"
        />
      );

      // Wait for initial data
      await waitFor(() => {
        expect(screen.getByText('User 1')).toBeDefined();
      });

      // Change page size to trigger loading
      const select = screen.getByLabelText('Rows per page:');
      await user.selectOptions(select, '20');

      // During loading, select should be disabled
      await waitFor(() => {
        const sel = screen.getByLabelText('Rows per page:') as HTMLSelectElement;
        expect(sel.disabled).toBe(true);
      });
    });
  });

  describe('Page Navigation Buttons', () => {
    it('renders Previous and Next buttons', async () => {
      const fetcher: Fetcher<User> = vi.fn(async () => ({
        items: mockUsers.slice(0, 20),
        total: 50,
      }));

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name')]}
          rowKey="id"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('User 1')).toBeDefined();
      });

      expect(screen.getByRole('button', { name: 'Previous page' })).toBeDefined();
      expect(screen.getByRole('button', { name: 'Next page' })).toBeDefined();
    });

    it('disables Previous button on first page', async () => {
      const fetcher: Fetcher<User> = vi.fn(async () => ({
        items: mockUsers.slice(0, 20),
        total: 50,
      }));

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name')]}
          rowKey="id"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('User 1')).toBeDefined();
      });

      const previousButton = screen.getByRole('button', { name: 'Previous page' }) as HTMLButtonElement;
      expect(previousButton.disabled).toBe(true);
    });

    it('disables Next button on last page', async () => {
      const fetcher: Fetcher<User> = vi.fn(async ({ page, pageSize }) => {
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        return {
          items: mockUsers.slice(start, end),
          total: 50,
        };
      });

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name')]}
          defaultPageSize={50} // Only 1 page
          rowKey="id"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('User 1')).toBeDefined();
      });

      const nextButton = screen.getByRole('button', { name: 'Next page' }) as HTMLButtonElement;
      expect(nextButton.disabled).toBe(true);
    });

    it('navigates to next page when Next clicked', async () => {
      const user = userEvent.setup();
      const fetcher: Fetcher<User> = vi.fn(async ({ page, pageSize }) => {
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        return {
          items: mockUsers.slice(start, end),
          total: 50,
        };
      });

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name')]}
          defaultPageSize={10}
          rowKey="id"
        />
      );

      // Wait for page 1
      await waitFor(() => {
        expect(screen.getByText('User 1')).toBeDefined();
      });

      const nextButton = screen.getByRole('button', { name: 'Next page' });
      await user.click(nextButton);

      // Should fetch page 2
      await waitFor(() => {
        expect(fetcher).toHaveBeenCalledWith({ page: 2, pageSize: 10 });
        expect(screen.getByText('User 11')).toBeDefined();
      });
    });

    it('navigates to previous page when Previous clicked', async () => {
      const user = userEvent.setup();
      const fetcher: Fetcher<User> = vi.fn(async ({ page, pageSize }) => {
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        return {
          items: mockUsers.slice(start, end),
          total: 50,
        };
      });

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name')]}
          defaultPageSize={10}
          rowKey="id"
        />
      );

      // Wait for page 1
      await waitFor(() => {
        expect(screen.getByText('User 1')).toBeDefined();
      });

      // Go to page 2
      const nextButton = screen.getByRole('button', { name: 'Next page' });
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('User 11')).toBeDefined();
      });

      // Go back to page 1
      const previousButton = screen.getByRole('button', { name: 'Previous page' });
      await user.click(previousButton);

      await waitFor(() => {
        expect(fetcher).toHaveBeenCalledWith({ page: 1, pageSize: 10 });
        expect(screen.getByText('User 1')).toBeDefined();
      });
    });

    it('disables both buttons during loading', async () => {
      const user = userEvent.setup();
      let callCount = 0;
      let _slowResolve: ((result: FetcherResult<User>) => void) | null = null;

      const fetcher: Fetcher<User> = vi.fn(async () => {
        callCount++;
        
        if (callCount === 1) {
          // First load - resolve with data
          return { items: mockUsers.slice(0, 20), total: 50 };
        }
        
        // Second load - never resolves (simulate slow loading)
        return new Promise<FetcherResult<User>>((resolve) => {
          _slowResolve = resolve;
        });
      });

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name')]}
          rowKey="id"
        />
      );

      // Wait for initial data
      await waitFor(() => {
        expect(screen.getByText('User 1')).toBeDefined();
      });

      // Trigger navigation which will start loading
      const nextButton = screen.getByRole('button', { name: 'Next page' });
      await user.click(nextButton);

      // During loading, both buttons should be disabled
      await waitFor(() => {
        const previousButton = screen.getByRole('button', { name: 'Previous page' }) as HTMLButtonElement;
        const nextBtn = screen.getByRole('button', { name: 'Next page' }) as HTMLButtonElement;
        
        expect(previousButton.disabled).toBe(true);
        expect(nextBtn.disabled).toBe(true);
      });
    });
  });

  describe('Page Info Display', () => {
    it('displays current page, total pages, and total items', async () => {
      const fetcher: Fetcher<User> = vi.fn(async () => ({
        items: mockUsers.slice(0, 20),
        total: 50,
      }));

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name')]}
          defaultPageSize={20}
          rowKey="id"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('User 1')).toBeDefined();
      });

      // Should show "Page 1 of 3 (50 total)"
      expect(screen.getByText(/Page 1 of 3/)).toBeDefined();
      expect(screen.getByText(/50 total/)).toBeDefined();
    });

    it('updates page info when navigating', async () => {
      const user = userEvent.setup();
      const fetcher: Fetcher<User> = vi.fn(async ({ page, pageSize }) => {
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        return {
          items: mockUsers.slice(start, end),
          total: 50,
        };
      });

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name')]}
          defaultPageSize={20}
          rowKey="id"
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Page 1 of 3/)).toBeDefined();
      });

      const nextButton = screen.getByRole('button', { name: 'Next page' });
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/Page 2 of 3/)).toBeDefined();
      });
    });

    it('calculates total pages correctly', async () => {
      const fetcher: Fetcher<User> = vi.fn(async () => ({
        items: mockUsers.slice(0, 10),
        total: 47, // Should be 5 pages with pageSize=10
      }));

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name')]}
          defaultPageSize={10}
          rowKey="id"
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Page 1 of 5/)).toBeDefined();
      });
    });
  });

  describe('Pagination Visibility', () => {
    it('hides pagination when total is 0', async () => {
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

      await waitFor(() => {
        expect(screen.getByText('No data')).toBeDefined();
      });

      expect(screen.queryByText(/Rows per page/)).toBeNull();
      expect(screen.queryByRole('button', { name: 'Previous page' })).toBeNull();
      expect(screen.queryByRole('button', { name: 'Next page' })).toBeNull();
    });

    it('shows pagination when data exists', async () => {
      const fetcher: Fetcher<User> = vi.fn(async () => ({
        items: mockUsers.slice(0, 10),
        total: 10,
      }));

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name')]}
          rowKey="id"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('User 1')).toBeDefined();
      });

      expect(screen.getByText(/Rows per page/)).toBeDefined();
      expect(screen.getByRole('button', { name: 'Previous page' })).toBeDefined();
      expect(screen.getByRole('button', { name: 'Next page' })).toBeDefined();
    });

    it('hides pagination during error state', async () => {
      const fetcher: Fetcher<User> = vi.fn(async () => {
        throw new Error('Test error');
      });

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name')]}
          rowKey="id"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test error')).toBeDefined();
      });

      expect(screen.queryByText(/Rows per page/)).toBeNull();
      expect(screen.queryByRole('button', { name: 'Previous page' })).toBeNull();
      expect(screen.queryByRole('button', { name: 'Next page' })).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('handles single page of data correctly', async () => {
      const fetcher: Fetcher<User> = vi.fn(async () => ({
        items: mockUsers.slice(0, 5),
        total: 5,
      }));

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name')]}
          defaultPageSize={20}
          rowKey="id"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('User 1')).toBeDefined();
      });

      // Should show page 1 of 1
      expect(screen.getByText(/Page 1 of 1/)).toBeDefined();

      // Both buttons should be disabled
      const previousButton = screen.getByRole('button', { name: 'Previous page' }) as HTMLButtonElement;
      const nextButton = screen.getByRole('button', { name: 'Next page' }) as HTMLButtonElement;

      expect(previousButton.disabled).toBe(true);
      expect(nextButton.disabled).toBe(true);
    });

    it('handles page size larger than total items', async () => {
      const fetcher: Fetcher<User> = vi.fn(async () => ({
        items: mockUsers.slice(0, 10),
        total: 10,
      }));

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name')]}
          defaultPageSize={50} // Larger than total
          rowKey="id"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('User 1')).toBeDefined();
      });

      expect(screen.getByText(/Page 1 of 1/)).toBeDefined();
    });

    it('does not allow navigation beyond last page', async () => {
      const user = userEvent.setup();
      const fetcher: Fetcher<User> = vi.fn(async ({ page, pageSize }) => {
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        return {
          items: mockUsers.slice(start, end),
          total: 25,
        };
      });

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name')]}
          defaultPageSize={10}
          rowKey="id"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('User 1')).toBeDefined();
      });

      const nextButton = screen.getByRole('button', { name: 'Next page' });

      // Go to page 2
      await user.click(nextButton);
      await waitFor(() => {
        expect(screen.getByText(/Page 2 of 3/)).toBeDefined();
      });

      // Go to page 3 (last page)
      await user.click(nextButton);
      await waitFor(() => {
        expect(screen.getByText(/Page 3 of 3/)).toBeDefined();
      });

      // Next button should now be disabled
      expect((nextButton as HTMLButtonElement).disabled).toBe(true);

      // Clicking again should not trigger another fetch
      const callCount = fetcher.mock.calls.length;
      await user.click(nextButton);
      
      // Wait a bit to ensure no new call was made
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(fetcher.mock.calls.length).toBe(callCount);
    });

    it('does not allow navigation before first page', async () => {
      const user = userEvent.setup();
      const fetcher: Fetcher<User> = vi.fn(async () => ({
        items: mockUsers.slice(0, 20),
        total: 50,
      }));

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name')]}
          rowKey="id"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('User 1')).toBeDefined();
      });

      const previousButton = screen.getByRole('button', { name: 'Previous page' });
      expect((previousButton as HTMLButtonElement).disabled).toBe(true);

      // Clicking should not trigger another fetch
      const callCount = fetcher.mock.calls.length;
      await user.click(previousButton);

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(fetcher.mock.calls.length).toBe(callCount);
    });
  });

  describe('Integration Tests', () => {
    it('pagination works end-to-end with multiple page changes', async () => {
      const user = userEvent.setup();
      const fetcher: Fetcher<User> = vi.fn(async ({ page, pageSize }) => {
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        return {
          items: mockUsers.slice(start, end),
          total: 50,
        };
      });

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name')]}
          defaultPageSize={10}
          rowKey="id"
        />
      );

      // Initial load - page 1
      await waitFor(() => {
        expect(fetcher).toHaveBeenCalledWith({ page: 1, pageSize: 10 });
        expect(screen.getByText('User 1')).toBeDefined();
      });

      // Go to page 3
      const nextButton = screen.getByRole('button', { name: 'Next page' });
      await user.click(nextButton);
      await waitFor(() => {
        expect(screen.getByText('User 11')).toBeDefined();
      });

      await user.click(nextButton);
      await waitFor(() => {
        expect(screen.getByText('User 21')).toBeDefined();
        expect(screen.getByText(/Page 3 of 5/)).toBeDefined();
      });

      // Go back to page 2
      const previousButton = screen.getByRole('button', { name: 'Previous page' });
      await user.click(previousButton);
      await waitFor(() => {
        expect(screen.getByText('User 11')).toBeDefined();
        expect(screen.getByText(/Page 2 of 5/)).toBeDefined();
      });

      // Change page size to 20 (should reset to page 1)
      const select = screen.getByLabelText('Rows per page:');
      await user.selectOptions(select, '20');

      await waitFor(() => {
        expect(fetcher).toHaveBeenCalledWith({ page: 1, pageSize: 20 });
        expect(screen.getByText('User 1')).toBeDefined();
        expect(screen.getByText(/Page 1 of 3/)).toBeDefined();
      });
    });
  });
});
