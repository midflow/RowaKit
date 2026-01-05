/**
 * StylingDemo Code - Custom CSS theming
 * Shows: CSS variables and design token customization
 */

export const code = `import { RowaKitTable, col } from '@rowakit/table';
import type { Fetcher } from '@rowakit/table';

interface DataItem {
  id: string;
  name: string;
  value: number;
}

// Custom CSS variables in your stylesheet
const customStyles = \`
  :root {
    --rowakit-border-color: #e0e0e0;
    --rowakit-header-bg: #f5f5f5;
    --rowakit-hover-bg: #fafafa;
    --rowakit-text-color: #333;
    --rowakit-font-size: 14px;
    --rowakit-row-height: 44px;
  }
\`;

const fetchData: Fetcher<DataItem> = async (query) => {
  const items: DataItem[] = [];
  return { items, total: 0 };
};

export default function StyledTable() {
  return (
    <>
      <style>{customStyles}</style>
      <RowaKitTable
        fetcher={fetchData}
        columns={[
          col.text<DataItem>('name'),
          col.number<DataItem>('value'),
        ]}
        rowKey="id"
      />
    </>
  );
}`;
