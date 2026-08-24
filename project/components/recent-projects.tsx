"use client";

import { Calendar, Users } from "lucide-react";
import Link from "next/link";

export interface RecentProject {
	id: string;
	slug: string;
	name: string;
	description: string | null;
	status: string;
	progress: number;
	memberCount: number;
	dueDate: string | null;
}

interface RecentProjectsProps {
	projects: RecentProject[];
}

export function RecentProjects({ projects }: RecentProjectsProps) {
	return (
		<div className="bg-white dark:bg-outer_space-500 rounded-lg border border-french_gray-300 dark:border-paynes_gray-400 p-6">
			<div className="flex items-center justify-between mb-6">
				<h3 className="text-lg font-semibold text-outer_space-500 dark:text-platinum-500">
					Recent Projects
				</h3>
				<Link
					href="/projects"
					className="text-blue_munsell-500 hover:text-blue_munsell-600 text-sm font-medium"
				>
					View all
				</Link>
			</div>

			{projects.length === 0 ? (
				<p className="text-sm text-paynes_gray-500 dark:text-french_gray-400">
					No projects yet. Create your first project to get started.
				</p>
			) : (
				<div className="space-y-4">
					{projects.map((project) => (
						<Link
							key={project.id}
							href={`/projects/${project.slug}`}
							className="block border border-french_gray-300 dark:border-paynes_gray-400 rounded-lg p-4 hover:border-blue_munsell-500 transition-colors"
						>
							<h4 className="font-medium text-outer_space-500 dark:text-platinum-500">
								{project.name}
							</h4>
							{project.description && (
								<p className="text-sm text-paynes_gray-500 dark:text-french_gray-400 mt-1">
									{project.description}
								</p>
							)}

							<div className="flex items-center space-x-4 mt-3 text-sm text-paynes_gray-500 dark:text-french_gray-400">
								<div className="flex items-center">
									<Users size={16} className="mr-1" />
									{project.memberCount}
								</div>
								{project.dueDate && (
									<div className="flex items-center">
										<Calendar size={16} className="mr-1" />
										{project.dueDate}
									</div>
								)}
							</div>

							<div className="mt-3">
								<div className="flex items-center justify-between text-sm mb-1">
									<span className="text-paynes_gray-500 dark:text-french_gray-400">
										Progress
									</span>
									<span className="text-outer_space-500 dark:text-platinum-500">
										{project.progress}%
									</span>
								</div>
								<div className="w-full bg-french_gray-300 dark:bg-paynes_gray-400 rounded-full h-2">
									<div
										className="bg-blue_munsell-500 h-2 rounded-full transition-all duration-300"
										style={{ width: `${project.progress}%` }}
									/>
								</div>
							</div>
						</Link>
					))}
				</div>
			)}
		</div>
	);
}
