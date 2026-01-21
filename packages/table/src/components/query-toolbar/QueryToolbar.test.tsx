import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryToolbar } from './QueryToolbar';

describe('QueryToolbar', () => {
	describe('Search Functionality', () => {
		it('renders search input', () => {
			const handleChange = vi.fn();
			render(<QueryToolbar searchQuery="" onSearchChange={handleChange} />);

			expect(screen.getByPlaceholderText('Search...')).toBeDefined();
		});

		it('calls onSearchChange when typing', async () => {
			const user = userEvent.setup();
			const handleChange = vi.fn();

			render(<QueryToolbar searchQuery="" onSearchChange={handleChange} />);

			const input = screen.getByPlaceholderText('Search...');
			await user.type(input, 'test');

			expect(handleChange).toHaveBeenCalled();
		});

		it('displays current search value', () => {
			render(<QueryToolbar searchQuery="current value" onSearchChange={() => {}} />);

			const input = screen.getByPlaceholderText('Search...') as HTMLInputElement;
			expect(input.value).toBe('current value');
		});

		it('clears search when clear button clicked', async () => {
			const user = userEvent.setup();
			const handleChange = vi.fn();

			render(<QueryToolbar searchQuery="test" onSearchChange={handleChange} />);

			const clearBtn = screen.getByLabelText('Clear search');
			await user.click(clearBtn);

			expect(handleChange).toHaveBeenCalledWith('');
		});

		it('hides clear button when search is empty', () => {
			render(<QueryToolbar searchQuery="" onSearchChange={() => {}} />);

			const clearBtn = screen.queryByLabelText('Clear search');
			expect(clearBtn).toBeNull();
		});

		it('shows clear button when search has value', () => {
			render(<QueryToolbar searchQuery="test" onSearchChange={() => {}} />);

			const clearBtn = screen.getByLabelText('Clear search');
			expect(clearBtn).toBeDefined();
		});

		it('supports custom search placeholder', () => {
			render(
				<QueryToolbar
					searchQuery=""
					onSearchChange={() => {}}
					searchPlaceholder="Search users..."
				/>
			);

			expect(screen.getByPlaceholderText('Search users...')).toBeDefined();
		});
	});

	describe('Filter Functionality', () => {
		it('displays active filter count', () => {
			render(<QueryToolbar activeFilterCount={3} onFilterClick={() => {}} />);

			expect(screen.getByText('3')).toBeDefined();
		});

		it('calls onFilterClick when filter button clicked', async () => {
			const user = userEvent.setup();
			const handleClick = vi.fn();

			render(<QueryToolbar onFilterClick={handleClick} activeFilterCount={0} />);

			const filterBtn = screen.getByLabelText('Toggle filters');
			await user.click(filterBtn);

			expect(handleClick).toHaveBeenCalled();
		});

		it('shows filter badge with count > 0', () => {
			render(<QueryToolbar onFilterClick={() => {}} activeFilterCount={5} />);

			expect(screen.getByText('5')).toBeDefined();
		});

		it('hides filter badge when count is 0', () => {
			render(<QueryToolbar onFilterClick={() => {}} activeFilterCount={0} />);

			const badge = screen.queryByText('0');
			expect(badge).toBeNull();
		});

		it('updates filter badge on prop change', () => {
			const { rerender } = render(
				<QueryToolbar onFilterClick={() => {}} activeFilterCount={2} />
			);

			expect(screen.getByText('2')).toBeDefined();

			rerender(<QueryToolbar onFilterClick={() => {}} activeFilterCount={5} />);

			expect(screen.getByText('5')).toBeDefined();
		});
	});

	describe('Sort Display', () => {
		it('displays sort info when provided', () => {
			render(<QueryToolbar sortInfo="Name (A→Z)" />);
			expect(screen.getByText(/Name \(A→Z\)/)).toBeDefined();
		});

		it('hides sort info when not provided', () => {
			const { container } = render(<QueryToolbar />);
			const sortInfo = container.querySelector('.rowakit-query-sort-info');
			expect(sortInfo).toBeNull();
		});

		it('updates sort info on prop change', () => {
			const { rerender } = render(<QueryToolbar sortInfo="Name (A→Z)" />);

			expect(screen.getByText(/Name \(A→Z\)/)).toBeDefined();

			rerender(<QueryToolbar sortInfo="Date (Newest)" />);

			expect(screen.getByText(/Date \(Newest\)/)).toBeDefined();
		});
	});

	describe('Custom Actions', () => {
		it('renders custom actions', () => {
			render(<QueryToolbar actions={<button>Export</button>} />);

			expect(screen.getByText('Export')).toBeDefined();
		});

		it('renders multiple custom actions', () => {
			render(
				<QueryToolbar
					actions={
						<>
							<button>Export</button>
							<button>Refresh</button>
						</>
					}
				/>
			);

			expect(screen.getByText('Export')).toBeDefined();
			expect(screen.getByText('Refresh')).toBeDefined();
		});

		it('does not render actions section when no actions provided', () => {
			const { container } = render(<QueryToolbar />);
			const actionBtns = container.querySelectorAll('button');

			// Should only have filter button (if any), no export/refresh etc
			expect(actionBtns.length).toBeLessThanOrEqual(1);
		});

		it('allows clicking custom action buttons', async () => {
			const user = userEvent.setup();
			const handleExport = vi.fn();

			render(<QueryToolbar actions={<button onClick={handleExport}>Export</button>} />);

			const exportBtn = screen.getByText('Export');
			await user.click(exportBtn);

			expect(handleExport).toHaveBeenCalled();
		});
	});

	describe('Styling & Accessibility', () => {
		it('renders with correct CSS class', () => {
			const { container } = render(<QueryToolbar />);
			const toolbar = container.firstChild;

			expect(toolbar?.className).toContain('rowakit-query-toolbar');
		});

		it('applies custom className', () => {
			const { container } = render(<QueryToolbar className="custom-class" />);
			const toolbar = container.firstChild;

			expect(toolbar?.className).toContain('custom-class');
		});

		it('search input is keyboard accessible', () => {
			render(<QueryToolbar searchQuery="" onSearchChange={() => {}} />);

			const input = screen.getByPlaceholderText('Search...') as HTMLInputElement;
			expect(input.tagName).toBe('INPUT');
			expect(input.type).toBe('text');
		});

		it('filter button is keyboard accessible', () => {
			render(<QueryToolbar onFilterClick={() => {}} activeFilterCount={0} />);

			const filterBtn = screen.getByLabelText('Toggle filters');
			expect(filterBtn.tagName).toBe('BUTTON');
		});
	});

	describe('Edge Cases', () => {
		it('handles empty search query', () => {
			render(<QueryToolbar searchQuery="" onSearchChange={() => {}} />);

			const input = screen.getByPlaceholderText('Search...') as HTMLInputElement;
			expect(input.value).toBe('');
		});

		it('handles very long search query', () => {
			const longQuery = 'a'.repeat(500);
			render(<QueryToolbar searchQuery={longQuery} onSearchChange={() => {}} />);

			const input = screen.getByPlaceholderText('Search...') as HTMLInputElement;
			expect(input.value).toBe(longQuery);
		});

		it('handles special characters in search', async () => {
			const user = userEvent.setup();
			const handleChange = vi.fn();

			render(<QueryToolbar searchQuery="" onSearchChange={handleChange} />);

			const input = screen.getByPlaceholderText('Search...');
			await user.type(input, '@#$%^&*()');

			expect(handleChange).toHaveBeenCalled();
		});

		it('handles rapid filter count changes', () => {
			const { rerender } = render(
				<QueryToolbar activeFilterCount={0} onFilterClick={() => {}} />
			);

			for (let i = 1; i <= 10; i++) {
				rerender(<QueryToolbar activeFilterCount={i} onFilterClick={() => {}} />);
				expect(screen.getByText(i.toString())).toBeDefined();
			}
		});

		it('handles all props being provided simultaneously', () => {
			const handleSearchChange = vi.fn();
			const handleFilterClick = vi.fn();

			render(
				<QueryToolbar
					searchQuery="test"
					onSearchChange={handleSearchChange}
					activeFilterCount={3}
					onFilterClick={handleFilterClick}
					sortInfo="Name (A→Z)"
					actions={<button>Export</button>}
					className="custom"
				/>
			);

			expect(screen.getByPlaceholderText('Search...')).toBeDefined();
			expect(screen.getByText('3')).toBeDefined();
			expect(screen.getByText(/Name \(A→Z\)/)).toBeDefined();
			expect(screen.getByText('Export')).toBeDefined();
		});
	});
});
