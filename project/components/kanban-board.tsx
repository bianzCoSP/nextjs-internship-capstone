"use client";

import { MoreHorizontal } from "lucide-react";
import { useBoardStore } from "@/stores/board-store";
import { useUIStore } from "@/stores/ui-store";
import { CreateTaskButton } from "./create-task-button";
import { CreateTaskModal } from "./modals/create-task-modal";
import { TaskCard, type TaskCardTask } from "./task-card";

export interface KanbanList {
	id: string;
	name: string;
	position: number;
}

export interface KanbanTask extends TaskCardTask {
	listId: string;
}

interface KanbanBoardProps {
	lists: KanbanList[];
	tasks: KanbanTask[];
	projectId: string;
	projectSlug: string;
}

export function KanbanBoard({
	lists: initialLists,
	tasks: initialTasks,
	projectId,
	projectSlug,
}: KanbanBoardProps) {
	const storeProjectId = useBoardStore((state) => state.projectId);
	const hydrateBoard = useBoardStore((state) => state.hydrateBoard);
	if (storeProjectId !== projectId) {
		hydrateBoard({
			projectId,
			projectSlug,
			lists: initialLists,
			tasks: initialTasks,
		});
	}

	const lists = useBoardStore((state) => state.lists);
	const tasks = useBoardStore((state) => state.tasks);

	const isCreateTaskModalOpen = useUIStore(
		(state) => state.isCreateTaskModalOpen,
	);
	const createTaskListId = useUIStore((state) => state.createTaskListId);
	const closeCreateTaskModal = useUIStore(
		(state) => state.closeCreateTaskModal,
	);

	if (lists.length === 0) {
		return (
			<div className="bg-white dark:bg-outer_space-500 rounded-lg border border-french_gray-300 dark:border-paynes_gray-400 p-12 text-center">
				<p className="text-paynes_gray-500 dark:text-french_gray-400">
					This project doesn't have any columns yet.
				</p>
			</div>
		);
	}

	return (
		<div className="bg-white dark:bg-outer_space-500 rounded-lg border border-french_gray-300 dark:border-paynes_gray-400 p-6">
			<div className="flex space-x-6 overflow-x-auto pb-4">
				{lists.map((list) => {
					const listTasks = tasks.filter((task) => task.listId === list.id);

					return (
						<div key={list.id} className="shrink-0 w-80">
							<div className="bg-platinum-800 dark:bg-outer_space-400 rounded-lg border border-french_gray-300 dark:border-paynes_gray-400">
								<div className="p-4 border-b border-french_gray-300 dark:border-paynes_gray-400">
									<div className="flex items-center justify-between">
										<h3 className="font-semibold text-outer_space-500 dark:text-platinum-500">
											{list.name}
											<span className="ml-2 px-2 py-1 text-xs bg-french_gray-300 dark:bg-paynes_gray-400 rounded-full">
												{listTasks.length}
											</span>
										</h3>
										<button
											type="button"
											className="p-1 hover:bg-platinum-500 dark:hover:bg-paynes_gray-400 rounded"
										>
											<MoreHorizontal size={16} />
										</button>
									</div>
								</div>

								<div className="p-4 space-y-3 min-h-100">
									{listTasks.map((task) => (
										<TaskCard key={task.id} task={task} />
									))}

									{listTasks.length === 0 ? (
										<p className="text-center text-xs text-paynes_gray-500 dark:text-french_gray-400 py-4">
											No tasks yet
										</p>
									) : null}

									<CreateTaskButton listId={list.id} />
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{isCreateTaskModalOpen && createTaskListId && (
				<CreateTaskModal
					listId={createTaskListId}
					projectSlug={projectSlug}
					onClose={closeCreateTaskModal}
				/>
			)}
		</div>
	);
}
