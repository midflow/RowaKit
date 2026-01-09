import { useState } from 'react';
import type { FetcherQuery } from '../types';
import type { Exporter } from '../types/export';

function downloadBlob(blob: Blob, filename: string) {
	if (typeof window === 'undefined') return;
	if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') return;

	const url = URL.createObjectURL(blob);
	try {
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		a.rel = 'noopener noreferrer';
		a.click();
	} finally {
		URL.revokeObjectURL(url);
	}
}

function openUrl(url: string) {
	if (typeof window === 'undefined') return;
	if (typeof window.open === 'function') {
		window.open(url, '_blank', 'noopener,noreferrer');
		return;
	}
	try {
		window.location.assign(url);
	} catch {
		// ignore
	}
}

export function ExportButton(props: {
	exporter: Exporter;
	query: FetcherQuery;
}) {
	const [isExporting, setIsExporting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const onClick = async () => {
		if (isExporting) return;

		setIsExporting(true);
		setError(null);

		try {
			const snapshot = { ...props.query };
			const result = await props.exporter(snapshot);

			if (result instanceof Blob) {
				downloadBlob(result, 'rowakit-export.csv');
				return;
			}

			openUrl(result.url);
		} catch (e: unknown) {
			setError(e instanceof Error ? e.message : 'Export failed');
		} finally {
			setIsExporting(false);
		}
	};

	return (
		<div className="rowakit-export">
			<button
				type="button"
				className="rowakit-button rowakit-button-secondary"
				onClick={onClick}
				disabled={isExporting}
			>
				{isExporting ? 'Exporting…' : 'Export CSV'}
			</button>
			{error && <div className="rowakit-export-error">{error}</div>}
		</div>
	);
}
