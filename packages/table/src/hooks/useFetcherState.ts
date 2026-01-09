import { useEffect, useRef, useState } from 'react';
import type { Fetcher, FetcherQuery } from '../types';

type FetchState = 'idle' | 'loading' | 'success' | 'empty' | 'error';

export interface DataState<T> {
	state: FetchState;
	items: T[];
	total: number;
	error?: string;
}

export function useFetcherState<T>(
	fetcher: Fetcher<T>,
	query: FetcherQuery,
	setQuery: (next: FetcherQuery) => void,
) {
	const [dataState, setDataState] = useState<DataState<T>>({
		state: 'idle',
		items: [],
		total: 0,
	});

	const requestIdRef = useRef(0);

	useEffect(() => {
		const currentRequestId = ++requestIdRef.current;

		setDataState((prev) => ({ ...prev, state: 'loading' }));

		fetcher(query)
			.then((result) => {
				if (currentRequestId !== requestIdRef.current) return;

				if (result.items.length === 0) {
					setDataState({
						state: 'empty',
						items: [],
						total: result.total,
					});
					return;
				}

				setDataState({
					state: 'success',
					items: result.items,
					total: result.total,
				});
			})
			.catch((error: unknown) => {
				if (currentRequestId !== requestIdRef.current) return;

				setDataState({
					state: 'error',
					items: [],
					total: 0,
					error: error instanceof Error ? error.message : 'Failed to load data',
				});
			});
	}, [fetcher, query]);

	const handleRetry = () => {
		setQuery({ ...query });
	};

	return {
		dataState,
		setDataState,
		handleRetry,
		isLoading: dataState.state === 'loading',
		isError: dataState.state === 'error',
		isEmpty: dataState.state === 'empty',
	};
}
