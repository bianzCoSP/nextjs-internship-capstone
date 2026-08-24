"use client";

import { Settings } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { EditProjectModal } from "./modals/edit-project-modal";

interface ProjectSettingsButtonProps {
	project: {
		id: string;
		name: string;
		description: string | null;
		dueDate?: Date | string | null;
	};
	navigateOnRename?: boolean;
}

export function ProjectSettingsButton({
	project,
	navigateOnRename = true,
}: ProjectSettingsButtonProps) {
	const isOpen = useUIStore((state) => state.editProjectId === project.id);
	const openEditProjectModal = useUIStore(
		(state) => state.openEditProjectModal,
	);
	const closeEditProjectModal = useUIStore(
		(state) => state.closeEditProjectModal,
	);

	return (
		<>
			<button
				type="button"
				onClick={(e) => {
					e.preventDefault();
					e.stopPropagation();
					openEditProjectModal(project.id);
				}}
				className="p-2 hover:bg-platinum-500 dark:hover:bg-paynes_gray-400 rounded-lg transition-colors"
			>
				<Settings size={20} />
			</button>

			{isOpen ? (
				<EditProjectModal
					project={project}
					onClose={closeEditProjectModal}
					navigateOnRename={navigateOnRename}
				/>
			) : null}
		</>
	);
}
