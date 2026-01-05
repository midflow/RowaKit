import { RowaKitTable, col } from '@rowakit/table';
import type { Fetcher, FetcherQuery } from '@rowakit/table';
import { useState } from 'react';

interface Task {
  id: string;
  title: string;
  priority: string;
}

const fetcher: Fetcher<Task> = async (query) => {
  const response = await fetch('/api/tasks', {
    body: JSON.stringify(query),
  });
  return response.json();
};

const STORAGE_KEY = 'my-views';

export default function MyTable() {
  const [query, setQuery] = useState<FetcherQuery>({ page: 1, pageSize: 5 });
  const [views, setViews] = useState<{ name: string; query: FetcherQuery }[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  });
  const [viewName, setViewName] = useState('');

  const saveView = () => {
    if (!viewName.trim()) return;
    const updated = [...views.filter((v) => v.name !== viewName), { name: viewName, query }];
    setViews(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setViewName('');
  };

  const loadView = (name: string) => {
    const view = views.find((v) => v.name === name);
    if (view) setQuery(view.query);
  };

  return (
    <div>
      <input value={viewName} onChange={(e) => setViewName(e.target.value)} placeholder="View name" />
      <button onClick={saveView}>Save</button>

      {views.map((v) => (
        <button key={v.name} onClick={() => loadView(v.name)}>
          {v.name}
        </button>
      ))}

      <RowaKitTable
        fetcher={fetcher}
        columns={[
          col.text<Task>('title', { sortable: true }),
          col.text<Task>('priority'),
        ]}
        rowKey="id"
      />
    </div>
  );
}
