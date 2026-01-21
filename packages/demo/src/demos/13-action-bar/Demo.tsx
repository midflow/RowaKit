import React, { useState } from 'react';
import { ActionBar } from '@rowakit/table';

export default function ActionBarDemo() {
	const [selected, setSelected] = useState(5);

	return (
		<div style={{ padding: '20px' }}>
			<h2>ActionBar Standalone Demo</h2>
			<p>
				ActionBar is a <strong>table-adjacent component</strong> for displaying selection
				summary and bulk action triggers. It can be used standalone or with RowaKitTable.
			</p>

			<ActionBar
				selectedCount={selected}
				totalCount={100}
				actions={[
					{
						id: 'export',
						label: '📥 Export Selected',
						onClick: () => alert(`Exporting ${selected} items`),
					},
					{
						id: 'archive',
						label: '📦 Archive',
						onClick: () => alert(`Archiving ${selected} items`),
					},
					{
						id: 'delete',
						label: '🗑️ Delete',
						onClick: () => {
							if (confirm(`Delete ${selected} items?`)) {
								alert('Deleted!');
								setSelected(0);
							}
						},
						variant: 'danger',
					},
				]}
				onClearSelection={() => setSelected(0)}
			/>

			<div style={{ marginTop: '20px', padding: '16px', background: '#f9fafb', borderRadius: '6px' }}>
				<h3>Simulate selection:</h3>
				<div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
					<button
						onClick={() => setSelected(1)}
						style={{
							padding: '8px 16px',
							border: '1px solid #d1d5db',
							borderRadius: '4px',
							background: 'white',
							cursor: 'pointer',
						}}
					>
						Select 1
					</button>
					<button
						onClick={() => setSelected(5)}
						style={{
							padding: '8px 16px',
							border: '1px solid #d1d5db',
							borderRadius: '4px',
							background: 'white',
							cursor: 'pointer',
						}}
					>
						Select 5
					</button>
					<button
						onClick={() => setSelected(10)}
						style={{
							padding: '8px 16px',
							border: '1px solid #d1d5db',
							borderRadius: '4px',
							background: 'white',
							cursor: 'pointer',
						}}
					>
						Select 10
					</button>
					<button
						onClick={() => setSelected(0)}
						style={{
							padding: '8px 16px',
							border: '1px solid #d1d5db',
							borderRadius: '4px',
							background: 'white',
							cursor: 'pointer',
						}}
					>
						Clear
					</button>
				</div>
			</div>

			<div style={{ marginTop: '20px' }}>
				<h3>Features:</h3>
				<ul>
					<li>Selection count display (with optional total)</li>
					<li>Clear selection button</li>
					<li>Multiple bulk actions with variants (default, danger)</li>
					<li>Disabled state support</li>
					<li>Auto-hides when selection is empty</li>
				</ul>
			</div>
		</div>
	);
}
