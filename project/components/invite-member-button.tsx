"use client";

import { UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { InviteMemberModal } from "./modals/invite-member-modal";

interface InviteMemberButtonProps {
	projects: { id: string; name: string }[];
	className?: string;
}

const DEFAULT_CLASSNAME =
	"inline-flex items-center px-4 py-2 bg-blue_munsell-500 text-white rounded-lg hover:bg-blue_munsell-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

export function InviteMemberButton({
	projects,
	className,
}: InviteMemberButtonProps) {
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<button
				type="button"
				onClick={() => setIsOpen(true)}
				disabled={projects.length === 0}
				title={
					projects.length === 0 ? "Join or create a project first" : undefined
				}
				className={className ?? DEFAULT_CLASSNAME}
			>
				<UserPlus size={20} className="mr-2" />
				Invite Member
			</button>

			{isOpen && (
				<InviteMemberModal
					projects={projects}
					onClose={() => setIsOpen(false)}
					onInvited={() => router.refresh()}
				/>
			)}
		</>
	);
}
