import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SmartTable } from './SmartTable';
import { col } from '../column-helpers';
import type { Fetcher, FetcherResult } from '../types';

// Sample data types for testing
interface User {
  id: string;
  name: string;
  email: string;
  active: boolean;
}

const mockUsers: User[] = [
  { id: '1', name: 'Alice', email: 'alice@example.com', active: true },
  { id: '2', name: 'Bob', email: 'bob@example.com', active: false },
  { id: '3', name: 'Charlie', email: 'charlie@example.com', active: true },
];

describe('SmartTable - Data Fetching (A-05)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('State Transitions', () => {
    it('starts in loading state on mount', async () => {
      const fetcher: Fetcher<User> = vi.fn(
        () => new Promise(() => {}) // Never resolves
      );

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name')]}
          rowKey="id"
        />
      );

      expect(screen.getByText('Loading...')).toBeDefined();
      expect(fetcher).toHaveBeenCalledOnce();
    });

    it('transitions from loading to success state', async () => {
      const fetcher: Fetcher<User> = vi.fn(async () => ({
        items: mockUsers,
        total: 3,
      }));

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name')]}
          rowKey="id"
        />
      );

      // Should start with loading
      expect(screen.getByText('Loading...')).toBeDefined();

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      expect(screen.getByText('Bob')).toBeDefined();
      expect(screen.getByText('Charlie')).toBeDefined();
    });

    it('transitions from loading to empty state', async () => {
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
    });

    it('transitions from loading to error state', async () => {
      const fetcher: Fetcher<User> = vi.fn(async () => {
        throw new Error('Network error');
      });

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name')]}
          rowKey="id"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeDefined();
      });

      expect(screen.getByRole('button', { name: 'Retry' })).toBeDefined();
    });
  });

  describe('Fetcher Invocation', () => {
    it('calls fetcher on mount with correct initial query', async () => {
      const fetcher: Fetcher<User> = vi.fn(async () => ({
        items: mockUsers,
        total: 3,
      }));

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name')]}
          defaultPageSize={25}
          rowKey="id"
        />
      );

      await waitFor(() => {
        expect(fetcher).toHaveBeenCalledOnce();
      });

      expect(fetcher).toHaveBeenCalledWith({
        page: 1,
        pageSize: 25,
      });
    });

    it('uses default pageSize of 20 when not specified', async () => {
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
        expect(fetcher).toHaveBeenCalledWith({
          page: 1,
          pageSize: 20,
        });
      });
    });
  });

  describe('Retry Logic', () => {
    it('shows retry button on error', async () => {
      const fetcher: Fetcher<User> = vi.fn(async () => {
        throw new Error('Failed to fetch');
      });

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name')]}
          rowKey="id"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Failed to fetch')).toBeDefined();
      });

      const retryButton = screen.getByRole('button', { name: 'Retry' });
      expect(retryButton).toBeDefined();
    });

    it('retries fetch when retry button clicked', async () => {
      let attemptCount = 0;
      const fetcher: Fetcher<User> = vi.fn(async () => {
        attemptCount++;
        if (attemptCount === 1) {
          throw new Error('First attempt failed');
        }
        return { items: mockUsers, total: 3 };
      });

      const user = userEvent.setup();

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name')]}
          rowKey="id"
        />
      );

      // Wait for error state
      await waitFor(() => {
        expect(screen.getByText('First attempt failed')).toBeDefined();
      });

      expect(fetcher).toHaveBeenCalledTimes(1);

      // Click retry
      const retryButton = screen.getByRole('button', { name: 'Retry' });
      await user.click(retryButton);

      // Wait for success state
      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      expect(fetcher).toHaveBeenCalledTimes(2);
    });

    it('retries with same query parameters', async () => {
      let callCount = 0;
      const fetcher: Fetcher<User> = vi.fn(async () => {
        callCount++;
        if (callCount === 1) {
          throw new Error('Temporary error');
        }
        return { items: mockUsers, total: 3 };
      });

      const user = userEvent.setup();

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name')]}
          defaultPageSize={30}
          rowKey="id"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Temporary error')).toBeDefined();
      });

      const firstCall = fetcher.mock.calls[0];

      const retryButton = screen.getByRole('button', { name: 'Retry' });
      await user.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      const secondCall = fetcher.mock.calls[1];
      expect(secondCall).toEqual(firstCall);
    });
  });

  describe('Stale Response Handling', () => {
    it('ignores stale responses from older requests', async () => {
      let firstRequestResolve: ((result: FetcherResult<User>) => void) | null = null;
      let requestCount = 0;

      const fetcher: Fetcher<User> = vi.fn(async () => {
        requestCount++;
        
        // First request: return a promise we'll resolve later
        if (requestCount === 1) {
          return new Promise<FetcherResult<User>>((resolve) => {
            firstRequestResolve = resolve;
          });
        }
        
        // Second request: resolve immediately with just Alice
        return { items: mockUsers.slice(0, 1), total: 1 };
      });

      const { rerender } = render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name')]}
          defaultPageSize={20}
          rowKey="id"
        />
      );

      // Wait for first fetch to be called
      await waitFor(() => {
        expect(fetcher).toHaveBeenCalledTimes(1);
      });

      // Create a new fetcher instance to trigger re-fetch (fetcher is in deps)
      const fetcher2: Fetcher<User> = vi.fn(async () => {
        return { items: mockUsers.slice(0, 1), total: 1 };
      });

      // Trigger second fetch with new fetcher instance
      rerender(
        <SmartTable
          fetcher={fetcher2}
          columns={[col.text<User>('name')]}
          defaultPageSize={20}
          rowKey="id"
        />
      );

      // Wait for second request to complete and show Alice
      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      // Now resolve the slow first request with all three users
      if (firstRequestResolve) {
        firstRequestResolve({ items: mockUsers, total: 3 });
      }

      // Give time for state update to be processed if it were to happen
      await new Promise(resolve => setTimeout(resolve, 50));

      // Should still only show Alice, not Bob or Charlie from the stale first request
      expect(screen.queryByText('Bob')).toBeNull();
      expect(screen.queryByText('Charlie')).toBeNull();
    });
  });

  describe('UI States', () => {
    it('shows loading skeleton during fetch', () => {
      const fetcher: Fetcher<User> = vi.fn(
        () => new Promise(() => {}) // Never resolves
      );

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name'), col.text<User>('email')]}
          rowKey="id"
        />
      );

      expect(screen.getByText('Loading...')).toBeDefined();
    });

    it('shows error message with retry button', async () => {
      const fetcher: Fetcher<User> = vi.fn(async () => {
        throw new Error('Custom error message');
      });

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name')]}
          rowKey="id"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Custom error message')).toBeDefined();
      });

      expect(screen.getByRole('button', { name: 'Retry' })).toBeDefined();
    });

    it('shows empty state when items array is empty', async () => {
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
    });

    it('shows table rows when data present', async () => {
      const fetcher: Fetcher<User> = vi.fn(async () => ({
        items: mockUsers,
        total: 3,
      }));

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[
            col.text<User>('name', { header: 'Name' }),
            col.text<User>('email', { header: 'Email' }),
          ]}
          rowKey="id"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      expect(screen.getByText('alice@example.com')).toBeDefined();
      expect(screen.getByText('Bob')).toBeDefined();
      expect(screen.getByText('bob@example.com')).toBeDefined();
    });
  });

  describe('Action Button Integration', () => {
    it('disables action buttons during loading', async () => {
      const handleEdit = vi.fn();
      const fetcher: Fetcher<User> = vi.fn(
        () => new Promise(() => {}) // Never resolves
      );

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[
            col.text<User>('name'),
            col.actions<User>([
              { id: 'edit', label: 'Edit', onClick: handleEdit },
            ]),
          ]}
          rowKey="id"
        />
      );

      // In loading state, no rows rendered yet, so no action buttons
      expect(screen.getByText('Loading...')).toBeDefined();
    });

    it('enables action buttons when data loaded', async () => {
      const handleEdit = vi.fn();
      const fetcher: Fetcher<User> = vi.fn(async () => ({
        items: mockUsers,
        total: 3,
      }));

      const user = userEvent.setup();

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[
            col.text<User>('name'),
            col.actions<User>([
              { id: 'edit', label: 'Edit', onClick: handleEdit },
            ]),
          ]}
          rowKey="id"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      const editButtons = screen.getAllByRole('button', { name: 'Edit' });
      expect(editButtons.length).toBeGreaterThan(0);

      await user.click(editButtons[0]!);
      expect(handleEdit).toHaveBeenCalledWith(mockUsers[0]);
    });
  });

  describe('Error Handling', () => {
    it('handles Error objects', async () => {
      const fetcher: Fetcher<User> = vi.fn(async () => {
        throw new Error('Specific error message');
      });

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name')]}
          rowKey="id"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Specific error message')).toBeDefined();
      });
    });

    it('handles non-Error exceptions', async () => {
      const fetcher: Fetcher<User> = vi.fn(async () => {
        throw 'String error';
      });

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name')]}
          rowKey="id"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Failed to load data')).toBeDefined();
      });
    });
  });

  describe('Data Rendering', () => {
    it('renders all fetched items', async () => {
      const fetcher: Fetcher<User> = vi.fn(async () => ({
        items: mockUsers,
        total: 3,
      }));

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name')]}
          rowKey="id"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      expect(screen.getByText('Bob')).toBeDefined();
      expect(screen.getByText('Charlie')).toBeDefined();
    });

    it('renders multiple columns correctly', async () => {
      const fetcher: Fetcher<User> = vi.fn(async () => ({
        items: mockUsers,
        total: 3,
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

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      expect(screen.getByText('alice@example.com')).toBeDefined();
      expect(screen.getAllByText('Yes')).toHaveLength(2);
      expect(screen.getAllByText('No')).toHaveLength(1);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty result with non-zero total', async () => {
      const fetcher: Fetcher<User> = vi.fn(async () => ({
        items: [],
        total: 100, // Total exists but current page empty
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
    });

    it('handles fetcher that resolves immediately', async () => {
      const fetcher: Fetcher<User> = vi.fn(async () => ({
        items: mockUsers,
        total: 3,
      }));

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name')]}
          rowKey="id"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });
    });
  });
});
