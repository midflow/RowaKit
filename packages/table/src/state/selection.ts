export type SelectionKey = string | number;

export function toggleSelectionKey(selected: SelectionKey[], key: SelectionKey): SelectionKey[] {
	if (selected.includes(key)) {
		return selected.filter((k) => k !== key);
	}
	return [...selected, key];
}

export function isAllSelected(selected: SelectionKey[], pageKeys: SelectionKey[]): boolean {
	if (pageKeys.length === 0) return false;
	return pageKeys.every((k) => selected.includes(k));
}

export function isIndeterminate(selected: SelectionKey[], pageKeys: SelectionKey[]): boolean {
	if (pageKeys.length === 0) return false;
	const selectedCount = pageKeys.filter((k) => selected.includes(k)).length;
	return selectedCount > 0 && selectedCount < pageKeys.length;
}

export function selectAll(pageKeys: SelectionKey[]): SelectionKey[] {
	return [...pageKeys];
}

export function clearSelection(): SelectionKey[] {
	return [];
}
