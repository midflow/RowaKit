/**
 * @fileoverview Tests for SmartTable row selection (Stage E / PRD-E1)
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SmartTable } from './SmartTable';
import { col } from '../column-helpers';
import type { Fetcher } from '../types';

interface User {
	id: string;
	name: string;
}

const users: User[] = [
	{ id: '1', name: 'Alice' },
	{ id: '2', name: 'Bob' },
	{ id: '3', name: 'Charlie' },
	{ id: '4', name: 'Diana' },
];

describe('SmartTable - Row Selection (PRD-E1)', () => {
	it('selects and unselects a single row', async () => {
		const user = userEvent.setup();
		const onSelectionChange = vi.fn();

		const fetcher: Fetcher<User> = vi.fn(async () => ({
			items: users.slice(0, 2),
			total: 2,
		}));

		render(
			<SmartTable
				fetcher={fetcher}
				columns={[col.text<User>('name')]}
				rowKey="id"
				enableRowSelection
				onSelectionChange={onSelectionChange}
			/>,
		);

		await waitFor(() => {
			expect(screen.getByText('Alice')).toBeDefined();
		});

		const row1 = screen.getByRole('checkbox', { name: 'Select row 1' });
		await user.click(row1);

		await waitFor(() => {
			expect(onSelectionChange).toHaveBeenLastCalledWith(['1']);
		});

		await user.click(row1);
		await waitFor(() => {
			expect(onSelectionChange).toHaveBeenLastCalledWith([]);
		});
	});

	it('selects all rows on current page only', async () => {
		const user = userEvent.setup();
		const onSelectionChange = vi.fn();

		const fetcher: Fetcher<User> = vi.fn(async ({ page, pageSize }) => {
			const start = (page - 1) * pageSize;
			const end = start + pageSize;
			return {
				items: users.slice(start, end),
				total: users.length,
			};
		});

		render(
			<SmartTable
				fetcher={fetcher}
				columns={[col.text<User>('name')]}
				rowKey="id"
				defaultPageSize={2}
				enableRowSelection
				onSelectionChange={onSelectionChange}
			/>,
		);

		// Page 1
		await waitFor(() => {
			expect(fetcher).toHaveBeenCalledWith({ page: 1, pageSize: 2 });
		});

		const selectAll = screen.getByRole('checkbox', { name: 'Select all rows' });
		await user.click(selectAll);

		await waitFor(() => {
			expect(onSelectionChange).toHaveBeenLastCalledWith(['1', '2']);
		});

		// Go to page 2 (selection should reset)
		await user.click(screen.getByRole('button', { name: 'Next page' }));
		await waitFor(() => {
			expect(fetcher).toHaveBeenCalledWith({ page: 2, pageSize: 2 });
		});

		await waitFor(() => {
			expect(onSelectionChange).toHaveBeenLastCalledWith([]);
		});

		// Select all on page 2
		const selectAll2 = screen.getByRole('checkbox', { name: 'Select all rows' });
		await user.click(selectAll2);

		await waitFor(() => {
			expect(onSelectionChange).toHaveBeenLastCalledWith(['3', '4']);
		});
	});

	it('resets selection on pagination', async () => {
		const user = userEvent.setup();

		const fetcher: Fetcher<User> = vi.fn(async ({ page, pageSize }) => {
			const start = (page - 1) * pageSize;
			const end = start + pageSize;
			return {
				items: users.slice(start, end),
				total: users.length,
			};
		});

		render(
			<SmartTable
				fetcher={fetcher}
				columns={[col.text<User>('name')]}
				rowKey="id"
				defaultPageSize={2}
				enableRowSelection
			/>,
		);

		await waitFor(() => {
			expect(screen.getByText('Alice')).toBeDefined();
		});

		const row1 = screen.getByRole('checkbox', { name: 'Select row 1' }) as HTMLInputElement;
		await user.click(row1);
		expect(row1.checked).toBe(true);

		await user.click(screen.getByRole('button', { name: 'Next page' }));
		await waitFor(() => {
			expect(screen.getByText('Charlie')).toBeDefined();
		});

		// On page 2, ensure selection is cleared
		const row3 = screen.getByRole('checkbox', { name: 'Select row 3' }) as HTMLInputElement;
		expect(row3.checked).toBe(false);
	});
});
