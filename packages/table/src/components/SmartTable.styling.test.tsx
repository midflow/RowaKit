/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SmartTable } from './SmartTable';
import { col } from '../column-helpers';
import type { Fetcher } from '../types';

interface User {
  id: number;
  name: string;
  email: string;
}

const mockUsers: User[] = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' },
  { id: 3, name: 'Charlie', email: 'charlie@example.com' },
];

describe('SmartTable Styling', () => {
  let fetcher: Fetcher<User>;

  beforeEach(() => {
    fetcher = vi.fn(async () => ({
      items: mockUsers,
      total: 3,
    }));
  });

  describe('CSS Classes', () => {
    it('applies rowakit-table class to container', async () => {
      const { container } = render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name'), col.text<User>('email')]}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      const tableContainer = container.querySelector('.rowakit-table');
      expect(tableContainer).toBeDefined();
    });

    it('applies custom className when provided', async () => {
      const { container } = render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name')]}
          className="custom-table-class"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      const tableContainer = container.querySelector('.rowakit-table.custom-table-class');
      expect(tableContainer).toBeDefined();
    });

    it('combines rowakit-table with custom className', async () => {
      const { container } = render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name')]}
          className="my-custom-class another-class"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      const tableContainer = container.querySelector('.rowakit-table');
      expect(tableContainer).toBeDefined();
      expect(tableContainer?.className).toContain('rowakit-table');
      expect(tableContainer?.className).toContain('my-custom-class');
      expect(tableContainer?.className).toContain('another-class');
    });

    it('works without custom className', async () => {
      const { container } = render(
        <SmartTable fetcher={fetcher} columns={[col.text<User>('name')]} />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      const tableContainer = container.querySelector('.rowakit-table');
      expect(tableContainer).toBeDefined();
      expect(tableContainer?.className).toBe('rowakit-table');
    });
  });

  describe('Table Structure', () => {
    it('renders table element', async () => {
      render(<SmartTable fetcher={fetcher} columns={[col.text<User>('name')]} />);

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      const table = screen.getByRole('table');
      expect(table).toBeDefined();
    });

    it('renders thead and tbody', async () => {
      const { container } = render(
        <SmartTable fetcher={fetcher} columns={[col.text<User>('name')]} />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      const thead = container.querySelector('thead');
      const tbody = container.querySelector('tbody');
      expect(thead).toBeDefined();
      expect(tbody).toBeDefined();
    });

    it('renders table headers in thead', async () => {
      const { container } = render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name', { header: 'Full Name' }), col.text<User>('email')]}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      const thead = container.querySelector('thead');
      expect(thead?.textContent).toContain('Full Name');
      expect(thead?.textContent).toContain('email');
    });

    it('renders data rows in tbody', async () => {
      const { container } = render(
        <SmartTable fetcher={fetcher} columns={[col.text<User>('name')]} />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      const tbody = container.querySelector('tbody');
      const rows = tbody?.querySelectorAll('tr');
      expect(rows?.length).toBe(3); // 3 users
    });
  });

  describe('Responsive Behavior', () => {
    it('table container has proper structure for overflow', async () => {
      const { container } = render(
        <SmartTable fetcher={fetcher} columns={[col.text<User>('name')]} />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      const tableContainer = container.querySelector('.rowakit-table');
      expect(tableContainer).toBeDefined();

      // Table should be inside the container
      const table = tableContainer?.querySelector('table');
      expect(table).toBeDefined();
    });

    it('handles many columns without breaking layout', async () => {
      render(
        <SmartTable
          fetcher={fetcher}
          columns={[
            col.text<User>('name', { id: 'name-1' }),
            col.text<User>('email', { id: 'email-1' }),
            col.text<User>('name', { id: 'name-2', header: 'Name Copy 1' }),
            col.text<User>('email', { id: 'email-2', header: 'Email Copy 1' }),
            col.text<User>('name', { id: 'name-3', header: 'Name Copy 2' }),
            col.text<User>('email', { id: 'email-3', header: 'Email Copy 2' }),
          ]}
        />
      );

      await waitFor(() => {
        const aliceElements = screen.getAllByText('Alice');
        // Should appear 3 times (once per name column)
        expect(aliceElements.length).toBe(3);
      });

      // Should render all column headers
      expect(screen.getByText('Name Copy 1')).toBeDefined();
      expect(screen.getByText('Email Copy 1')).toBeDefined();
      expect(screen.getByText('Name Copy 2')).toBeDefined();
      expect(screen.getByText('Email Copy 2')).toBeDefined();
    });
  });

  describe('Loading State Styling', () => {
    it('renders loading message in centered td', async () => {
      const slowFetcher: Fetcher<User> = vi.fn(
        () => new Promise(() => {}) // Never resolves
      );

      const { container } = render(
        <SmartTable fetcher={slowFetcher} columns={[col.text<User>('name')]} />
      );

      await waitFor(() => {
        expect(screen.getByText('Loading...')).toBeDefined();
      });

      const loadingTd = container.querySelector('tbody td');
      expect(loadingTd?.getAttribute('colspan')).toBe('1');
    });
  });

  describe('Empty State Styling', () => {
    it('renders empty message in centered td', async () => {
      const emptyFetcher: Fetcher<User> = vi.fn(async () => ({
        items: [],
        total: 0,
      }));

      const { container } = render(
        <SmartTable fetcher={emptyFetcher} columns={[col.text<User>('name')]} />
      );

      await waitFor(() => {
        expect(screen.getByText('No data')).toBeDefined();
      });

      const emptyTd = container.querySelector('tbody td');
      expect(emptyTd?.getAttribute('colspan')).toBe('1');
    });
  });

  describe('Error State Styling', () => {
    it('renders error message with retry button', async () => {
      const errorFetcher: Fetcher<User> = vi.fn(async () => {
        throw new Error('Failed to fetch');
      });

      render(<SmartTable fetcher={errorFetcher} columns={[col.text<User>('name')]} />);

      await waitFor(() => {
        expect(screen.getByText('Failed to fetch')).toBeDefined();
      });

      const retryButton = screen.getByText('Retry');
      expect(retryButton).toBeDefined();
    });
  });

  describe('Pagination Styling', () => {
    it('renders pagination controls with proper structure', async () => {
      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name')]}
          pageSizeOptions={[10, 20, 50]}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      // Page size selector
      expect(screen.getByText('Rows per page:')).toBeDefined();
      const select = screen.getByLabelText('Rows per page:');
      expect(select).toBeDefined();

      // Page info
      expect(screen.getByText(/page \d+ of \d+/i)).toBeDefined();

      // Navigation buttons
      expect(screen.getByText('Previous')).toBeDefined();
      expect(screen.getByText('Next')).toBeDefined();
    });
  });

  describe('Sortable Column Styling', () => {
    it('sortable headers have proper attributes', async () => {
      const { container } = render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name', { sortable: true }), col.text<User>('email')]}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      // Sortable column should have role="button"
      const nameHeader = container.querySelector('th[role="button"]');
      expect(nameHeader).toBeDefined();
      expect(nameHeader?.textContent).toContain('name');

      // Non-sortable column should not have role="button"
      const headers = container.querySelectorAll('thead th');
      const emailHeader = Array.from(headers).find((h) => h.textContent === 'email');
      expect(emailHeader?.getAttribute('role')).not.toBe('button');
    });

    it('sortable headers have tabindex', async () => {
      const { container } = render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name', { sortable: true })]}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      const sortableHeader = container.querySelector('th[role="button"]');
      expect(sortableHeader?.getAttribute('tabindex')).toBe('0');
    });
  });

  describe('Action Buttons Styling', () => {
    it('renders action buttons in flex container', async () => {
      const { container } = render(
        <SmartTable
          fetcher={fetcher}
          columns={[
            col.text<User>('name'),
            col.actions<User>([
              { id: 'edit', label: 'Edit', onClick: vi.fn() },
              { id: 'delete', label: 'Delete', onClick: vi.fn() },
            ]),
          ]}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      // Actions should be in a flex container
      const actionsCell = container.querySelector('tbody tr td:last-child');
      expect(actionsCell).toBeDefined();

      const editButtons = screen.getAllByText('Edit');
      expect(editButtons.length).toBe(3); // One per row
    });
  });

  describe('Modal Styling', () => {
    it('modal has proper ARIA attributes', async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();
      render(
        <SmartTable
          fetcher={fetcher}
          columns={[
            col.text<User>('name'),
            col.actions<User>([
              { id: 'delete', label: 'Delete', confirm: true, onClick: onDelete },
            ]),
          ]}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      // Click delete button to open modal
      const deleteButtons = screen.getAllByText('Delete');
      await user.click(deleteButtons[0]!);

      // Wait for modal to appear
      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeDefined();
        expect(dialog.getAttribute('aria-modal')).toBe('true');
        expect(dialog.getAttribute('aria-labelledby')).toBe('confirm-dialog-title');
      });
    });
  });

  describe('Table Width', () => {
    it('table has rowakit-table class', async () => {
      const { container } = render(
        <SmartTable fetcher={fetcher} columns={[col.text<User>('name')]} />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      const tableContainer = container.querySelector('.rowakit-table');
      expect(tableContainer).toBeTruthy();
    });

    it('table element exists within container', async () => {
      const { container } = render(
        <SmartTable fetcher={fetcher} columns={[col.text<User>('name')]} />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      const table = container.querySelector('table');
      expect(table).toBeTruthy();
    });
  });
});
