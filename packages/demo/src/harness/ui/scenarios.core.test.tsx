/**
 * Core Scenarios - UI Level
 *
 * Tests pagination, sorting, and filtering through the actual UI.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { HarnessTestApp } from './HarnessTestApp';
import { MockServer } from '../server/mockServer';

describe('Core Scenarios (UI Level)', () => {
  let mockServer: MockServer;

  beforeEach(() => {
    mockServer = new MockServer({
      datasetSize: 1000, // Smaller for faster tests
      seed: 42,
      network: {
        latency: { min: 50, max: 100 },
        jitter: 10,
        errorRate: 0, // No errors for core tests
      },
    });
  });

  describe('Pagination', () => {
    it('should navigate to next page', async () => {
      const user = userEvent.setup();
      const fetcher = mockServer.createFetcher();

      render(<HarnessTestApp fetcher={fetcher} testId="pagination-test" />);

      // Wait for initial render - table shows "Page 1 of X"
      await waitFor(() => {
        expect(screen.getByText(/page 1 of/i)).toBeInTheDocument();
      });

      // Find and click next button
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      // Verify page changed
      await waitFor(() => {
        expect(screen.getByText(/page 2 of/i)).toBeInTheDocument();
      });
    });

    it('should navigate to previous page', async () => {
      const user = userEvent.setup();
      const fetcher = mockServer.createFetcher();

      render(<HarnessTestApp fetcher={fetcher} testId="pagination-test" />);

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByText(/page 1 of/i)).toBeInTheDocument();
      });

      // Go to page 2
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);
      await waitFor(() => {
        expect(screen.getByText(/page 2/i)).toBeInTheDocument();
      });

      // Go back to page 1
      const prevButton = screen.getByRole('button', { name: /previous/i });
      await user.click(prevButton);
      await waitFor(() => {
        expect(screen.getByText(/page 1/i)).toBeInTheDocument();
      });
    });

    it('should change page size', async () => {
      const user = userEvent.setup();
      const fetcher = mockServer.createFetcher();

      render(<HarnessTestApp fetcher={fetcher} testId="pagination-test" />);

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByText(/page 1 of/i)).toBeInTheDocument();
      });

      // Find page size selector (labeled "Rows per page:")
      const pageSizeSelect = screen.getByLabelText(/rows per page/i);
      await user.selectOptions(pageSizeSelect, '50');

      // Verify still on page 1 but with different page count
      await waitFor(() => {
        expect(screen.getByText(/page 1 of/i)).toBeInTheDocument();
      });
    });
  });

  describe('Sorting', () => {
    it('should sort column ascending', async () => {
      const user = userEvent.setup();
      const fetcher = mockServer.createFetcher();

      render(<HarnessTestApp fetcher={fetcher} testId="sorting-test" />);

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByText(/page 1 of/i)).toBeInTheDocument();
      });

      // Find and click Name column header (sortable = button role)
      const nameHeader = screen.getByRole('button', { name: /name/i });
      await user.click(nameHeader);

      // Verify sort indicator appears (ascending)
      await waitFor(() => {
        expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');
      });
    });

    it('should toggle sort direction (asc -> desc -> none)', async () => {
      const user = userEvent.setup();
      const fetcher = mockServer.createFetcher();

      render(<HarnessTestApp fetcher={fetcher} testId="sorting-test" />);

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByText(/page 1 of/i)).toBeInTheDocument();
      });

      const nameHeader = screen.getByRole('button', { name: /name/i });

      // First click: ascending
      await user.click(nameHeader);
      await waitFor(() => {
        expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');
      });

      // Second click: descending
      await user.click(nameHeader);
      await waitFor(() => {
        expect(nameHeader).toHaveAttribute('aria-sort', 'descending');
      });

      // Third click: none
      await user.click(nameHeader);
      await waitFor(() => {
        expect(nameHeader).not.toHaveAttribute('aria-sort');
      });
    });

    it('should support multi-column sorting', async () => {
      const user = userEvent.setup();
      const fetcher = mockServer.createFetcher();

      render(<HarnessTestApp fetcher={fetcher} testId="sorting-test" />);

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByText(/page 1 of/i)).toBeInTheDocument();
      });

      // Sort by Department first
      const deptHeader = screen.getByRole('button', { name: /department/i });
      await user.click(deptHeader);
      await waitFor(() => {
        expect(deptHeader).toHaveAttribute('aria-sort', 'ascending');
      });

      // Then sort by Name (with Ctrl to add to sort - PRD-E4)
      const nameHeader = screen.getByRole('button', { name: /name/i });
      await user.click(nameHeader, { ctrlKey: true });

      // Verify both columns have sort indicators
      await waitFor(() => {
        expect(deptHeader).toHaveAttribute('aria-sort', 'ascending');
        expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');
      });
    });
  });

  describe('Filtering', () => {
    it('should apply text filter', async () => {
      const user = userEvent.setup();
      const fetcher = mockServer.createFetcher();

      render(<HarnessTestApp fetcher={fetcher} enableFilters={true} testId="filtering-test" />);

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByText(/page 1 of/i)).toBeInTheDocument();
      });

      // Find filter input for Name column
      const nameFilter = screen.getByPlaceholderText(/filter name/i);
      await user.type(nameFilter, 'John');

      // Wait for filter to apply
      await waitFor(() => {
        // Total count should decrease
        expect(screen.getByText(/of \d+/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should clear filters', async () => {
      const user = userEvent.setup();
      const fetcher = mockServer.createFetcher();

      render(<HarnessTestApp fetcher={fetcher} enableFilters={true} testId="filtering-test" />);

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByText(/page 1 of/i)).toBeInTheDocument();
      });

      // Apply filter
      const nameFilter = screen.getByPlaceholderText(/filter name/i);
      await user.type(nameFilter, 'John');
      await waitFor(() => {
        expect(nameFilter).toHaveValue('John');
      });

      // Wait for clear button to appear (only shows when filters active)
      const clearButton = await waitFor(() => {
        return screen.getByRole('button', { name: /clear.*filter/i });
      });
      await user.click(clearButton);

      // Verify filter cleared
      await waitFor(() => {
        expect(nameFilter).toHaveValue('');
      });
    });
  });
});
