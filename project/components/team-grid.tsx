"use client";

import { Mail, MoreHorizontal, UserPlus, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { queries } from "@/lib/db";
import { InviteMemberModal } from "./modals/invite-member-modal";

export type TeamMember = Awaited<
	ReturnType<typeof queries.users.getTeammates>
>[number];

interface ProjectOption {
	id: string;
	name: string;
}

function getInitials(name: string) {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase());
	return initials.join("") || "?";
}

function TeamMemberCard({
	member,
	onInvite,
}: {
	member: TeamMember;
	onInvite: (member: TeamMember) => void;
}) {
	const [menuOpen, setMenuOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!menuOpen) return;

		function handlePointerDown(event: MouseEvent) {
			if (!menuRef.current?.contains(event.target as Node)) {
				setMenuOpen(false);
			}
		}

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") setMenuOpen(false);
		}

		document.addEventListener("mousedown", handlePointerDown);
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("mousedown", handlePointerDown);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [menuOpen]);

	return (
		<div className="bg-white dark:bg-outer_space-500 rounded-lg border border-french_gray-300 dark:border-paynes_gray-400 p-6">
			<div className="flex items-start justify-between mb-4">
				<div className="flex items-center space-x-3">
					<div className="w-12 h-12 bg-blue_munsell-500 rounded-full flex items-center justify-center text-white font-semibold">
						{getInitials(member.name)}
					</div>
					<div>
						<h3 className="font-semibold text-outer_space-500 dark:text-platinum-500">
							{member.name}
						</h3>
						<p className="text-sm text-paynes_gray-500 dark:text-french_gray-400">
							{member.role}
						</p>
					</div>
				</div>

				<div className="relative" ref={menuRef}>
					<button
						type="button"
						onClick={() => setMenuOpen((open) => !open)}
						aria-haspopup="menu"
						aria-expanded={menuOpen}
						className="p-1 hover:bg-platinum-500 dark:hover:bg-paynes_gray-400 rounded"
					>
						<MoreHorizontal size={16} />
					</button>
					{menuOpen && (
						<div
							role="menu"
							className="absolute right-0 mt-1 w-44 bg-white dark:bg-outer_space-500 border border-french_gray-300 dark:border-paynes_gray-400 rounded-lg shadow-lg z-10 overflow-hidden"
						>
							<button
								type="button"
								role="menuitem"
								onClick={() => {
									setMenuOpen(false);
									onInvite(member);
								}}
								className="flex w-full items-center px-4 py-2 text-sm text-left text-outer_space-500 dark:text-platinum-500 hover:bg-platinum-500 dark:hover:bg-paynes_gray-400"
							>
								<UserPlus size={14} className="mr-2 shrink-0" />
								Invite to project
							</button>
						</div>
					)}
				</div>
			</div>

			<div className="flex items-center text-sm text-paynes_gray-500 dark:text-french_gray-400 mb-4">
				<Mail size={16} className="mr-2 shrink-0" />
				<span className="truncate">{member.email}</span>
			</div>

			<div className="flex items-center justify-between">
				<span className="px-2 py-1 text-xs font-medium rounded-full bg-blue_munsell-100 text-blue_munsell-700 dark:bg-blue_munsell-900 dark:text-blue_munsell-300">
					{member.role}
				</span>
				<div className="text-sm text-paynes_gray-500 dark:text-french_gray-400">
					{member.sharedProjectCount}{" "}
					{member.sharedProjectCount === 1
						? "shared project"
						: "shared projects"}
				</div>
			</div>
		</div>
	);
}

export function TeamGrid({
	members,
	projects,
}: {
	members: TeamMember[];
	projects: ProjectOption[];
}) {
	const router = useRouter();
	const [inviteTarget, setInviteTarget] = useState<TeamMember | null>(null);

	if (members.length === 0) {
		return (
			<div className="bg-white dark:bg-outer_space-500 rounded-lg border border-french_gray-300 dark:border-paynes_gray-400 p-12 text-center">
				<Users className="mx-auto mb-3 text-paynes_gray-500 dark:text-french_gray-400" />
				<p className="text-paynes_gray-500 dark:text-french_gray-400">
					You don't share any projects with other members yet.
				</p>
				<p className="text-sm text-paynes_gray-400 dark:text-french_gray-500 mt-1">
					Add teammates to a project to see them here.
				</p>
			</div>
		);
	}

	return (
		<>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{members.map((member) => (
					<TeamMemberCard
						key={member.id}
						member={member}
						onInvite={setInviteTarget}
					/>
				))}
			</div>

			{inviteTarget && (
				<InviteMemberModal
					projects={projects}
					preselectedMember={{
						id: inviteTarget.id,
						name: inviteTarget.name,
						email: inviteTarget.email,
					}}
					onClose={() => setInviteTarget(null)}
					onInvited={() => router.refresh()}
				/>
			)}
		</>
	);
}
