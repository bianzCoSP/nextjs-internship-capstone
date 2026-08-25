import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AnalyticsDashboard } from "@/components/analytics-dashboard";
import { queries } from "@/lib/db/index";

export default async function AnalyticsPage() {
	const { userId: clerkId } = await auth();
	if (!clerkId) {
		redirect("/sign-in");
	}

	const user = await queries.users.getByClerkId(clerkId);
	if (!user) {
		redirect("/sign-in");
	}

	const analytics = await queries.analytics.getForUser(user.id);

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold text-outer_space-500 dark:text-platinum-500">
					Analytics
				</h1>
				<p className="text-paynes_gray-500 dark:text-french_gray-500 mt-2">
					Track project performance and team productivity
				</p>
			</div>

			<AnalyticsDashboard analytics={analytics} />
		</div>
	);
}
