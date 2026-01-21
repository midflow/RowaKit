import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryToolbar } from './query-toolbar/QueryToolbar';
import { ActionBar } from './action-bar/ActionBar';

function Harness() {
	const [search, setSearch] = useState('');
	const [selected, setSelected] = useState<string[]>([]);
	const [filterCount, setFilterCount] = useState(0);

	const row1Selected = selected.includes('1');

	return (
		<div>
			<QueryToolbar
				searchQuery={search}
				onSearchChange={setSearch}
				searchPlaceholder="Search users..."
				activeFilterCount={filterCount}
				onFilterClick={() => setFilterCount((c) => c + 1)}
				sortInfo={selected.length > 0 ? undefined : 'Default sort'}
				actions={<button type="button">Export All</button>}
			/>

			<ActionBar
				selectedCount={selected.length}
				totalCount={50}
				actions={[
					{
						id: 'email',
						label: 'Email',
						onClick: () => {},
					},
				]}
				onClearSelection={() => setSelected([])}
			/>

			<label>
				<input
					type="checkbox"
					aria-label="Select row 1"
					checked={row1Selected}
					onChange={(e) => setSelected(e.target.checked ? ['1'] : [])}
				/>
				Select row 1
			</label>
		</div>
	);
}

describe('ToolkitCombined (QueryToolbar + ActionBar)', () => {
	it('shows ActionBar when selection is non-empty and hides sortInfo', async () => {
		const user = userEvent.setup();
		render(<Harness />);

		// Initial state
		expect(screen.queryByText(/selected of/i)).toBeNull();
		expect(screen.getByText(/Default sort/i)).toBeDefined();

		// Select row
		await user.click(screen.getByLabelText('Select row 1'));
		expect(screen.getByText('1 selected of 50')).toBeDefined();
		expect(screen.queryByText(/Default sort/i)).toBeNull();
	});

	it('clears selection via ActionBar and shows sortInfo again', async () => {
		const user = userEvent.setup();
		render(<Harness />);

		await user.click(screen.getByLabelText('Select row 1'));
		expect(screen.getByText('1 selected of 50')).toBeDefined();

		await user.click(screen.getByRole('button', { name: 'Clear' }));
		expect(screen.queryByText('1 selected of 50')).toBeNull();
		expect(screen.getByText(/Default sort/i)).toBeDefined();

		const checkbox = screen.getByLabelText('Select row 1') as HTMLInputElement;
		expect(checkbox.checked).toBe(false);
	});

	it('wires core QueryToolbar interactions (search clear + filter count)', async () => {
		const user = userEvent.setup();
		render(<Harness />);

		const input = screen.getByPlaceholderText('Search users...') as HTMLInputElement;
		await user.type(input, 'alice');
		expect(input.value).toBe('alice');

		await user.click(screen.getByLabelText('Clear search'));
		expect(input.value).toBe('');

		await user.click(screen.getByLabelText('Toggle filters'));
		expect(screen.getByText('1')).toBeDefined();
	});

	it('invokes bulk action button click from ActionBar', async () => {
		const user = userEvent.setup();
		const onEmail = vi.fn();

		function ActionHarness() {
			const [selected, setSelected] = useState<string[]>(['1']);
			return (
				<div>
					<ActionBar
						selectedCount={selected.length}
						totalCount={50}
						actions={[{ id: 'email', label: 'Email', onClick: onEmail }]}
						onClearSelection={() => setSelected([])}
					/>
				</div>
			);
		}

		render(<ActionHarness />);
		await user.click(screen.getByRole('button', { name: 'Email' }));
		expect(onEmail).toHaveBeenCalledTimes(1);
	});
});
