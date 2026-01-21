/**
 * ActionBar - Selection summary + bulk action triggers
 * Part of @rowakit/table toolkit
 */

import './ActionBar.css';

export interface ActionBarAction {
	id: string;
	label: string;
	onClick: () => void;
	variant?: 'default' | 'danger';
	disabled?: boolean;
}

export interface ActionBarProps {
	/** Number of selected items */
	selectedCount: number;
	/** Total items available */
	totalCount?: number;
	/** Bulk actions */
	actions?: ActionBarAction[];
	/** Clear selection handler */
	onClearSelection?: () => void;
	/** Custom className */
	className?: string;
}

/**
 * ActionBar component for displaying selection and bulk actions
 *
 * @example
 * ```tsx
 * <ActionBar
 *   selectedCount={5}
 *   totalCount={100}
 *   actions={[
 *     { id: 'delete', label: 'Delete', onClick: handleDelete, variant: 'danger' }
 *   ]}
 *   onClearSelection={() => setSelected([])}
 * />
 * ```
 */
export function ActionBar({
	selectedCount,
	totalCount,
	actions = [],
	onClearSelection,
	className,
}: ActionBarProps) {
	if (selectedCount === 0) {
		return null;
	}

	return (
		<div className={`rowakit-action-bar ${className || ''}`}>
			<div className="rowakit-action-bar-left">
				<span className="rowakit-action-bar-count">
					{selectedCount} selected
					{totalCount && ` of ${totalCount}`}
				</span>
				{onClearSelection && (
					<button onClick={onClearSelection} className="rowakit-action-bar-clear">
						Clear
					</button>
				)}
			</div>

			{actions.length > 0 && (
				<div className="rowakit-action-bar-actions">
					{actions.map((action) => (
						<button
							key={action.id}
							onClick={action.onClick}
							disabled={action.disabled}
							className={`rowakit-action-bar-btn rowakit-action-bar-btn-${action.variant || 'default'}`}
						>
							{action.label}
						</button>
					))}
				</div>
			)}
		</div>
	);
}
