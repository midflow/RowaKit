/**
 * Workflow Scenarios - UI Level
 *
 * Tests row selection, bulk actions, and export through the UI.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { HarnessTestApp } from './HarnessTestApp';
import { MockServer } from '../server/mockServer';
import type { BulkActionDef, Exporter } from '@rowakit/table';

describe('Workflow Scenarios (UI Level)', () => {
  let mockServer: MockServer;

  beforeEach(() => {
    mockServer = new MockServer({
      datasetSize: 100,
      seed: 42,
      network: {
        latency: { min: 50, max: 100 },
        jitter: 10,
        errorRate: 0,
      },
    });
  });

  describe('Row Selection', () => {
    it('should select individual rows', async () => {
      const user = userEvent.setup();
      const fetcher = mockServer.createFetcher();

      // Need bulkActions for selection count to display
      const bulkActions: BulkActionDef[] = [
        { id: 'dummy', label: 'Dummy', onClick: vi.fn() },
      ];

      render(
        <HarnessTestApp
          fetcher={fetcher}
          enableRowSelection={true}
          bulkActions={bulkActions}
          testId="selection-test"
        />
      );

      // Wait for table to render
      await waitFor(() => {
        expect(screen.getAllByRole('row').length).toBeGreaterThan(1);
      });

      // Select first data row (skip header row)
      const checkboxes = screen.getAllByRole('checkbox');
      const firstRowCheckbox = checkboxes[1]; // Index 0 is "select all"
      
      await user.click(firstRowCheckbox);

      // Verify checkbox is checked and selection count displayed
      await waitFor(() => {
        expect(firstRowCheckbox).toBeChecked();
        expect(screen.getByText(/1 selected/i)).toBeInTheDocument();
      });
    });

    it('should select all rows on page', async () => {
      const user = userEvent.setup();
      const fetcher = mockServer.createFetcher();

      // Need bulkActions for selection count to display
      const bulkActions: BulkActionDef[] = [
        { id: 'dummy', label: 'Dummy', onClick: vi.fn() },
      ];

      render(
        <HarnessTestApp
          fetcher={fetcher}
          enableRowSelection={true}
          bulkActions={bulkActions}
          testId="selection-test"
        />
      );

      // Wait for table to render
      await waitFor(() => {
        expect(screen.getAllByRole('row').length).toBeGreaterThan(1);
      });

      // Click "select all" checkbox in header
      const checkboxes = screen.getAllByRole('checkbox');
      const selectAllCheckbox = checkboxes[0];
      
      await user.click(selectAllCheckbox);

      // Verify checkbox checked and selection count (default page size is 20)
      await waitFor(() => {
        expect(selectAllCheckbox).toBeChecked();
        expect(screen.getByText(/20 selected/i)).toBeInTheDocument();
      });
    });

    it('should reset selection on page change', async () => {
      const user = userEvent.setup();
      const fetcher = mockServer.createFetcher();

      // Need bulkActions for selection count to display
      const bulkActions: BulkActionDef[] = [
        { id: 'dummy', label: 'Dummy', onClick: vi.fn() },
      ];

      render(
        <HarnessTestApp
          fetcher={fetcher}
          enableRowSelection={true}
          bulkActions={bulkActions}
          testId="selection-test"
        />
      );

      // Wait for table
      await waitFor(() => {
        expect(screen.getAllByRole('row').length).toBeGreaterThan(1);
      });

      // Select a row
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[1]);
      
      await waitFor(() => {
        expect(checkboxes[1]).toBeChecked();
        expect(screen.getByText(/1 selected/i)).toBeInTheDocument();
      });

      // Navigate to next page
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      // Verify selection cleared
      await waitFor(() => {
        expect(screen.queryByText(/selected/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Bulk Actions', () => {
    it('should call bulk action with selected keys', async () => {
      const user = userEvent.setup();
      const fetcher = mockServer.createFetcher();
      
      const bulkActionSpy = vi.fn();
      const bulkActions: BulkActionDef[] = [
        {
          id: 'test-action',
          label: 'Test Action',
          onClick: bulkActionSpy,
        },
      ];

      render(
        <HarnessTestApp
          fetcher={fetcher}
          enableRowSelection={true}
          bulkActions={bulkActions}
          testId="bulk-action-test"
        />
      );

      // Wait for table
      await waitFor(() => {
        expect(screen.getAllByRole('row').length).toBeGreaterThan(1);
      });

      // Select two rows
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[1]);
      await user.click(checkboxes[2]);

      await waitFor(() => {
        expect(checkboxes[1]).toBeChecked();
        expect(checkboxes[2]).toBeChecked();
        expect(screen.getByText(/2 selected/i)).toBeInTheDocument();
      });

      // Click bulk action button
      const actionButton = screen.getByRole('button', { name: /test action/i });
      await user.click(actionButton);

      // Verify onClick called with 2 keys
      expect(bulkActionSpy).toHaveBeenCalledWith(
        expect.arrayContaining([expect.any(String), expect.any(String)])
      );
      expect(bulkActionSpy.mock.calls[0][0]).toHaveLength(2);
    });

    it('should show confirmation dialog and cancel', async () => {
      const user = userEvent.setup();
      const fetcher = mockServer.createFetcher();
      
      const bulkActionSpy = vi.fn();
      const bulkActions: BulkActionDef[] = [
        {
          id: 'delete-action',
          label: 'Delete',
          confirm: {
            title: 'Confirm Delete',
            description: 'Are you sure?',
          },
          onClick: bulkActionSpy,
        },
      ];

      render(
        <HarnessTestApp
          fetcher={fetcher}
          enableRowSelection={true}
          bulkActions={bulkActions}
          testId="bulk-confirm-test"
        />
      );

      // Wait for table
      await waitFor(() => {
        expect(screen.getAllByRole('row').length).toBeGreaterThan(1);
      });

      // Select a row
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[1]);

      // Wait for selection to register
      await waitFor(() => {
        expect(checkboxes[1]).toBeChecked();
        expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
      });

      // Click delete button
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      // Verify confirmation dialog appears
      await waitFor(() => {
        expect(screen.getByText(/confirm delete/i)).toBeInTheDocument();
        expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
      });

      // Click cancel
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      // Verify onClick NOT called
      expect(bulkActionSpy).not.toHaveBeenCalled();
    });

    it('should show confirmation dialog and confirm', async () => {
      const user = userEvent.setup();
      const fetcher = mockServer.createFetcher();
      
      const bulkActionSpy = vi.fn();
      const bulkActions: BulkActionDef[] = [
        {
          id: 'delete-action',
          label: 'Delete',
          confirm: {
            title: 'Confirm Delete',
            description: 'Are you sure?',
          },
          onClick: bulkActionSpy,
        },
      ];

      render(
        <HarnessTestApp
          fetcher={fetcher}
          enableRowSelection={true}
          bulkActions={bulkActions}
          testId="bulk-confirm-test"
        />
      );

      // Wait for table
      await waitFor(() => {
        expect(screen.getAllByRole('row').length).toBeGreaterThan(1);
      });

      // Select a row
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[1]);

      // Wait for selection to register and delete button to appear
      await waitFor(() => {
        expect(checkboxes[1]).toBeChecked();
        expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
      });

      // Click delete button
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      // Click confirm
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
      });
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);

      // Verify onClick called
      await waitFor(() => {
        expect(bulkActionSpy).toHaveBeenCalled();
      });
    });
  });

  describe('Export', () => {
    it('should call exporter with query snapshot', async () => {
      const user = userEvent.setup();
      const fetcher = mockServer.createFetcher();
      
      const exporterSpy = vi.fn().mockResolvedValue({ url: 'https://example.com/export.csv' });
      const exporter: Exporter = exporterSpy;

      render(
        <HarnessTestApp
          fetcher={fetcher}
          exporter={exporter}
          testId="export-test"
        />
      );

      // Wait for table
      await waitFor(() => {
        expect(screen.getAllByRole('row').length).toBeGreaterThan(1);
      });

      // Apply some state (sort by name)
      const nameHeader = screen.getByRole('button', { name: /name/i });
      await user.click(nameHeader);
      
      await waitFor(() => {
        expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');
      });

      // Click export button
      const exportButton = screen.getByRole('button', { name: /export/i });
      await user.click(exportButton);

      // Verify exporter called with query containing sort
      await waitFor(() => {
        expect(exporterSpy).toHaveBeenCalled();
      });
      
      const query = exporterSpy.mock.calls[0][0];
      expect(query.sorts).toBeDefined();
      expect(query.sorts.length).toBeGreaterThan(0);
      expect(query.sorts[0].field).toBe('name');
    });

    it('should handle export errors gracefully', async () => {
      const user = userEvent.setup();
      const fetcher = mockServer.createFetcher();
      
      const exporterSpy = vi.fn().mockRejectedValue(new Error('Export failed'));
      const exporter: Exporter = exporterSpy;

      render(
        <HarnessTestApp
          fetcher={fetcher}
          exporter={exporter}
          testId="export-error-test"
        />
      );

      // Wait for table
      await waitFor(() => {
        expect(screen.getAllByRole('row').length).toBeGreaterThan(1);
      });

      // Click export button
      const exportButton = screen.getByRole('button', { name: /export/i });
      await user.click(exportButton);

      // Verify error displayed
      await waitFor(() => {
        expect(screen.getByText(/export failed|error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Stale Request Protection', () => {
    it('should ensure later requests win', async () => {
      const user = userEvent.setup();
      
      // Create mock server with variable latency to simulate race conditions
      const mockServerRace = new MockServer({
        datasetSize: 100,
        seed: 999,
        network: {
          latency: { min: 100, max: 500 },
          jitter: 200,
          errorRate: 0,
        },
      });
      
      const fetcher = mockServerRace.createFetcher();

      render(<HarnessTestApp fetcher={fetcher} testId="stale-test" />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getAllByRole('row').length).toBeGreaterThan(1);
      });

      // Rapidly toggle sort multiple times to create race condition
      const nameHeader = screen.getByRole('button', { name: /name/i });
      
      // Fast clicks without waiting
      await user.click(nameHeader); // Request 1: asc
      await user.click(nameHeader); // Request 2: desc
      await user.click(nameHeader); // Request 3: none

      // Wait for all requests to settle
      await waitFor(() => {
        // Final state should be "none" (no sort)
        expect(nameHeader).not.toHaveAttribute('aria-sort');
      }, { timeout: 3000 });

      // Verify UI reflects the last action (none/unsorted)
      expect(nameHeader).not.toHaveAttribute('aria-sort');
    });
  });
});
