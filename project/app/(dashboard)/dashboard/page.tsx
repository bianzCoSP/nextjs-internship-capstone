import { auth } from "@clerk/nextjs/server";
import {
	type DashboardStat,
	DashboardStats,
} from "@/components/dashboard-stats";
import { QuickActions } from "@/components/quick-actions";
import {
	type RecentProject,
	RecentProjects,
} from "@/components/recent-projects";
import { queries } from "@/lib/db";

const RECENT_PROJECTS_LIMIT = 3;

function formatDueDate(date: Date | null) {
	if (!date) return null;
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	}).format(date);
}

export default async function DashboardPage() {
	const { userId: clerkId } = await auth();
	const currentUser = clerkId
		? await queries.users.getByClerkId(clerkId)
		: null;

	if (!currentUser) {
		throw new Error("User record not found for authenticated session");
	}

	const [projects, teammates] = await Promise.all([
		queries.projects.getAllForUser(currentUser.id),
		queries.users.getTeammates(currentUser.id),
	]);

	const activeProjects = projects.filter((p) => p.status !== "Done").length;
	const completedTasks = projects.reduce((sum, p) => sum + p.doneTasks, 0);
	const pendingTasks = projects.reduce(
		(sum, p) => sum + (p.totalTasks - p.doneTasks),
		0,
	);

	const stats: DashboardStat[] = [
		{ name: "Active Projects", value: activeProjects, icon: "projects" },
		{ name: "Team Members", value: teammates.length, icon: "team" },
		{ name: "Completed Tasks", value: completedTasks, icon: "completed" },
		{ name: "Pending Tasks", value: pendingTasks, icon: "pending" },
	];

	const recentProjects: RecentProject[] = [...projects]
		.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
		.slice(0, RECENT_PROJECTS_LIMIT)
		.map((project) => ({
			id: project.id,
			slug: project.slug,
			name: project.name,
			description: project.description,
			status: project.status,
			progress: project.progress,
			memberCount: project.memberCount,
			dueDate: formatDueDate(project.dueDate),
		}));

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold text-outer_space-500 dark:text-platinum-500">
					Dashboard
				</h1>
				<p className="text-paynes_gray-500 dark:text-french_gray-500 mt-2">
					Welcome back! Here's an overview of your projects and tasks.
				</p>
			</div>

			<DashboardStats stats={stats} />

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<RecentProjects projects={recentProjects} />
				<QuickActions />
			</div>
		</div>
	);
}
