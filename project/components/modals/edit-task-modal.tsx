"use client";

import { Trash2, X } from "lucide-react";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
	AssigneeSelect,
	type ProjectMemberOption,
} from "@/components/assignee-select";
import type { KanbanTask } from "@/components/kanban-board";
import { useBoardStore } from "@/stores/board-store";

interface EditTaskModalProps {
	task: KanbanTask;
	members: ProjectMemberOption[];
	onClose: () => void;
}

type EditTaskFormState = {
	success: boolean;
	errors?: Record<string, string[] | undefined>;
};

const initialState: EditTaskFormState = { success: false };

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

export function EditTaskModal({ task, members, onClose }: EditTaskModalProps) {
	const updateTask = useBoardStore((state) => state.updateTask);
	const deleteTask = useBoardStore((state) => state.deleteTask);

	const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [deleteError, setDeleteError] = useState<string | null>(null);
	const [assigneeIds, setAssigneeIds] = useState<string[]>(
		task.assignees?.map((assignee) => assignee.id) ?? [],
	);

	const [state, formAction] = useActionState(
		async (
			_prevState: EditTaskFormState,
			formData: FormData,
		): Promise<EditTaskFormState> => {
			const priority =
				(formData.get("priority") as "low" | "medium" | "high") || "medium";

			const result = await updateTask(task.id, {
				title: formData.get("title") as string,
				description: (formData.get("description") as string) || undefined,
				priority,
				dueDate: (formData.get("dueDate") as string) || undefined,
				assigneeIds,
			});

			if (result.success) {
				onClose();
			}

			return { success: result.success, errors: result.errors };
		},
		initialState,
	);

	async function handleDelete() {
		setIsDeleting(true);
		setDeleteError(null);

		const result = await deleteTask(task.id);

		setIsDeleting(false);

		if (result.success) {
			onClose();
		} else {
			setDeleteError(result.error ?? "Failed to delete task");
		}
	}

	return (
		<>
			<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
				<div className="bg-white dark:bg-outer_space-500 rounded-lg p-6 w-full max-w-md mx-4">
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-lg font-semibold text-outer_space-500 dark:text-platinum-500">
							Edit Task
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
								Title
								<input
									name="title"
									type="text"
									defaultValue={task.title}
									className="w-full px-3 py-2 border rounded-lg"
									placeholder="Enter task title"
								/>
							</label>
							{state.errors?.title && (
								<p className="text-sm text-red-500">{state.errors.title[0]}</p>
							)}
						</div>

						<div>
							<label className="block text-sm font-medium mb-2">
								Description
								<textarea
									name="description"
									rows={3}
									defaultValue={task.description ?? ""}
									className="w-full px-3 py-2 border rounded-lg"
								/>
							</label>
							{state.errors?.description && (
								<p className="text-sm text-red-500">
									{state.errors.description[0]}
								</p>
							)}
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium mb-2">
									Priority
									<select
										name="priority"
										defaultValue={task.priority}
										className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-outer_space-500"
									>
										<option value="low">Low</option>
										<option value="medium">Medium</option>
										<option value="high">High</option>
									</select>
								</label>
								{state.errors?.priority && (
									<p className="text-sm text-red-500">
										{state.errors.priority[0]}
									</p>
								)}
							</div>

							<div>
								<label className="block text-sm font-medium mb-2">
									Due Date
									<input
										name="dueDate"
										type="date"
										defaultValue={formatDateInputValue(task.dueDate)}
										className="w-full px-3 py-2 border rounded-lg"
									/>
								</label>
								{state.errors?.dueDate && (
									<p className="text-sm text-red-500">
										{state.errors.dueDate[0]}
									</p>
								)}
							</div>
						</div>

						<AssigneeSelect
							members={members}
							selectedIds={assigneeIds}
							onChange={setAssigneeIds}
							error={state.errors?.assigneeIds?.[0]}
						/>

						<div className="flex items-center justify-between pt-4">
							<button
								type="button"
								onClick={() => setIsConfirmingDelete(true)}
								className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
							>
								<Trash2 size={16} />
								Delete Task
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
				<div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm">
					<div className="bg-white dark:bg-outer_space-500 rounded-lg p-6 w-full max-w-sm mx-4 shadow-xl border border-gray-100 dark:border-gray-800 space-y-4">
						<h4 className="text-lg font-semibold text-outer_space-500 dark:text-platinum-500">
							Delete Task?
						</h4>
						<p className="text-sm text-paynes_gray-500 dark:text-french_gray-400">
							Are you sure you want to delete{" "}
							<span className="font-medium text-outer_space-500 dark:text-platinum-500">
								"{task.title}"
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
								{isDeleting ? "Deleting…" : "Delete Task"}
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
