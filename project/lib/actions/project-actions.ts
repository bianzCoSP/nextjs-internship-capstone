"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { queries } from "@/lib/db";
import { projectSchema } from "@/lib/validations";

export type CreateProjectState = {
	success: boolean;
	errors?: Record<string, string[] | undefined>;
};

export async function createProject(
	_prevState: CreateProjectState,
	formData: FormData,
): Promise<CreateProjectState> {
	const { userId: clerkId } = await auth();
	if (!clerkId) return { success: false, errors: { _form: ["Not signed in"] } };

	const rawData = {
		name: formData.get("name") as string,
		description: (formData.get("description") as string) || undefined,
		dueDate: formData.get("dueDate")
			? new Date(formData.get("dueDate") as string)
			: undefined,
	};

	const parsedSchema = projectSchema.safeParse(rawData);
	if (!parsedSchema.success) {
		return {
			success: false,
			errors: z.flattenError(parsedSchema.error).fieldErrors,
		};
	}

	const user = await queries.users.getByClerkId(clerkId);
	if (!user) return { success: false, errors: { _form: ["User not found"] } };

	await queries.projects.create({ ...parsedSchema.data, ownerId: user.id });
	revalidatePath("/projects");
	return { success: true };
}
