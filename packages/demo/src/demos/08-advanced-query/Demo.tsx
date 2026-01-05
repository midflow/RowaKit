/**
 * Demo 08: Advanced Patterns
 * Shows combining filters, URL sync, saved views, and proper error handling
 */

import { RowaKitTable, col } from '@rowakit/table';
import type { Fetcher, FilterValue } from '@rowakit/table';

interface Order {
  id: string;
  customer: string;
  status: 'pending' | 'shipped' | 'delivered';
  amount: number;
  date: string;
}

const MOCK_ORDERS: Order[] = [
  { id: '1', customer: 'Acme Inc', status: 'delivered', amount: 5000, date: '2024-02-01' },
  { id: '2', customer: 'TechCorp', status: 'shipped', amount: 8000, date: '2024-02-05' },
  { id: '3', customer: 'GlobalTrade', status: 'pending', amount: 12000, date: '2024-02-10' },
  { id: '4', customer: 'StartupXYZ', status: 'delivered', amount: 3000, date: '2024-02-12' },
  { id: '5', customer: 'Enterprise Ltd', status: 'pending', amount: 25000, date: '2024-02-15' },
];

const fetcher: Fetcher<Order> = async (query) => {
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 400));

  // Simulate occasional errors (5% chance)
  if (Math.random() < 0.05) {
    throw new Error('Server error: Failed to fetch orders');
  }

  let data = [...MOCK_ORDERS];

  // Apply filters (server-side style)
  if (query.filters) {
    const applyFilter = (row: Order, field: keyof Order, filter: FilterValue): boolean => {
      const value = row[field] as unknown;

      if (filter.op === 'contains') {
        return String(value ?? '').toLowerCase().includes(filter.value.toLowerCase());
      }

      if (filter.op === 'equals') {
        return String(value ?? '') === String(filter.value ?? '');
      }

      if (filter.op === 'in') {
        return filter.value.map(String).includes(String(value ?? ''));
      }

      if (filter.op === 'range') {
        const from = filter.value.from;
        const to = filter.value.to;

        // amount is numeric, date is an ISO string; handle both.
        if (field === 'amount') {
          const n = Number(value);
          const fromN = from == null ? undefined : Number(from);
          const toN = to == null ? undefined : Number(to);
          if (Number.isFinite(fromN as number) && n < (fromN as number)) return false;
          if (Number.isFinite(toN as number) && n > (toN as number)) return false;
          return true;
        }

        if (field === 'date') {
          const d = String(value);
          const fromS = from == null ? undefined : String(from);
          const toS = to == null ? undefined : String(to);
          if (fromS && d < fromS) return false;
          if (toS && d > toS) return false;
          return true;
        }

        // Fallback: compare as strings
        const s = String(value ?? '');
        const fromS = from == null ? undefined : String(from);
        const toS = to == null ? undefined : String(to);
        if (fromS && s < fromS) return false;
        if (toS && s > toS) return false;
        return true;
      }

      return true;
    };

    for (const [field, filter] of Object.entries(query.filters)) {
      if (!filter) continue;
      const key = field as keyof Order;
      data = data.filter((row) => applyFilter(row, key, filter));
    }
  }

  // Apply sorting
  if (query.sort) {
    data.sort((a, b) => {
      const av = a[query.sort!.field as keyof Order];
      const bv = b[query.sort!.field as keyof Order];
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return query.sort!.direction === 'asc' ? cmp : -cmp;
    });
  }

  const start = (query.page - 1) * query.pageSize;
  return {
    items: data.slice(start, start + query.pageSize),
    total: data.length,
  };
};

export default function AdvancedQueryDemo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ backgroundColor: '#f0f9ff', padding: '12px', borderRadius: '6px', fontSize: '13px' }}>
        <strong>Demo Notes:</strong> Advanced patterns combined:
        <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
          <li>URL sync: page/sort/filters → URL query string</li>
          <li>Saved views: Save/load state to localStorage</li>
          <li>Column resizing: Drag header resize handles</li>
          <li>Filters: Enable filters UI and apply server-side</li>
          <li>Error handling: Simulated random server errors (5% rate)</li>
        </ul>
      </div>

      <RowaKitTable
        fetcher={fetcher}
        columns={[
          col.text<Order>('customer', { header: 'Customer', sortable: true, width: 220, truncate: true }),
          col.text<Order>('status', { header: 'Status', sortable: true, width: 130 }),
          col.number<Order>('amount', {
            header: 'Amount',
            sortable: true,
            align: 'right',
            width: 140,
            format: (v) => `$${v.toLocaleString()}`,
          }),
          col.text<Order>('date', { header: 'Date', sortable: true, width: 130 }),
        ]}
        rowKey="id"
        defaultPageSize={10}
        enableFilters={true}
        enableSavedViews={true}
        enableColumnResizing={true}
        syncToUrl={true}
      />
    </div>
  );
}
