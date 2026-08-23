"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { queries } from "@/lib/db";
import { taskSchema } from "@/lib/validations";

export type CreateTaskState = {
	success: boolean;
	errors?: Record<string, string[] | undefined>;
	task?: Awaited<ReturnType<typeof queries.tasks.create>>;
};

const createTaskSchema = taskSchema.omit({ assigneeId: true });

export async function createTask(
	_prevState: CreateTaskState,
	formData: FormData,
): Promise<CreateTaskState> {
	const { userId: clerkId } = await auth();
	if (!clerkId) {
		return { success: false, errors: { _form: ["Not signed in"] } };
	}

	const listId = formData.get("listId") as string;
	if (!listId) {
		return { success: false, errors: { _form: ["Missing list"] } };
	}

	const rawData = {
		title: formData.get("title") as string,
		description: (formData.get("description") as string) || undefined,
		priority: (formData.get("priority") as string) || "medium",
		dueDate: formData.get("dueDate")
			? new Date(formData.get("dueDate") as string)
			: undefined,
	};

	const parsedSchema = createTaskSchema.safeParse(rawData);
	if (!parsedSchema.success) {
		return {
			success: false,
			errors: z.flattenError(parsedSchema.error).fieldErrors,
		};
	}

	const existingTasks = await queries.tasks.getByList(listId);
	const position =
		existingTasks.length > 0
			? Math.max(...existingTasks.map((task) => task.position)) + 1
			: 0;

	const task = await queries.tasks.create({
		...parsedSchema.data,
		listId,
		position,
	});

	const projectSlug = formData.get("projectSlug") as string;
	if (projectSlug) {
		revalidatePath(`/projects/${projectSlug}`);
	}

	return { success: true, task };
}
