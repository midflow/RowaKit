/**
 * Demo 05: URL Synchronization
 * Shows how to sync table state with URL query parameters for shareable links
 */

import { RowaKitTable, col } from '@rowakit/table';
import type { Fetcher } from '@rowakit/table';

interface Article {
  id: string;
  title: string;
  author: string;
  views: number;
}

const MOCK_ARTICLES: Article[] = [
  { id: '1', title: 'React Best Practices', author: 'Alice', views: 5420 },
  { id: '2', title: 'TypeScript Tips', author: 'Bob', views: 3210 },
  { id: '3', title: 'CSS Grid Guide', author: 'Charlie', views: 4120 },
  { id: '4', title: 'Testing Strategies', author: 'Diana', views: 2950 },
  { id: '5', title: 'Performance Optimization', author: 'Eve', views: 6800 },
  { id: '6', title: 'Web Security 101', author: 'Frank', views: 4500 },
];

const fetchArticles: Fetcher<Article> = async (query) => {
  await new Promise((r) => setTimeout(r, 300));
  let data = [...MOCK_ARTICLES];

  if (query.sort) {
    data.sort((a, b) => {
      const av = a[query.sort!.field as keyof Article];
      const bv = b[query.sort!.field as keyof Article];
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

export default function UrlSyncDemo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ backgroundColor: '#f0f9ff', padding: '12px', borderRadius: '6px', fontSize: '13px' }}>
        <strong>Demo Notes:</strong> Try sorting or changing pages, then copy the URL to share a bookmarkable link. URL params: page, pageSize, sortField, sortDirection
      </div>

      <RowaKitTable
        fetcher={fetchArticles}
        columns={[
          col.text<Article>('title', { header: 'Title', sortable: true }),
          col.text<Article>('author', { header: 'Author', sortable: true }),
          col.number<Article>('views', { header: 'Views', sortable: true, align: 'right', format: (v) => v.toLocaleString() }),
        ]}
        rowKey="id"
        defaultPageSize={10}
        syncToUrl={true}
      />
    </div>
  );
}
