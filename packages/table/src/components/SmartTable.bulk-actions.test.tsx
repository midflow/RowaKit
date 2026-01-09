/**
 * @fileoverview Tests for SmartTable bulk actions (Stage E / PRD-E2)
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
];

describe('SmartTable - Bulk Actions (PRD-E2)', () => {
	it('invokes bulk action with selected keys', async () => {
		const user = userEvent.setup();
		const onClick = vi.fn();

		const fetcher: Fetcher<User> = vi.fn(async () => ({ items: users, total: 2 }));

		render(
			<SmartTable
				fetcher={fetcher}
				columns={[col.text<User>('name')]}
				rowKey="id"
				enableRowSelection
				bulkActions={[{ id: 'archive', label: 'Archive', onClick }]}
			/>,
		);

		await waitFor(() => {
			expect(screen.getByText('Alice')).toBeDefined();
		});

		await user.click(screen.getByRole('checkbox', { name: 'Select row 1' }));

		await user.click(screen.getByRole('button', { name: 'Archive' }));

		expect(onClick).toHaveBeenCalledWith(['1']);
	});

	it('shows confirm modal and respects cancel/confirm', async () => {
		const user = userEvent.setup();
		const onClick = vi.fn();

		const fetcher: Fetcher<User> = vi.fn(async () => ({ items: users, total: 2 }));

		render(
			<SmartTable
				fetcher={fetcher}
				columns={[col.text<User>('name')]}
				rowKey="id"
				enableRowSelection
				bulkActions={[
					{
						id: 'delete',
						label: 'Delete',
						confirm: { title: 'Confirm delete', description: 'Delete selected rows?' },
						onClick,
					},
				]}
			/>,
		);

		await waitFor(() => {
			expect(screen.getByText('Alice')).toBeDefined();
		});

		await user.click(screen.getByRole('checkbox', { name: 'Select row 1' }));
		await user.click(screen.getByRole('button', { name: 'Delete' }));

		expect(screen.getByRole('dialog')).toBeDefined();
		expect(screen.getByText('Confirm delete')).toBeDefined();

		await user.click(screen.getByRole('button', { name: 'Cancel' }));
		expect(onClick).not.toHaveBeenCalled();

		// Open again and confirm
		await user.click(screen.getByRole('button', { name: 'Delete' }));
		await user.click(screen.getByRole('button', { name: 'Confirm' }));
		expect(onClick).toHaveBeenCalledWith(['1']);
	});
});
