import { config } from "dotenv";

config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
	throw new Error("DATABASE_URL is not set in environment");
}

async function main() {
	const { db } = await import("./drizzle");
	const { comments, lists, projectMembers, projects, tasks, users } =
		await import("./schema");

	async function resetSeedData() {
		console.log("Clearing previously seeded data (users untouched)...");

		await db.delete(comments);
		await db.delete(tasks);
		await db.delete(lists);
		await db.delete(projectMembers);
		await db.delete(projects);
	}

	console.log("Seeding database...");

	const existingUsers = await db.select().from(users);

	if (existingUsers.length === 0) {
		throw new Error(
			"No users found. Sign up / sync at least one user via Clerk before seeding.",
		);
	}

	const userA = existingUsers[0];
	const userB = existingUsers[1] ?? existingUsers[0];
	const userC = existingUsers[2] ?? existingUsers[0];

	await resetSeedData();

	const [projectAlpha, projectBeta] = await db
		.insert(projects)
		.values([
			{
				name: "Website Redesign",
				description: "Revamp marketing site with new brand guidelines",
				status: "In Progress",
				color: "bg-blue_munsell-500",
				ownerId: userA.id,
				dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
			},
			{
				name: "Mobile App Launch",
				description: "Ship v1.0 of the companion mobile app",
				status: "To Do",
				color: "bg-red-500",
				ownerId: userB.id,
				dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60),
			},
		])
		.returning();

	await db.insert(projectMembers).values([
		{ projectId: projectAlpha.id, userId: userA.id },
		{ projectId: projectAlpha.id, userId: userB.id },
		{ projectId: projectBeta.id, userId: userB.id },
		{ projectId: projectBeta.id, userId: userC.id },
	]);

	const [todoList, inProgressList, doneList, backlogList] = await db
		.insert(lists)
		.values([
			{ name: "To Do", projectId: projectAlpha.id, position: 0 },
			{ name: "In Progress", projectId: projectAlpha.id, position: 1 },
			{ name: "Done", projectId: projectAlpha.id, position: 2 },
			{ name: "Backlog", projectId: projectBeta.id, position: 0 },
		])
		.returning();

	const [taskOne, taskTwo, taskThree, taskFour] = await db
		.insert(tasks)
		.values([
			{
				title: "Design new homepage hero",
				description: "Explore 3 concepts and present to stakeholders",
				listId: todoList.id,
				assigneeId: userA.id,
				priority: "high",
				status: "To Do",
				position: 0,
				dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
			},
			{
				title: "Set up CI/CD pipeline",
				description: "Automate build and deploy on merge to main",
				listId: inProgressList.id,
				assigneeId: userB.id,
				priority: "medium",
				status: "In Progress",
				position: 0,
			},
			{
				title: "Migrate legacy blog posts",
				description: null,
				listId: doneList.id,
				assigneeId: userA.id,
				priority: "low",
				status: "Done",
				position: 0,
			},
			{
				title: "Define app onboarding flow",
				description: "Wireframe the first-run experience",
				listId: backlogList.id,
				assigneeId: userC.id,
				priority: "medium",
				status: "To Do",
				position: 0,
			},
		])
		.returning();

	await db.insert(comments).values([
		{
			content: "Love the direction on concept 2, let's refine it further.",
			taskId: taskOne.id,
			authorId: userB.id,
		},
		{
			content: "Pipeline is mostly done, just need to wire up secrets.",
			taskId: taskTwo.id,
			authorId: userB.id,
		},
		{
			content: "Confirmed all posts migrated and redirects are in place.",
			taskId: taskThree.id,
			authorId: userA.id,
		},
		{
			content: "Kicking off wireframes this week.",
			taskId: taskFour.id,
			authorId: userC.id,
		},
	]);

	console.log("Seeding complete.");
	console.log(`Created ${2} projects, ${4} lists, ${4} tasks, ${4} comments.`);
}

main()
	.catch((err) => {
		console.error("Seeding failed:", err);
		process.exitCode = 1;
	})
	.finally(() => {
		process.exit(process.exitCode ?? 0);
	});
