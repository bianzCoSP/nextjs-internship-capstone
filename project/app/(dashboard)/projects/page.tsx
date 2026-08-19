import { Filter, Search } from "lucide-react";
import { CreateProjectButton } from "@/components/create-project-button";
import { ProjectGrid } from "@/components/project-grid";
import { queries } from "@/lib/db/index";

export default async function ProjectsPage() {
	const projects = await queries.projects.getAll();

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold text-outer_space-500 dark:text-platinum-500">
						Projects
					</h1>
					<p className="text-paynes_gray-500 dark:text-french_gray-500 mt-2">
						Manage and organize your team projects
					</p>
				</div>
				<CreateProjectButton />
			</div>

			{/* Search and Filter Bar */}
			<div className="flex flex-col sm:flex-row gap-4">
				<div className="relative flex-1">
					<Search
						className="absolute left-3 top-1/2 transform -translate-y-1/2 text-paynes_gray-500 dark:text-french_gray-400"
						size={16}
					/>
					<input
						type="text"
						placeholder="Search projects..."
						className="w-full pl-10 pr-4 py-2 bg-white dark:bg-outer_space-500 border border-french_gray-300 dark:border-paynes_gray-400 rounded-lg text-outer_space-500 dark:text-platinum-500 placeholder-paynes_gray-500 dark:placeholder-french_gray-400 focus:outline-hidden focus:ring-2 focus:ring-blue_munsell-500"
					/>
				</div>
				<button
					type="button"
					className="inline-flex items-center px-4 py-2 border border-french_gray-300 dark:border-paynes_gray-400 text-outer_space-500 dark:text-platinum-500 rounded-lg hover:bg-platinum-500 dark:hover:bg-paynes_gray-400 transition-colors"
				>
					<Filter size={16} className="mr-2" />
					Filter
				</button>
			</div>

			<ProjectGrid projects={projects} />
		</div>
	);
}
