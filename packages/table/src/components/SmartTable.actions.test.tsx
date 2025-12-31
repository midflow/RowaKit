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

describe('SmartTable Actions', () => {
  let fetcher: Fetcher<User>;

  beforeEach(() => {
    fetcher = vi.fn(async () => ({
      items: mockUsers,
      total: 3,
    }));
  });

  describe('Action Execution', () => {
    it('executes action without confirmation directly', async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[
            col.text<User>('name'),
            col.actions<User>([
              {
                id: 'edit',
                label: 'Edit',
                onClick: onEdit,
              },
            ]),
          ]}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      const editButtons = screen.getAllByText('Edit');
      await user.click(editButtons[0]!);

      expect(onEdit).toHaveBeenCalledTimes(1);
      expect(onEdit).toHaveBeenCalledWith(mockUsers[0]);
    });

    it('does not execute action when disabled is true', async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[
            col.text<User>('name'),
            col.actions<User>([
              {
                id: 'edit',
                label: 'Edit',
                onClick: onEdit,
                disabled: true,
              },
            ]),
          ]}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      const editButtons = screen.getAllByText('Edit');
      expect(editButtons[0]).toHaveProperty('disabled', true);
      await user.click(editButtons[0]!);

      expect(onEdit).not.toHaveBeenCalled();
    });

    it('evaluates disabled function per row', async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[
            col.text<User>('name'),
            col.actions<User>([
              {
                id: 'edit',
                label: 'Edit',
                onClick: onEdit,
                disabled: (row) => row.id === 1,
              },
            ]),
          ]}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      const editButtons = screen.getAllByText('Edit');

      // First button (Alice, id=1) should be disabled
      expect(editButtons[0]).toHaveProperty('disabled', true);
      await user.click(editButtons[0]!);
      expect(onEdit).not.toHaveBeenCalled();

      // Second button (Bob, id=2) should be enabled
      expect(editButtons[1]).not.toHaveProperty('disabled', true);
      await user.click(editButtons[1]!);
      expect(onEdit).toHaveBeenCalledWith(mockUsers[1]);
    });

    it('disables action when loading is true', async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[
            col.text<User>('name'),
            col.actions<User>([
              {
                id: 'edit',
                label: 'Edit',
                onClick: onEdit,
                loading: true,
              },
            ]),
          ]}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      const editButtons = screen.getAllByText('Edit');
      expect(editButtons[0]).toHaveProperty('disabled', true);
      await user.click(editButtons[0]!);

      expect(onEdit).not.toHaveBeenCalled();
    });
  });

  describe('Confirmation Modal', () => {
    it('shows confirmation modal when confirm is true', async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();

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

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      const deleteButtons = screen.getAllByText('Delete');
      await user.click(deleteButtons[0]!);

      // Modal should appear
      expect(screen.getByRole('dialog')).toBeDefined();
      expect(screen.getByText('Confirm Action')).toBeDefined();
      expect(screen.getByText(/are you sure you want to delete/i)).toBeDefined();

      // Action should not be executed yet
      expect(onDelete).not.toHaveBeenCalled();
    });

    it('executes action when confirmed in modal', async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();

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

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      const deleteButtons = screen.getAllByText('Delete');
      await user.click(deleteButtons[0]!);

      // Wait for modal and click confirm
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);

      // Action should be executed
      expect(onDelete).toHaveBeenCalledTimes(1);
      expect(onDelete).toHaveBeenCalledWith(mockUsers[0]);

      // Modal should disappear
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).toBeNull();
      });
    });

    it('does not execute action when cancelled in modal', async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();

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

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      const deleteButtons = screen.getAllByText('Delete');
      await user.click(deleteButtons[0]!);

      // Wait for modal and click cancel
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      // Action should NOT be executed
      expect(onDelete).not.toHaveBeenCalled();

      // Modal should disappear
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).toBeNull();
      });
    });

    it('closes modal when clicking backdrop', async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();

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

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      const deleteButtons = screen.getAllByText('Delete');
      await user.click(deleteButtons[0]!);

      // Click on backdrop (dialog itself)
      const dialog = screen.getByRole('dialog');
      await user.click(dialog);

      // Action should NOT be executed
      expect(onDelete).not.toHaveBeenCalled();

      // Modal should disappear
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).toBeNull();
      });
    });

    it('does not close modal when clicking inside modal content', async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();

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

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      const deleteButtons = screen.getAllByText('Delete');
      await user.click(deleteButtons[0]!);

      // Click inside modal content (the title)
      const title = screen.getByText('Confirm Action');
      await user.click(title);

      // Modal should still be visible
      expect(screen.getByRole('dialog')).toBeDefined();
      expect(onDelete).not.toHaveBeenCalled();
    });
  });

  describe('Action Icons', () => {
    it('renders string icons correctly', async () => {
      render(
        <SmartTable
          fetcher={fetcher}
          columns={[
            col.text<User>('name'),
            col.actions<User>([
              {
                id: 'edit',
                label: 'Edit',
                icon: '✏️',
                onClick: vi.fn(),
              },
            ]),
          ]}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      const editButtons = screen.getAllByText('Edit');
      expect(editButtons[0]?.textContent).toContain('✏️');
    });

    it('renders ReactNode icons correctly', async () => {
      render(
        <SmartTable
          fetcher={fetcher}
          columns={[
            col.text<User>('name'),
            col.actions<User>([
              {
                id: 'edit',
                label: 'Edit',
                icon: <span data-testid="edit-icon">🖊️</span>,
                onClick: vi.fn(),
              },
            ]),
          ]}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      expect(screen.getAllByTestId('edit-icon')).toHaveLength(3); // One per row
    });
  });

  describe('Multiple Actions', () => {
    it('renders multiple actions in the same column', async () => {
      const onEdit = vi.fn();
      const onDelete = vi.fn();

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[
            col.text<User>('name'),
            col.actions<User>([
              {
                id: 'edit',
                label: 'Edit',
                onClick: onEdit,
              },
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

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      // Should have 3 Edit buttons (one per row)
      expect(screen.getAllByText('Edit')).toHaveLength(3);
      // Should have 3 Delete buttons (one per row)
      expect(screen.getAllByText('Delete')).toHaveLength(3);
    });

    it('handles different confirmation states for different actions', async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();
      const onDelete = vi.fn();

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[
            col.text<User>('name'),
            col.actions<User>([
              {
                id: 'edit',
                label: 'Edit',
                onClick: onEdit,
              },
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

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      // Click Edit (no confirmation)
      const editButtons = screen.getAllByText('Edit');
      await user.click(editButtons[0]!);
      expect(onEdit).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole('dialog')).toBeNull();

      // Click Delete (requires confirmation)
      const deleteButtons = screen.getAllByText('Delete');
      await user.click(deleteButtons[0]!);
      expect(onDelete).not.toHaveBeenCalled();
      expect(screen.getByRole('dialog')).toBeDefined();

      // Confirm deletion
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);
      expect(onDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe('Actions Disabled During Table Loading', () => {
    it('disables all actions when table is loading', async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();
      const slowFetcher: Fetcher<User> = vi.fn(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({ items: mockUsers, total: 3 }), 1000);
          })
      );

      render(
        <SmartTable
          fetcher={slowFetcher}
          columns={[
            col.text<User>('name'),
            col.actions<User>([
              {
                id: 'edit',
                label: 'Edit',
                onClick: onEdit,
              },
            ]),
          ]}
        />
      );

      // During loading, action buttons should be disabled
      await waitFor(() => {
        expect(screen.getByText('Loading...')).toBeDefined();
      });

      // Wait for data to load
      await waitFor(
        () => {
          expect(screen.getByText('Alice')).toBeDefined();
        },
        { timeout: 2000 }
      );

      // Now buttons should be enabled
      const editButtons = screen.getAllByText('Edit');
      expect(editButtons[0]).not.toHaveProperty('disabled', true);
      await user.click(editButtons[0]!);
      expect(onEdit).toHaveBeenCalled();
    });
  });

  describe('Async Actions', () => {
    it('handles async action onClick', async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

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
              },
            ]),
          ]}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      const deleteButtons = screen.getAllByText('Delete');
      await user.click(deleteButtons[0]!);

      expect(onDelete).toHaveBeenCalledTimes(1);
      expect(onDelete).toHaveBeenCalledWith(mockUsers[0]);

      // Wait for async operation to complete
      await waitFor(() => {
        expect(onDelete).toHaveReturned();
      });
    });

    it('handles async action with confirmation', async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

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

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      const deleteButtons = screen.getAllByText('Delete');
      await user.click(deleteButtons[0]!);

      // Confirm in modal
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);

      expect(onDelete).toHaveBeenCalledTimes(1);

      // Wait for async operation to complete
      await waitFor(() => {
        expect(onDelete).toHaveReturned();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles empty actions array', async () => {
      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name'), col.actions<User>([])]}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      // Should render actions column but with no buttons
      expect(screen.queryAllByRole('button', { name: /edit|delete/i })).toHaveLength(0);
    });

    it('handles action with both disabled and confirm', async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();

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
                disabled: true,
                confirm: true,
              },
            ]),
          ]}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      const deleteButtons = screen.getAllByText('Delete');
      expect(deleteButtons[0]).toHaveProperty('disabled', true);
      await user.click(deleteButtons[0]!);

      // Should not show modal because button is disabled
      expect(screen.queryByRole('dialog')).toBeNull();
      expect(onDelete).not.toHaveBeenCalled();
    });
  });
});
