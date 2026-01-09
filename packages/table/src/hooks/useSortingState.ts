import type { FetcherQuery, SortColumn } from '../types';

export function useSortingState(
	query: FetcherQuery,
	setQuery: React.Dispatch<React.SetStateAction<FetcherQuery>>,
) {
	const handleSort = (field: string, isMultiSort: boolean = false) => {
		setQuery((prev): FetcherQuery => {
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
					const { sorts: _removed, ...rest } = prev;
					return {
						...rest,
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
				const newSorts: SortColumn[] = currentSorts.map((s) => {
					if (s.field === field) {
						const newDirection: 'asc' | 'desc' = s.direction === 'asc' ? 'desc' : 'asc';
						return { ...s, direction: newDirection };
					}
					return s;
				});
				return { ...prev, sorts: newSorts, page: 1 };
			}

			// Add as secondary sort with next priority
			const nextPriority = currentSorts.length;
			const newSorts: SortColumn[] = [...currentSorts, { field, direction: 'asc', priority: nextPriority }];
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
