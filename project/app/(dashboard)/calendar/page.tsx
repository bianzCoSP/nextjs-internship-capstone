import { auth } from "@clerk/nextjs/server";
import { CreateEventButton } from "@/components/create-event-button";
import { ProjectCalendar } from "@/components/project-calendar";
import { queries } from "@/lib/db";

export default async function CalendarPage() {
	const { userId: clerkId } = await auth();

	const user = clerkId ? await queries.users.getByClerkId(clerkId) : null;

	const [tasks, events, projects] = user
		? await Promise.all([
				queries.tasks.getAllForUser(user.id),
				queries.events.getAllForUser(user.id),
				queries.projects.getAllForUser(user.id),
			])
		: [[], [], []];

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold text-outer_space-500 dark:text-platinum-500">
						Calendar
					</h1>
					<p className="text-paynes_gray-500 dark:text-french_gray-500 mt-2">
						View project deadlines and team schedules
					</p>
				</div>
				<CreateEventButton
					projects={projects.map((project) => ({
						id: project.id,
						name: project.name,
					}))}
				/>
			</div>

			<ProjectCalendar tasks={tasks} events={events} />
		</div>
	);
}
