"use client";

import { ProjectCard } from "@/components/project-card";

interface ProjectGridProject {
	id: string;
	name: string;
	description: string | null;
	status: "To Do" | "In Progress" | "Review" | "Done";
	color: string;
	dueDate: Date | null;
	memberCount: number;
	progress: number;
}

interface ProjectGridProps {
	projects: ProjectGridProject[];
}

export function ProjectGrid({ projects }: ProjectGridProps) {
	const handleEdit = (id: string) => {
		// TODO: open edit modal / navigate to edit route
	};

	const handleDelete = (id: string) => {
		// TODO: confirm + call delete server action
	};

	if (projects.length === 0) {
		return (
			<div className="text-center py-12 text-paynes_gray-500 dark:text-french_gray-400">
				No projects yet. Create one to get started.
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{projects.map((project) => (
				<ProjectCard
					key={project.id}
					project={{
						id: project.id,
						name: project.name,
						description: project.description ?? undefined,
						progress: project.progress,
						memberCount: project.memberCount,
						dueDate: project.dueDate
							? new Date(project.dueDate).toLocaleDateString()
							: undefined,
						status: project.status,
						color: project.color,
					}}
					onEdit={handleEdit}
					onDelete={handleDelete}
				/>
			))}
		</div>
	);
}
