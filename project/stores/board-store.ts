"use client";

import { create } from "zustand";
import type { KanbanList, KanbanTask } from "@/components/kanban-board";
import {
	type CreateTaskState,
	createTask as createTaskAction,
	type DeleteTaskState,
	deleteTask as deleteTaskAction,
	moveTask as moveTaskAction,
	type UpdateTaskState,
	updateTask as updateTaskAction,
} from "@/lib/actions/task-actions";

interface CreateTaskInput {
	listId: string;
	projectSlug: string;
	title: string;
	description?: string;
	priority: "low" | "medium" | "high";
	dueDate?: string;
	assigneeName?: string | null;
}

interface UpdateTaskInput {
	title: string;
	description?: string;
	priority: "low" | "medium" | "high";
	dueDate?: string;
}

interface BoardState {
	projectId: string | null;
	projectSlug: string | null;
	lists: KanbanList[];
	tasks: KanbanTask[];

	draggedTaskId: string | null;
	draggedOverListId: string | null;

	isLoading: boolean;
	isSaving: boolean;
	error: string | null;

	hydrateBoard: (data: {
		projectId: string;
		projectSlug: string;
		lists: KanbanList[];
		tasks: KanbanTask[];
	}) => void;

	createTask: (input: CreateTaskInput) => Promise<CreateTaskState>;
	updateTask: (
		taskId: string,
		input: UpdateTaskInput,
	) => Promise<UpdateTaskState>;
	deleteTask: (taskId: string) => Promise<DeleteTaskState>;
	updateTaskLocal: (taskId: string, updates: Partial<KanbanTask>) => void;
	removeTaskLocal: (taskId: string) => void;

	moveTaskLocal: (
		taskId: string,
		newListId: string,
		newPosition: number,
	) => void;

	moveTask: (
		taskId: string,
		destinationListId: string,
		destinationIndex: number,
	) => Promise<void>;

	setDraggedTask: (taskId: string | null) => void;
	setDraggedOverList: (listId: string | null) => void;
	clearError: () => void;
}

const LIST_NAME_TO_STATUS = new Set(["To Do", "In Progress", "Review", "Done"]);

function moveTaskInTasks(
	tasks: KanbanTask[],
	taskId: string,
	destListId: string,
	destIndex: number,
): KanbanTask[] {
	const moving = tasks.find((task) => task.id === taskId);
	if (!moving) return tasks;

	const sourceListId = moving.listId;
	const rest = tasks.filter((task) => task.id !== taskId);

	const destTasks = rest
		.filter((task) => task.listId === destListId)
		.sort((a, b) => a.position - b.position);

	const clampedIndex = Math.max(0, Math.min(destIndex, destTasks.length));
	destTasks.splice(clampedIndex, 0, { ...moving, listId: destListId });
	const destPositions = new Map(
		destTasks.map((task, index) => [task.id, index]),
	);

	let sourcePositions: Map<string, number> | null = null;
	if (sourceListId !== destListId) {
		const sourceTasks = rest
			.filter((task) => task.listId === sourceListId)
			.sort((a, b) => a.position - b.position);
		sourcePositions = new Map(
			sourceTasks.map((task, index) => [task.id, index]),
		);
	}

	return tasks.map((task) => {
		if (task.id === taskId) {
			return {
				...task,
				listId: destListId,
				position: destPositions.get(taskId) ?? clampedIndex,
			};
		}
		if (task.listId === destListId) {
			const destPosition = destPositions.get(task.id);
			if (destPosition !== undefined) {
				return { ...task, position: destPosition };
			}
		}
		const sourcePosition = sourcePositions?.get(task.id);
		if (sourcePosition !== undefined) {
			return { ...task, position: sourcePosition };
		}
		return task;
	});
}

function orderedIdsForList(tasks: KanbanTask[], listId: string) {
	return tasks
		.filter((task) => task.listId === listId)
		.sort((a, b) => a.position - b.position)
		.map((task) => task.id);
}

export const useBoardStore = create<BoardState>((set, get) => ({
	projectId: null,
	projectSlug: null,
	lists: [],
	tasks: [],

	draggedTaskId: null,
	draggedOverListId: null,

	isLoading: false,
	isSaving: false,
	error: null,

	hydrateBoard: ({ projectId, projectSlug, lists, tasks }) =>
		set({ projectId, projectSlug, lists, tasks }),

	createTask: async (input) => {
		const tempId = `temp-${Date.now()}`;
		const optimisticPosition = get().tasks.filter(
			(task) => task.listId === input.listId,
		).length;

		const optimisticTask = {
			id: tempId,
			title: input.title,
			description: input.description ?? null,
			listId: input.listId,
			assigneeId: null,
			assigneeName: input.assigneeName ?? null,
			priority: input.priority,
			status: "To Do",
			dueDate: input.dueDate ? new Date(input.dueDate) : null,
			completionDate: null,
			position: optimisticPosition,
			createdAt: new Date(),
			updatedAt: new Date(),
		} as unknown as KanbanTask;

		set((state) => ({
			tasks: [...state.tasks, optimisticTask],
			isSaving: true,
			error: null,
		}));

		const formData = new FormData();
		formData.set("listId", input.listId);
		formData.set("projectSlug", input.projectSlug);
		formData.set("title", input.title);
		if (input.description) formData.set("description", input.description);
		formData.set("priority", input.priority);
		if (input.dueDate) formData.set("dueDate", input.dueDate);

		const result = await createTaskAction({ success: false }, formData);

		if (!result.success || !result.task) {
			set((state) => ({
				tasks: state.tasks.filter((task) => task.id !== tempId),
				isSaving: false,
				error: result.errors?._form?.[0] ?? null,
			}));
			return result;
		}

		set((state) => ({
			tasks: state.tasks.map((task) =>
				task.id === tempId
					? ({
							...task,
							...result.task,
							assigneeName: result.task?.assigneeName ?? task.assigneeName,
						} as KanbanTask)
					: task,
			),
			isSaving: false,
		}));

		return result;
	},

	updateTask: async (taskId, input) => {
		const previousTasks = get().tasks;

		set((state) => ({
			tasks: state.tasks.map((task) =>
				task.id === taskId
					? {
							...task,
							title: input.title,
							description: input.description ?? null,
							priority: input.priority,
							dueDate: input.dueDate ? new Date(input.dueDate) : null,
						}
					: task,
			),
			isSaving: true,
			error: null,
		}));

		const formData = new FormData();
		formData.set("title", input.title);
		if (input.description) formData.set("description", input.description);
		formData.set("priority", input.priority);
		if (input.dueDate) formData.set("dueDate", input.dueDate);

		const result = await updateTaskAction(
			taskId,
			get().projectSlug ?? undefined,
			{ success: false },
			formData,
		);

		if (!result.success) {
			set({
				tasks: previousTasks,
				isSaving: false,
				error: result.errors?._form?.[0] ?? null,
			});
			return result;
		}

		set((state) => ({
			tasks: state.tasks.map((task) =>
				task.id === taskId ? ({ ...task, ...result.task } as KanbanTask) : task,
			),
			isSaving: false,
		}));

		return result;
	},

	deleteTask: async (taskId) => {
		const previousTasks = get().tasks;

		set((state) => ({
			tasks: state.tasks.filter((task) => task.id !== taskId),
			isSaving: true,
			error: null,
		}));

		const result = await deleteTaskAction(
			taskId,
			get().projectSlug ?? undefined,
		);

		if (!result.success) {
			set({
				tasks: previousTasks,
				isSaving: false,
				error: result.error ?? "Failed to delete task",
			});
			return result;
		}

		set({ isSaving: false });
		return result;
	},

	updateTaskLocal: (taskId, updates) =>
		set((state) => ({
			tasks: state.tasks.map((task) =>
				task.id === taskId ? { ...task, ...updates } : task,
			),
		})),

	removeTaskLocal: (taskId) =>
		set((state) => ({
			tasks: state.tasks.filter((task) => task.id !== taskId),
		})),

	moveTaskLocal: (taskId, newListId, newPosition) =>
		set((state) => ({
			tasks: moveTaskInTasks(state.tasks, taskId, newListId, newPosition),
		})),

	moveTask: async (taskId, destinationListId, destinationIndex) => {
		const previousTasks = get().tasks;
		const movingTask = previousTasks.find((task) => task.id === taskId);
		if (!movingTask) return;

		const sourceListId = movingTask.listId;

		set((state) => {
			const movedTasks = moveTaskInTasks(
				state.tasks,
				taskId,
				destinationListId,
				destinationIndex,
			);

			if (sourceListId === destinationListId) {
				return { tasks: movedTasks, error: null };
			}

			const destinationList = state.lists.find(
				(list) => list.id === destinationListId,
			);

			if (!destinationList || !LIST_NAME_TO_STATUS.has(destinationList.name)) {
				return { tasks: movedTasks, error: null };
			}

			const status = destinationList.name as
				| "To Do"
				| "In Progress"
				| "Review"
				| "Done";

			return {
				tasks: movedTasks.map((task) =>
					task.id === taskId
						? {
								...task,
								status,
								completionDate: status === "Done" ? new Date() : null,
							}
						: task,
				),
				error: null,
			};
		});

		const nextTasks = get().tasks;
		const destinationOrderedIds = orderedIdsForList(
			nextTasks,
			destinationListId,
		);
		const sourceOrderedIds =
			sourceListId === destinationListId
				? destinationOrderedIds
				: orderedIdsForList(nextTasks, sourceListId);

		const result = await moveTaskAction({
			taskId,
			sourceListId,
			destinationListId,
			sourceOrderedIds,
			destinationOrderedIds,
			projectSlug: get().projectSlug ?? undefined,
		});

		if (!result.success) {
			set({
				tasks: previousTasks,
				error: result.error ?? "Failed to move task",
			});
		}
	},

	setDraggedTask: (taskId) => set({ draggedTaskId: taskId }),
	setDraggedOverList: (listId) => set({ draggedOverListId: listId }),
	clearError: () => set({ error: null }),
}));
