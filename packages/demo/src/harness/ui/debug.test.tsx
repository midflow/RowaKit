/**
 * Debug Test - Minimal test to isolate bug
 */

import { describe, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MockServer } from '../server/mockServer';
import { HarnessTestApp } from './HarnessTestApp';

describe('Debug Test', () => {
  it('should render table without errors', async () => {
    const mockServer = new MockServer({
      datasetSize: 100,
      seed: 12345,
      network: {
        latency: { min: 0, max: 10 },
        jitter: 0,
        errorRate: 0,
      },
    });

    const fetcher = mockServer.createFetcher();

    // Try calling fetcher directly
    console.log('=== CALLING FETCHER ===');
    try {
      const result = await fetcher({ page: 1, pageSize: 10, filters: {}, sorts: [] });
      console.log('Fetcher result:', {
        total: result.total,
        itemsLength: result.items?.length,
        firstRow: result.items?.[0],
      });
    } catch (error) {
      console.error('Fetcher error:', error);
    }

    // Now try rendering
    console.log('=== RENDERING COMPONENT ===');
    render(<HarnessTestApp fetcher={fetcher} testId="debug-table" />);

    // Wait for loading to finish
    console.log('=== WAITING FOR DATA ===');
    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      // Should have header row + data rows (at least 2 rows)
      expect(rows.length).toBeGreaterThan(1);
    }, { timeout: 5000 });

    // Log rendered HTML
    console.log('=== RENDER SUCCESS ===');
    screen.debug();
  });
});
