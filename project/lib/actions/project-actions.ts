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

	const rawDueDate = formData.get("dueDate") as string;
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const rawData = {
		name: formData.get("name") as string,
		description: (formData.get("description") as string) || undefined,
		dueDate: rawDueDate ? new Date(rawDueDate) : today,
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

export type UpdateProjectState = {
	success: boolean;
	errors?: Record<string, string[] | undefined>;
	slug?: string;
};

export async function updateProject(
	projectId: string,
	_prevState: UpdateProjectState,
	formData: FormData,
): Promise<UpdateProjectState> {
	const { userId: clerkId } = await auth();
	if (!clerkId) return { success: false, errors: { _form: ["Not signed in"] } };

	const rawDueDate = formData.get("dueDate") as string;

	const rawData = {
		name: formData.get("name") as string,
		description: (formData.get("description") as string) || undefined,
		dueDate: rawDueDate ? new Date(rawDueDate) : undefined,
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

	const existing = await queries.projects.getById(projectId);
	if (!existing) {
		return { success: false, errors: { _form: ["Project not found"] } };
	}

	const updates = Object.fromEntries(
		Object.entries(parsedSchema.data).filter(
			([, value]) => value !== undefined,
		),
	);

	const updated = await queries.projects.update(projectId, updates);
	if (!updated) {
		return { success: false, errors: { _form: ["Failed to update project"] } };
	}

	revalidatePath(`/projects/${existing.slug}`);
	if (updated.slug !== existing.slug) {
		revalidatePath(`/projects/${updated.slug}`);
	}
	revalidatePath("/projects");

	return { success: true, slug: updated.slug };
}

export type DeleteProjectState = {
	success: boolean;
	error?: string;
};

export async function deleteProject(
	projectId: string,
): Promise<DeleteProjectState> {
	const { userId: clerkId } = await auth();
	if (!clerkId) return { success: false, error: "Not signed in" };

	const existing = await queries.projects.getById(projectId);
	if (!existing) return { success: false, error: "Project not found" };

	try {
		await queries.projects.delete(projectId);
	} catch {
		return { success: false, error: "Failed to delete project" };
	}

	revalidatePath(`/projects/${existing.slug}`);
	revalidatePath("/projects");

	return { success: true };
}
