import { describe, it, expect, expectTypeOf } from 'vitest';
import type {
  Fetcher,
  FetcherQuery,
  FetcherResult,
  ColumnDef,
  ActionDef,
  TextColumnDef,
  DateColumnDef,
  BooleanColumnDef,
  ActionsColumnDef,
  CustomColumnDef,
} from '../types';

// Sample data type for testing
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  active: boolean;
}

describe('Core Types', () => {
  describe('Fetcher types', () => {
    it('FetcherQuery has correct shape', () => {
      const query: FetcherQuery = {
        page: 1,
        pageSize: 20,
        sort: { field: 'name', direction: 'asc' },
        filters: { status: 'active' },
      };

      expect(query.page).toBe(1);
      expect(query.pageSize).toBe(20);
      expect(query.sort?.field).toBe('name');
      expect(query.sort?.direction).toBe('asc');
      expect(query.filters?.status).toBe('active');
    });

    it('FetcherQuery works without optional fields', () => {
      const query: FetcherQuery = {
        page: 1,
        pageSize: 20,
      };

      expect(query.sort).toBeUndefined();
      expect(query.filters).toBeUndefined();
    });

    it('FetcherResult has correct shape', () => {
      const result: FetcherResult<User> = {
        items: [
          {
            id: '1',
            name: 'Alice',
            email: 'alice@example.com',
            createdAt: new Date(),
            active: true,
          },
        ],
        total: 100,
      };

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(100);
    });

    it('Fetcher function type works correctly', () => {
      const fetchUsers: Fetcher<User> = async (query) => {
        expectTypeOf(query).toMatchTypeOf<FetcherQuery>();
        return {
          items: [],
          total: 0,
        };
      };

      expectTypeOf(fetchUsers).toBeFunction();
      expectTypeOf(fetchUsers).parameter(0).toMatchTypeOf<FetcherQuery>();
      expectTypeOf(fetchUsers)
        .returns.resolves.toMatchTypeOf<FetcherResult<User>>();
    });
  });

  describe('Column types', () => {
    it('TextColumnDef has correct shape', () => {
      const column: TextColumnDef<User> = {
        id: 'name',
        kind: 'text',
        field: 'name',
        header: 'Name',
        sortable: true,
      };

      expect(column.kind).toBe('text');
      expect(column.field).toBe('name');
      expect(column.sortable).toBe(true);
    });

    it('DateColumnDef has correct shape', () => {
      const column: DateColumnDef<User> = {
        id: 'createdAt',
        kind: 'date',
        field: 'createdAt',
        header: 'Created',
        format: (date) => new Date(date).toLocaleDateString(),
      };

      expect(column.kind).toBe('date');
      expect(column.field).toBe('createdAt');
      expect(column.format).toBeTypeOf('function');
    });

    it('BooleanColumnDef has correct shape', () => {
      const column: BooleanColumnDef<User> = {
        id: 'active',
        kind: 'boolean',
        field: 'active',
        header: 'Active',
      };

      expect(column.kind).toBe('boolean');
      expect(column.field).toBe('active');
    });

    it('ActionsColumnDef has correct shape', () => {
      const column: ActionsColumnDef<User> = {
        id: 'actions',
        kind: 'actions',
        actions: [
          {
            id: 'edit',
            label: 'Edit',
            onClick: (row) => {
              expectTypeOf(row).toMatchTypeOf<User>();
            },
          },
        ],
      };

      expect(column.kind).toBe('actions');
      expect(column.actions).toHaveLength(1);
    });

    it('CustomColumnDef has correct shape', () => {
      const column: CustomColumnDef<User> = {
        id: 'custom',
        kind: 'custom',
        field: 'name',
        render: (row) => {
          expectTypeOf(row).toMatchTypeOf<User>();
          return row.name.toUpperCase();
        },
      };

      expect(column.kind).toBe('custom');
      expect(column.render).toBeTypeOf('function');
    });

    it('ColumnDef union type works correctly', () => {
      const columns: ColumnDef<User>[] = [
        { id: 'name', kind: 'text', field: 'name' },
        { id: 'createdAt', kind: 'date', field: 'createdAt' },
        { id: 'active', kind: 'boolean', field: 'active' },
        {
          id: 'actions',
          kind: 'actions',
          actions: [{ id: 'edit', label: 'Edit', onClick: () => {} }],
        },
        {
          id: 'custom',
          kind: 'custom',
          field: 'name',
          render: (row) => row.name,
        },
      ];

      expect(columns).toHaveLength(5);
      expect(columns[0]?.kind).toBe('text');
      expect(columns[1]?.kind).toBe('date');
      expect(columns[2]?.kind).toBe('boolean');
      expect(columns[3]?.kind).toBe('actions');
      expect(columns[4]?.kind).toBe('custom');
    });
  });

  describe('Action types', () => {
    it('ActionDef has correct shape', () => {
      const action: ActionDef<User> = {
        id: 'delete',
        label: 'Delete',
        icon: 'trash',
        confirm: true,
        onClick: async (row) => {
          expectTypeOf(row).toMatchTypeOf<User>();
          // Perform delete operation
          void row.id;
        },
      };

      expect(action.id).toBe('delete');
      expect(action.label).toBe('Delete');
      expect(action.confirm).toBe(true);
      expect(action.onClick).toBeTypeOf('function');
    });

    it('ActionDef works with minimal properties', () => {
      const action: ActionDef<User> = {
        id: 'view',
        label: 'View',
        onClick: () => {},
      };

      expect(action.id).toBe('view');
      expect(action.confirm).toBeUndefined();
      expect(action.icon).toBeUndefined();
    });

    it('ActionDef supports disabled function', () => {
      const action: ActionDef<User> = {
        id: 'edit',
        label: 'Edit',
        onClick: () => {},
        disabled: (row) => !row.active,
      };

      expect(action.disabled).toBeTypeOf('function');
    });
  });

  describe('Type safety', () => {
    it('enforces field types from data model', () => {
      // This should compile - 'name' is a valid User field
      const validColumn: TextColumnDef<User> = {
        id: 'name',
        kind: 'text',
        field: 'name',
      };
      expect(validColumn.field).toBe('name');

      // TypeScript should prevent invalid fields
      // @ts-expect-error - 'invalidField' is not a key of User
      const invalidColumn: TextColumnDef<User> = {
        id: 'invalid',
        kind: 'text',
        field: 'invalidField',
      };
      expect(invalidColumn).toBeDefined();
    });

    it('Fetcher return type is enforced', async () => {
      const fetcher: Fetcher<User> = async () => {
        // Return type must match FetcherResult<User>
        return {
          items: [
            {
              id: '1',
              name: 'Test',
              email: 'test@example.com',
              createdAt: new Date(),
              active: true,
            },
          ],
          total: 1,
        };
      };

      const result = await fetcher({ page: 1, pageSize: 20 });
      expectTypeOf(result).toMatchTypeOf<FetcherResult<User>>();
    });
  });
});
