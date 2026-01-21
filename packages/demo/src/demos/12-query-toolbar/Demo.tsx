import React, { useState } from 'react';
import { QueryToolbar } from '@rowakit/table';

export default function QueryToolbarDemo() {
	const [search, setSearch] = useState('');
	const [filterCount, setFilterCount] = useState(0);

	return (
		<div style={{ padding: '20px' }}>
			<h2>QueryToolbar Standalone Demo</h2>
			<p>
				QueryToolbar is a <strong>table-adjacent component</strong> for controlling and
				visualizing query state. It can be used standalone or with RowaKitTable.
			</p>

			<QueryToolbar
				searchQuery={search}
				onSearchChange={setSearch}
				activeFilterCount={filterCount}
				onFilterClick={() => setFilterCount(filterCount + 1)}
				sortInfo="Name (A→Z)"
				actions={
					<>
						<button
							style={{
								padding: '8px 12px',
								border: '1px solid #d1d5db',
								borderRadius: '4px',
								background: 'white',
								cursor: 'pointer',
							}}
						>
							🔄 Refresh
						</button>
						<button
							style={{
								padding: '8px 12px',
								border: '1px solid #d1d5db',
								borderRadius: '4px',
								background: 'white',
								cursor: 'pointer',
							}}
						>
							📥 Export
						</button>
					</>
				}
			/>

			<div style={{ marginTop: '20px', padding: '16px', background: '#f9fafb', borderRadius: '6px' }}>
				<h3>State (for demonstration):</h3>
				<p>
					<strong>Search:</strong> {search || '(empty)'}
				</p>
				<p>
					<strong>Filter count:</strong> {filterCount}
				</p>
			</div>

			<div style={{ marginTop: '20px' }}>
				<h3>Features:</h3>
				<ul>
					<li>Search input with clear button</li>
					<li>Filter button with badge count</li>
					<li>Sort info display</li>
					<li>Custom action buttons (refresh, export, etc.)</li>
				</ul>
			</div>
		</div>
	);
}
