/**
 * Demo 07: Column Sizing
 * Shows how to configure static column widths and alignment
 */

import { RowaKitTable, col } from '@rowakit/table';
import type { Fetcher } from '@rowakit/table';

interface DataPoint {
  id: string;
  metric: string;
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  total: number;
}

const MOCK_DATA: DataPoint[] = [
  { id: '1', metric: 'Revenue', q1: 10000, q2: 12000, q3: 15000, q4: 18000, total: 55000 },
  { id: '2', metric: 'Users', q1: 500, q2: 650, q3: 800, q4: 950, total: 2900 },
  { id: '3', metric: 'Engagement', q1: 65, q2: 72, q3: 78, q4: 85, total: 300 },
];

const fetcher: Fetcher<DataPoint> = async (query) => {
  await new Promise((r) => setTimeout(r, 300));
  const start = (query.page - 1) * query.pageSize;
  return {
    items: MOCK_DATA.slice(start, start + query.pageSize),
    total: MOCK_DATA.length,
  };
};

export default function ColumnSizingDemo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ backgroundColor: '#f0f9ff', padding: '12px', borderRadius: '6px', fontSize: '13px' }}>
        <strong>Demo Notes:</strong> This demo shows how to configure table layout with balanced column widths. Notice the column proportions and alignment.
      </div>

      <RowaKitTable
        fetcher={fetcher}
        columns={[
          col.text<DataPoint>('metric', { header: 'Metric', sortable: true }),
          col.number<DataPoint>('q1', { header: 'Q1', align: 'right', format: (v) => v.toLocaleString() }),
          col.number<DataPoint>('q2', { header: 'Q2', align: 'right', format: (v) => v.toLocaleString() }),
          col.number<DataPoint>('q3', { header: 'Q3', align: 'right', format: (v) => v.toLocaleString() }),
          col.number<DataPoint>('q4', { header: 'Q4', align: 'right', format: (v) => v.toLocaleString() }),
          col.number<DataPoint>('total', { header: 'Total', align: 'right', format: (v) => v.toLocaleString(), sortable: true }),
        ]}
        rowKey="id"
        defaultPageSize={10}
      />
    </div>
  );
}
