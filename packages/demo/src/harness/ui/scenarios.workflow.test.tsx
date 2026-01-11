/**
 * Workflow Scenarios - UI Level
 *
 * Tests row selection, bulk actions, and export through the UI.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
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

  afterEach(() => {
    cleanup();
    mockServer.dispose();
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    window.history.replaceState({}, '', '/');
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

      // Data-ready marker
      await screen.findByText(/page 1 of/i);

	  // Select first data row by accessible name
    const firstRowCheckbox = await screen.findByRole('checkbox', { name: /^select row user-1$/i });
	  await user.click(firstRowCheckbox);

	  // Verify selection indicator
	  await screen.findByText(/1 selected/i);
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

      // Data-ready marker (ensure real rows exist, not just skeleton)
      await screen.findByText(/page 1 of/i);
      await screen.findByText('User 1');

      // Click "select all" checkbox in header
      const selectAllCheckbox = await screen.findByRole('checkbox', { name: /^select all rows$/i });
      await waitFor(() => expect(selectAllCheckbox).toBeEnabled());
      await user.click(selectAllCheckbox);

      // Verify selection count (default page size is 20)
      await screen.findByText(/^20 selected$/i, undefined, { timeout: 3000 });
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

      // Data-ready marker
      await screen.findByText(/page 1 of/i);

      // Select a row
      const rowCheckbox = await screen.findByRole('checkbox', { name: /^select row user-1$/i });
      await user.click(rowCheckbox);
      await screen.findByText(/1 selected/i);

      // Navigate to next page
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

	  // Wait for page navigation to complete
	  await screen.findByText(/page 2 of/i);

      // Verify selection cleared
	  await waitFor(() => {
		expect(screen.queryByText(/1 selected/i)).not.toBeInTheDocument();
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

      // Data-ready marker
      await screen.findByText(/page 1 of/i);

      // Select two rows
      const row1 = await screen.findByRole('checkbox', { name: /^select row user-1$/i });
      const row2 = await screen.findByRole('checkbox', { name: /^select row user-2$/i });
      await user.click(row1);
      await user.click(row2);

      await screen.findByText(/2 selected/i);

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

      // Data-ready marker
      await screen.findByText(/page 1 of/i);

      // Select a row
      const row1 = await screen.findByRole('checkbox', { name: /^select row user-1$/i });
      await user.click(row1);

      // Wait for selection indicator BEFORE searching for bulk actions
      await screen.findByText(/1 selected/i);
	  const deleteButton = await screen.findByRole('button', { name: /delete/i });

      // Click delete button
      await user.click(deleteButton);

      // Verify confirmation dialog appears
      await waitFor(() => {
        expect(screen.getByText(/confirm delete/i)).toBeInTheDocument();
        expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
      }, { timeout: 3000 });

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

      // Data-ready marker
      await screen.findByText(/page 1 of/i);

      // Select a row
      const row1 = await screen.findByRole('checkbox', { name: /^select row user-1$/i });
      await user.click(row1);

      // Wait for selection indicator BEFORE searching for bulk actions
      await screen.findByText(/1 selected/i);
      const deleteButton = await screen.findByRole('button', { name: /delete/i });

      // Click delete button
      await user.click(deleteButton);

      // Click confirm
      const confirmButton = await screen.findByRole('button', { name: /confirm/i });
      await user.click(confirmButton);

      // Verify onClick called
      await waitFor(() => {
        expect(bulkActionSpy).toHaveBeenCalled();
      }, { timeout: 3000 });
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
