"use client";

import { X } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { ColorPicker } from "@/components/color-picker";
import {
	type CreateEventState,
	createEvent,
} from "@/lib/actions/event-actions";

interface CreateEventModalProps {
	projects: { id: string; name: string }[];
	onClose: () => void;
	onCreated?: () => void;
}

const initialState: CreateEventState = { success: false };

function SubmitButton() {
	const { pending } = useFormStatus();
	return (
		<button
			type="submit"
			disabled={pending}
			className="px-4 py-2 bg-blue_munsell-500 text-white rounded-lg hover:bg-blue_munsell-600 transition-colors disabled:opacity-50"
		>
			{pending ? "Creating…" : "Create Event"}
		</button>
	);
}

export function CreateEventModal({
	projects,
	onClose,
	onCreated,
}: CreateEventModalProps) {
	const [state, formAction] = useActionState(createEvent, initialState);
	const [allDay, setAllDay] = useState(false);

	useEffect(() => {
		if (state.success) {
			onCreated?.();
			onClose();
		}
	}, [state.success, onClose, onCreated]);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
			<div className="bg-white dark:bg-outer_space-500 rounded-lg p-6 w-full max-w-lg mx-4">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-lg font-semibold text-outer_space-500 dark:text-platinum-500">
						Add Event
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
								placeholder="Enter event title"
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

					<label className="flex items-center space-x-2 text-sm font-medium">
						<input
							name="allDay"
							type="checkbox"
							checked={allDay}
							onChange={(e) => setAllDay(e.target.checked)}
							className="rounded"
						/>
						<span>All day</span>
					</label>

					<div className="grid grid-cols-1 gap-4">
						<div>
							<label className="block text-sm font-medium mb-2">
								Start
								<input
									name="startDate"
									type={allDay ? "date" : "datetime-local"}
									className="w-full px-3 py-2 border rounded-lg"
								/>
							</label>
							{state.errors?.startDate && (
								<p className="text-sm text-red-500">
									{state.errors.startDate[0]}
								</p>
							)}
						</div>

						<div>
							<label className="block text-sm font-medium mb-2">
								End
								<input
									name="endDate"
									type={allDay ? "date" : "datetime-local"}
									className="w-full px-3 py-2 border rounded-lg"
								/>
							</label>
							{state.errors?.endDate && (
								<p className="text-sm text-red-500">
									{state.errors.endDate[0]}
								</p>
							)}
						</div>
					</div>

					{projects.length > 0 && (
						<div>
							<label className="block text-sm font-medium mb-2">
								Project (optional)
								<select
									name="projectId"
									defaultValue=""
									className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-outer_space-500"
								>
									<option value="">No project</option>
									{projects.map((project) => (
										<option key={project.id} value={project.id}>
											{project.name}
										</option>
									))}
								</select>
							</label>
						</div>
					)}

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
