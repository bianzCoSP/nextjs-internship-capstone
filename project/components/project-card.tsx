"use client";

import { Calendar, MoreHorizontal, Users } from "lucide-react";
import Link from "next/link";

interface ProjectCardProps {
	project: {
		id: string;
		slug: string;
		name: string;
		description?: string;
		progress: number;
		memberCount: number;
		dueDate?: string;
		status: "To Do" | "In Progress" | "Review" | "Done";
		color?: string;
	};
	onEdit?: (id: string) => void;
	onDelete?: (id: string) => void;
}

const statusStyles: Record<string, string> = {
	"In Progress":
		"bg-blue_munsell-100 text-blue_munsell-700 dark:bg-blue_munsell-900 dark:text-blue_munsell-300",
	Review:
		"bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
	"To Do": "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
	Done: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
};

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
	const color = project.color ?? "bg-blue_munsell-500";

	return (
		<Link
			href={`/projects/${project.slug}`}
			className="block bg-white dark:bg-outer_space-500 rounded-lg border border-french_gray-300 dark:border-paynes_gray-400 p-6 hover:shadow-lg transition-shadow cursor-pointer"
		>
			<div className="flex items-start justify-between mb-4">
				<div className={`w-3 h-3 rounded-full ${color}`} />
				<button
					type="button"
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						// TODO: add edit delete dropdown
					}}
					className="p-1 hover:bg-platinum-500 dark:hover:bg-paynes_gray-400 rounded"
				>
					<MoreHorizontal size={16} />
				</button>
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
				{project.dueDate && (
					<div className="flex items-center">
						<Calendar size={16} className="mr-1" />
						{project.dueDate}
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
						className={`h-2 rounded-full transition-all duration-300 ${color}`}
						style={{ width: `${project.progress}%` }}
					/>
				</div>
			</div>

			<div className="flex items-center justify-between">
				<span
					className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[project.status]}`}
				>
					{project.status}
				</span>
			</div>
		</Link>
	);
}
