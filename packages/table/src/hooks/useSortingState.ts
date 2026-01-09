import type { FetcherQuery } from '../types';

export function useSortingState(
	query: FetcherQuery,
	setQuery: React.Dispatch<React.SetStateAction<FetcherQuery>>,
) {
	const handleSort = (field: string, isMultiSort: boolean = false) => {
		setQuery((prev) => {
			const currentSorts = prev.sorts || [];
			const existingSort = currentSorts.find((s) => s.field === field);

			// Single sort mode (default click)
			if (!isMultiSort) {
				if (existingSort?.priority === 0) {
					// Toggle direction if it's the primary sort
					if (existingSort.direction === 'asc') {
						return {
							...prev,
							sorts: [{ field, direction: 'desc', priority: 0 }],
							page: 1,
						};
					}
					// Remove primary sort if it was descending
					return {
						...prev,
						sorts: [],
						page: 1,
					};
				}
				// Set as primary sort
				return {
					...prev,
					sorts: [{ field, direction: 'asc', priority: 0 }],
					page: 1,
				};
			}

			// Multi sort mode (Ctrl/Cmd + click)
			if (existingSort) {
				// Toggle direction if shift-clicking on existing sort
				const newSorts = currentSorts.map((s) =>
					s.field === field
						? { ...s, direction: s.direction === 'asc' ? 'desc' : 'asc' }
						: s,
				);
				return { ...prev, sorts: newSorts, page: 1 };
			}

			// Add as secondary sort with next priority
			const nextPriority = currentSorts.length;
			const newSorts = [...currentSorts, { field, direction: 'asc', priority: nextPriority }];
			return { ...prev, sorts: newSorts, page: 1 };
		});
	};

	const getSortIndicator = (field: string): string => {
		const sorts = query.sorts || [];
		const sort = sorts.find((s) => s.field === field);

		if (!sort) {
			return '';
		}

		const directionIcon = sort.direction === 'asc' ? ' ↑' : ' ↓';
		const priorityLabel = sort.priority === 0 ? '' : ` [${sort.priority + 1}]`;
		return directionIcon + priorityLabel;
	};

	const getSortPriority = (field: string): number | null => {
		const sorts = query.sorts || [];
		const sort = sorts.find((s) => s.field === field);
		return sort ? sort.priority : null;
	};

	return { handleSort, getSortIndicator, getSortPriority };
}
