import { RowaKitTable, col } from '@rowakit/table';
import type { Fetcher, FetcherQuery } from '@rowakit/table';
import { useEffect, useState } from 'react';

interface Order {
  id: string;
  customer: string;
  amount: number;
  status: string;
}

const fetcher: Fetcher<Order> = async (query) => {
  const response = await fetch('/api/orders', {
    body: JSON.stringify(query),
  });
  return response.json();
};

export default function MyTable() {
  const [query] = useState<FetcherQuery>({ page: 1, pageSize: 5 });

  // Sync to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (query.page !== 1) params.set('page', String(query.page));
    const url = params.toString() ? `?${params}` : '';
    window.history.replaceState(null, '', url || window.location.pathname);
  }, [query]);

  return (
    <RowaKitTable
      fetcher={fetcher}
      columns={[
        col.text<Order>('customer', { sortable: true }),
        col.text<Order>('status'),
        col.number<Order>('amount', { align: 'right' }),
      ]}
      rowKey="id"
    />
  );
}
