"use client";

import { X } from "lucide-react";
import { useRef, useState } from "react";
import AsyncSelect from "react-select/async";
import {
	type InviteCandidate,
	inviteProjectMembers,
	searchProjectInviteCandidates,
} from "@/lib/actions/team-actions";

interface ProjectOption {
	id: string;
	name: string;
}

interface UserOption {
	value: string;
	label: string;
	email: string;
}

interface InviteMemberModalProps {
	projects: ProjectOption[];
	onClose: () => void;
	onInvited?: () => void;
}

const SEARCH_DEBOUNCE_MS = 300;

export function InviteMemberModal({
	projects,
	onClose,
	onInvited,
}: InviteMemberModalProps) {
	const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
	const [selectedUsers, setSelectedUsers] = useState<UserOption[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [successCount, setSuccessCount] = useState<number | null>(null);

	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Only returns results once the user has typed something, and debounces
	// requests so we don't fire a search on every keystroke.
	function loadOptions(inputValue: string): Promise<UserOption[]> {
		return new Promise((resolve) => {
			if (debounceRef.current) clearTimeout(debounceRef.current);

			if (!inputValue.trim() || !projectId) {
				resolve([]);
				return;
			}

			debounceRef.current = setTimeout(async () => {
				const results: InviteCandidate[] = await searchProjectInviteCandidates(
					projectId,
					inputValue,
				);
				const selectedIds = new Set(selectedUsers.map((user) => user.value));
				resolve(
					results
						.filter((user) => !selectedIds.has(user.id))
						.map((user) => ({
							value: user.id,
							label: user.name,
							email: user.email,
						})),
				);
			}, SEARCH_DEBOUNCE_MS);
		});
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!projectId || selectedUsers.length === 0) return;

		setIsSubmitting(true);
		setError(null);

		const result = await inviteProjectMembers(
			projectId,
			selectedUsers.map((user) => user.value),
		);

		setIsSubmitting(false);

		if (result.success) {
			setSuccessCount(result.addedCount ?? selectedUsers.length);
			setSelectedUsers([]);
			onInvited?.();
			setTimeout(onClose, 900);
		} else {
			setError(result.error ?? "Failed to invite members");
		}
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
			<div className="bg-white dark:bg-outer_space-500 rounded-lg p-6 w-full max-w-md mx-4">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-lg font-semibold text-outer_space-500 dark:text-platinum-500">
						Invite Members
					</h3>
					<button type="button" onClick={onClose}>
						<X size={20} />
					</button>
				</div>

				{projects.length === 0 ? (
					<p className="text-sm text-paynes_gray-500 dark:text-french_gray-400">
						You need to be part of a project before you can invite someone to
						it.
					</p>
				) : (
					<>
						{error && <p className="text-sm text-red-500 mb-2">{error}</p>}
						{successCount !== null && (
							<p className="text-sm text-green-600 mb-2">
								{successCount === 1
									? "They've been added to the project."
									: `${successCount} people have been added to the project.`}
							</p>
						)}

						<form onSubmit={handleSubmit} className="space-y-4">
							<div>
								<label className="block text-sm font-medium mb-2">
									Project
									<select
										value={projectId}
										onChange={(e) => {
											setProjectId(e.target.value);
											setSelectedUsers([]);
										}}
										className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-outer_space-500 text-outer_space-500 dark:text-platinum-500"
									>
										{projects.map((project) => (
											<option key={project.id} value={project.id}>
												{project.name}
											</option>
										))}
									</select>
								</label>
							</div>

							<div>
								<span className="block text-sm font-medium mb-2">
									Search for people to invite
								</span>
								<AsyncSelect<UserOption, true>
									key={projectId}
									instanceId="invite-member-user-search"
									isMulti
									cacheOptions
									defaultOptions={false}
									loadOptions={loadOptions}
									value={selectedUsers}
									onChange={(options) =>
										setSelectedUsers(options ? [...options] : [])
									}
									placeholder="Type a name or email…"
									noOptionsMessage={({ inputValue }) =>
										inputValue ? "No matching users" : "Start typing to search"
									}
									formatOptionLabel={(option, { context }) =>
										context === "menu" ? (
											<div>
												<div className="font-medium">{option.label}</div>
												<div className="text-xs opacity-70">{option.email}</div>
											</div>
										) : (
											option.label
										)
									}
									unstyled
									classNames={{
										control: () =>
											"!min-h-[42px] px-2 !rounded-lg !border !border-french_gray-300 dark:!border-paynes_gray-400 dark:!bg-outer_space-500",
										placeholder: () =>
											"text-paynes_gray-500 dark:text-french_gray-400",
										input: () => "text-outer_space-500 dark:text-platinum-500",
										singleValue: () =>
											"text-outer_space-500 dark:text-platinum-500",
										menu: () =>
											"!mt-1 !rounded-lg border border-french_gray-300 dark:border-paynes_gray-400 bg-white dark:bg-outer_space-500 shadow-lg overflow-hidden",
										option: ({ isFocused }) =>
											`px-3 py-2 cursor-pointer text-outer_space-500 dark:text-platinum-500 ${
												isFocused
													? "bg-platinum-500 dark:bg-paynes_gray-400"
													: ""
											}`,
										noOptionsMessage: () =>
											"px-3 py-2 text-sm text-paynes_gray-500 dark:text-french_gray-400",
										loadingMessage: () =>
											"px-3 py-2 text-sm text-paynes_gray-500 dark:text-french_gray-400",
										multiValue: () =>
											"flex items-center gap-1 mr-1 my-0.5 pl-2 pr-1 py-0.5 rounded-full bg-blue_munsell-100 dark:bg-blue_munsell-900 text-blue_munsell-700 dark:text-blue_munsell-300 text-sm",
										multiValueLabel: () => "leading-5",
										multiValueRemove: () =>
											"ml-0.5 rounded-full hover:bg-blue_munsell-200 dark:hover:bg-blue_munsell-800 cursor-pointer px-1",
									}}
								/>
								{selectedUsers.length > 0 && (
									<p className="mt-2 text-xs text-paynes_gray-500 dark:text-french_gray-400">
										{selectedUsers.length}{" "}
										{selectedUsers.length === 1 ? "person" : "people"} selected
									</p>
								)}
							</div>

							<div className="flex justify-end space-x-3 pt-4">
								<button type="button" onClick={onClose} className="px-4 py-2">
									Cancel
								</button>
								<button
									type="submit"
									disabled={selectedUsers.length === 0 || isSubmitting}
									className="px-4 py-2 bg-blue_munsell-500 text-white rounded-lg hover:bg-blue_munsell-600 transition-colors disabled:opacity-50"
								>
									{isSubmitting
										? "Inviting…"
										: selectedUsers.length > 1
											? `Add ${selectedUsers.length} to Project`
											: "Add to Project"}
								</button>
							</div>
						</form>
					</>
				)}
			</div>
		</div>
	);
}
