import { useEffect, useRef } from 'react';

export function RowSelectionHeaderCell(props: {
	checked: boolean;
	indeterminate: boolean;
	disabled?: boolean;
	onChange: (checked: boolean) => void;
}) {
	const checkboxRef = useRef<HTMLInputElement | null>(null);

	useEffect(() => {
		if (!checkboxRef.current) return;
		checkboxRef.current.indeterminate = props.indeterminate;
	}, [props.indeterminate]);

	return (
		<th>
			<input
				ref={checkboxRef}
				type="checkbox"
				aria-label="Select all rows"
				disabled={props.disabled}
				checked={props.checked}
				onChange={(e) => props.onChange(e.target.checked)}
			/>
		</th>
	);
}

export function RowSelectionCell(props: {
	rowKey: string | number;
	checked: boolean;
	disabled?: boolean;
	onChange: (checked: boolean) => void;
}) {
	return (
		<td>
			<input
				type="checkbox"
				aria-label={`Select row ${props.rowKey}`}
				disabled={props.disabled}
				checked={props.checked}
				onChange={(e) => props.onChange(e.target.checked)}
			/>
		</td>
	);
}
