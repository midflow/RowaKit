import React, { useState } from 'react';
import { RowaKitTable, QueryToolbar, ActionBar, col } from '@rowakit/table';
import type { Fetcher } from '@rowakit/table';
import './styles.css';

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

export default function ToolkitCombinedDemo() {
	const [search, setSearch] = useState('');
	const [selected, setSelected] = useState<string[]>([]);
	const [filterCount, setFilterCount] = useState(0);

	return (
		<div className="rowakit-toolkit-demo">
			<h2>Table Toolkit Combined Demo</h2>
			<p>
				This demo shows <strong>RowaKitTable + QueryToolbar + ActionBar</strong> working
				together as a complete toolkit for server-side data management.
			</p>

{/* Toolbar Container: QueryToolbar + ActionBar (2-row layout) */}
		<div className="rowakit-toolbar-container">
			{/* Row 1: QueryToolbar for query control */}
			<QueryToolbar
				searchQuery={search}
				onSearchChange={setSearch}
				searchPlaceholder="Search users..."
				activeFilterCount={filterCount}
				onFilterClick={() => setFilterCount(filterCount + 1)}
				sortInfo={selected.length > 0 ? undefined : 'Default sort'}
				actions={
					<button className="rowakit-toolbar-action-btn" onClick={() => alert('Exporting all users...')}>
						📥 Export All
					</button>
				}
			/>

			{/* Row 2: ActionBar for bulk operations (only visible when items selected) */}
			{selected.length > 0 && (
				<ActionBar
					selectedCount={selected.length}
					totalCount={mockUsers.length}
					actions={[
						{
							id: 'email',
							label: '📧 Email',
							onClick: () => alert(`Sending email to ${selected.length} users`),
						},
						{
							id: 'export',
							label: '📥 Export Selected',
							onClick: () => alert(`Exporting ${selected.length} users`),
						},
						{
							id: 'delete',
							label: '🗑️ Delete',
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
			)}
		</div>

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

			<div className="rowakit-toolkit-benefits">
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
