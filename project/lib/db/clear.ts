import readline from "node:readline/promises";
import { config } from "dotenv";

config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
	throw new Error("DATABASE_URL is not set in environment");
}

const FORCE = process.argv.includes("--yes") || process.argv.includes("-y");

async function confirm() {
	if (FORCE) return true;

	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	const answer = await rl.question(
		`This will permanently delete all projects, lists, tasks, comments, and\nproject/task assignments from:\n  ${process.env.DATABASE_URL}\n(users will NOT be touched)\nType "yes" to continue: `,
	);
	rl.close();

	return answer.trim().toLowerCase() === "yes";
}

async function main() {
	const ok = await confirm();
	if (!ok) {
		console.log("Aborted. No data was deleted.");
		return;
	}

	const { db } = await import("./drizzle");
	const { comments, taskAssignees, tasks, lists, projectMembers, projects } =
		await import("./schema");

	console.log("Clearing database (users untouched)...");

	await db.delete(comments);
	await db.delete(taskAssignees);
	await db.delete(tasks);
	await db.delete(lists);
	await db.delete(projectMembers);
	await db.delete(projects);

	console.log("Database cleared.");
}

main()
	.catch((err) => {
		console.error("Clearing failed:", err);
		process.exitCode = 1;
	})
	.finally(() => {
		process.exit(process.exitCode ?? 0);
	});
