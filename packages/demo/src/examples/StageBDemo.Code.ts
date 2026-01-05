/**
 * StageBDemo Code - v0.2.2 features
 * Shows: badge columns, number formatting, server-side filters
 */

export const code = `import { RowaKitTable, col } from '@rowakit/table';
import type { Fetcher } from '@rowakit/table';

interface Item {
  id: string;
  status: 'active' | 'pending' | 'inactive';
  rating: number;
  count: number;
}

const fetchItems: Fetcher<Item> = async (query) => {
  const items: Item[] = [];
  return { items, total: 0 };
};

export default function StageBExample() {
  return (
    <RowaKitTable
      fetcher={fetchItems}
      columns={[
        // Badge column (v0.2.2)
        col.badge<Item>('status', {
          variants: {
            active: { bg: '#d4edda', color: '#155724' },
            pending: { bg: '#fff3cd', color: '#856404' },
            inactive: { bg: '#f8d7da', color: '#721c24' },
          },
        }),
        
        // Number formatting (v0.2.2)
        col.number<Item>('rating', {
          format: (v) => v.toFixed(2),
        }),
        
        col.number<Item>('count', {
          format: (v) => v.toLocaleString(),
          align: 'right',
        }),
      ]}
      rowKey="id"
    />
  );
}`;
