import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TaskComments } from "@/components/task-comments";
import { queries } from "@/lib/db/index";

const PRIORITY_STYLES: Record<"low" | "medium" | "high", string> = {
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

function formatDate(value: Date | string | null | undefined) {
	if (!value) return null;
	return new Date(value).toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

export default async function TaskDetailPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const task = await queries.tasks.getBySlug(slug);

	if (!task) {
		notFound();
	}

	const comments = await queries.comments.getByTask(task.id);
	const overdue =
		task.status !== "Done" && new Date(task.dueDate).getTime() < Date.now();

	return (
		<div className="flex h-full flex-col max-w-3xl mx-auto w-full">
			<div className="shrink-0 flex items-center space-x-4 pb-6">
				<Link
					href={`/projects/${task.projectSlug}`}
					className="p-2 hover:bg-platinum-500 dark:hover:bg-paynes_gray-400 rounded-lg transition-colors"
				>
					<ArrowLeft size={20} />
				</Link>
				<div>
					<p className="text-xs text-paynes_gray-500 dark:text-french_gray-400">
						{task.projectName} / {task.listName}
					</p>
					<h1 className="text-2xl font-bold text-outer_space-500 dark:text-platinum-500">
						{task.title}
					</h1>
				</div>
			</div>

			<div className="flex-1 min-h-0 overflow-y-auto space-y-6 pb-10">
				<div className="bg-white dark:bg-outer_space-300 rounded-lg border border-french_gray-300 dark:border-paynes_gray-400 p-5 space-y-5">
					<div className="flex flex-wrap items-center gap-2">
						<span
							className={`px-2 py-1 text-xs font-medium rounded-full ${PRIORITY_STYLES[task.priority]}`}
						>
							{task.priority[0].toUpperCase() + task.priority.slice(1)} priority
						</span>
						<span className="px-2 py-1 text-xs font-medium rounded-full bg-french_gray-300/60 dark:bg-paynes_gray-400/40 text-outer_space-500 dark:text-platinum-500">
							{task.status}
						</span>
						{task.dueDate ? (
							<span
								className={`text-xs ${
									overdue
										? "text-red-600 dark:text-red-400 font-medium"
										: "text-paynes_gray-500 dark:text-french_gray-400"
								}`}
							>
								Due {formatDate(task.dueDate)}
							</span>
						) : null}
					</div>

					<div>
						<h3 className="text-xs font-semibold uppercase text-paynes_gray-500 dark:text-french_gray-400 mb-2">
							Description
						</h3>
						{task.description ? (
							<p className="text-sm text-paynes_gray-600 dark:text-french_gray-300 whitespace-pre-wrap wrap-break-word">
								{task.description}
							</p>
						) : (
							<p className="text-sm italic text-paynes_gray-500 dark:text-french_gray-400">
								No description provided.
							</p>
						)}
					</div>

					<div>
						<h3 className="text-xs font-semibold uppercase text-paynes_gray-500 dark:text-french_gray-400 mb-2">
							Assignees
						</h3>
						{task.assignees.length > 0 ? (
							<div className="flex flex-wrap gap-3">
								{task.assignees.map((assignee) => (
									<div key={assignee.id} className="flex items-center gap-2">
										<div className="w-6 h-6 shrink-0 bg-blue_munsell-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
											{getInitials(assignee.name)}
										</div>
										<span className="text-sm text-outer_space-500 dark:text-platinum-500">
											{assignee.name}
										</span>
									</div>
								))}
							</div>
						) : (
							<p className="text-sm text-paynes_gray-500 dark:text-french_gray-400">
								Unassigned
							</p>
						)}
					</div>

					<div className="text-xs text-paynes_gray-500 dark:text-french_gray-400 pt-1 border-t border-french_gray-300/60 dark:border-paynes_gray-400/40">
						Created by {task.creatorName}
						{formatDate(task.createdAt)
							? ` on ${formatDate(task.createdAt)}`
							: ""}
					</div>
				</div>

				<TaskComments
					taskId={task.id}
					taskSlug={task.slug}
					comments={comments}
				/>
			</div>
		</div>
	);
}
