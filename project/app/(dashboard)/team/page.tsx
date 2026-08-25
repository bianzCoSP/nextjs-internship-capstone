import { auth } from "@clerk/nextjs/server";
import { InviteMemberButton } from "@/components/invite-member-button";
import { TeamGrid } from "@/components/team-grid";
import { queries } from "@/lib/db/index";

export default async function TeamPage() {
	const { userId: clerkId } = await auth();
	const currentUser = clerkId
		? await queries.users.getByClerkId(clerkId)
		: null;

	const teammates = currentUser
		? await queries.users.getTeammates(currentUser.id)
		: [];

	const projects = currentUser
		? await queries.projects.getAllForUser(currentUser.id)
		: [];

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold text-outer_space-500 dark:text-platinum-500">
						Team
					</h1>
					<p className="text-paynes_gray-500 dark:text-french_gray-500 mt-2">
						People you share projects with
					</p>
				</div>
				<InviteMemberButton
					projects={projects.map((project) => ({
						id: project.id,
						name: project.name,
					}))}
				/>
			</div>

			<TeamGrid
				members={teammates}
				projects={projects.map((project) => ({
					id: project.id,
					name: project.name,
				}))}
			/>
		</div>
	);
}
