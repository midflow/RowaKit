import { RowaKitTable, col } from '@rowakit/table';
import type { Fetcher, FetcherQuery } from '@rowakit/table';
import { useEffect, useState } from 'react';

interface Article {
  id: string;
  title: string;
  author: string;
}

const fetcher: Fetcher<Article> = async (query) => {
  const params = new URLSearchParams();
  params.set('page', String(query.page));
  params.set('pageSize', String(query.pageSize));
  const response = await fetch(`/api/articles?${params}`);
  return response.json();
};

export default function MyTable() {
  const [query] = useState<FetcherQuery>({ page: 1, pageSize: 5 });

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
        col.text<Article>('title', { sortable: true }),
        col.text<Article>('author'),
      ]}
      rowKey="id"
    />
  );
}
