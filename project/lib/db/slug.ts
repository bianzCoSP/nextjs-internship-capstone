import { like } from "drizzle-orm";
import slugify from "slugify";
import { db } from "@/lib/db/drizzle";
import { projects } from "./schema";

export async function generateUniqueProjectSlug(name: string): Promise<string> {
	const base = slugify(name, { lower: true, strict: true, trim: true });

	const existing = await db
		.select({ slug: projects.slug })
		.from(projects)
		.where(like(projects.slug, `${base}%`));

	if (existing.length === 0) return base;

	const taken = new Set(existing.map((p) => p.slug));
	if (!taken.has(base)) return base;

	let counter = 2;
	while (taken.has(`${base}-${counter}`)) {
		counter++;
	}
	return `${base}-${counter}`;
}
