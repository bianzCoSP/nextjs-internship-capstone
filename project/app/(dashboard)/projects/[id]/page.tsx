import {
	ArrowLeft,
	Calendar,
	MoreHorizontal,
	Settings,
	Users,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { KanbanBoard } from "@/components/kanban-board";
import { queries } from "@/lib/db/index";

export default async function ProjectPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const project = await queries.projects.getBySlug(id);

	if (!project) {
		notFound();
	}

	const [lists, tasks] = await Promise.all([
		queries.lists.getByProject(project.id),
		queries.tasks.getByProject(project.id),
	]);

	return (
		<div className="flex h-full flex-col">
			{/* Project Header */}
			<div className="shrink-0 flex items-center justify-between pb-6">
				<div className="flex items-center space-x-4">
					<Link
						href="/projects"
						className="p-2 hover:bg-platinum-500 dark:hover:bg-paynes_gray-400 rounded-lg transition-colors"
					>
						<ArrowLeft size={20} />
					</Link>
					<div>
						<h1 className="text-3xl font-bold text-outer_space-500 dark:text-platinum-500">
							{project.name}
						</h1>
						{project.description ? (
							<p className="text-paynes_gray-500 dark:text-french_gray-500 mt-1">
								{project.description}
							</p>
						) : (
							<p className="text-paynes_gray-500 dark:text-french_gray-500 mt-1">
								Kanban board view for project management
							</p>
						)}
					</div>
				</div>

				<div className="flex items-center space-x-2">
					<button
						type="button"
						className="p-2 hover:bg-platinum-500 dark:hover:bg-paynes_gray-400 rounded-lg transition-colors"
					>
						<Users size={20} />
					</button>
					<button
						type="button"
						className="p-2 hover:bg-platinum-500 dark:hover:bg-paynes_gray-400 rounded-lg transition-colors"
					>
						<Calendar size={20} />
					</button>
					<button
						type="button"
						className="p-2 hover:bg-platinum-500 dark:hover:bg-paynes_gray-400 rounded-lg transition-colors"
					>
						<Settings size={20} />
					</button>
					<button
						type="button"
						className="p-2 hover:bg-platinum-500 dark:hover:bg-paynes_gray-400 rounded-lg transition-colors"
					>
						<MoreHorizontal size={20} />
					</button>
				</div>
			</div>

			<div className="flex-1 min-h-0">
				<KanbanBoard
					lists={lists}
					tasks={tasks}
					projectId={project.id}
					projectSlug={project.slug}
				/>
			</div>
		</div>
	);
}
