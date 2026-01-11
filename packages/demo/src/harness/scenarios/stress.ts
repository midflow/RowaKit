/**
 * Stress Test Scenarios
 *
 * Simulates repeated randomized interactions
 */

import { describe, it, expect } from 'vitest';
import type { Fetcher } from '@rowakit/table';
import type { TestUser } from '../dataset';
import { generateDataset, applyFilters, applySorting } from '../dataset';
import type { HarnessConfig } from '../config';

export function runStressScenarios(
  datasetSize: number,
  config: HarnessConfig
) {
  describe('Stress Test Scenarios', () => {
    const dataset = generateDataset(datasetSize);

    const createFetcher = (): Fetcher<TestUser> => {
      return async (query) => {
        let filtered = dataset;

        if (query.filters) {
          filtered = applyFilters(filtered, query.filters);
        }

        if (query.sorts && query.sorts.length > 0) {
          filtered = applySorting(filtered, query.sorts);
        } else if (query.sort) {
          filtered = applySorting(filtered, [
            { ...query.sort, priority: 0 },
          ]);
        }

        const start = (query.page - 1) * query.pageSize;
        const end = start + query.pageSize;
        const items = filtered.slice(start, end);

        return {
          items,
          total: filtered.length,
        };
      };
    };

    it('Stress — repeated randomized interactions', async () => {
      const fetcher = createFetcher();
      const iterations = Math.min(config.scenarios.stressIterations, 50); // Limit for CI
      const results: boolean[] = [];

      for (let i = 0; i < iterations; i++) {
        // Random page (1-10)
        const page = Math.floor(Math.random() * 10) + 1;

        // Random page size
        const pageSize = [10, 25, 50, 100][
          Math.floor(Math.random() * 4)
        ];

        // Random sort
        const sortFields = ['age', 'salary', 'name', 'department'];
        const sortField = sortFields[Math.floor(Math.random() * sortFields.length)];
        const sortDir: 'asc' | 'desc' = Math.random() > 0.5 ? 'asc' : 'desc';

        try {
          const result = await fetcher({
            page,
            pageSize,
            sort: { field: sortField, direction: sortDir },
          });

          // Verify result structure
          expect(result.items).toBeDefined();
          expect(result.total).toBeGreaterThan(0);
          expect(result.items.length).toBeLessThanOrEqual(pageSize);

          results.push(true);
        } catch (error) {
          results.push(false);
        }

        // Small delay to simulate user interaction timing
        if (config.scenarios.stressDelay > 0) {
          await new Promise((resolve) =>
            setTimeout(resolve, config.scenarios.stressDelay)
          );
        }
      }

      // At least 95% success rate
      const successRate = results.filter((r) => r).length / results.length;
      expect(successRate).toBeGreaterThan(0.95);
    });

    it('Stress — rapid pagination clicks', async () => {
      const fetcher = createFetcher();
      const pages = [1, 2, 3, 4, 5, 4, 3, 2, 1]; // Back and forth

      for (const page of pages) {
        const result = await fetcher({
          page,
          pageSize: 50,
        });

        expect(result.items).toBeDefined();
        expect(result.total).toBe(datasetSize);
      }
    });

    it('Stress — rapid sort toggles', async () => {
      const fetcher = createFetcher();
      const sortSequence: Array<'asc' | 'desc'> = ['asc', 'desc', 'asc', 'desc', 'asc'];

      for (const dir of sortSequence) {
        const result = await fetcher({
          page: 1,
          pageSize: 50,
          sort: { field: 'age', direction: dir },
        });

        expect(result.items).toBeDefined();
      }
    });

    it('Stress — rapid filter changes', async () => {
      const fetcher = createFetcher();
      const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance'];

      for (const dept of departments) {
        const result = await fetcher({
          page: 1,
          pageSize: 50,
          filters: {
            department: { op: 'equals', value: dept },
          },
        });

        expect(result.items).toBeDefined();
        expect(result.total).toBeGreaterThan(0);
      }
    });
  });
}
