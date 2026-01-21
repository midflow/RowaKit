import React, { useState } from 'react';
import { RowaKitTable, QueryToolbar, ActionBar, col } from '@rowakit/table';
import type { Fetcher } from '@rowakit/table';

interface User {
	id: string;
	name: string;
	email: string;
	department: string;
}

const mockUsers: User[] = Array.from({ length: 50 }, (_, i) => ({
	id: String(i + 1),
	name: `User ${i + 1}`,
	email: `user${i + 1}@example.com`,
	department: ['Engineering', 'Sales', 'Marketing', 'Support'][i % 4],
}));

const fetchUsers: Fetcher<User> = async ({ page, pageSize }) => {
	// Simulate network delay
	await new Promise((r) => setTimeout(r, 300));

	const start = (page - 1) * pageSize;
	return {
		items: mockUsers.slice(start, start + pageSize),
		total: mockUsers.length,
	};
};

export default function ToolkitCombinedCode() {
	const [search, setSearch] = useState('');
	const [selected, setSelected] = useState<string[]>([]);
	const [filterCount, setFilterCount] = useState(0);

	return (
		<div style={{ padding: '20px' }}>
			<h2>Table Toolkit Combined Demo</h2>
			<p>
				This demo shows <strong>RowaKitTable + QueryToolbar + ActionBar</strong> working
				together as a complete toolkit for server-side data management.
			</p>

			{/* QueryToolbar for query control */}
			<QueryToolbar
				searchQuery={search}
				onSearchChange={setSearch}
				searchPlaceholder="Search users..."
				activeFilterCount={filterCount}
				onFilterClick={() => setFilterCount(filterCount + 1)}
				sortInfo={selected.length > 0 ? undefined : 'Default sort'}
				actions={
					<button
						style={{
							padding: '8px 12px',
							border: '1px solid #d1d5db',
							borderRadius: '4px',
							background: 'white',
							cursor: 'pointer',
						}}
						onClick={() => alert('Exporting all users...')}
					>
						📥 Export All
					</button>
				}
			/>

			{/* ActionBar for bulk operations */}
			<ActionBar
				selectedCount={selected.length}
				totalCount={mockUsers.length}
				actions={[
					{
						id: 'email',
						label: `📧 Email ${selected.length}`,
						onClick: () => alert(`Sending email to ${selected.length} users`),
					},
					{
						id: 'export',
						label: '📥 Export Selected',
						onClick: () => alert(`Exporting ${selected.length} users`),
					},
					{
						id: 'delete',
						label: `🗑️ Delete ${selected.length}`,
						onClick: () => {
							if (confirm(`Delete ${selected.length} users?`)) {
								alert('Deleted!');
								setSelected([]);
							}
						},
						variant: 'danger',
					},
				]}
				onClearSelection={() => setSelected([])}
			/>

			{/* RowaKitTable for data display */}
			<RowaKitTable
				fetcher={fetchUsers}
				rowKey="id"
				columns={[
					col.text('name', { header: 'Name', sortable: true }),
					col.text('email', { header: 'Email' }),
					col.text('department', { header: 'Department' }),
				]}
				enableRowSelection
				onSelectionChange={setSelected}
				defaultPageSize={10}
			/>

			<div style={{ marginTop: '20px', padding: '16px', background: '#f9fafb', borderRadius: '6px' }}>
				<h3>Toolkit Benefits:</h3>
				<ul>
					<li>
						<strong>QueryToolbar:</strong> Centralized query controls (search, filters, sort,
						actions)
					</li>
					<li>
						<strong>ActionBar:</strong> Clear selection state with bulk operations
					</li>
					<li>
						<strong>RowaKitTable:</strong> Server-side pagination, sorting, selection
					</li>
					<li>
						<strong>Composable:</strong> Use standalone or together, consumer orchestrates state
					</li>
				</ul>
			</div>
		</div>
	);
}
