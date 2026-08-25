"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { queries } from "@/lib/db";

export type InviteCandidate = {
	id: string;
	name: string;
	email: string;
};

export async function searchProjectInviteCandidates(
	projectId: string,
	query: string,
): Promise<InviteCandidate[]> {
	const { userId: clerkId } = await auth();
	if (!clerkId || !projectId || !query.trim()) return [];

	const currentUser = await queries.users.getByClerkId(clerkId);
	if (!currentUser) return [];

	const isMember = await queries.projects.isMember(projectId, currentUser.id);
	if (!isMember) return [];

	const existingMembers = await queries.projects.getMembers(projectId);
	const excludeIds = existingMembers.map((member) => member.id);

	return await queries.users.search(query, excludeIds);
}

export type InviteMemberState = {
	success: boolean;
	error?: string;
	addedCount?: number;
};

export async function inviteProjectMembers(
	projectId: string,
	userIds: string[],
): Promise<InviteMemberState> {
	const { userId: clerkId } = await auth();
	if (!clerkId) return { success: false, error: "Not signed in" };

	const uniqueUserIds = [...new Set(userIds)];

	if (!projectId || uniqueUserIds.length === 0) {
		return { success: false, error: "Missing project or users" };
	}

	const currentUser = await queries.users.getByClerkId(clerkId);
	if (!currentUser) return { success: false, error: "User not found" };

	const isMember = await queries.projects.isMember(projectId, currentUser.id);
	if (!isMember) {
		return { success: false, error: "You don't have access to this project" };
	}

	const project = await queries.projects.getById(projectId);
	if (!project) return { success: false, error: "Project not found" };

	const added = await queries.projects.addMembers(projectId, uniqueUserIds);

	revalidatePath("/team");
	revalidatePath(`/projects/${project.slug}`);
	revalidatePath("/projects");

	if (added.length === 0) {
		return {
			success: false,
			error:
				uniqueUserIds.length === 1
					? "That person is already a member of this project"
					: "Those people are already members of this project",
		};
	}

	return { success: true, addedCount: added.length };
}
