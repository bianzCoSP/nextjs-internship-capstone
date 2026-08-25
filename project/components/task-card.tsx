import { MoreHorizontal } from "lucide-react";
import Link from "next/link";

export interface TaskCardTask {
	id: string;
	slug: string;
	title: string;
	description?: string | null;
	priority: "low" | "medium" | "high";
	assigneeName?: string | null;
	assignees?: { id: string; name: string }[];
	dueDate?: Date | string | null;
	createdAt?: Date | string | null;
}

interface TaskCardProps {
	task: TaskCardTask;
	isDragging?: boolean;
	onEditClick?: (id: string) => void;
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

function formatCreatedDate(createdAt?: Date | string | null) {
	if (!createdAt) return null;
	return new Date(createdAt).toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
	});
}

const MAX_VISIBLE_ASSIGNEES = 3;

function AssigneeAvatars({
	assignees,
	fallbackName,
}: {
	assignees?: { id: string; name: string }[];
	fallbackName?: string | null;
}) {
	if (assignees && assignees.length > 0) {
		const visible = assignees.slice(0, MAX_VISIBLE_ASSIGNEES);
		const overflow = assignees.length - visible.length;

		return (
			<div className="flex items-center -space-x-2">
				{visible.map((assignee) => (
					<div
						key={assignee.id}
						title={assignee.name}
						className="w-6 h-6 shrink-0 bg-blue_munsell-500 rounded-full ring-2 ring-white dark:ring-outer_space-300 flex items-center justify-center text-white text-xs font-semibold"
					>
						{getInitials(assignee.name)}
					</div>
				))}
				{overflow > 0 ? (
					<div
						title={`${overflow} more`}
						className="w-6 h-6 shrink-0 bg-paynes_gray-500 rounded-full ring-2 ring-white dark:ring-outer_space-300 flex items-center justify-center text-white text-[10px] font-semibold"
					>
						+{overflow}
					</div>
				) : null}
			</div>
		);
	}

	if (fallbackName) {
		return (
			<div
				title={fallbackName}
				className="w-6 h-6 shrink-0 bg-blue_munsell-500 rounded-full flex items-center justify-center text-white text-xs font-semibold"
			>
				{getInitials(fallbackName)}
			</div>
		);
	}

	return null;
}

export function TaskCard({ task, isDragging, onEditClick }: TaskCardProps) {
	const overdue = isOverdue(task.dueDate);

	return (
		<div
			className={`relative w-full text-left bg-white dark:bg-outer_space-300 rounded-lg border border-french_gray-300 dark:border-paynes_gray-400 hover:shadow-md transition-shadow ${
				isDragging ? "opacity-50" : ""
			}`}
		>
			{onEditClick ? (
				<button
					type="button"
					aria-label="Task options"
					onPointerDown={(event) => event.stopPropagation()}
					onClick={(event) => {
						event.stopPropagation();
						event.preventDefault();
						onEditClick(task.id);
					}}
					className="absolute top-2.5 right-2.5 z-10 p-1 rounded hover:bg-platinum-500/60 dark:hover:bg-paynes_gray-400/40 text-paynes_gray-500 dark:text-french_gray-400"
				>
					<MoreHorizontal size={14} />
				</button>
			) : null}

			<Link href={`/projects/tasks/${task.slug}`} className="block p-4">
				<h4 className="font-medium text-outer_space-500 dark:text-platinum-500 text-sm mb-1 pr-6">
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

					<div className="flex items-center gap-2">
						{formatCreatedDate(task.createdAt) ? (
							<span
								title={`Created ${formatCreatedDate(task.createdAt)}`}
								className="text-xs text-paynes_gray-500 dark:text-french_gray-400"
							>
								Created {formatCreatedDate(task.createdAt)}
							</span>
						) : null}

						<AssigneeAvatars
							assignees={task.assignees}
							fallbackName={task.assigneeName}
						/>
					</div>
				</div>
			</Link>
		</div>
	);
}
