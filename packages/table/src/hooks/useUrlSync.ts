import { useEffect, useRef, useCallback } from 'react';
import type { ColumnDef, FetcherQuery, FilterValue, SortColumn } from '../types';

function parseUrlState(
	params: URLSearchParams,
	defaultPageSize: number,
	pageSizeOptions?: number[],
): {
	page: number;
	pageSize: number;
	sort?: { field: string; direction: 'asc' | 'desc' };
	sorts?: SortColumn[];
	filters?: Record<string, FilterValue | undefined>;
	columnWidths?: Record<string, number>;
} {
	const pageStr = params.get('page');
	let page = 1;
	if (pageStr) {
		const parsed = parseInt(pageStr, 10);
		page = !isNaN(parsed) && parsed >= 1 ? parsed : 1;
	}

	const pageSizeStr = params.get('pageSize');
	let pageSize = defaultPageSize;
	if (pageSizeStr) {
		const parsed = parseInt(pageSizeStr, 10);
		if (!isNaN(parsed) && parsed >= 1) {
			if (pageSizeOptions && pageSizeOptions.length > 0) {
				pageSize = pageSizeOptions.includes(parsed) ? parsed : defaultPageSize;
			} else {
				pageSize = parsed;
			}
		}
	}

	const result: {
		page: number;
		pageSize: number;
		sort?: { field: string; direction: 'asc' | 'desc' };
		sorts?: SortColumn[];
		filters?: Record<string, FilterValue | undefined>;
		columnWidths?: Record<string, number>;
	} = { page, pageSize };

	// PRD-E4: Support multi-sort via 'sorts' parameter
	const sortsStr = params.get('sorts');
	if (sortsStr) {
		try {
			const parsed = JSON.parse(sortsStr) as SortColumn[];
			if (Array.isArray(parsed) && parsed.every(s => typeof s.field === 'string' && (s.direction === 'asc' || s.direction === 'desc') && typeof s.priority === 'number')) {
				result.sorts = parsed;
			}
		} catch {
			// ignore
		}
	}

	// Backward compatibility: single sort in one param (e.g. sort=name:asc)
	// NOTE: This format is used by some consumers and UI harness tests.
	if (!result.sorts) {
		const sortStr = params.get('sort');
		if (sortStr) {
			const [field, dir] = sortStr.split(':');
			if (field && (dir === 'asc' || dir === 'desc')) {
				result.sort = { field, direction: dir };
				result.sorts = [{ field, direction: dir, priority: 0 }];
			}
		}
	}

	// Backward compatibility: single sort (two params)
	if (!result.sorts) {
		const sortField = params.get('sortField');
		const sortDir = params.get('sortDirection');
		if (sortField && (sortDir === 'asc' || sortDir === 'desc')) {
			result.sort = { field: sortField, direction: sortDir };
			result.sorts = [{ field: sortField, direction: sortDir, priority: 0 }];
		}
	}

	const filtersStr = params.get('filters');
	if (filtersStr) {
		try {
			const parsed = JSON.parse(filtersStr);
			if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
				result.filters = parsed;
			}
		} catch {
			// ignore
		}
	}

	const widthsStr = params.get('columnWidths');
	if (widthsStr) {
		try {
			const parsed = JSON.parse(widthsStr);
			if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
				const widths: Record<string, number> = {};
				for (const [key, value] of Object.entries(parsed)) {
					if (typeof value === 'number' && value > 0) {
						widths[key] = value;
					}
				}
				if (Object.keys(widths).length > 0) {
					result.columnWidths = widths;
				}
			}
		} catch {
			// ignore
		}
	}

	return result;
}

function serializeUrlState(
	query: FetcherQuery,
	filters: Record<string, FilterValue | undefined>,
	columnWidths: Record<string, number>,
	defaultPageSize: number,
	enableColumnResizing: boolean,
): string {
	const params = new URLSearchParams();
	params.set('page', String(query.page));

	if (query.pageSize !== defaultPageSize) {
		params.set('pageSize', String(query.pageSize));
	}

	// PRD-E4: Use 'sorts' array for multi-sort
	if (query.sorts && query.sorts.length > 0) {
		params.set('sorts', JSON.stringify(query.sorts));
	} else if (query.sort) {
		// Backward compatibility
		params.set('sortField', query.sort.field);
		params.set('sortDirection', query.sort.direction);
	}

	if (filters && Object.keys(filters).length > 0) {
		const nonEmptyFilters = Object.fromEntries(
			Object.entries(filters).filter(([, v]) => v !== undefined),
		);
		if (Object.keys(nonEmptyFilters).length > 0) {
			params.set('filters', JSON.stringify(nonEmptyFilters));
		}
	}

	if (enableColumnResizing && Object.keys(columnWidths).length > 0) {
		params.set('columnWidths', JSON.stringify(columnWidths));
	}

	return params.toString();
}

export function useUrlSync<T>({
	syncToUrl,
	enableColumnResizing,
	defaultPageSize,
	pageSizeOptions,
	columns,
	query,
	setQuery,
	filters,
	setFilters,
	columnWidths,
	setColumnWidths,
}: {
	syncToUrl: boolean;
	enableColumnResizing: boolean;
	defaultPageSize: number;
	pageSizeOptions?: number[];
	columns: ColumnDef<T>[];
	query: FetcherQuery;
	setQuery: React.Dispatch<React.SetStateAction<FetcherQuery>>;
	filters: Record<string, FilterValue | undefined>;
	setFilters: React.Dispatch<React.SetStateAction<Record<string, FilterValue | undefined>>>;
	columnWidths: Record<string, number>;
	setColumnWidths: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}) {
	const didHydrateUrlRef = useRef(false);
	const urlSyncDebounceRef = useRef<NodeJS.Timeout | null>(null);
	const isApplyingUrlStateRef = useRef(false);
	const clearApplyingTimerRef = useRef<NodeJS.Timeout | null>(null);
	const hasWrittenUrlRef = useRef(false);
	const lastQueryForUrlRef = useRef<FetcherQuery | null>(null);
	
	// Store props in refs to avoid unnecessary effect re-runs during hydration
	const defaultPageSizeRef = useRef(defaultPageSize);
	const pageSizeOptionsRef = useRef(pageSizeOptions);
	const enableColumnResizingRef = useRef(enableColumnResizing);
	const columnsRef = useRef(columns);
	
	// Keep refs updated
	defaultPageSizeRef.current = defaultPageSize;
	pageSizeOptionsRef.current = pageSizeOptions;
	enableColumnResizingRef.current = enableColumnResizing;
	columnsRef.current = columns;

	useEffect(() => {
		if (!syncToUrl) {
			hasWrittenUrlRef.current = false;
			lastQueryForUrlRef.current = null;
			return;
		}
		// Never write URL until we've hydrated state from the current URL.
		if (!didHydrateUrlRef.current) return;
		if (isApplyingUrlStateRef.current) return;

		if (urlSyncDebounceRef.current) {
			clearTimeout(urlSyncDebounceRef.current);
			urlSyncDebounceRef.current = null;
		}

		const urlStr = serializeUrlState(query, filters, columnWidths, defaultPageSizeRef.current, enableColumnResizingRef.current);
		const qs = urlStr ? `?${urlStr}` : '';
		const nextUrl = `${window.location.pathname}${qs}${window.location.hash}`;

		const prevQuery = lastQueryForUrlRef.current;
		const shouldPush =
			hasWrittenUrlRef.current &&
			prevQuery != null &&
			prevQuery.page !== query.page;

		if (shouldPush) {
			window.history.pushState(null, '', nextUrl);
		} else {
			window.history.replaceState(null, '', nextUrl);
		}

		hasWrittenUrlRef.current = true;
		lastQueryForUrlRef.current = query;
	}, [
		query,
		filters,
		syncToUrl,
		columnWidths,
	]);

	useEffect(() => {
		if (!syncToUrl || !enableColumnResizingRef.current) return;
		if (!didHydrateUrlRef.current) return;
		if (!hasWrittenUrlRef.current) return;
		if (isApplyingUrlStateRef.current) return;

		if (urlSyncDebounceRef.current) {
			clearTimeout(urlSyncDebounceRef.current);
		}

		urlSyncDebounceRef.current = setTimeout(() => {
			const urlStr = serializeUrlState(query, filters, columnWidths, defaultPageSizeRef.current, enableColumnResizingRef.current);
			const qs = urlStr ? `?${urlStr}` : '';
			window.history.replaceState(null, '', `${window.location.pathname}${qs}${window.location.hash}`);
			urlSyncDebounceRef.current = null;
		}, 150);

		return () => {
			if (urlSyncDebounceRef.current) {
				clearTimeout(urlSyncDebounceRef.current);
				urlSyncDebounceRef.current = null;
			}
		};
	}, [
		columnWidths,
		syncToUrl,
		query,
		filters,
	]);

	function scheduleClearApplyingFlag() {
		if (clearApplyingTimerRef.current) {
			clearTimeout(clearApplyingTimerRef.current);
			clearApplyingTimerRef.current = null;
		}
		clearApplyingTimerRef.current = setTimeout(() => {
			isApplyingUrlStateRef.current = false;
			clearApplyingTimerRef.current = null;
		}, 0);
	}

	const applyUrlToState = useCallback(() => {
		const params = new URLSearchParams(window.location.search);
		const parsed = parseUrlState(params, defaultPageSizeRef.current, pageSizeOptionsRef.current);

		const nextQuery: FetcherQuery = {
			page: parsed.page,
			pageSize: parsed.pageSize,
			sort: parsed.sort,
			sorts: parsed.sorts,
			filters: parsed.filters,
		};

		isApplyingUrlStateRef.current = true;
		scheduleClearApplyingFlag();

		setQuery(nextQuery);

		setFilters(parsed.filters ?? {});

		// Establish a canonical baseline URL immediately after hydration.
		// This guarantees there's a history entry for the initial state so that
		// later page changes can use pushState and browser back/forward works.
		if (!hasWrittenUrlRef.current) {
			const urlStr = serializeUrlState(
				nextQuery,
				parsed.filters ?? {},
				parsed.columnWidths ?? {},
				defaultPageSizeRef.current,
				enableColumnResizingRef.current,
			);
			const qs = urlStr ? `?${urlStr}` : '';
			window.history.replaceState(null, '', `${window.location.pathname}${qs}${window.location.hash}`);
			hasWrittenUrlRef.current = true;
			lastQueryForUrlRef.current = nextQuery;
		}

		if (enableColumnResizingRef.current && parsed.columnWidths) {
			const clamped: Record<string, number> = {};
			for (const [colId, rawWidth] of Object.entries(parsed.columnWidths)) {
				const widthNum = typeof rawWidth === 'number' ? rawWidth : Number(rawWidth);
				if (!Number.isFinite(widthNum)) continue;

				const colDef = columnsRef.current.find((c) => c.id === colId);
				if (!colDef) continue;

				const minW = colDef.minWidth ?? 80;
				const maxW = colDef.maxWidth;

				let finalW = Math.max(minW, widthNum);
				if (maxW != null) {
					finalW = Math.min(finalW, maxW);
				}
				clamped[colId] = finalW;
			}

			setColumnWidths(clamped);
		} else if (enableColumnResizingRef.current) {
			setColumnWidths({});
		}
	}, [setQuery, setFilters, setColumnWidths]);

	useEffect(() => {
		if (!syncToUrl) {
			didHydrateUrlRef.current = false;
			hasWrittenUrlRef.current = false;
			lastQueryForUrlRef.current = null;
			return;
		}
		if (didHydrateUrlRef.current) return;
		didHydrateUrlRef.current = true;

		applyUrlToState();
	}, [
		syncToUrl,
		setQuery,
		setFilters,
		setColumnWidths,
		applyUrlToState,
	]);

	useEffect(() => {
		if (!syncToUrl) return;

		const onPopState = () => {
			applyUrlToState();
		};

		window.addEventListener('popstate', onPopState);
		return () => {
			window.removeEventListener('popstate', onPopState);
		};
	}, [syncToUrl, setQuery, setFilters, setColumnWidths, applyUrlToState]);

	useEffect(() => {
		return () => {
			if (clearApplyingTimerRef.current) {
				clearTimeout(clearApplyingTimerRef.current);
				clearApplyingTimerRef.current = null;
			}
		};
	}, []);
}
