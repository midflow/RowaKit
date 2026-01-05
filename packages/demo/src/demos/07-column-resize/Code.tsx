import { RowaKitTable, col } from '@rowakit/table';
import type { Fetcher } from '@rowakit/table';

interface DataPoint {
  id: string;
  metric: string;
  value: number;
}

const fetcher: Fetcher<DataPoint> = async (query) => {
  const response = await fetch('/api/metrics', {
    body: JSON.stringify(query),
  });
  return response.json();
};

export default function MyTable() {
  return (
    <RowaKitTable
      fetcher={fetcher}
      columns={[
        col.text<DataPoint>('metric', { sortable: true }),
        col.number<DataPoint>('value', {
          align: 'right',
          format: (v) => v.toLocaleString(),
        }),
      ]}
      rowKey="id"
    />
  );
}
