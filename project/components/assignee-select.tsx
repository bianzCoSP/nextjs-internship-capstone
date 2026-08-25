"use client";

import { useId } from "react";

export interface ProjectMemberOption {
	id: string;
	name: string;
	email?: string;
}

interface AssigneeSelectProps {
	members: ProjectMemberOption[];
	selectedIds: string[];
	onChange: (ids: string[]) => void;
	error?: string;
}

function getInitials(name: string) {
	return name
		.split(" ")
		.map((part) => part[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
}

export function AssigneeSelect({
	members,
	selectedIds,
	onChange,
	error,
}: AssigneeSelectProps) {
	const groupId = useId();

	function toggle(id: string) {
		if (selectedIds.includes(id)) {
			onChange(selectedIds.filter((existing) => existing !== id));
		} else {
			onChange([...selectedIds, id]);
		}
	}

	return (
		<div>
			<span
				id={groupId}
				className="block text-sm font-medium mb-2 text-outer_space-500 dark:text-platinum-500"
			>
				Assignees
			</span>

			{members.length === 0 ? (
				<p className="text-sm text-paynes_gray-500 dark:text-french_gray-400">
					No project members to assign yet.
				</p>
			) : (
				<div
					role="group"
					aria-labelledby={groupId}
					className="max-h-40 overflow-y-auto space-y-1 border rounded-lg p-2"
				>
					{members.map((member) => {
						const checked = selectedIds.includes(member.id);
						return (
							<label
								key={member.id}
								className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-platinum-500/60 dark:hover:bg-paynes_gray-400/40 cursor-pointer"
							>
								<input
									type="checkbox"
									checked={checked}
									onChange={() => toggle(member.id)}
									className="rounded"
								/>
								<span className="w-6 h-6 shrink-0 bg-blue_munsell-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
									{getInitials(member.name)}
								</span>
								<span className="text-sm text-outer_space-500 dark:text-platinum-500">
									{member.name}
								</span>
							</label>
						);
					})}
				</div>
			)}

			{error && <p className="text-sm text-red-500 mt-1">{error}</p>}
		</div>
	);
}
