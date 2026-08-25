"use client";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/stores/ui-store";
import { CreateEventModal } from "./modals/create-event-modal";

interface CreateEventButtonProps {
	projects: { id: string; name: string }[];
	className?: string;
}

const DEFAULT_CLASSNAME =
	"inline-flex items-center px-4 py-2 bg-blue_munsell-500 text-white rounded-lg hover:bg-blue_munsell-600 transition-colors";

export function CreateEventButton({
	projects,
	className,
}: CreateEventButtonProps) {
	const router = useRouter();
	const isOpen = useUIStore((state) => state.isCreateEventModalOpen);
	const openModal = useUIStore((state) => state.openCreateEventModal);
	const closeModal = useUIStore((state) => state.closeCreateEventModal);

	return (
		<>
			<button
				type="button"
				onClick={openModal}
				className={className ?? DEFAULT_CLASSNAME}
			>
				<Plus size={20} className="mr-2" />
				Add Event
			</button>

			{isOpen && (
				<CreateEventModal
					projects={projects}
					onClose={closeModal}
					onCreated={() => router.refresh()}
				/>
			)}
		</>
	);
}
