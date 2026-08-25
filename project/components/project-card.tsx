"use client";

import { Calendar, Users } from "lucide-react";
import Link from "next/link";
import { ProjectSettingsButton } from "@/components/project-settings-button";
import { type ProjectStatus, StatusBadge } from "@/components/status-badge";

interface ProjectCardProps {
	project: {
		id: string;
		slug: string;
		name: string;
		description?: string;
		progress: number;
		memberCount: number;
		dueDate?: Date | string | null;
		status: ProjectStatus;
		color?: string;
	};
}

function formatDueDate(value?: Date | string | null) {
	if (!value) return undefined;
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return undefined;
	return date.toLocaleDateString();
}

export function ProjectCard({ project }: ProjectCardProps) {
	const color = project.color ?? "#4a89a9";
	const dueDateLabel = formatDueDate(project.dueDate);

	return (
		<Link
			href={`/projects/${project.slug}`}
			className="block bg-white dark:bg-outer_space-500 rounded-lg border border-french_gray-300 dark:border-paynes_gray-400 p-6 hover:shadow-lg transition-shadow cursor-pointer"
		>
			<div className="flex items-start justify-between mb-4">
				<div
					className="w-3 h-3 rounded-full"
					style={{ backgroundColor: color }}
				/>
				<ProjectSettingsButton
					project={{
						id: project.id,
						name: project.name,
						description: project.description ?? null,
						dueDate: project.dueDate ?? null,
						color: project.color ?? null,
						status: project.status,
					}}
					navigateOnRename={false}
				/>
			</div>

			<h3 className="text-lg font-semibold text-outer_space-500 dark:text-platinum-500 mb-2">
				{project.name}
			</h3>

			<p className="text-sm text-paynes_gray-500 dark:text-french_gray-400 mb-4 line-clamp-2">
				{project.description}
			</p>

			<div className="flex items-center justify-between text-sm text-paynes_gray-500 dark:text-french_gray-400 mb-4">
				<div className="flex items-center">
					<Users size={16} className="mr-1" />
					{project.memberCount} members
				</div>
				{dueDateLabel && (
					<div className="flex items-center">
						<Calendar size={16} className="mr-1" />
						{dueDateLabel}
					</div>
				)}
			</div>

			<div className="mb-4">
				<div className="flex items-center justify-between text-sm mb-2">
					<span className="text-paynes_gray-500 dark:text-french_gray-400">
						Progress
					</span>
					<span className="text-outer_space-500 dark:text-platinum-500 font-medium">
						{project.progress}%
					</span>
				</div>
				<div className="w-full bg-french_gray-300 dark:bg-paynes_gray-400 rounded-full h-2">
					<div
						className="h-2 rounded-full transition-all duration-300"
						style={{ width: `${project.progress}%`, backgroundColor: color }}
					/>
				</div>
			</div>

			<div className="flex items-center justify-between">
				<StatusBadge status={project.status} />
			</div>
		</Link>
	);
}
