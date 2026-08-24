"use client";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/stores/ui-store";
import { CreateProjectModal } from "./modals/create-project-modal";

interface CreateProjectButtonProps {
	className?: string;
}

const DEFAULT_CLASSNAME =
	"inline-flex items-center px-4 py-2 bg-blue_munsell-500 text-white rounded-lg hover:bg-blue_munsell-600 transition-colors";

export function CreateProjectButton({ className }: CreateProjectButtonProps) {
	const router = useRouter();
	const isOpen = useUIStore((state) => state.isCreateProjectModalOpen);
	const openModal = useUIStore((state) => state.openCreateProjectModal);
	const closeModal = useUIStore((state) => state.closeCreateProjectModal);

	return (
		<>
			<button
				type="button"
				onClick={openModal}
				className={className ?? DEFAULT_CLASSNAME}
			>
				<Plus size={20} className="mr-2" />
				New Project
			</button>

			{isOpen && (
				<CreateProjectModal
					onClose={closeModal}
					onCreated={() => router.refresh()}
				/>
			)}
		</>
	);
}
