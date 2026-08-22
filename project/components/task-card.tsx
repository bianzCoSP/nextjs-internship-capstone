export interface TaskCardTask {
	id: string;
	title: string;
	description?: string | null;
	priority: "low" | "medium" | "high";
	assigneeName?: string | null;
	dueDate?: Date | string | null;
}

interface TaskCardProps {
	task: TaskCardTask;
	isDragging?: boolean;
	onClick?: (id: string) => void;
}

const PRIORITY_STYLES: Record<TaskCardTask["priority"], string> = {
	high: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
	medium:
		"bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
	low: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
};

function getInitials(name: string) {
	return name
		.split(" ")
		.map((part) => part[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
}

function isOverdue(dueDate?: Date | string | null) {
	if (!dueDate) return false;
	return new Date(dueDate).getTime() < Date.now();
}

function formatDueDate(dueDate?: Date | string | null) {
	if (!dueDate) return null;
	return new Date(dueDate).toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
	});
}

export function TaskCard({ task, isDragging, onClick }: TaskCardProps) {
	const overdue = isOverdue(task.dueDate);

	return (
		<button
			type="button"
			onClick={() => onClick?.(task.id)}
			className={`w-full text-left bg-white dark:bg-outer_space-300 p-4 rounded-lg border border-french_gray-300 dark:border-paynes_gray-400 hover:shadow-md transition-shadow ${
				isDragging ? "opacity-50" : ""
			}`}
		>
			<h4 className="font-medium text-outer_space-500 dark:text-platinum-500 text-sm mb-1">
				{task.title}
			</h4>

			{task.description ? (
				<p className="text-xs text-paynes_gray-500 dark:text-french_gray-400 mb-3 line-clamp-2">
					{task.description}
				</p>
			) : null}

			<div className="flex items-center justify-between mt-2">
				<div className="flex items-center gap-2">
					<span
						className={`px-2 py-1 text-xs font-medium rounded-full ${PRIORITY_STYLES[task.priority]}`}
					>
						{task.priority[0].toUpperCase() + task.priority.slice(1)}
					</span>
					{task.dueDate ? (
						<span
							className={`text-xs ${
								overdue
									? "text-red-600 dark:text-red-400 font-medium"
									: "text-paynes_gray-500 dark:text-french_gray-400"
							}`}
						>
							{formatDueDate(task.dueDate)}
						</span>
					) : null}
				</div>

				{task.assigneeName ? (
					<div
						title={task.assigneeName}
						className="w-6 h-6 shrink-0 bg-blue_munsell-500 rounded-full flex items-center justify-center text-white text-xs font-semibold"
					>
						{getInitials(task.assigneeName)}
					</div>
				) : null}
			</div>
		</button>
	);
}
