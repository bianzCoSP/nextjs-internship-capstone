// TODO: Task 4.1 - Implement project CRUD operations
// TODO: Task 4.4 - Build task creation and editing functionality

/*
TODO: Implementation Notes for Interns:

Modal for creating new projects with form validation.

Features to implement:
- Form with project name, description, due date
- Zod validation
- Error handling
- Loading states
- Success feedback
- Team member assignment
- Project template selection

Form fields:
- Name (required)
- Description (optional)
- Due date (optional)
- Team members (optional)
- Project template (optional)
- Privacy settings

Integration:
- Use project validation schema from lib/validations.ts
- Call project creation API
- Update project list optimistically
- Handle errors gracefully
*/

"use client";

import { X } from "lucide-react";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { ColorPicker } from "@/components/color-picker";
import {
	type CreateProjectState,
	createProject,
} from "@/lib/actions/project-actions";

interface CreateProjectModalProps {
	onClose: () => void;
	onCreated?: () => void;
}

const initialState: CreateProjectState = { success: false };

function SubmitButton() {
	const { pending } = useFormStatus();
	return (
		<button
			type="submit"
			disabled={pending}
			className="px-4 py-2 bg-blue_munsell-500 text-white rounded-lg hover:bg-blue_munsell-600 transition-colors disabled:opacity-50"
		>
			{pending ? "Creating…" : "Create Project"}
		</button>
	);
}

export function CreateProjectModal({
	onClose,
	onCreated,
}: CreateProjectModalProps) {
	const [state, formAction] = useActionState(createProject, initialState);

	useEffect(() => {
		if (state.success) {
			onCreated?.();
			onClose();
		}
	}, [state.success, onClose, onCreated]);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
			<div className="bg-white dark:bg-outer_space-500 rounded-lg p-6 w-full max-w-md mx-4">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-lg font-semibold">Create New Project</h3>
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
							Project Name
							<input
								name="name"
								type="text"
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
								className="w-full px-3 py-2 border rounded-lg"
							/>
						</label>
						{state.errors?.dueDate && (
							<p className="text-sm text-red-500">{state.errors.dueDate[0]}</p>
						)}
					</div>

					<ColorPicker error={state.errors?.color?.[0]} />

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
