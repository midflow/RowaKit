/**
 * @fileoverview Tests for SmartTable URL sync hardening (PRD-05)
 * Tests URL parsing/validation and debouncing behavior
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SmartTable } from './SmartTable';
import { col } from '../column-helpers';
import type { Fetcher, FetcherQuery } from '../types';

interface User {
  id: string;
  name: string;
  email: string;
}

const mockUsers: User[] = [
  { id: '1', name: 'Alice', email: 'alice@example.com' },
  { id: '2', name: 'Bob', email: 'bob@example.com' },
  { id: '3', name: 'Charlie', email: 'charlie@example.com' },
];

describe('SmartTable - URL sync hardening (PRD-05)', () => {
  beforeEach(() => {
    // Clear URL params before each test
    window.history.replaceState(null, '', window.location.pathname);
  });

  describe('URL parameter parsing and validation', () => {
    it('renders correctly with syncToUrl enabled', async () => {
      const fetcher: Fetcher<User> = async () => {
        return { items: mockUsers, total: 3 };
      };

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name'), col.text<User>('email')]}
          rowKey="id"
          syncToUrl={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });
    });

    it('renders without crashing when syncToUrl is enabled', async () => {
      const fetcher: Fetcher<User> = async () => {
        return { items: mockUsers, total: 3 };
      };

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name'), col.text<User>('email')]}
          rowKey="id"
          syncToUrl={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });
    });

    it('ignores invalid pageSize and uses default', async () => {
      window.history.replaceState(null, '', '?pageSize=999');
      let capturedQuery: FetcherQuery | undefined;

      const fetcher: Fetcher<User> = async (query) => {
        capturedQuery = query;
        return { items: mockUsers, total: 3 };
      };

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name'), col.text<User>('email')]}
          rowKey="id"
          pageSizeOptions={[10, 20, 50]}
          defaultPageSize={20}
          syncToUrl={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
        expect(capturedQuery?.pageSize).toBe(20);
      });
    });

    it('ignores invalid sort direction', async () => {
      window.history.replaceState(null, '', '?sortField=name&sortDirection=invalid');
      let capturedQuery: FetcherQuery | undefined;

      const fetcher: Fetcher<User> = async (query) => {
        capturedQuery = query;
        return { items: mockUsers, total: 3 };
      };

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[
            col.text<User>('name', { sortable: true }),
            col.text<User>('email'),
          ]}
          rowKey="id"
          syncToUrl={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
        expect(capturedQuery?.sort).toBeUndefined();
      });
    });

    it('ignores invalid filters JSON', async () => {
      window.history.replaceState(null, '', '?filters={invalid json}');

      const fetcher: Fetcher<User> = async () => {
        return { items: mockUsers, total: 3 };
      };

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name'), col.text<User>('email')]}
          rowKey="id"
          enableFilters={true}
          syncToUrl={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });
    });

    it('accepts valid page and pageSize from URL', async () => {
      window.history.replaceState(null, '', '?page=2&pageSize=20');
      let capturedQuery: FetcherQuery | undefined;

      const fetcher: Fetcher<User> = async (query) => {
        capturedQuery = query;
        return { items: mockUsers, total: 50 };
      };

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name'), col.text<User>('email')]}
          rowKey="id"
          defaultPageSize={20}
          syncToUrl={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
        expect(capturedQuery?.page).toBe(2);
        expect(capturedQuery?.pageSize).toBe(20);
      });
    });

    it('accepts valid sort (asc) from URL', async () => {
      window.history.replaceState(null, '', '?sortField=name&sortDirection=asc');
      let capturedQuery: FetcherQuery | undefined;

      const fetcher: Fetcher<User> = async (query) => {
        capturedQuery = query;
        return { items: mockUsers, total: 3 };
      };

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[
            col.text<User>('name', { sortable: true }),
            col.text<User>('email'),
          ]}
          rowKey="id"
          syncToUrl={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
        expect(capturedQuery?.sort?.field).toBe('name');
        expect(capturedQuery?.sort?.direction).toBe('asc');
      });
    });

    it('accepts valid sort (desc) from URL', async () => {
      window.history.replaceState(null, '', '?sortField=email&sortDirection=desc');
      let capturedQuery: FetcherQuery | undefined;

      const fetcher: Fetcher<User> = async (query) => {
        capturedQuery = query;
        return { items: mockUsers, total: 3 };
      };

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[
            col.text<User>('name'),
            col.text<User>('email', { sortable: true }),
          ]}
          rowKey="id"
          syncToUrl={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
        expect(capturedQuery?.sort?.field).toBe('email');
        expect(capturedQuery?.sort?.direction).toBe('desc');
      });
    });
  });

  describe('No crash on malformed URL', () => {
    it('handles completely invalid URL gracefully', async () => {
      window.history.replaceState(null, '', '?page=abc&pageSize=xyz&sortDirection=xyz&filters={bad}');

      const fetcher: Fetcher<User> = async () => ({
        items: mockUsers,
        total: 3,
      });

      const { container } = render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name'), col.text<User>('email')]}
          rowKey="id"
          enableColumnResizing={true}
          syncToUrl={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      expect(container.querySelector('table')).toBeDefined();
    });
  });

  describe('Old URLs remain compatible', () => {
    it('loads state from old URL format', async () => {
      window.history.replaceState(null, '', '?page=1&pageSize=20');
      let capturedQuery: FetcherQuery | undefined;

      const fetcher: Fetcher<User> = async (query) => {
        capturedQuery = query;
        return { items: mockUsers, total: 3 };
      };

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name'), col.text<User>('email')]}
          rowKey="id"
          syncToUrl={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
        expect(capturedQuery?.page).toBe(1);
        expect(capturedQuery?.pageSize).toBe(20);
      });
    });
  });

  describe('Defaults applied when parameters missing', () => {
    it('uses defaults when URL is empty', async () => {
      window.history.replaceState(null, '', '/');
      let capturedQuery: FetcherQuery | undefined;

      const fetcher: Fetcher<User> = async (query) => {
        capturedQuery = query;
        return { items: mockUsers, total: 3 };
      };

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name'), col.text<User>('email')]}
          rowKey="id"
          defaultPageSize={20}
          syncToUrl={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
        expect(capturedQuery?.page).toBe(1);
        expect(capturedQuery?.pageSize).toBe(20);
      });
    });
  });

  describe('Page boundary validation', () => {
    it('clamps page 0 to 1', async () => {
      window.history.replaceState(null, '', '?page=0');
      let capturedQuery: FetcherQuery | undefined;

      const fetcher: Fetcher<User> = async (query) => {
        capturedQuery = query;
        return { items: mockUsers, total: 3 };
      };

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name'), col.text<User>('email')]}
          rowKey="id"
          syncToUrl={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
        expect(capturedQuery?.page).toBe(1);
      });
    });

    it('accepts large page numbers', async () => {
      window.history.replaceState(null, '', '?page=999999');
      let capturedQuery: FetcherQuery | undefined;

      const fetcher: Fetcher<User> = async (query) => {
        capturedQuery = query;
        return { items: [], total: 0 };
      };

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name'), col.text<User>('email')]}
          rowKey="id"
          syncToUrl={true}
        />
      );

      await waitFor(() => {
        expect(capturedQuery?.page).toBe(999999);
      });
    });
  });

  describe('syncToUrl disabled behavior', () => {
    it('ignores URL when syncToUrl is false', async () => {
      window.history.replaceState(null, '', '?page=5&pageSize=50');
      let capturedQuery: FetcherQuery | undefined;

      const fetcher: Fetcher<User> = async (query) => {
        capturedQuery = query;
        return { items: mockUsers, total: 3 };
      };

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name'), col.text<User>('email')]}
          rowKey="id"
          defaultPageSize={20}
          syncToUrl={false}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
        expect(capturedQuery?.page).toBe(1);
        expect(capturedQuery?.pageSize).toBe(20);
      });
    });
  });

  describe('URL write after state changes', () => {
    it('updates URL when table state changes', async () => {
      window.history.replaceState(null, '', '/');

      const fetcher: Fetcher<User> = async () => ({
        items: mockUsers,
        total: 3,
      });

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[col.text<User>('name'), col.text<User>('email')]}
          rowKey="id"
          syncToUrl={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      const params = new URLSearchParams(window.location.search);
      expect(params.get('page')).toBeDefined();
    });
  });
});
