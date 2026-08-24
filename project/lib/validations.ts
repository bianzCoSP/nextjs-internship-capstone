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
	assigneeId: z.string().optional(),
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
