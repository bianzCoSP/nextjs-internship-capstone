import { config } from "dotenv";

config({ path: ".env.local" });

if (!process.env.DIRECT_URL) {
	throw new Error("DIRECT_URL is not set in environment");
}

const MIGRATIONS_FOLDER = "./drizzle";

async function main() {
	const { drizzle } = await import("drizzle-orm/neon-http");
	const { migrate } = await import("drizzle-orm/neon-http/migrator");

	const db = drizzle(process.env.DIRECT_URL as string);

	console.log("Running migrations...");

	await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });

	console.log("Migrations applied.");
}

main()
	.catch((err) => {
		console.error("Migration failed:", err);
		process.exitCode = 1;
	})
	.finally(() => {
		process.exit(process.exitCode ?? 0);
	});
