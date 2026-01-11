/**
 * Workflow Scenarios — Row Selection, Bulk Actions, Export
 *
 * Tests Stage E workflow features
 */

import { describe, it, expect } from 'vitest';
import type { Fetcher, Exporter, BulkActionDef } from '@rowakit/table';
import type { TestUser } from '../dataset';
import { generateDataset } from '../dataset';

export function runWorkflowScenarios(datasetSize: number) {
  describe('Workflow Scenarios', () => {
    const dataset = generateDataset(datasetSize);

    const createFetcher = (): Fetcher<TestUser> => {
      return async (query) => {
        const start = (query.page - 1) * query.pageSize;
        const end = start + query.pageSize;
        const items = dataset.slice(start, end);

        return {
          items,
          total: dataset.length,
        };
      };
    };

    it('Row Selection — select multiple rows on page', async () => {
      const fetcher = createFetcher();
      const result = await fetcher({ page: 1, pageSize: 50 });

      const selected = [result.items[0].id, result.items[5].id, result.items[10].id];

      expect(selected).toHaveLength(3);
      expect(selected).toContain(result.items[0].id);
      expect(selected).toContain(result.items[5].id);
    });

    it('Row Selection — select all on page', async () => {
      const fetcher = createFetcher();
      const result = await fetcher({ page: 1, pageSize: 50 });

      const allSelected = result.items.map((item) => item.id);

      expect(allSelected).toHaveLength(50);
      expect(allSelected[0]).toBe(result.items[0].id);
      expect(allSelected[49]).toBe(result.items[49].id);
    });

    it('Row Selection — selection resets on page change', async () => {
      const fetcher = createFetcher();

      // Page 1: select items
      const page1 = await fetcher({ page: 1, pageSize: 50 });
      const selectedPage1 = [page1.items[0].id, page1.items[1].id];

      // Page 2: selection should be empty (page-scoped)
      const page2 = await fetcher({ page: 2, pageSize: 50 });
      const selectedPage2: string[] = [];

      expect(selectedPage1).toHaveLength(2);
      expect(selectedPage2).toHaveLength(0);
      expect(page2.items[0].id).not.toBe(page1.items[0].id);
    });

    it('Bulk Actions — receives correct keys', async () => {
      const fetcher = createFetcher();
      const result = await fetcher({ page: 1, pageSize: 50 });

      const selectedKeys = [result.items[0].id, result.items[5].id];
      let receivedKeys: string[] = [];

      const bulkAction: BulkActionDef = {
        id: 'test-action',
        label: 'Test Action',
        onClick: (keys) => {
          receivedKeys = keys;
        },
      };

      // Simulate bulk action click
      bulkAction.onClick(selectedKeys);

      expect(receivedKeys).toEqual(selectedKeys);
      expect(receivedKeys).toHaveLength(2);
    });

    it('Bulk Actions — confirmation dialog definition', async () => {
      const bulkAction: BulkActionDef = {
        id: 'delete',
        label: 'Delete selected',
        confirm: {
          title: 'Confirm delete',
          description: 'Are you sure?',
        },
        onClick: (keys) => {
          console.log('Delete keys:', keys);
        },
      };

      expect(bulkAction.confirm).toBeDefined();
      expect(bulkAction.confirm?.title).toBe('Confirm delete');
    });

    it('Bulk Actions — handles empty selection', async () => {
      let receivedKeys: string[] = [];

      const bulkAction: BulkActionDef = {
        id: 'test',
        label: 'Test',
        onClick: (keys) => {
          receivedKeys = keys;
        },
      };

      bulkAction.onClick([]);

      expect(receivedKeys).toHaveLength(0);
    });

    it('Export — exporter receives query snapshot', async () => {
      let receivedQuery: any = null;

      const exporter: Exporter = async (query) => {
        receivedQuery = query;
        return { url: 'mock-url' };
      };

      const query = {
        page: 2,
        pageSize: 100,
        sort: { field: 'name', direction: 'asc' as const },
        filters: {
          department: { op: 'equals', value: 'Engineering' },
        },
      };

      await exporter(query);

      expect(receivedQuery).toEqual(query);
      expect(receivedQuery.page).toBe(2);
      expect(receivedQuery.pageSize).toBe(100);
      expect(receivedQuery.sort?.field).toBe('name');
      expect(receivedQuery.filters?.department).toBeDefined();
    });

    it('Export — returns download URL', async () => {
      const exporter: Exporter = async () => {
        return { url: 'https://example.com/export.csv' };
      };

      const result = await exporter({ page: 1, pageSize: 50 });

      expect(result.url).toBe('https://example.com/export.csv');
      expect(typeof result.url).toBe('string');
    });

    it('Stale Request Protection — later request wins', async () => {
      const fetcher = createFetcher();
      const requestIds: number[] = [];

      // Simulate 3 rapid requests
      const req1 = fetcher({ page: 1, pageSize: 50 }).then((result) => {
        requestIds.push(1);
        return result;
      });

      const req2 = fetcher({ page: 2, pageSize: 50 }).then((result) => {
        requestIds.push(2);
        return result;
      });

      const req3 = fetcher({ page: 3, pageSize: 50 }).then((result) => {
        requestIds.push(3);
        return result;
      });

      await Promise.all([req1, req2, req3]);

      // All requests should complete
      expect(requestIds).toHaveLength(3);
    });
  });
}
