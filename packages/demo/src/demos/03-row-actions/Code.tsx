import { RowaKitTable, col } from '@rowakit/table';
import type { Fetcher } from '@rowakit/table';

interface User {
  id: string;
  name: string;
  email: string;
}

const fetcher: Fetcher<User> = async (query) => {
  const response = await fetch('/api/users', {
    body: JSON.stringify(query),
  });
  return response.json();
};

const handleArchive = async (user: User): Promise<void> => {
  const response = await fetch(`/api/users/${user.id}/archive`, {
    method: 'POST',
  });
  if (response.ok) {
    alert(`Archived: ${user.name}`);
  }
};

export default function MyTable() {
  return (
    <RowaKitTable
      fetcher={fetcher}
      columns={[
        col.text<User>('name', { sortable: true }),
        col.text<User>('email'),
        col.actions<User>([
          {
            id: 'archive',
            label: 'Archive',
            onClick: handleArchive,
          },
        ]),
      ]}
      rowKey="id"
    />
  );
}
