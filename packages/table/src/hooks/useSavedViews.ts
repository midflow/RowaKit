import { useEffect, useMemo, useState } from 'react';
import type { FetcherQuery, FilterValue } from '../types';

interface SavedViewsIndex {
	name: string;
	updatedAt: number;
}

interface SavedViewState {
	page: number;
	pageSize: number;
	sort?: { field: string; direction: 'asc' | 'desc' };
	filters?: Record<string, FilterValue | undefined>;
	columnWidths?: Record<string, number>;
}

export interface SavedViewEntry {
	name: string;
	state: SavedViewState;
}

function validateViewName(name: string): { valid: boolean; error?: string } {
	const trimmed = name.trim();

	if (trimmed.length === 0) {
		return { valid: false, error: 'Name cannot be empty' };
	}

	if (trimmed.length > 40) {
		return { valid: false, error: 'Name cannot exceed 40 characters' };
	}

	// eslint-disable-next-line no-control-regex
	const invalidChars = /[/\\?%*:|"<>\x00-\x1f\x7f]/;
	if (invalidChars.test(trimmed)) {
		return { valid: false, error: 'Name contains invalid characters' };
	}

	return { valid: true };
}

function getSavedViewsIndex(): SavedViewsIndex[] {
	if (typeof window === 'undefined' || !window.localStorage) {
		return [];
	}

	try {
		const indexStr = localStorage.getItem('rowakit-views-index');
		if (indexStr) {
			const index = JSON.parse(indexStr) as SavedViewsIndex[];
			if (Array.isArray(index)) {
				return index;
			}
		}
	} catch {
		// ignore
	}

	const rebuilt: SavedViewsIndex[] = [];
	try {
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key?.startsWith('rowakit-view-')) {
				const name = key.substring('rowakit-view-'.length);
				rebuilt.push({ name, updatedAt: Date.now() });
			}
		}
	} catch {
		// ignore
	}

	return rebuilt;
}

function setSavedViewsIndex(index: SavedViewsIndex[]): void {
	if (typeof window === 'undefined' || !window.localStorage) {
		return;
	}

	try {
		localStorage.setItem('rowakit-views-index', JSON.stringify(index));
	} catch {
		// ignore
	}
}

function loadSavedViewsFromStorage(): SavedViewEntry[] {
	if (typeof window === 'undefined' || !window.localStorage) {
		return [];
	}

	const index = getSavedViewsIndex();
	const views: SavedViewEntry[] = [];

	for (const entry of index) {
		try {
			const viewStr = localStorage.getItem(`rowakit-view-${entry.name}`);
			if (viewStr) {
				const state = JSON.parse(viewStr) as SavedViewState;
				views.push({ name: entry.name, state });
			}
		} catch {
			// ignore
		}
	}

	return views;
}

export function useSavedViews(options: {
	enableSavedViews: boolean;
	enableColumnResizing: boolean;
	defaultPageSize: number;
	query: FetcherQuery;
	setQuery: React.Dispatch<React.SetStateAction<FetcherQuery>>;
	setFilters: React.Dispatch<React.SetStateAction<Record<string, FilterValue | undefined>>>;
	columnWidths: Record<string, number>;
	setColumnWidths: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}) {
	const [savedViews, setSavedViews] = useState<SavedViewEntry[]>([]);

	const [showSaveViewForm, setShowSaveViewForm] = useState(false);
	const [saveViewInput, setSaveViewInput] = useState('');
	const [saveViewError, setSaveViewError] = useState('');
	const [overwriteConfirmName, setOverwriteConfirmName] = useState<string | null>(null);

	useEffect(() => {
		if (!options.enableSavedViews) return;
		setSavedViews(loadSavedViewsFromStorage());
	}, [options.enableSavedViews]);

	const saveCurrentView = (name: string) => {
		const viewState: SavedViewState = {
			page: options.query.page,
			pageSize: options.query.pageSize,
			sort: options.query.sort,
			filters: options.query.filters,
			columnWidths: options.enableColumnResizing ? options.columnWidths : undefined,
		};

		setSavedViews((prev) => {
			const filtered = prev.filter((v) => v.name !== name);
			return [...filtered, { name, state: viewState }];
		});

		if (typeof window !== 'undefined' && window.localStorage) {
			try {
				localStorage.setItem(`rowakit-view-${name}`, JSON.stringify(viewState));
				const index = getSavedViewsIndex();
				const filtered = index.filter((v) => v.name !== name);
				filtered.push({ name, updatedAt: Date.now() });
				setSavedViewsIndex(filtered);
			} catch {
				// ignore
			}
		}
	};

	const loadSavedView = (name: string) => {
		const view = savedViews.find((v) => v.name === name);
		if (!view) return;

		const { state } = view;
		options.setQuery({
			page: state.page,
			pageSize: state.pageSize,
			sort: state.sort,
			filters: state.filters,
		});

		options.setFilters(state.filters ?? {});

		if (state.columnWidths && options.enableColumnResizing) {
			options.setColumnWidths(state.columnWidths);
		}
	};

	const deleteSavedView = (name: string) => {
		setSavedViews((prev) => prev.filter((v) => v.name !== name));

		if (typeof window !== 'undefined' && window.localStorage) {
			try {
				localStorage.removeItem(`rowakit-view-${name}`);
				const index = getSavedViewsIndex();
				const filtered = index.filter((v) => v.name !== name);
				setSavedViewsIndex(filtered);
			} catch {
				// ignore
			}
		}
	};

	const resetTableState = () => {
		options.setQuery({
			page: 1,
			pageSize: options.defaultPageSize,
		});
		options.setFilters({});
		options.setColumnWidths({});
	};

	const shouldShowReset = useMemo(() => {
		if (!options.enableSavedViews) return false;
		return Boolean(options.query.page > 1 || options.query.sort || (options.query.filters && Object.keys(options.query.filters).length > 0));
	}, [options.enableSavedViews, options.query.page, options.query.sort, options.query.filters]);

	const openSaveViewForm = () => {
		setShowSaveViewForm(true);
		setSaveViewInput('');
		setSaveViewError('');
		setOverwriteConfirmName(null);
	};

	const cancelSaveViewForm = () => {
		setShowSaveViewForm(false);
		setSaveViewInput('');
		setSaveViewError('');
		setOverwriteConfirmName(null);
	};

	const onSaveViewInputChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
		setSaveViewInput(e.target.value);
		setSaveViewError('');
	};

	const attemptSave = () => {
		const validation = validateViewName(saveViewInput);
		if (!validation.valid) {
			setSaveViewError(validation.error || 'Invalid name');
			return;
		}

		const trimmed = saveViewInput.trim();
		if (savedViews.some((v) => v.name === trimmed)) {
			setOverwriteConfirmName(trimmed);
			return;
		}

		saveCurrentView(trimmed);
		cancelSaveViewForm();
	};

	const onSaveViewInputKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
		if (e.key !== 'Enter') return;
		attemptSave();
	};

	const confirmOverwrite = () => {
		if (!overwriteConfirmName) return;
		saveCurrentView(overwriteConfirmName);
		cancelSaveViewForm();
	};

	const cancelOverwrite = () => {
		setOverwriteConfirmName(null);
	};

	return {
		savedViews,
		showSaveViewForm,
		saveViewInput,
		saveViewError,
		overwriteConfirmName,
		openSaveViewForm,
		cancelSaveViewForm,
		onSaveViewInputChange,
		onSaveViewInputKeyDown,
		attemptSave,
		confirmOverwrite,
		cancelOverwrite,
		loadSavedView,
		deleteSavedView,
		resetTableState,
		shouldShowReset,
	};
}
