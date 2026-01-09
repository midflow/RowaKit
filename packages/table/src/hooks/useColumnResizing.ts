import { useRef, useState } from 'react';
import type { ColumnDef } from '../types';

export function useColumnResizing<T>(columns: ColumnDef<T>[]) {
	const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});

	const resizeRafRef = useRef<number | null>(null);
	const resizePendingRef = useRef<{ colId: string; width: number } | null>(null);
	const tableRef = useRef<HTMLTableElement | null>(null);

	const isResizingRef = useRef(false);
	const lastResizeEndTsRef = useRef(0);
	const resizingColIdRef = useRef<string | null>(null);

	const scheduleColumnWidthUpdate = (colId: string, width: number) => {
		resizePendingRef.current = { colId, width };
		if (resizeRafRef.current != null) return;

		resizeRafRef.current = requestAnimationFrame(() => {
			resizeRafRef.current = null;
			const pending = resizePendingRef.current;
			if (!pending) return;
			handleColumnResize(pending.colId, pending.width);
		});
	};

	const handleColumnResize = (columnId: string, newWidth: number) => {
		const minWidth = columns.find((c) => c.id === columnId)?.minWidth ?? 80;
		const maxWidth = columns.find((c) => c.id === columnId)?.maxWidth;

		let finalWidth = Math.max(minWidth, newWidth);
		if (maxWidth) {
			finalWidth = Math.min(finalWidth, maxWidth);
		}

		if (columnWidths[columnId] === finalWidth) {
			return;
		}

		setColumnWidths((prev) => ({
			...prev,
			[columnId]: finalWidth,
		}));
	};

	const autoFitColumnWidth = (columnId: string) => {
		const tableEl = tableRef.current;
		if (!tableEl) return;

		const th = tableEl.querySelector(`th[data-col-id="${columnId}"]`) as HTMLTableCellElement | null;
		if (!th) return;

		const tds = Array.from(
			tableEl.querySelectorAll(`td[data-col-id="${columnId}"]`),
		) as HTMLTableCellElement[];

		const headerW = th.scrollWidth;
		const cellsMaxW = tds.reduce((max, td) => Math.max(max, td.scrollWidth), 0);

		const padding = 24;
		const raw = Math.max(headerW, cellsMaxW) + padding;

		const colDef = columns.find((c) => c.id === columnId);
		const minW = colDef?.minWidth ?? 80;
		const maxW = colDef?.maxWidth ?? 600;

		const finalW = Math.max(minW, Math.min(raw, maxW));
		setColumnWidths((prev) => ({ ...prev, [columnId]: finalW }));
	};

	const startColumnResize = (e: React.PointerEvent<HTMLDivElement>, columnId: string) => {
		e.preventDefault();
		e.stopPropagation();

		if (e.detail === 2) {
			autoFitColumnWidth(columnId);
			return;
		}

		if (e.pointerType === 'mouse' && e.buttons !== 1) {
			return;
		}

		const target = e.currentTarget;
		const pointerId = e.pointerId;

		try {
			target.setPointerCapture(pointerId);
		} catch {
			// ignore
		}

		isResizingRef.current = true;
		resizingColIdRef.current = columnId;

		const startX = e.clientX;
		const th = target.parentElement as HTMLTableCellElement;

		let startWidth = columnWidths[columnId] ?? th.offsetWidth;

		const MIN_DRAG_WIDTH = 80;
		if (startWidth < MIN_DRAG_WIDTH) {
			const nextTh = th.nextElementSibling as HTMLTableCellElement | null;
			if (nextTh && nextTh.offsetWidth >= 50) {
				startWidth = nextTh.offsetWidth;
			} else {
				startWidth = 100;
			}
		}

		document.body.classList.add('rowakit-resizing');

		const handlePointerMove = (moveEvent: PointerEvent) => {
			const delta = moveEvent.clientX - startX;
			const newWidth = startWidth + delta;
			scheduleColumnWidthUpdate(columnId, newWidth);
		};

		const cleanupResize = () => {
			target.removeEventListener('pointermove', handlePointerMove);
			target.removeEventListener('pointerup', handlePointerUp);
			target.removeEventListener('pointercancel', handlePointerCancel);

			document.body.classList.remove('rowakit-resizing');

			isResizingRef.current = false;
			resizingColIdRef.current = null;
			lastResizeEndTsRef.current = Date.now();

			try {
				target.releasePointerCapture(pointerId);
			} catch {
				// ignore
			}
		};

		const handlePointerUp = () => {
			cleanupResize();
		};

		const handlePointerCancel = () => {
			cleanupResize();
		};

		target.addEventListener('pointermove', handlePointerMove);
		target.addEventListener('pointerup', handlePointerUp);
		target.addEventListener('pointercancel', handlePointerCancel);
	};

	const handleColumnResizeDoubleClick = (e: React.MouseEvent<HTMLDivElement>, columnId: string) => {
		e.preventDefault();
		e.stopPropagation();
		autoFitColumnWidth(columnId);
	};

	return {
		tableRef,
		columnWidths,
		setColumnWidths,
		startColumnResize,
		handleColumnResizeDoubleClick,
		isResizingRef,
		lastResizeEndTsRef,
		resizingColIdRef,
	};
}
