import { config } from "dotenv";
import { eq } from "drizzle-orm";
import slugify from "slugify";

config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
	throw new Error("DATABASE_URL is not set in environment");
}

async function main() {
	const { db } = await import("./drizzle");
	const {
		comments,
		lists,
		projectMembers,
		projects,
		taskAssignees,
		tasks,
		users,
	} = await import("./schema");

	async function resetSeedData() {
		console.log("Clearing previously seeded data (users untouched)...");

		await db.delete(comments);
		await db.delete(taskAssignees);
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

	console.log("Assigning roles to seeded users...");

	await db
		.update(users)
		.set({ role: "Admin", updatedAt: new Date() })
		.where(eq(users.id, userA.id));

	if (userB.id !== userA.id) {
		await db
			.update(users)
			.set({ role: "Member", updatedAt: new Date() })
			.where(eq(users.id, userB.id));
	}

	if (userC.id !== userA.id && userC.id !== userB.id) {
		await db
			.update(users)
			.set({ role: "Member", updatedAt: new Date() })
			.where(eq(users.id, userC.id));
	}

	const [projectAlpha, projectBeta] = await db
		.insert(projects)
		.values([
			{
				name: "Website Redesign",
				slug: slugify("Website Redesign", { lower: true, strict: true }),
				description: "Revamp marketing site with new brand guidelines",
				status: "In Progress",
				color: "#4a89a9",
				ownerId: userA.id,
				dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
			},
			{
				name: "Mobile App Launch",
				slug: slugify("Mobile App Launch", { lower: true, strict: true }),
				description: "Ship v1.0 of the companion mobile app",
				status: "To Do",
				color: "#ef4444",
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

	const [
		todoAlpha,
		inProgressAlpha,
		reviewAlpha,
		doneAlpha,
		todoBeta,
		inProgressBeta,
		reviewBeta,
		doneBeta,
	] = await db
		.insert(lists)
		.values([
			{ name: "To Do", projectId: projectAlpha.id, position: 0 },
			{ name: "In Progress", projectId: projectAlpha.id, position: 1 },
			{ name: "Review", projectId: projectAlpha.id, position: 2 },
			{ name: "Done", projectId: projectAlpha.id, position: 3 },
			{ name: "To Do", projectId: projectBeta.id, position: 0 },
			{ name: "In Progress", projectId: projectBeta.id, position: 1 },
			{ name: "Review", projectId: projectBeta.id, position: 2 },
			{ name: "Done", projectId: projectBeta.id, position: 3 },
		])
		.returning();

	void reviewAlpha;
	void inProgressBeta;
	void reviewBeta;

	const [
		taskOne,
		taskTwo,
		taskThree,
		taskFour,
		taskFive,
		taskSix,
		taskSeven,
		taskEight,
	] = await db
		.insert(tasks)
		.values([
			{
				title: "Design new homepage hero",
				description: "Explore 3 concepts and present to stakeholders",
				listId: todoAlpha.id,
				creatorId: userA.id,
				priority: "high",
				status: "To Do",
				position: 0,
				dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
				completionDate: null,
			},
			{
				title: "Set up CI/CD pipeline",
				description: "Automate build and deploy on merge to main",
				listId: inProgressAlpha.id,
				creatorId: userB.id,
				priority: "medium",
				status: "In Progress",
				position: 0,
				dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
				completionDate: null,
			},
			{
				title: "Migrate legacy blog posts",
				description: "Move all posts from the old CMS and set up redirects",
				listId: doneAlpha.id,
				creatorId: userA.id,
				priority: "low",
				status: "Done",
				position: 0,
				dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
				createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
				completionDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
			},
			{
				title: "Define app onboarding flow",
				description: "Wireframe the first-run experience",
				listId: todoBeta.id,
				creatorId: userC.id,
				priority: "medium",
				status: "To Do",
				position: 0,
				dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
				completionDate: null,
			},
			{
				title: "Write API documentation",
				description: "Document all REST endpoints for the mobile team",
				listId: doneAlpha.id,
				creatorId: userB.id,
				priority: "medium",
				status: "Done",
				position: 1,
				dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
				createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
				completionDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
			},
			{
				title: "Fix critical security bug",
				description: "Patch the auth token validation vulnerability",
				listId: doneBeta.id,
				creatorId: userC.id,
				priority: "high",
				status: "Done",
				position: 0,
				dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
				createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
				completionDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
			},
			{
				title: "Optimize database queries",
				description: "Add missing indexes and cut p95 query time in half",
				listId: doneAlpha.id,
				creatorId: userA.id,
				priority: "medium",
				status: "Done",
				position: 2,
				dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
				createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6),
				completionDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
			},
			{
				title: "Update dependency versions",
				description: "Bump outdated npm packages and resolve breaking changes",
				listId: doneBeta.id,
				creatorId: userB.id,
				priority: "low",
				status: "Done",
				position: 1,
				dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
				createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
				completionDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
			},
		])
		.returning();

	console.log("Assigning tasks to project members...");

	const taskAssigneeMap: Record<string, string[]> = {
		[taskOne.id]: [userA.id, userB.id],
		[taskTwo.id]: [userB.id],
		[taskThree.id]: [userA.id],
		[taskFour.id]: [userC.id, userB.id],
		[taskFive.id]: [userB.id],
		[taskSix.id]: [userC.id],
		[taskSeven.id]: [userA.id],
		[taskEight.id]: [userB.id],
	};

	const taskAssigneeRows = Object.entries(taskAssigneeMap).flatMap(
		([taskId, userIds]) =>
			Array.from(new Set(userIds)).map((userId) => ({ taskId, userId })),
	);

	await db.insert(taskAssignees).values(taskAssigneeRows);

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
	console.log(
		`Created ${2} projects, ${8} lists, ${8} tasks, ${taskAssigneeRows.length} task assignments, ${4} comments.`,
	);
}

main()
	.catch((err) => {
		console.error("Seeding failed:", err);
		process.exitCode = 1;
	})
	.finally(() => {
		process.exit(process.exitCode ?? 0);
	});
