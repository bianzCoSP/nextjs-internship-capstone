import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

const directUrl = process.env.DIRECT_URL;

if (!directUrl) {
	throw new Error("DIRECT_URL not set in environment");
}

export default defineConfig({
	out: "./drizzle",
	schema: "./lib/db/schema.ts",
	dialect: "postgresql",
	dbCredentials: {
		url: directUrl,
	},
});
