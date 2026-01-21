/**
 * QueryToolbar - Control and visualize query state
 * Part of @rowakit/table toolkit
 */

import React from 'react';
import './QueryToolbar.css';

export interface QueryToolbarProps {
	/** Current search query */
	searchQuery?: string;
	/** Search query change handler */
	onSearchChange?: (query: string) => void;
	/** Search placeholder text */
	searchPlaceholder?: string;
	/** Active filter count */
	activeFilterCount?: number;
	/** Filter button click handler */
	onFilterClick?: () => void;
	/** Sort info display */
	sortInfo?: string;
	/** Additional actions (e.g., refresh, export) */
	actions?: React.ReactNode;
	/** Custom className */
	className?: string;
}

/**
 * QueryToolbar component for controlling query state
 *
 * @example
 * ```tsx
 * <QueryToolbar
 *   searchQuery={search}
 *   onSearchChange={setSearch}
 *   activeFilterCount={2}
 *   onFilterClick={() => setFilterOpen(true)}
 *   sortInfo="Name (A→Z)"
 * />
 * ```
 */
export function QueryToolbar({
	searchQuery = '',
	onSearchChange,
	searchPlaceholder = 'Search...',
	activeFilterCount = 0,
	onFilterClick,
	sortInfo,
	actions,
	className,
}: QueryToolbarProps) {
	return (
		<div className={`rowakit-query-toolbar ${className || ''}`}>
			<div className="rowakit-query-toolbar-left">
				{/* Search Input */}
				{onSearchChange && (
					<div className="rowakit-query-search">
						<input
							type="text"
							value={searchQuery}
							onChange={(e) => onSearchChange(e.target.value)}
							placeholder={searchPlaceholder}
							className="rowakit-query-search-input"
						/>
						{searchQuery && (
							<button
								onClick={() => onSearchChange('')}
								className="rowakit-query-search-clear"
								aria-label="Clear search"
							>
								×
							</button>
						)}
					</div>
				)}

				{/* Filter Button */}
				{onFilterClick && (
					<button
						onClick={onFilterClick}
						className="rowakit-query-filter-btn"
						aria-label="Toggle filters"
					>
						🔍 Filters
						{activeFilterCount > 0 && (
							<span className="rowakit-query-filter-badge">{activeFilterCount}</span>
						)}
					</button>
				)}

				{/* Sort Info */}
				{sortInfo && <div className="rowakit-query-sort-info">↕️ {sortInfo}</div>}
			</div>

			{/* Right Actions */}
			{actions && <div className="rowakit-query-toolbar-right">{actions}</div>}
		</div>
	);
}
