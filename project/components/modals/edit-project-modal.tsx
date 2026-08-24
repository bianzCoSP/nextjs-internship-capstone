"use client";

import { Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { createPortal, useFormStatus } from "react-dom";
import {
	deleteProject,
	type UpdateProjectState,
	updateProject,
} from "@/lib/actions/project-actions";

interface EditProjectModalProps {
	project: {
		id: string;
		name: string;
		description: string | null;
		dueDate?: Date | string | null;
	};
	onClose: () => void;
	navigateOnRename?: boolean;
}

const initialState: UpdateProjectState = { success: false };

function SubmitButton() {
	const { pending } = useFormStatus();
	return (
		<button
			type="submit"
			disabled={pending}
			className="px-4 py-2 bg-blue_munsell-500 text-white rounded-lg hover:bg-blue_munsell-600 transition-colors disabled:opacity-50 text-sm font-medium"
		>
			{pending ? "Saving…" : "Save Changes"}
		</button>
	);
}

function formatDateInputValue(value?: Date | string | null) {
	if (!value) return "";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "";
	return date.toISOString().slice(0, 10);
}

export function EditProjectModal({
	project,
	onClose,
	navigateOnRename = false,
}: EditProjectModalProps) {
	const router = useRouter();

	const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [deleteError, setDeleteError] = useState<string | null>(null);

	const updateProjectWithId = updateProject.bind(null, project.id);
	const [state, formAction] = useActionState(updateProjectWithId, initialState);

	// biome-ignore lint/correctness/useExhaustiveDependencies: only re-run when state changes
	useEffect(() => {
		if (!state.success) return;
		if (navigateOnRename && state.slug) {
			router.push(`/projects/${state.slug}`);
		}
		onClose();
	}, [state.success, state.slug]);

	async function handleDelete() {
		setIsDeleting(true);
		setDeleteError(null);

		const result = await deleteProject(project.id);

		setIsDeleting(false);

		if (result.success) {
			router.push("/projects");
		} else {
			setDeleteError(result.error ?? "Failed to delete project");
		}
	}

	return createPortal(
		<>
			{/* biome-ignore lint/a11y/noStaticElementInteractions: not interactive, only stops click bubbling into the card's Link */}
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: no action is triggered, so there's no keyboard equivalent needed */}
			<div
				className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="bg-white dark:bg-outer_space-500 rounded-lg p-6 w-full max-w-md mx-4">
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-lg font-semibold text-outer_space-500 dark:text-platinum-500">
							Project Settings
						</h3>
						<button type="button" onClick={onClose}>
							<X size={20} />
						</button>
					</div>

					{state.errors?._form && (
						<p className="text-sm text-red-500 mb-2">{state.errors._form[0]}</p>
					)}

					<form action={formAction} className="space-y-4">
						<div>
							<label className="block text-sm font-medium mb-2">
								Name
								<input
									name="name"
									type="text"
									defaultValue={project.name}
									className="w-full px-3 py-2 border rounded-lg"
									placeholder="Enter project name"
								/>
							</label>
							{state.errors?.name && (
								<p className="text-sm text-red-500">{state.errors.name[0]}</p>
							)}
						</div>

						<div>
							<label className="block text-sm font-medium mb-2">
								Description
								<textarea
									name="description"
									rows={3}
									defaultValue={project.description ?? ""}
									className="w-full px-3 py-2 border rounded-lg"
								/>
							</label>
							{state.errors?.description && (
								<p className="text-sm text-red-500">
									{state.errors.description[0]}
								</p>
							)}
						</div>

						<div>
							<label className="block text-sm font-medium mb-2">
								Due Date
								<input
									name="dueDate"
									type="date"
									defaultValue={formatDateInputValue(project.dueDate)}
									className="w-full px-3 py-2 border rounded-lg"
								/>
							</label>
							{state.errors?.dueDate && (
								<p className="text-sm text-red-500">
									{state.errors.dueDate[0]}
								</p>
							)}
						</div>

						<div className="flex items-center justify-between pt-4">
							<button
								type="button"
								onClick={() => setIsConfirmingDelete(true)}
								className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
							>
								<Trash2 size={16} />
								Delete Project
							</button>

							<div className="flex space-x-3">
								<button
									type="button"
									onClick={onClose}
									className="px-4 py-2 text-sm"
								>
									Cancel
								</button>
								<SubmitButton />
							</div>
						</div>
					</form>
				</div>
			</div>

			{isConfirmingDelete && (
				// biome-ignore lint/a11y/noStaticElementInteractions: not interactive, only stops click bubbling into the card's Link
				// biome-ignore lint/a11y/useKeyWithClickEvents: no action is triggered, so there's no keyboard equivalent needed
				<div
					className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm"
					onClick={(e) => e.stopPropagation()}
				>
					<div className="bg-white dark:bg-outer_space-500 rounded-lg p-6 w-full max-w-sm mx-4 shadow-xl border border-gray-100 dark:border-gray-800 space-y-4">
						<h4 className="text-lg font-semibold text-outer_space-500 dark:text-platinum-500">
							Delete Project?
						</h4>
						<p className="text-sm text-paynes_gray-500 dark:text-french_gray-400">
							Are you sure you want to delete{" "}
							<span className="font-medium text-outer_space-500 dark:text-platinum-500">
								"{project.name}"
							</span>
							? This action cannot be undone.
						</p>
						{deleteError && (
							<p className="text-sm text-red-500">{deleteError}</p>
						)}
						<div className="flex justify-end gap-3 pt-2">
							<button
								type="button"
								onClick={() => setIsConfirmingDelete(false)}
								disabled={isDeleting}
								className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={handleDelete}
								disabled={isDeleting}
								className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
							>
								{isDeleting ? "Deleting…" : "Delete Project"}
							</button>
						</div>
					</div>
				</div>
			)}
		</>,
		document.body,
	);
}
