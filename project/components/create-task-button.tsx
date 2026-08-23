"use client";
import { Plus } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";

interface CreateTaskButtonProps {
	listId: string;
}

export function CreateTaskButton({ listId }: CreateTaskButtonProps) {
	const openCreateTaskModal = useUIStore((state) => state.openCreateTaskModal);

	return (
		<button
			type="button"
			onClick={() => openCreateTaskModal(listId)}
			className="w-full p-3 border-2 border-dashed border-french_gray-300 dark:border-paynes_gray-400 rounded-lg text-paynes_gray-500 dark:text-french_gray-400 hover:border-blue_munsell-500 hover:text-blue_munsell-500 transition-colors inline-flex items-center justify-center"
		>
			<Plus size={16} className="mr-1" />
			Add task
		</button>
	);
}
