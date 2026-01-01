/**
 * Tests for Stage B Features (v0.2.0)
 * - B-01: col.badge
 * - B-02: col.number
 * - B-03: Column modifiers (width, align, truncate)
 * - B-04: Server-side filters
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { RowaKitTable } from './SmartTable';
import { col } from '../column-helpers';
import type { Fetcher } from '../types';

interface TestUser {
  id: number;
  name: string;
  status: 'active' | 'inactive' | 'pending';
  balance: number;
  createdAt: string;
  isVerified: boolean;
}

const mockUsers: TestUser[] = [
  { id: 1, name: 'Alice', status: 'active', balance: 1234.56, createdAt: '2024-01-15', isVerified: true },
  { id: 2, name: 'Bob', status: 'inactive', balance: 5000, createdAt: '2024-02-20', isVerified: false },
  { id: 3, name: 'Charlie', status: 'pending', balance: 750.25, createdAt: '2024-03-10', isVerified: true },
];

describe('SmartTable - Stage B Features', () => {
  describe('B-01: Badge Column', () => {
    it('renders badge column with mapped values', async () => {
      const fetcher: Fetcher<TestUser> = vi.fn().mockResolvedValue({
        items: mockUsers,
        total: 3,
      });

      const columns = [
        col.text<TestUser>('name', { header: 'Name' }),
        col.badge<TestUser>('status', {
          header: 'Status',
          map: {
            active: { label: 'Active', tone: 'success' },
            inactive: { label: 'Inactive', tone: 'neutral' },
            pending: { label: 'Pending', tone: 'warning' },
          },
        }),
      ];

      render(<RowaKitTable columns={columns} fetcher={fetcher} rowKey="id" />);

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      // Check badge elements exist with correct tone classes
      const badges = document.querySelectorAll('.rowakit-badge');
      expect(badges.length).toBe(3);

      // Check specific badge tones
      expect(document.querySelector('.rowakit-badge-success')).toBeDefined();
      expect(document.querySelector('.rowakit-badge-neutral')).toBeDefined();
      expect(document.querySelector('.rowakit-badge-warning')).toBeDefined();
    });

    it('makes badge column sortable when specified', async () => {
      const fetcher: Fetcher<TestUser> = vi.fn().mockResolvedValue({
        items: mockUsers,
        total: 3,
      });

      const columns = [
        col.badge<TestUser>('status', {
          header: 'Status',
          sortable: true,
          map: { 
            active: { label: 'Active', tone: 'success' }, 
            inactive: { label: 'Inactive', tone: 'neutral' }, 
            pending: { label: 'Pending', tone: 'warning' } 
          },
        }),
      ];

      render(<RowaKitTable columns={columns} fetcher={fetcher} rowKey="id" />);

      await waitFor(() => {
        const header = screen.getByText('Status');
        expect(header).toBeDefined();
        expect(header.closest('th')?.getAttribute('role')).toBe('button');
      });
    });
  });

  describe('B-02: Number Column', () => {
    it('renders number column with currency formatting', async () => {
      const fetcher: Fetcher<TestUser> = vi.fn().mockResolvedValue({
        items: [mockUsers[0]], // balance: 1234.56
        total: 1,
      });

      const columns = [
        col.number<TestUser>('balance', {
          header: 'Balance',
          format: { style: 'currency', currency: 'USD' },
        }),
      ];

      render(<RowaKitTable columns={columns} fetcher={fetcher} rowKey="id" />);

      await waitFor(() => {
        // Should format as USD currency
        const text = document.body.textContent || '';
        expect(text).toContain('1,234.56');
      });
    });

    it('renders number column with custom format function', async () => {
      const fetcher: Fetcher<TestUser> = vi.fn().mockResolvedValue({
        items: [mockUsers[0]],
        total: 1,
      });

      const columns = [
        col.number<TestUser>('balance', {
          header: 'Balance',
          format: (value) => `${value.toFixed(2)} USD`,
        }),
      ];

      render(<RowaKitTable columns={columns} fetcher={fetcher} rowKey="id" />);

      await waitFor(() => {
        expect(screen.getByText('1234.56 USD')).toBeDefined();
      });
    });

    it('makes number column sortable when specified', async () => {
      const fetcher: Fetcher<TestUser> = vi.fn().mockResolvedValue({
        items: mockUsers,
        total: 3,
      });

      const columns = [
        col.number<TestUser>('balance', {
          header: 'Balance',
          sortable: true,
        }),
      ];

      render(<RowaKitTable columns={columns} fetcher={fetcher} rowKey="id" />);

      await waitFor(() => {
        const header = screen.getByText('Balance');
        expect(header.closest('th')?.getAttribute('role')).toBe('button');
      });
    });
  });

  describe('B-03: Column Modifiers', () => {
    it('applies width modifier to columns', async () => {
      const fetcher: Fetcher<TestUser> = vi.fn().mockResolvedValue({
        items: [mockUsers[0]],
        total: 1,
      });

      const columns = [
        col.text<TestUser>('name', { header: 'Name', width: 200 }),
        col.number<TestUser>('balance', { header: 'Balance', width: 150 }),
      ];

      render(<RowaKitTable columns={columns} fetcher={fetcher} rowKey="id" />);

      await waitFor(() => {
        expect(screen.getByText('Name')).toBeDefined();
      });

      const nameHeader = screen.getByText('Name').closest('th');
      const balanceHeader = screen.getByText('Balance').closest('th');

      expect(nameHeader?.style.width).toBe('200px');
      expect(balanceHeader?.style.width).toBe('150px');
    });

    it('applies align modifier to columns', async () => {
      const fetcher: Fetcher<TestUser> = vi.fn().mockResolvedValue({
        items: [mockUsers[0]],
        total: 1,
      });

      const columns = [
        col.text<TestUser>('name', { header: 'Name', align: 'left' }),
        col.badge<TestUser>('status', {
          header: 'Status',
          align: 'center',
          map: { active: { label: 'Active', tone: 'success' } },
        }),
        col.number<TestUser>('balance', { header: 'Balance', align: 'right' }),
      ];

      render(<RowaKitTable columns={columns} fetcher={fetcher} rowKey="id" />);

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      const nameHeader = screen.getByText('Name').closest('th');
      const statusHeader = screen.getByText('Status').closest('th');
      const balanceHeader = screen.getByText('Balance').closest('th');

      expect(nameHeader?.style.textAlign).toBe('left');
      expect(statusHeader?.style.textAlign).toBe('center');
      expect(balanceHeader?.style.textAlign).toBe('right');
    });

    it('applies truncate modifier to columns', async () => {
      const fetcher: Fetcher<TestUser> = vi.fn().mockResolvedValue({
        items: [mockUsers[0]],
        total: 1,
      });

      const columns = [
        col.text<TestUser>('name', { header: 'Name', truncate: true }),
      ];

      render(<RowaKitTable columns={columns} fetcher={fetcher} rowKey="id" />);

      await waitFor(() => {
        expect(screen.getByText('Name')).toBeDefined();
      });

      const header = screen.getByText('Name').closest('th');
      expect(header?.className).toContain('rowakit-cell-truncate');
    });
  });

  describe('B-04: Server-Side Filters', () => {
    it('does not render filter row when enableFilters is false', async () => {
      const fetcher: Fetcher<TestUser> = vi.fn().mockResolvedValue({
        items: mockUsers,
        total: 3,
      });

      const columns = [col.text<TestUser>('name', { header: 'Name' })];

      render(<RowaKitTable columns={columns} fetcher={fetcher} rowKey="id" />);

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      const filterRow = document.querySelector('.rowakit-table-filter-row');
      expect(filterRow).toBeNull();
    });

    it('renders filter row when enableFilters is true', async () => {
      const fetcher: Fetcher<TestUser> = vi.fn().mockResolvedValue({
        items: mockUsers,
        total: 3,
      });

      const columns = [col.text<TestUser>('name', { header: 'Name' })];

      render(<RowaKitTable columns={columns} fetcher={fetcher} rowKey="id" enableFilters />);

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      const filterRow = document.querySelector('.rowakit-table-filter-row');
      expect(filterRow).not.toBeNull();
    });

    it('renders text input for text columns', async () => {
      const fetcher: Fetcher<TestUser> = vi.fn().mockResolvedValue({
        items: mockUsers,
        total: 3,
      });

      const columns = [col.text<TestUser>('name', { header: 'Name' })];

      render(<RowaKitTable columns={columns} fetcher={fetcher} rowKey="id" enableFilters />);

      await waitFor(() => {
        const input = screen.getByPlaceholderText('Filter Name...');
        expect(input).toBeDefined();
        expect(input.getAttribute('type')).toBe('text');
      });
    });

    it('renders select for badge columns', async () => {
      const fetcher: Fetcher<TestUser> = vi.fn().mockResolvedValue({
        items: mockUsers,
        total: 3,
      });

      const columns = [
        col.badge<TestUser>('status', {
          header: 'Status',
          map: { 
            active: { label: 'Active', tone: 'success' }, 
            inactive: { label: 'Inactive', tone: 'neutral' }, 
            pending: { label: 'Pending', tone: 'warning' } 
          },
        }),
      ];

      render(<RowaKitTable columns={columns} fetcher={fetcher} rowKey="id" enableFilters />);

      await waitFor(() => {
        const filterRow = document.querySelector('.rowakit-table-filter-row');
        const select = filterRow?.querySelector('select');
        expect(select).not.toBeNull();

        // Check options
        const options = select?.querySelectorAll('option');
        expect(options?.length).toBe(4); // All + 3 badge values
        expect(options?.[0]?.textContent).toBe('All');
        expect(options?.[1]?.textContent).toBe('active');
        expect(options?.[2]?.textContent).toBe('inactive');
        expect(options?.[3]?.textContent).toBe('pending');
      });
    });

    it('renders select for boolean columns', async () => {
      const fetcher: Fetcher<TestUser> = vi.fn().mockResolvedValue({
        items: mockUsers,
        total: 3,
      });

      const columns = [col.boolean<TestUser>('isVerified', { header: 'Verified' })];

      render(<RowaKitTable columns={columns} fetcher={fetcher} rowKey="id" enableFilters />);

      await waitFor(() => {
        const filterRow = document.querySelector('.rowakit-table-filter-row');
        const select = filterRow?.querySelector('select');
        expect(select).not.toBeNull();

        const options = select?.querySelectorAll('option');
        expect(options?.length).toBe(3); // All, True, False
        expect(options?.[0]?.textContent).toBe('All');
        expect(options?.[1]?.textContent).toBe('True');
        expect(options?.[2]?.textContent).toBe('False');
      });
    });

    it('renders date inputs for date columns', async () => {
      const fetcher: Fetcher<TestUser> = vi.fn().mockResolvedValue({
        items: mockUsers,
        total: 3,
      });

      const columns = [col.date<TestUser>('createdAt', { header: 'Created' })];

      render(<RowaKitTable columns={columns} fetcher={fetcher} rowKey="id" enableFilters />);

      await waitFor(() => {
        const filterRow = document.querySelector('.rowakit-table-filter-row');
        const dateInputs = filterRow?.querySelectorAll('input[type="date"]');
        expect(dateInputs?.length).toBe(2); // from and to
      });
    });

    it('does not render filter inputs for actions columns', async () => {
      const fetcher: Fetcher<TestUser> = vi.fn().mockResolvedValue({
        items: mockUsers,
        total: 3,
      });

      const columns = [
        col.text<TestUser>('name', { header: 'Name' }),
        col.actions<TestUser>([
          { id: 'edit', label: 'Edit', onClick: () => {} },
        ]),
      ];

      render(<RowaKitTable columns={columns} fetcher={fetcher} rowKey="id" enableFilters />);

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      const filterRow = document.querySelector('.rowakit-table-filter-row');
      const filterCells = filterRow?.querySelectorAll('th');

      // Should have 2 cells (one for name, one empty for actions)
      expect(filterCells?.length).toBe(2);

      // First cell should have input
      expect(filterCells?.[0]?.querySelector('input')).not.toBeNull();

      // Second cell (actions) should be empty
      expect(filterCells?.[1]?.querySelector('input')).toBeNull();
      expect(filterCells?.[1]?.querySelector('select')).toBeNull();
    });
  });
});
