import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActionBar } from './ActionBar';

describe('ActionBar', () => {
	describe('Visibility & Rendering', () => {
		it('does not render when selectedCount is 0', () => {
			const { container } = render(<ActionBar selectedCount={0} />);
			expect(container.firstChild).toBeNull();
		});

		it('renders when selectedCount is greater than 0', () => {
			const { container } = render(<ActionBar selectedCount={1} />);
			expect(container.firstChild).not.toBeNull();
		});

		it('hides when selectedCount changes from positive to 0', () => {
			const { container, rerender } = render(<ActionBar selectedCount={5} />);

			expect(container.firstChild).not.toBeNull();

			rerender(<ActionBar selectedCount={0} />);

			expect(container.firstChild).toBeNull();
		});

		it('renders with correct CSS class', () => {
			const { container } = render(<ActionBar selectedCount={1} />);
			const actionBar = container.firstChild;

			expect(actionBar?.className).toContain('rowakit-action-bar');
		});

		it('applies custom className', () => {
			const { container } = render(<ActionBar selectedCount={1} className="custom-class" />);
			const actionBar = container.firstChild;

			expect(actionBar?.className).toContain('custom-class');
		});
	});

	describe('Selection Count Display', () => {
		it('displays selection count', () => {
			render(<ActionBar selectedCount={5} />);
			expect(screen.getByText('5 selected')).toBeDefined();
		});

		it('displays correct count for single selection', () => {
			render(<ActionBar selectedCount={1} />);
			expect(screen.getByText('1 selected')).toBeDefined();
		});

		it('displays large selection count', () => {
			render(<ActionBar selectedCount={9999} />);
			expect(screen.getByText('9999 selected')).toBeDefined();
		});

		it('updates display when selectedCount changes', () => {
			const { rerender } = render(<ActionBar selectedCount={5} />);

			expect(screen.getByText('5 selected')).toBeDefined();

			rerender(<ActionBar selectedCount={10} />);

			expect(screen.queryByText('5 selected')).toBeNull();
			expect(screen.getByText('10 selected')).toBeDefined();
		});

		it('displays total count when provided', () => {
			render(<ActionBar selectedCount={5} totalCount={100} />);
			expect(screen.getByText('5 selected of 100')).toBeDefined();
		});

		it('displays correct format with total count', () => {
			render(<ActionBar selectedCount={25} totalCount={1000} />);
			expect(screen.getByText('25 selected of 1000')).toBeDefined();
		});

		it('updates total count on prop change', () => {
			const { rerender } = render(<ActionBar selectedCount={5} totalCount={100} />);

			expect(screen.getByText('5 selected of 100')).toBeDefined();

			rerender(<ActionBar selectedCount={5} totalCount={200} />);

			expect(screen.getByText('5 selected of 200')).toBeDefined();
		});
	});

	describe('Clear Selection', () => {
		it('renders clear button', () => {
			render(<ActionBar selectedCount={5} onClearSelection={() => {}} />);
			const clearBtn = screen.getByText('Clear');
			expect(clearBtn).toBeDefined();
		});

		it('calls onClearSelection when clear button clicked', async () => {
			const user = userEvent.setup();
			const handleClear = vi.fn();

			render(<ActionBar selectedCount={5} onClearSelection={handleClear} />);

			await user.click(screen.getByText('Clear'));
			expect(handleClear).toHaveBeenCalled();
		});

		it('calls onClearSelection only once per click', async () => {
			const user = userEvent.setup();
			const handleClear = vi.fn();

			render(<ActionBar selectedCount={5} onClearSelection={handleClear} />);

			const clearBtn = screen.getByText('Clear');
			await user.click(clearBtn);

			expect(handleClear).toHaveBeenCalledTimes(1);
		});

		it('does not render clear button when onClearSelection not provided', () => {
			render(<ActionBar selectedCount={5} />);
			const clearBtn = screen.queryByText('Clear');
			expect(clearBtn).toBeNull();
		});

		it('clear button is keyboard accessible', () => {
			render(<ActionBar selectedCount={5} onClearSelection={() => {}} />);

			const clearBtn = screen.getByText('Clear') as HTMLButtonElement;
			expect(clearBtn.tagName).toBe('BUTTON');
			expect(clearBtn.disabled).toBe(false);
		});
	});

	describe('Action Buttons', () => {
		it('renders action buttons', () => {
			const actions = [
				{ id: 'delete', label: 'Delete', onClick: vi.fn(), variant: 'danger' as const },
			];

			render(<ActionBar selectedCount={3} actions={actions} />);

			expect(screen.getByText('Delete')).toBeDefined();
		});

		it('renders multiple actions', () => {
			const actions = [
				{ id: 'export', label: 'Export', onClick: vi.fn() },
				{ id: 'delete', label: 'Delete', onClick: vi.fn(), variant: 'danger' as const },
			];

			render(<ActionBar selectedCount={3} actions={actions} />);

			expect(screen.getByText('Export')).toBeDefined();
			expect(screen.getByText('Delete')).toBeDefined();
		});

		it('calls action onClick when clicked', async () => {
			const user = userEvent.setup();
			const handleDelete = vi.fn();
			const actions = [{ id: 'delete', label: 'Delete', onClick: handleDelete }];

			render(<ActionBar selectedCount={3} actions={actions} />);

			await user.click(screen.getByText('Delete'));
			expect(handleDelete).toHaveBeenCalled();
		});

		it('calls correct action onClick for multiple actions', async () => {
			const user = userEvent.setup();
			const handleExport = vi.fn();
			const handleDelete = vi.fn();

			const actions = [
				{ id: 'export', label: 'Export', onClick: handleExport },
				{ id: 'delete', label: 'Delete', onClick: handleDelete },
			];

			render(<ActionBar selectedCount={3} actions={actions} />);

			await user.click(screen.getByText('Export'));
			expect(handleExport).toHaveBeenCalled();
			expect(handleDelete).not.toHaveBeenCalled();

			await user.click(screen.getByText('Delete'));
			expect(handleDelete).toHaveBeenCalled();
		});

		it('disables action button when disabled prop is true', () => {
			const actions = [{ id: 'delete', label: 'Delete', onClick: vi.fn(), disabled: true }];

			render(<ActionBar selectedCount={3} actions={actions} />);

			const button = screen.getByText('Delete') as HTMLButtonElement;
			expect(button.disabled).toBe(true);
		});

		it('enables action button when disabled prop is false', () => {
			const actions = [{ id: 'delete', label: 'Delete', onClick: vi.fn(), disabled: false }];

			render(<ActionBar selectedCount={3} actions={actions} />);

			const button = screen.getByText('Delete') as HTMLButtonElement;
			expect(button.disabled).toBe(false);
		});

		it('disables action dynamically based on conditions', () => {
			const actions = [
				{
					id: 'export',
					label: 'Export',
					onClick: vi.fn(),
					disabled: false,
				},
			];

			const { rerender } = render(<ActionBar selectedCount={3} actions={actions} />);

			let button = screen.getByText('Export') as HTMLButtonElement;
			expect(button.disabled).toBe(false);

			rerender(
				<ActionBar
					selectedCount={3}
					actions={[
						{
							id: 'export',
							label: 'Export',
							onClick: vi.fn(),
							disabled: true,
						},
					]}
				/>
			);

			button = screen.getByText('Export') as HTMLButtonElement;
			expect(button.disabled).toBe(true);
		});

		it('handles no actions gracefully', () => {
			const { container } = render(<ActionBar selectedCount={5} actions={[]} />);

			const actionBar = container.querySelector('.rowakit-action-bar');
			expect(actionBar).not.toBeNull();
			expect(screen.getByText('5 selected')).toBeDefined();
		});
	});

	describe('Action Variants', () => {
		it('applies default variant styling', () => {
			const actions = [
				{
					id: 'export',
					label: 'Export',
					onClick: vi.fn(),
					variant: 'default' as const,
				},
			];

			const { container } = render(<ActionBar selectedCount={3} actions={actions} />);

			const button = container.querySelector('.rowakit-action-bar-btn-default');
			expect(button).toBeDefined();
		});

		it('applies danger variant styling', () => {
			const actions = [
				{ id: 'delete', label: 'Delete', onClick: vi.fn(), variant: 'danger' as const },
			];

			const { container } = render(<ActionBar selectedCount={3} actions={actions} />);

			const button = container.querySelector('.rowakit-action-bar-btn-danger');
			expect(button).toBeDefined();
		});

		it('renders multiple actions with different variants', () => {
			const actions = [
				{ id: 'export', label: 'Export', onClick: vi.fn(), variant: 'default' as const },
				{ id: 'delete', label: 'Delete', onClick: vi.fn(), variant: 'danger' as const },
			];

			const { container } = render(<ActionBar selectedCount={3} actions={actions} />);

			expect(container.querySelector('.rowakit-action-bar-btn-default')).toBeDefined();
			expect(container.querySelector('.rowakit-action-bar-btn-danger')).toBeDefined();
		});
	});

	describe('Accessibility', () => {
		it('action buttons are keyboard accessible', () => {
			const actions = [{ id: 'export', label: 'Export', onClick: vi.fn() }];

			render(<ActionBar selectedCount={5} actions={actions} />);

			const exportBtn = screen.getByText('Export') as HTMLButtonElement;
			expect(exportBtn.tagName).toBe('BUTTON');
			expect(exportBtn.disabled).toBe(false);
		});

		it('supports keyboard navigation between buttons', () => {
			const actions = [
				{ id: 'export', label: 'Export', onClick: vi.fn() },
				{ id: 'delete', label: 'Delete', onClick: vi.fn() },
			];

			render(<ActionBar selectedCount={3} actions={actions} onClearSelection={() => {}} />);

			const clearBtn = screen.getByText('Clear') as HTMLButtonElement;
			const exportBtn = screen.getByText('Export') as HTMLButtonElement;
			const deleteBtn = screen.getByText('Delete') as HTMLButtonElement;

			expect(clearBtn.tagName).toBe('BUTTON');
			expect(exportBtn.tagName).toBe('BUTTON');
			expect(deleteBtn.tagName).toBe('BUTTON');

			expect(clearBtn.disabled).toBe(false);
			expect(exportBtn.disabled).toBe(false);
			expect(deleteBtn.disabled).toBe(false);
		});

		it('disabled button is not keyboard accessible', () => {
			const actions = [
				{
					id: 'delete',
					label: 'Delete',
					onClick: vi.fn(),
					disabled: true,
				},
			];

			render(<ActionBar selectedCount={3} actions={actions} />);

			const button = screen.getByText('Delete') as HTMLButtonElement;
			expect(button.disabled).toBe(true);
		});
	});

	describe('Edge Cases', () => {
		it('handles selectedCount of 1', () => {
			render(<ActionBar selectedCount={1} />);
			expect(screen.getByText('1 selected')).toBeDefined();
		});

		it('handles very large selectedCount', () => {
			render(<ActionBar selectedCount={999999} />);
			expect(screen.getByText('999999 selected')).toBeDefined();
		});

		it('handles selectedCount greater than totalCount', () => {
			render(<ActionBar selectedCount={100} totalCount={50} />);
			expect(screen.getByText('100 selected of 50')).toBeDefined();
		});

		it('handles selectedCount equal to totalCount', () => {
			render(<ActionBar selectedCount={50} totalCount={50} />);
			expect(screen.getByText('50 selected of 50')).toBeDefined();
		});

		it('handles rapid selection changes', () => {
			const { rerender } = render(<ActionBar selectedCount={0} />);

			// Show when selected
			rerender(<ActionBar selectedCount={5} />);
			expect(screen.getByText('5 selected')).toBeDefined();

			// Hide when no selection
			rerender(<ActionBar selectedCount={0} />);
			expect(screen.queryByText('5 selected')).toBeNull();

			// Show again
			rerender(<ActionBar selectedCount={3} />);
			expect(screen.getByText('3 selected')).toBeDefined();
		});

		it('handles action list updates', () => {
			const actions1 = [
				{ id: 'export', label: 'Export', onClick: vi.fn() },
			];

			const { rerender } = render(
				<ActionBar selectedCount={5} actions={actions1} />
			);

			expect(screen.getByText('Export')).toBeDefined();
			expect(screen.queryByText('Delete')).toBeNull();

			const actions2 = [
				{ id: 'export', label: 'Export', onClick: vi.fn() },
				{ id: 'delete', label: 'Delete', onClick: vi.fn() },
			];

			rerender(<ActionBar selectedCount={5} actions={actions2} />);

			expect(screen.getByText('Export')).toBeDefined();
			expect(screen.getByText('Delete')).toBeDefined();
		});

		it('handles all props provided simultaneously', () => {
			const handleClear = vi.fn();
			const handleExport = vi.fn();

			const actions = [
				{ id: 'export', label: 'Export', onClick: handleExport },
			];

			render(
				<ActionBar
					selectedCount={25}
					totalCount={100}
					actions={actions}
					onClearSelection={handleClear}
					className="custom"
				/>
			);

			expect(screen.getByText('25 selected of 100')).toBeDefined();
			expect(screen.getByText('Clear')).toBeDefined();
			expect(screen.getByText('Export')).toBeDefined();
		});
	});
});
