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

const DEBUG_HARNESS = process.env.ROWAKIT_DEBUG_HARNESS === '1';
const debugLog = (...args: unknown[]) => {
  if (DEBUG_HARNESS) {
    // eslint-disable-next-line no-console
    console.log(...args);
  }
};

const describeDebug = DEBUG_HARNESS ? describe : describe.skip;

describeDebug('DEBUG: Workflow Selection', () => {
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
    mockServer.dispose();
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    window.history.replaceState({}, '', '/');
  });

  it('DEBUG: should have select individual rows work', async () => {
    const user = userEvent.setup();
    const fetcher = mockServer.createFetcher();

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

    debugLog('Initial render complete');

    // Get a specific row checkbox (avoid brittle indexing)
    const firstRowCheckbox = screen.getByLabelText(/select row/i) as HTMLInputElement;
    debugLog('First row checkbox:', firstRowCheckbox);
    debugLog('Before click - checked:', firstRowCheckbox.checked);

    // Click the checkbox
    await user.click(firstRowCheckbox);

    debugLog('After click - checked:', firstRowCheckbox.checked);

    // Try to find the "X selected" text
    const selectedText = screen.queryByText(/1 selected/i);
    debugLog('Selected text found:', !!selectedText);

    if (!selectedText) {
      debugLog('DOM:', screen.getByTestId('selection-test').innerHTML);
    }

    // Verify selection count displayed (indicates checkbox was checked)
    await waitFor(() => {
      expect(screen.getByText(/1 selected/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
