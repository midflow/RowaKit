/**
 * @fileoverview Tests for SmartTable CSV export (Stage E / PRD-E3)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SmartTable } from './SmartTable';
import { col } from '../column-helpers';
import type { Fetcher } from '../types';
import type { Exporter } from '../types/export';

interface User {
	id: string;
	name: string;
}

const users: User[] = [
	{ id: '1', name: 'Alice' },
	{ id: '2', name: 'Bob' },
];

describe('SmartTable - Export CSV (PRD-E3)', () => {
	beforeEach(() => {
		// prevent actual navigation
		vi.stubGlobal('open', vi.fn());
	});

	it('invokes exporter with current query snapshot', async () => {
		const user = userEvent.setup();
		const fetcher: Fetcher<User> = vi.fn(async () => ({ items: users, total: 2 }));
		const exporter: Exporter = vi.fn(async () => ({ url: 'https://example.com/export.csv' }));

		render(
			<SmartTable
				fetcher={fetcher}
				columns={[col.text<User>('name')]}
				rowKey="id"
				defaultPageSize={10}
				exporter={exporter}
			/>,
		);

		await waitFor(() => {
			expect(screen.getByText('Alice')).toBeDefined();
		});

		await user.click(screen.getByRole('button', { name: 'Export CSV' }));

		await waitFor(() => {
			expect(exporter).toHaveBeenCalledWith({ page: 1, pageSize: 10 });
		});
	});

	it('shows error message when export fails', async () => {
		const user = userEvent.setup();
		const fetcher: Fetcher<User> = vi.fn(async () => ({ items: users, total: 2 }));
		const exporter: Exporter = vi.fn(async () => {
			throw new Error('Boom');
		});

		render(
			<SmartTable
				fetcher={fetcher}
				columns={[col.text<User>('name')]}
				rowKey="id"
				exporter={exporter}
			/>,
		);

		await waitFor(() => {
			expect(screen.getByText('Alice')).toBeDefined();
		});

		await user.click(screen.getByRole('button', { name: 'Export CSV' }));

		await waitFor(() => {
			expect(screen.getByText('Boom')).toBeDefined();
		});
	});
});
