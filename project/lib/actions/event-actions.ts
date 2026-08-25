"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { queries } from "@/lib/db";
import { eventSchema } from "@/lib/validations";

function parseEventFormData(formData: FormData) {
	const rawStartDate = formData.get("startDate") as string;
	const rawEndDate = formData.get("endDate") as string;
	const rawColor = formData.get("color") as string;
	const rawProjectId = formData.get("projectId") as string;

	return {
		title: formData.get("title") as string,
		description: (formData.get("description") as string) || undefined,
		startDate: rawStartDate ? new Date(rawStartDate) : undefined,
		endDate: rawEndDate ? new Date(rawEndDate) : undefined,
		allDay: formData.get("allDay") === "on",
		color: rawColor || undefined,
		projectId: rawProjectId || undefined,
	};
}

export type CreateEventState = {
	success: boolean;
	errors?: Record<string, string[] | undefined>;
};

export async function createEvent(
	_prevState: CreateEventState,
	formData: FormData,
): Promise<CreateEventState> {
	const { userId: clerkId } = await auth();
	if (!clerkId) return { success: false, errors: { _form: ["Not signed in"] } };

	const rawData = parseEventFormData(formData);

	const parsedSchema = eventSchema.safeParse(rawData);
	if (!parsedSchema.success) {
		return {
			success: false,
			errors: z.flattenError(parsedSchema.error).fieldErrors,
		};
	}

	const user = await queries.users.getByClerkId(clerkId);
	if (!user) return { success: false, errors: { _form: ["User not found"] } };

	if (parsedSchema.data.projectId) {
		const isMember = await queries.projects.isMember(
			parsedSchema.data.projectId,
			user.id,
		);
		if (!isMember) {
			return {
				success: false,
				errors: { _form: ["You're not a member of that project"] },
			};
		}
	}

	await queries.events.create({ ...parsedSchema.data, creatorId: user.id });
	revalidatePath("/calendar");
	return { success: true };
}

export type UpdateEventState = {
	success: boolean;
	errors?: Record<string, string[] | undefined>;
};

export async function updateEvent(
	eventId: string,
	_prevState: UpdateEventState,
	formData: FormData,
): Promise<UpdateEventState> {
	const { userId: clerkId } = await auth();
	if (!clerkId) return { success: false, errors: { _form: ["Not signed in"] } };

	if (!eventId) {
		return { success: false, errors: { _form: ["Missing event"] } };
	}

	const rawData = parseEventFormData(formData);

	const parsedSchema = eventSchema.safeParse(rawData);
	if (!parsedSchema.success) {
		return {
			success: false,
			errors: z.flattenError(parsedSchema.error).fieldErrors,
		};
	}

	const existing = await queries.events.getById(eventId);
	if (!existing) {
		return { success: false, errors: { _form: ["Event not found"] } };
	}

	const updated = await queries.events.update(eventId, parsedSchema.data);
	if (!updated) {
		return { success: false, errors: { _form: ["Failed to update event"] } };
	}

	revalidatePath("/calendar");
	return { success: true };
}

export type DeleteEventState = {
	success: boolean;
	error?: string;
};

export async function deleteEvent(eventId: string): Promise<DeleteEventState> {
	const { userId: clerkId } = await auth();
	if (!clerkId) {
		return { success: false, error: "Not signed in" };
	}

	if (!eventId) {
		return { success: false, error: "Missing event" };
	}

	const existing = await queries.events.getById(eventId);
	if (!existing) {
		return { success: false, error: "Event not found" };
	}

	try {
		await queries.events.delete(eventId);
	} catch {
		return { success: false, error: "Failed to delete event" };
	}

	revalidatePath("/calendar");
	return { success: true };
}
