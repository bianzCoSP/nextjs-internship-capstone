import { auth } from "@clerk/nextjs/server";
import { UserPlus } from "lucide-react";
import { TeamGrid } from "@/components/team-grid";
import { queries } from "@/lib/db";

export default async function TeamPage() {
	const { userId: clerkId } = await auth();
	const currentUser = clerkId
		? await queries.users.getByClerkId(clerkId)
		: null;

	const teammates = currentUser
		? await queries.users.getTeammates(currentUser.id)
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
				<button
					type="button"
					className="inline-flex items-center px-4 py-2 bg-blue_munsell-500 text-white rounded-lg hover:bg-blue_munsell-600 transition-colors"
				>
					<UserPlus size={20} className="mr-2" />
					Invite Member
				</button>
			</div>

			<TeamGrid members={teammates} />
		</div>
	);
}
