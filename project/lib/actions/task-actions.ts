"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { queries } from "@/lib/db";
import { taskSchema } from "@/lib/validations";

const LIST_NAME_TO_STATUS = new Set(["To Do", "In Progress", "Review", "Done"]);

export type CreateTaskState = {
	success: boolean;
	errors?: Record<string, string[] | undefined>;
	task?: Awaited<ReturnType<typeof queries.tasks.create>> & {
		assigneeName?: string | null;
	};
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

	const user = await queries.users.getByClerkId(clerkId);
	if (!user) {
		return { success: false, errors: { _form: ["User not found"] } };
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
		assigneeId: user.id,
	});

	const projectSlug = formData.get("projectSlug") as string;
	if (projectSlug) {
		revalidatePath(`/projects/${projectSlug}`);
	}
	revalidatePath("/projects");

	return { success: true, task: { ...task, assigneeName: user.name } };
}

export type MoveTaskState = {
	success: boolean;
	error?: string;
};

export type MoveTaskInput = {
	taskId: string;
	sourceListId: string;
	destinationListId: string;
	sourceOrderedIds: string[];
	destinationOrderedIds: string[];
	projectSlug?: string;
};

export async function moveTask(input: MoveTaskInput): Promise<MoveTaskState> {
	const { userId: clerkId } = await auth();
	if (!clerkId) {
		return { success: false, error: "Not signed in" };
	}

	const {
		taskId,
		sourceListId,
		destinationListId,
		sourceOrderedIds,
		destinationOrderedIds,
		projectSlug,
	} = input;

	if (!taskId || !destinationListId || destinationOrderedIds.length === 0) {
		return { success: false, error: "Missing task or list" };
	}

	try {
		if (sourceListId === destinationListId) {
			await queries.tasks.reorder(destinationListId, destinationOrderedIds);
		} else {
			await queries.tasks.move({
				taskId,
				destinationListId,
				sourceOrderedIds,
				destinationOrderedIds,
			});

			const destinationList = await queries.lists.getById(destinationListId);
			if (destinationList && LIST_NAME_TO_STATUS.has(destinationList.name)) {
				await queries.tasks.update(taskId, {
					status: destinationList.name as
						| "To Do"
						| "In Progress"
						| "Review"
						| "Done",
				});
			}
		}
	} catch {
		return { success: false, error: "Failed to move task" };
	}

	if (projectSlug) {
		revalidatePath(`/projects/${projectSlug}`);
	}
	revalidatePath("/projects");

	return { success: true };
}
