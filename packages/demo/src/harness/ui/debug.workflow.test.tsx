/**
 * Debug test for workflow selection issues
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { HarnessTestApp } from './HarnessTestApp';
import { MockServer } from '../server/mockServer';
import type { BulkActionDef } from '@rowakit/table';

describe('DEBUG: Workflow Selection', () => {
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
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    window.history.replaceState({}, '', '/');
  });

  it('DEBUG: should have select individual rows work', async () => {
    const user = userEvent.setup();
    const fetcher = mockServer.createFetcher();
    const onSelectionChange = vi.fn();

    const bulkActions: BulkActionDef[] = [
      { id: 'dummy', label: 'Dummy', onClick: vi.fn() },
    ];

    const { rerender } = render(
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

    console.log('Initial render complete');

    // Get checkboxes
    const checkboxes = screen.getAllByRole('checkbox');
    console.log('Found', checkboxes.length, 'checkboxes');

    const firstRowCheckbox = checkboxes[1]; // Index 0 is "select all"
    console.log('First row checkbox:', firstRowCheckbox);
    console.log('Before click - checked:', firstRowCheckbox.checked);

    // Click the checkbox
    await user.click(firstRowCheckbox);

    console.log('After click - checked:', firstRowCheckbox.checked);

    // Try to find the "X selected" text
    const selectedText = screen.queryByText(/1 selected/i);
    console.log('Selected text found:', !!selectedText);

    if (!selectedText) {
      console.log('DOM:', screen.getByTestId('selection-test').innerHTML);
    }

    // Verify selection count displayed (indicates checkbox was checked)
    await waitFor(() => {
      expect(screen.getByText(/1 selected/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
