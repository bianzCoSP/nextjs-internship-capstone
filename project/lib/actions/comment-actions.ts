"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { queries } from "@/lib/db/index";

export type AddCommentState = {
	success: boolean;
	error?: string;
};

export async function addComment(
	taskId: string,
	taskSlug: string,
	_prevState: AddCommentState,
	formData: FormData,
): Promise<AddCommentState> {
	const { userId: clerkId } = await auth();
	if (!clerkId) {
		return { success: false, error: "Not signed in" };
	}

	if (!taskId) {
		return { success: false, error: "Missing task" };
	}

	const content = (formData.get("content") as string)?.trim();
	if (!content) {
		return { success: false, error: "Comment cannot be empty" };
	}
	if (content.length > 2000) {
		return { success: false, error: "Comment is too long" };
	}

	const user = await queries.users.getByClerkId(clerkId);
	if (!user) {
		return { success: false, error: "User not found" };
	}

	await queries.comments.create({
		taskId,
		authorId: user.id,
		content,
	});

	revalidatePath(`/projects/tasks/${taskSlug}`);

	return { success: true };
}
