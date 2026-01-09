export interface BulkActionDef {
	id: string;
	label: string;
	confirm?: {
		title: string;
		description?: string;
	};
	onClick: (selectedKeys: Array<string | number>) => void;
}

export function BulkActionBar(props: {
	selectedCount: number;
	actions: BulkActionDef[];
	onActionClick: (actionId: string) => void;
}) {
	if (props.selectedCount <= 0) return null;

	return (
		<div className="rowakit-bulk-action-bar">
			<span>{props.selectedCount} selected</span>
			{props.actions.map((action) => (
				<button
					key={action.id}
					type="button"
					className="rowakit-button rowakit-button-secondary"
					onClick={() => props.onActionClick(action.id)}
				>
					{action.label}
				</button>
			))}
		</div>
	);
}
