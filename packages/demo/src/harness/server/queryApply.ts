/**
 * Server-side Query Application
 *
 * Applies filters and sorting to dataset (simulates backend logic).
 */

import type { Filters, SortColumn } from '@rowakit/table';
import type { TestUser } from '../dataset';

/**
 * Apply filters to dataset
 */
export function applyFilters(dataset: TestUser[], filters: Filters | undefined): TestUser[] {
  if (!filters) return dataset;
  
  let result = dataset;

  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null) continue;

    if (key === 'name' && typeof value === 'string') {
      // Text contains filter
      const search = value.toLowerCase();
      result = result.filter((item) =>
        item.name.toLowerCase().includes(search)
      );
    } else if (key === 'email' && typeof value === 'string') {
      // Email contains filter
      const search = value.toLowerCase();
      result = result.filter((item) =>
        item.email.toLowerCase().includes(search)
      );
    } else if (key === 'department' && typeof value === 'string') {
      // Exact match filter
      result = result.filter((item) => item.department === value);
    } else if (key === 'role' && typeof value === 'string') {
      // Exact match filter
      result = result.filter((item) => item.role === value);
    } else if (key === 'active' && typeof value === 'boolean') {
      // Boolean filter
      result = result.filter((item) => item.active === value);
    } else if (key === 'age' && typeof value === 'object') {
      // Range filter
      const range = value as { min?: number; max?: number };
      if (range.min !== undefined) {
        result = result.filter((item) => item.age >= range.min!);
      }
      if (range.max !== undefined) {
        result = result.filter((item) => item.age <= range.max!);
      }
    } else if (key === 'salary' && typeof value === 'object') {
      // Range filter
      const range = value as { min?: number; max?: number };
      if (range.min !== undefined) {
        result = result.filter((item) => item.salary >= range.min!);
      }
      if (range.max !== undefined) {
        result = result.filter((item) => item.salary <= range.max!);
      }
    }
  }

  return result;
}

/**
 * Apply sorting to dataset
 */
export function applySorting(dataset: TestUser[], sorts: SortColumn[]): TestUser[] {
  if (sorts.length === 0) return dataset;

  const result = [...dataset];

  result.sort((a, b) => {
    for (const sort of sorts) {
      const aVal = a[sort.field as keyof TestUser];
      const bVal = b[sort.field as keyof TestUser];

      let comparison = 0;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal);
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
        comparison = aVal === bVal ? 0 : aVal ? 1 : -1;
      } else if (aVal instanceof Date && bVal instanceof Date) {
        comparison = aVal.getTime() - bVal.getTime();
      }

      if (comparison !== 0) {
        return sort.direction === 'desc' ? -comparison : comparison;
      }
    }

    return 0;
  });

  return result;
}
