"use client";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CreateProjectModal } from "./modals/create-project-modal";

export function CreateProjectButton() {
	const [isOpen, setIsOpen] = useState(false);
	const router = useRouter();

	return (
		<>
			<button
				type="button"
				onClick={() => setIsOpen(true)}
				className="inline-flex items-center px-4 py-2 bg-blue_munsell-500 text-white rounded-lg hover:bg-blue_munsell-600 transition-colors"
			>
				<Plus size={20} className="mr-2" />
				New Project
			</button>

			{isOpen && (
				<CreateProjectModal
					onClose={() => setIsOpen(false)}
					onCreated={() => router.refresh()}
				/>
			)}
		</>
	);
}
