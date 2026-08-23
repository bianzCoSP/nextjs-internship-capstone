"use client";

import { X } from "lucide-react";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import type { CreateTaskState } from "@/lib/actions/task-actions";
import { useBoardStore } from "@/stores/board-store";

interface CreateTaskModalProps {
	listId: string;
	projectSlug: string;
	onClose: () => void;
}

const initialState: CreateTaskState = { success: false };

function SubmitButton() {
	const { pending } = useFormStatus();
	return (
		<button
			type="submit"
			disabled={pending}
			className="px-4 py-2 bg-blue_munsell-500 text-white rounded-lg hover:bg-blue_munsell-600 transition-colors disabled:opacity-50"
		>
			{pending ? "Creating…" : "Create Task"}
		</button>
	);
}

export function CreateTaskModal({
	listId,
	projectSlug,
	onClose,
}: CreateTaskModalProps) {
	const createTask = useBoardStore((state) => state.createTask);

	const [state, formAction] = useActionState(
		async (
			_prevState: CreateTaskState,
			formData: FormData,
		): Promise<CreateTaskState> => {
			const priority =
				(formData.get("priority") as "low" | "medium" | "high") || "medium";

			return createTask({
				listId,
				projectSlug,
				title: formData.get("title") as string,
				description: (formData.get("description") as string) || undefined,
				priority,
				dueDate: (formData.get("dueDate") as string) || undefined,
			});
		},
		initialState,
	);

	useEffect(() => {
		if (state.success) {
			onClose();
		}
	}, [state.success, onClose]);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
			<div className="bg-white dark:bg-outer_space-500 rounded-lg p-6 w-full max-w-md mx-4">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-lg font-semibold text-outer_space-500 dark:text-platinum-500">
						Create New Task
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
									defaultValue="medium"
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

					<div className="flex justify-end space-x-3 pt-4">
						<button type="button" onClick={onClose} className="px-4 py-2">
							Cancel
						</button>
						<SubmitButton />
					</div>
				</form>
			</div>
		</div>
	);
}
