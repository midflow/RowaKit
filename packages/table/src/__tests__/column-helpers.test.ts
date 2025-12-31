import { describe, it, expect, vi } from 'vitest';
import { col } from '../column-helpers';
import type { ActionDef } from '../types';

// Sample data type for testing
interface Product {
  id: string;
  name: string;
  price: number;
  createdAt: Date;
  inStock: boolean;
  category: string;
}

describe('Column Helper Factory', () => {
  describe('col.text', () => {
    it('creates a basic text column', () => {
      const column = col.text<Product>('name');

      expect(column).toEqual({
        id: 'name',
        kind: 'text',
        field: 'name',
        header: undefined,
        sortable: false,
        format: undefined,
      });
    });

    it('creates a text column with options', () => {
      const column = col.text<Product>('name', {
        header: 'Product Name',
        sortable: true,
      });

      expect(column.id).toBe('name');
      expect(column.kind).toBe('text');
      expect(column.header).toBe('Product Name');
      expect(column.sortable).toBe(true);
    });

    it('creates a text column with format function', () => {
      const formatFn = (val: unknown) => String(val).toUpperCase();
      const column = col.text<Product>('category', { format: formatFn });

      expect(column.format).toBe(formatFn);
      expect(column.format?.('electronics')).toBe('ELECTRONICS');
    });

    it('has correct TypeScript types', () => {
      const column = col.text<Product>('name');

      // Should be TextColumnDef<Product>
      expect(column.kind).toBe('text');
      expect(column.field).toBe('name');
    });
  });

  describe('col.date', () => {
    it('creates a basic date column', () => {
      const column = col.date<Product>('createdAt');

      expect(column).toEqual({
        id: 'createdAt',
        kind: 'date',
        field: 'createdAt',
        header: undefined,
        sortable: false,
        format: undefined,
      });
    });

    it('creates a date column with options', () => {
      const column = col.date<Product>('createdAt', {
        header: 'Created',
        sortable: true,
      });

      expect(column.id).toBe('createdAt');
      expect(column.kind).toBe('date');
      expect(column.header).toBe('Created');
      expect(column.sortable).toBe(true);
    });

    it('creates a date column with format function', () => {
      const formatFn = (date: Date | string | number) =>
        new Date(date).toLocaleDateString();
      const column = col.date<Product>('createdAt', { format: formatFn });

      expect(column.format).toBe(formatFn);

      const testDate = new Date('2024-01-15');
      const formatted = column.format?.(testDate);
      expect(formatted).toBeTruthy();
    });

    it('has correct TypeScript types', () => {
      const column = col.date<Product>('createdAt');

      expect(column.kind).toBe('date');
      expect(column.field).toBe('createdAt');
    });
  });

  describe('col.boolean', () => {
    it('creates a basic boolean column', () => {
      const column = col.boolean<Product>('inStock');

      expect(column).toEqual({
        id: 'inStock',
        kind: 'boolean',
        field: 'inStock',
        header: undefined,
        sortable: false,
        format: undefined,
      });
    });

    it('creates a boolean column with options', () => {
      const column = col.boolean<Product>('inStock', {
        header: 'In Stock',
        sortable: true,
      });

      expect(column.id).toBe('inStock');
      expect(column.kind).toBe('boolean');
      expect(column.header).toBe('In Stock');
      expect(column.sortable).toBe(true);
    });

    it('creates a boolean column with format function', () => {
      const formatFn = (val: boolean) => (val ? 'Yes' : 'No');
      const column = col.boolean<Product>('inStock', { format: formatFn });

      expect(column.format).toBe(formatFn);
      expect(column.format?.(true)).toBe('Yes');
      expect(column.format?.(false)).toBe('No');
    });

    it('has correct TypeScript types', () => {
      const column = col.boolean<Product>('inStock');

      expect(column.kind).toBe('boolean');
      expect(column.field).toBe('inStock');
    });
  });

  describe('col.actions', () => {
    it('creates an actions column with single action', () => {
      const editAction: ActionDef<Product> = {
        id: 'edit',
        label: 'Edit',
        onClick: vi.fn(),
      };

      const column = col.actions<Product>([editAction]);

      expect(column).toEqual({
        id: 'actions',
        kind: 'actions',
        actions: [editAction],
      });
    });

    it('creates an actions column with multiple actions', () => {
      const actions: ActionDef<Product>[] = [
        { id: 'view', label: 'View', onClick: vi.fn() },
        { id: 'edit', label: 'Edit', onClick: vi.fn() },
        { id: 'delete', label: 'Delete', confirm: true, onClick: vi.fn() },
      ];

      const column = col.actions<Product>(actions);

      expect(column.kind).toBe('actions');
      expect(column.actions).toHaveLength(3);
      expect(column.actions[0]?.id).toBe('view');
      expect(column.actions[1]?.id).toBe('edit');
      expect(column.actions[2]?.id).toBe('delete');
      expect(column.actions[2]?.confirm).toBe(true);
    });

    it('preserves action callbacks', () => {
      const onClickMock = vi.fn();
      const column = col.actions<Product>([
        { id: 'test', label: 'Test', onClick: onClickMock },
      ]);

      const testProduct: Product = {
        id: '1',
        name: 'Test',
        price: 100,
        createdAt: new Date(),
        inStock: true,
        category: 'test',
      };

      column.actions[0]?.onClick(testProduct);
      expect(onClickMock).toHaveBeenCalledWith(testProduct);
    });

    it('supports action options', () => {
      const column = col.actions<Product>([
        {
          id: 'delete',
          label: 'Delete',
          icon: 'trash',
          confirm: true,
          onClick: vi.fn(),
        },
      ]);

      expect(column.actions[0]?.icon).toBe('trash');
      expect(column.actions[0]?.confirm).toBe(true);
    });
  });

  describe('col.custom', () => {
    it('creates a custom column with render function', () => {
      const renderFn = (row: Product) => `$${row.price}`;
      const column = col.custom<Product>('price', renderFn);

      expect(column).toEqual({
        id: 'price',
        kind: 'custom',
        field: 'price',
        render: renderFn,
      });
    });

    it('render function receives correct row data', () => {
      const renderFn = vi.fn((row: Product) => row.name);
      const column = col.custom<Product>('name', renderFn);

      const testProduct: Product = {
        id: '1',
        name: 'Test Product',
        price: 99.99,
        createdAt: new Date(),
        inStock: true,
        category: 'electronics',
      };

      const result = column.render(testProduct);
      expect(renderFn).toHaveBeenCalledWith(testProduct);
      expect(result).toBe('Test Product');
    });

    it('supports complex rendering logic', () => {
      const column = col.custom<Product>('price', (row) => {
        const formatted = row.price.toFixed(2);
        const stockStatus = row.inStock ? '(In Stock)' : '(Out of Stock)';
        return `$${formatted} ${stockStatus}`;
      });

      const testProduct: Product = {
        id: '1',
        name: 'Widget',
        price: 49.99,
        createdAt: new Date(),
        inStock: true,
        category: 'widgets',
      };

      const result = column.render(testProduct);
      expect(result).toBe('$49.99 (In Stock)');
    });

    it('has correct TypeScript types', () => {
      const column = col.custom<Product>('name', (row) => row.name);

      expect(column.kind).toBe('custom');
      expect(column.field).toBe('name');
      expect(typeof column.render).toBe('function');
    });
  });

  describe('Integration', () => {
    it('creates a complete column set', () => {
      const columns = [
        col.text<Product>('name', { header: 'Product', sortable: true }),
        col.text<Product>('category'),
        col.date<Product>('createdAt', { header: 'Created' }),
        col.boolean<Product>('inStock', { header: 'Available' }),
        col.custom<Product>('price', (row) => `$${row.price}`),
        col.actions<Product>([
          { id: 'edit', label: 'Edit', onClick: vi.fn() },
          { id: 'delete', label: 'Delete', confirm: true, onClick: vi.fn() },
        ]),
      ];

      expect(columns).toHaveLength(6);
      expect(columns[0]?.kind).toBe('text');
      expect(columns[1]?.kind).toBe('text');
      expect(columns[2]?.kind).toBe('date');
      expect(columns[3]?.kind).toBe('boolean');
      expect(columns[4]?.kind).toBe('custom');
      expect(columns[5]?.kind).toBe('actions');
    });

    it('all columns have unique ids', () => {
      const columns = [
        col.text<Product>('name'),
        col.text<Product>('category'),
        col.date<Product>('createdAt'),
        col.boolean<Product>('inStock'),
        col.custom<Product>('price', (row) => row.price),
      ];

      const ids = columns.map((c) => c.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });

    it('supports method chaining style API', () => {
      // While not actual chaining, the API should be clean and readable
      const columns = [
        col.text<Product>('name', { sortable: true }),
        col.date<Product>('createdAt', { sortable: true }),
        col.boolean<Product>('inStock'),
      ];

      columns.forEach((column) => {
        expect(column.id).toBeTruthy();
        expect(column.kind).toBeTruthy();
      });
    });
  });
});
