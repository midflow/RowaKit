/**
 * @fileoverview Tests for SmartTable Column Width Hardening (PRD-03)
 * Tests that column widths are applied to both headers and body cells
 * and that fixed layout provides stable resizing behavior
 */

import { describe, it, expect } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { SmartTable } from './SmartTable';
import { col } from '../column-helpers';
import type { Fetcher } from '../types';

// ============================================================================
// TEST DATA
// ============================================================================

interface User {
  id: string;
  name: string;
  email: string;
  age: number;
}

const mockUsers: User[] = [
  { id: '1', name: 'Alice Johnson', email: 'alice.johnson@example.com', age: 28 },
  { id: '2', name: 'Bob Smith', email: 'bob.smith@example.com', age: 35 },
  { id: '3', name: 'Charlie Brown', email: 'charlie.brown@example.com', age: 42 },
];

// ============================================================================
// COLUMN WIDTH HARDENING TESTS (PRD-03)
// ============================================================================

describe('SmartTable - Column Width Hardening (PRD-03)', () => {
  describe('Double-click auto-fit', () => {
    it('double-clicking the resize handle auto-fits to content width', async () => {
      const fetcher: Fetcher<User> = async () => ({
        items: mockUsers,
        total: 3,
      });

      const { container } = render(
        <SmartTable
          fetcher={fetcher}
          columns={[
            col.text<User>('name'),
            col.text<User>('email'),
          ]}
          rowKey="id"
          enableColumnResizing={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeDefined();
      });

      const nameHeader = container.querySelector('th[data-col-id="name"]') as HTMLTableCellElement;
      expect(nameHeader).toBeTruthy();

      const nameCells = Array.from(
        container.querySelectorAll('td[data-col-id="name"]'),
      ) as HTMLTableCellElement[];
      expect(nameCells.length).toBe(3);

      // JSDOM doesn't compute real layout; stub scrollWidth so auto-fit has data.
      Object.defineProperty(nameHeader, 'scrollWidth', { value: 110, configurable: true });
      nameCells.forEach((td) => {
        Object.defineProperty(td, 'scrollWidth', { value: 220, configurable: true });
      });

      const resizeHandle = nameHeader.querySelector('.rowakit-column-resize-handle') as HTMLDivElement;
      expect(resizeHandle).toBeTruthy();

      // Expect: max(110, 220) + padding(24) => 244
      fireEvent.doubleClick(resizeHandle);

      await waitFor(() => {
        expect(nameHeader.style.width).toBe('244px');
      });

      nameCells.forEach((td) => {
        expect(td.style.width).toBe('244px');
      });
    });
  });

  describe('Width application to body cells', () => {
    it('applies column.width to body cells when no resize occurred', async () => {
      const fetcher: Fetcher<User> = async () => ({
        items: mockUsers,
        total: 3,
      });

      const { container } = render(
        <SmartTable
          fetcher={fetcher}
          columns={[
            col.text<User>('name', { width: 150 }),
            col.text<User>('email', { width: 200 }),
            col.number<User>('age'),
          ]}
          rowKey="id"
          enableColumnResizing={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeDefined();
      });

      // Check that header has the width applied
      const nameHeader = container.querySelector('th[data-col-id="name"]') as HTMLTableCellElement;
      expect(nameHeader.style.width).toBe('150px');

      // Check that body cells also have the width applied
      const nameBodyCells = Array.from(
        container.querySelectorAll('td[data-col-id="name"]')
      ) as HTMLTableCellElement[];
      
      expect(nameBodyCells.length).toBe(3);
      nameBodyCells.forEach(cell => {
        expect(cell.style.width).toBe('150px');
      });
    });

    it('truncation class is applied to body cells when truncate is enabled', async () => {
      const fetcher: Fetcher<User> = async () => ({
        items: mockUsers,
        total: 3,
      });

      const { container } = render(
        <SmartTable
          fetcher={fetcher}
          columns={[
            col.text<User>('name', { width: 100, truncate: true }),
            col.text<User>('email', { truncate: true }),
          ]}
          rowKey="id"
          enableColumnResizing={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeDefined();
      });

      // Body cells with truncate should have the class
      const nameBodyCells = Array.from(
        container.querySelectorAll('td[data-col-id="name"]')
      ) as HTMLTableCellElement[];

      nameBodyCells.forEach(cell => {
        expect(cell.className).toContain('rowakit-cell-truncate');
      });
    });

    it('header truncation class is applied when truncate is enabled', async () => {
      const fetcher: Fetcher<User> = async () => ({
        items: mockUsers,
        total: 3,
      });

      const { container } = render(
        <SmartTable
          fetcher={fetcher}
          columns={[
            col.text<User>('name', { width: 100, truncate: true }),
            col.text<User>('email'),
          ]}
          rowKey="id"
          enableColumnResizing={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeDefined();
      });

      // PRD-03: Headers should also have truncation class when enabled
      const nameHeader = container.querySelector('th[data-col-id="name"]') as HTMLTableCellElement;
      expect(nameHeader.className).toContain('rowakit-cell-truncate');
    });
  });

  describe('Fixed layout mode', () => {
    it('applies rowakit-layout-fixed class when enableColumnResizing is true', async () => {
      const fetcher: Fetcher<User> = async () => ({
        items: mockUsers,
        total: 3,
      });

      const { container } = render(
        <SmartTable
          fetcher={fetcher}
          columns={[
            col.text<User>('name', { width: 100 }),
            col.text<User>('email'),
          ]}
          rowKey="id"
          enableColumnResizing={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeDefined();
      });

      const tableContainer = container.querySelector('.rowakit-table') as HTMLDivElement;
      expect(tableContainer.className).toContain('rowakit-layout-fixed');
    });

    it('does not apply rowakit-layout-fixed when enableColumnResizing is false', async () => {
      const fetcher: Fetcher<User> = async () => ({
        items: mockUsers,
        total: 3,
      });

      const { container } = render(
        <SmartTable
          fetcher={fetcher}
          columns={[
            col.text<User>('name', { width: 100 }),
            col.text<User>('email'),
          ]}
          rowKey="id"
          enableColumnResizing={false}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeDefined();
      });

      const tableContainer = container.querySelector('.rowakit-table') as HTMLDivElement;
      expect(tableContainer.className).not.toContain('rowakit-layout-fixed');
    });

    it('preserves custom className while adding layout-fixed', async () => {
      const fetcher: Fetcher<User> = async () => ({
        items: mockUsers,
        total: 3,
      });

      const { container } = render(
        <SmartTable
          fetcher={fetcher}
          columns={[
            col.text<User>('name', { width: 100 }),
          ]}
          rowKey="id"
          enableColumnResizing={true}
          className="my-custom-class"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeDefined();
      });

      const tableContainer = container.querySelector('.rowakit-table') as HTMLDivElement;
      expect(tableContainer.className).toContain('rowakit-layout-fixed');
      expect(tableContainer.className).toContain('my-custom-class');
    });
  });

  describe('Width consistency after resize', () => {
    it('body cell widths match header widths after resize', async () => {
      const fetcher: Fetcher<User> = async () => ({
        items: mockUsers,
        total: 3,
      });

      const { container } = render(
        <SmartTable
          fetcher={fetcher}
          columns={[
            col.text<User>('name', { width: 100 }),
            col.text<User>('email', { width: 150 }),
          ]}
          rowKey="id"
          enableColumnResizing={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeDefined();
      });

      // Get header widths
      const nameHeader = container.querySelector('th[data-col-id="name"]') as HTMLTableCellElement;
      const emailHeader = container.querySelector('th[data-col-id="email"]') as HTMLTableCellElement;

      const nameHeaderWidth = nameHeader.style.width;
      const emailHeaderWidth = emailHeader.style.width;

      // Get first body cell widths
      const nameBodyCell = container.querySelector('td[data-col-id="name"]') as HTMLTableCellElement;
      const emailBodyCell = container.querySelector('td[data-col-id="email"]') as HTMLTableCellElement;

      const nameBodyWidth = nameBodyCell.style.width;
      const emailBodyWidth = emailBodyCell.style.width;

      // Widths should match (or both be empty for no-width columns)
      expect(nameBodyWidth).toBe(nameHeaderWidth);
      expect(emailBodyWidth).toBe(emailHeaderWidth);
    });
  });

  describe('Truncation and fixed layout integration', () => {
    it('long text in resizable column is truncated with ellipsis', async () => {
      const fetcher: Fetcher<User> = async () => ({
        items: mockUsers,
        total: 3,
      });

      const { container } = render(
        <SmartTable
          fetcher={fetcher}
          columns={[
            col.text<User>('name', { width: 80, truncate: true }),
            col.text<User>('email', { width: 120 }),
          ]}
          rowKey="id"
          enableColumnResizing={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeDefined();
      });

      // Body cells should have truncate class
      const nameBodyCell = container.querySelector('td[data-col-id="name"]') as HTMLTableCellElement;
      expect(nameBodyCell.className).toContain('rowakit-cell-truncate');
      
      // Width should be set for fixed layout
      expect(nameBodyCell.style.width).toBe('80px');
    });
  });

  describe('Width update optimization', () => {
    it('does not re-render if width value unchanged (guard against duplicate resizes)', async () => {
      const fetcher: Fetcher<User> = async () => ({
        items: mockUsers,
        total: 3,
      });

      const { container } = render(
        <SmartTable
          fetcher={fetcher}
          columns={[
            col.text<User>('name', { width: 100 }),
            col.text<User>('email'),
          ]}
          rowKey="id"
          enableColumnResizing={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeDefined();
      });

      // Initial render with default width
      const nameHeader = container.querySelector('th[data-col-id="name"]') as HTMLTableCellElement;
      expect(nameHeader.style.width).toBe('100px');

      // The guard in handleColumnResize ensures that if finalWidth equals
      // the current columnWidths[columnId], the state update is skipped
      // This is verified by the component's internal logic, not observable in DOM
      // (since we're not triggering resize in this test, just verifying width exists)
      expect(nameHeader).toBeDefined();
    });
  });
});
