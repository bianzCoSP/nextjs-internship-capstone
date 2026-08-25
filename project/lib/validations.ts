import { z } from "zod";

function isNotInPast(date: Date) {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	return date >= today;
}

export const projectSchema = z.object({
	name: z.string().min(1, "Name is required").max(100, "Name too long"),
	description: z.string().max(500, "Description too long").optional(),
	dueDate: z
		.date()
		.refine(isNotInPast, { message: "Due date can't be in the past" }),
	color: z
		.string()
		.regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Enter a valid hex color")
		.optional(),
	status: z.enum(["To Do", "In Progress", "Review", "Done"]).optional(),
});

export const taskSchema = z.object({
	title: z.string().min(1, "Title is required").max(200, "Title too long"),
	description: z
		.string({ message: "Description is required" })
		.min(1, "Description is required")
		.max(1000, "Description too long"),
	priority: z.enum(["low", "medium", "high"]),
	dueDate: z
		.date({ message: "Due date is required" })
		.refine(isNotInPast, { message: "Due date can't be in the past" }),
	creatorId: z.string().optional(),
});

export const userSchema = z.object({
	email: z.email(),
	name: z.string().min(1, "Name is required").max(100, "Name too long"),
});

export const listSchema = z.object({
	name: z.string().min(1, "Name is required").max(100, "Name too long"),
});

export const commentSchema = z.object({
	content: z.string().max(1000, "Comment is too long").optional(),
});
