/**
 * URL Sync & Saved Views Scenarios - UI Level
 *
 * Tests URL synchronization and saved view persistence.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { HarnessTestApp } from './HarnessTestApp';
import { MockServer } from '../server/mockServer';

describe('URL Sync & Saved Views (UI Level)', () => {
  let mockServer: MockServer;

  beforeEach(() => {
    mockServer = new MockServer({
      datasetSize: 100,
      seed: 42,
      network: {
        latency: { min: 30, max: 50 },
        jitter: 5,
        errorRate: 0,
      },
    });

    // Reset URL and localStorage
    window.history.replaceState({}, '', window.location.pathname);
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
    window.history.replaceState({}, '', window.location.pathname);
    vi.clearAllTimers();
    vi.clearAllMocks();
  });

  describe('URL Sync', () => {
    it('should sync pagination to URL', async () => {
      const user = userEvent.setup();
      const fetcher = mockServer.createFetcher();

      render(<HarnessTestApp fetcher={fetcher} urlSync={true} testId="url-sync-test" />);

      // Wait for table
      await waitFor(() => {
        expect(screen.getAllByRole('row').length).toBeGreaterThan(1);
      });

      // Navigate to page 2
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      // Verify URL contains page parameter
      await waitFor(() => {
        expect(window.location.search).toContain('page=2');
      }, { timeout: 3000 });
    });

    it('should sync sorting to URL', async () => {
      const user = userEvent.setup();
      const fetcher = mockServer.createFetcher();

      render(<HarnessTestApp fetcher={fetcher} urlSync={true} testId="url-sync-test" />);

      // Wait for table
      await waitFor(() => {
        expect(screen.getAllByRole('row').length).toBeGreaterThan(1);
      });

      // Sort by name
      const nameHeader = screen.getByRole('button', { name: /name/i });
      await user.click(nameHeader);

      // Verify URL contains sort parameter
      await waitFor(() => {
        expect(window.location.search).toMatch(/sort.*name/);
      }, { timeout: 3000 });
    });

    it('should sync filters to URL', async () => {
      const user = userEvent.setup();
      const fetcher = mockServer.createFetcher();

      render(<HarnessTestApp fetcher={fetcher} urlSync={true} testId="url-sync-test" />);

      // Wait for table
      await waitFor(() => {
        expect(screen.getAllByRole('row').length).toBeGreaterThan(1);
      });

      // Apply filter
      const nameFilter = screen.getByPlaceholderText(/filter name/i);
      await user.type(nameFilter, 'John');

      // Verify URL contains filter parameter
      await waitFor(() => {
        expect(window.location.search).toMatch(/filter.*name.*john/i);
      }, { timeout: 3000 });
    });

    it('should restore state from URL on mount', async () => {
      const fetcher = mockServer.createFetcher();

      // Pre-set URL with state
      window.history.replaceState(
        {},
        '',
        '?page=3&sort=name:asc&pageSize=50'
      );

      render(<HarnessTestApp fetcher={fetcher} urlSync={true} testId="url-restore-test" />);

      // Wait for table to render with restored state
      await waitFor(() => {
        expect(screen.getByText(/page 3/i)).toBeInTheDocument();
      }, { timeout: 3000 });

      // Verify page size also restored (check select value)
      const pageSizeSelect = screen.getByLabelText(/rows per page/i);
      expect(pageSizeSelect).toHaveValue('50');

      // Verify sort restored
      const nameHeader = screen.getByRole('button', { name: /name/i });
      expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');
    });

    it('should support browser back/forward', async () => {
      const user = userEvent.setup();
      const fetcher = mockServer.createFetcher();

      render(<HarnessTestApp fetcher={fetcher} urlSync={true} testId="history-test" />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getAllByRole('row').length).toBeGreaterThan(1);
      });

      // Navigate to page 2
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);
      
      await waitFor(() => {
        expect(screen.getByText(/page 2/i)).toBeInTheDocument();
      }, { timeout: 3000 });

      // Go back
      window.history.back();
      
      // Trigger popstate event manually (jsdom doesn't auto-trigger)
      window.dispatchEvent(new PopStateEvent('popstate'));

      // Verify back to page 1
      await waitFor(() => {
        expect(screen.getByText(/page 1/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Saved Views', () => {
    it.skip('should save view to localStorage', async () => {
      const user = userEvent.setup();
      const fetcher = mockServer.createFetcher();

      render(
        <HarnessTestApp
          fetcher={fetcher}
          urlSync={true}
          savedViews="test-views"
          testId="saved-views-test"
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

      // Click Save View button
      const saveViewButton = screen.getByRole('button', { name: /save view/i });
      await user.click(saveViewButton);

      // Enter view name (now looking in modal/dialog that appears)
      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText(/view name/i);
        expect(nameInput).toBeInTheDocument();
      });
      
      const nameInput = screen.getByPlaceholderText(/view name/i);
      await user.type(nameInput, 'My View');
      
      const saveButton = screen.getByRole('button', { name: /^save$/i });
      await user.click(saveButton);
      
      // Wait longer for async save to complete
      await new Promise(resolve => setTimeout(resolve, 500));

      // Verify localStorage contains saved view
      await waitFor(() => {
        const stored = localStorage.getItem('test-views');
        expect(stored).toBeTruthy();
        
        const views = JSON.parse(stored!);
        expect(views['My View']).toBeDefined();
        expect(views['My View'].sorts).toBeDefined();
      }, { timeout: 3000 });
    });

    it.skip('should load saved view', async () => {
      const user = userEvent.setup();
      const fetcher = mockServer.createFetcher();

      // Pre-populate localStorage with a saved view
      localStorage.setItem(
        'test-views',
        JSON.stringify({
          'Test View': {
            page: 2,
            pageSize: 50,
            sorts: [{ field: 'age', direction: 'desc', priority: 0 }],
            filters: {},
          },
        })
      );

      render(
        <HarnessTestApp
          fetcher={fetcher}
          urlSync={true}
          savedViews="test-views"
          testId="load-view-test"
        />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getAllByRole('row').length).toBeGreaterThan(1);
      });

      // Open saved views menu
      const savedViewsButton = screen.getByRole('button', { name: /saved views|views/i });
      await user.click(savedViewsButton);

      // Click on saved view
      const testViewButton = screen.getByRole('button', { name: /test view/i });
      await user.click(testViewButton);

      // Verify state restored
      await waitFor(() => {
        expect(screen.getByText(/page 2/i)).toBeInTheDocument();
      });
      
      const pageSizeSelect = screen.getByLabelText(/rows per page/i);
      expect(pageSizeSelect).toHaveValue('50');

      // Verify sort restored
      const ageHeader = screen.getByRole('button', { name: /age/i });
      expect(ageHeader).toHaveAttribute('aria-sort', 'descending');
    });

    it.skip('should delete saved view', async () => {
      const user = userEvent.setup();
      const fetcher = mockServer.createFetcher();

      // Pre-populate localStorage
      localStorage.setItem(
        'test-views',
        JSON.stringify({
          'View to Delete': {
            page: 1,
            pageSize: 25,
            sorts: [],
            filters: {},
          },
        })
      );

      render(
        <HarnessTestApp
          fetcher={fetcher}
          urlSync={true}
          savedViews="test-views"
          testId="delete-view-test"
        />
      );

      // Wait for table
      await waitFor(() => {
        expect(screen.getAllByRole('row').length).toBeGreaterThan(1);
      });

      // Open saved views menu
      const savedViewsButton = screen.getByRole('button', { name: /saved views|views/i });
      await user.click(savedViewsButton);

      // Find delete button for the view
      const deleteButton = screen.getByRole('button', { name: /delete.*view to delete/i });
      await user.click(deleteButton);

      // Verify localStorage updated
      await waitFor(() => {
        const stored = localStorage.getItem('test-views');
        expect(stored).toBeTruthy();
        
        const views = JSON.parse(stored!);
        expect(views['View to Delete']).toBeUndefined();
      });
    });

    it('should handle corrupted localStorage gracefully', async () => {
      const fetcher = mockServer.createFetcher();

      // Set corrupted data in localStorage
      localStorage.setItem('test-views', '{invalid json}');

      // Should not crash on mount
      expect(() => {
        render(
          <HarnessTestApp
            fetcher={fetcher}
            urlSync={true}
            savedViews="test-views"
            testId="corrupted-storage-test"
          />
        );
      }).not.toThrow();

      // Table should still render
      await waitFor(() => {
        expect(screen.getAllByRole('row').length).toBeGreaterThan(1);
      });
    });
  });
});
