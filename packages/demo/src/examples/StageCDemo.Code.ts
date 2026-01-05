/**
 * StageCDemo Code - v0.4.0 features
 * Shows: column resizing, URL sync, saved views
 */

export const code = `import { RowaKitTable, col } from '@rowakit/table';
import type { Fetcher, TableState } from '@rowakit/table';
import { useEffect, useState } from 'react';

interface Item {
  id: string;
  name: string;
  value: number;
}

const fetchItems: Fetcher<Item> = async (query) => {
  const items: Item[] = [];
  return { items, total: 0 };
};

export default function StageCExample() {
  const [state, setState] = useState<TableState>({
    page: 1,
    pageSize: 10,
  });

  // Sync with URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setState((prev) => ({
      ...prev,
      page: parseInt(params.get('page') || '1'),
      pageSize: parseInt(params.get('pageSize') || '10'),
    }));
  }, []);

  const handleStateChange = (newState: TableState) => {
    setState(newState);
    const params = new URLSearchParams();
    params.set('page', String(newState.page));
    params.set('pageSize', String(newState.pageSize));
    window.history.pushState({}, '', \`?\${params}\`);
  };

  return (
    <RowaKitTable
      fetcher={fetchItems}
      state={state}
      onStateChange={handleStateChange}
      columns={[
        col.text<Item>('name', {
          resizable: true,
          minWidth: 100,
          maxWidth: 400,
        }),
        col.number<Item>('value', { resizable: true }),
      ]}
      rowKey="id"
      enableResizing
    />
  );
}`;
