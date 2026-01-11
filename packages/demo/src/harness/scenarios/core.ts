/**
 * Core Scenarios — Pagination, Sorting, Filters
 *
 * Tests basic table operations under production-like conditions
 */

import { describe, it, expect } from 'vitest';
import type { Fetcher } from '@rowakit/table';
import type { TestUser } from '../dataset';
import {
  generateDataset,
  applyFilters,
  applySorting,
} from '../dataset';

export function runCoreScenarios(datasetSize: number) {
  describe('Core Scenarios', () => {
    const dataset = generateDataset(datasetSize);

    const createFetcher = (): Fetcher<TestUser> => {
      return async (query) => {
        let filtered = dataset;

        // Apply filters
        if (query.filters) {
          filtered = applyFilters(filtered, query.filters);
        }

        // Apply sorting
        if (query.sorts && query.sorts.length > 0) {
          filtered = applySorting(filtered, query.sorts);
        } else if (query.sort) {
          filtered = applySorting(filtered, [
            { ...query.sort, priority: 0 },
          ]);
        }

        // Apply pagination
        const start = (query.page - 1) * query.pageSize;
        const end = start + query.pageSize;
        const items = filtered.slice(start, end);

        return {
          items,
          total: filtered.length,
        };
      };
    };

    it('Pagination — should handle next/prev correctly', async () => {
      const fetcher = createFetcher();

      // Page 1
      const page1 = await fetcher({
        page: 1,
        pageSize: 50,
      });

      expect(page1.items).toHaveLength(50);
      expect(page1.total).toBe(datasetSize);
      expect(page1.items[0].id).toBe('user-1');

      // Page 2
      const page2 = await fetcher({
        page: 2,
        pageSize: 50,
      });

      expect(page2.items).toHaveLength(50);
      expect(page2.items[0].id).toBe('user-51');

      // Last page
      const lastPage = Math.ceil(datasetSize / 50);
      const lastPageResult = await fetcher({
        page: lastPage,
        pageSize: 50,
      });

      expect(lastPageResult.items.length).toBeGreaterThan(0);
      expect(lastPageResult.items.length).toBeLessThanOrEqual(50);
    });

    it('Pagination — should handle different page sizes', async () => {
      const fetcher = createFetcher();

      const sizes = [10, 25, 50, 100];

      for (const size of sizes) {
        const result = await fetcher({
          page: 1,
          pageSize: size,
        });

        expect(result.items).toHaveLength(size);
        expect(result.total).toBe(datasetSize);
      }
    });

    it('Sorting — single column ascending', async () => {
      const fetcher = createFetcher();

      const result = await fetcher({
        page: 1,
        pageSize: 100,
        sort: { field: 'age', direction: 'asc' },
      });

      expect(result.items).toHaveLength(100);

      // Verify sorting
      for (let i = 1; i < result.items.length; i++) {
        expect(result.items[i].age).toBeGreaterThanOrEqual(
          result.items[i - 1].age
        );
      }
    });

    it('Sorting — single column descending', async () => {
      const fetcher = createFetcher();

      const result = await fetcher({
        page: 1,
        pageSize: 100,
        sort: { field: 'salary', direction: 'desc' },
      });

      expect(result.items).toHaveLength(100);

      // Verify sorting
      for (let i = 1; i < result.items.length; i++) {
        expect(result.items[i].salary).toBeLessThanOrEqual(
          result.items[i - 1].salary
        );
      }
    });

    it('Sorting — multi-column (sorts array)', async () => {
      const fetcher = createFetcher();

      const result = await fetcher({
        page: 1,
        pageSize: 100,
        sorts: [
          { field: 'department', direction: 'asc', priority: 0 },
          { field: 'salary', direction: 'desc', priority: 1 },
        ],
      });

      expect(result.items).toHaveLength(100);

      // Verify primary sort (department)
      for (let i = 1; i < result.items.length; i++) {
        if (result.items[i].department === result.items[i - 1].department) {
          // Within same department, verify secondary sort (salary desc)
          expect(result.items[i].salary).toBeLessThanOrEqual(
            result.items[i - 1].salary
          );
        } else {
          // Departments should be in ascending order
          expect(result.items[i].department.localeCompare(result.items[i - 1].department)).toBeGreaterThanOrEqual(0);
        }
      }
    });

    it('Sorting — rapid toggle (asc → desc → none)', async () => {
      const fetcher = createFetcher();

      // Asc
      const asc = await fetcher({
        page: 1,
        pageSize: 50,
        sort: { field: 'name', direction: 'asc' },
      });

      // Desc
      const desc = await fetcher({
        page: 1,
        pageSize: 50,
        sort: { field: 'name', direction: 'desc' },
      });

      // None
      const none = await fetcher({
        page: 1,
        pageSize: 50,
      });

      expect(asc.items[0].id).not.toBe(desc.items[0].id);
      expect(none.items[0].id).toBe('user-1'); // Default order
    });

    it('Filters — text contains', async () => {
      const fetcher = createFetcher();

      const result = await fetcher({
        page: 1,
        pageSize: 50,
        filters: {
          email: { op: 'contains', value: '100' },
        },
      });

      expect(result.total).toBeGreaterThan(0);
      expect(result.total).toBeLessThan(datasetSize);

      // Verify all emails contain '100'
      result.items.forEach((item) => {
        expect(item.email).toContain('100');
      });
    });

    it('Filters — equals (department)', async () => {
      const fetcher = createFetcher();

      const result = await fetcher({
        page: 1,
        pageSize: 50,
        filters: {
          department: { op: 'equals', value: 'Engineering' },
        },
      });

      expect(result.total).toBeGreaterThan(0);

      // Verify all are Engineering
      result.items.forEach((item) => {
        expect(item.department).toBe('Engineering');
      });
    });

    it('Filters — range (salary)', async () => {
      const fetcher = createFetcher();

      const result = await fetcher({
        page: 1,
        pageSize: 50,
        filters: {
          salary: {
            op: 'range',
            value: { from: 50000, to: 100000 },
          },
        },
      });

      expect(result.total).toBeGreaterThan(0);

      // Verify all salaries in range
      result.items.forEach((item) => {
        expect(item.salary).toBeGreaterThanOrEqual(50000);
        expect(item.salary).toBeLessThanOrEqual(100000);
      });
    });

    it('Filters — clear (reset to no filters)', async () => {
      const fetcher = createFetcher();

      // With filter
      const filtered = await fetcher({
        page: 1,
        pageSize: 50,
        filters: {
          active: { op: 'equals', value: true },
        },
      });

      // Without filter
      const unfiltered = await fetcher({
        page: 1,
        pageSize: 50,
      });

      expect(filtered.total).toBeLessThan(unfiltered.total);
      expect(unfiltered.total).toBe(datasetSize);
    });
  });
}
