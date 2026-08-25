import { auth } from "@clerk/nextjs/server";
import { CreateProjectButton } from "@/components/create-project-button";
import { ProjectGrid } from "@/components/project-grid";
import { queries } from "@/lib/db/index";

export default async function ProjectsPage() {
	const { userId: clerkId } = await auth();
	const user = clerkId ? await queries.users.getByClerkId(clerkId) : null;

	if (!user) {
		throw new Error("User record not found for authenticated session");
	}

	const projects = await queries.projects.getAllForUser(user.id);

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

			<ProjectGrid projects={projects} />
		</div>
	);
}
