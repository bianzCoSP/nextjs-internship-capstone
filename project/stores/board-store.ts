"use client";

import { create } from "zustand";
import type { KanbanList, KanbanTask } from "@/components/kanban-board";
import {
	type CreateTaskState,
	createTask as createTaskAction,
} from "@/lib/actions/task-actions";

interface CreateTaskInput {
	listId: string;
	projectSlug: string;
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
	updateTaskLocal: (taskId: string, updates: Partial<KanbanTask>) => void;
	removeTaskLocal: (taskId: string) => void;

	// TODO: change this to server action version with dnd-kit/core
	moveTaskLocal: (
		taskId: string,
		newListId: string,
		newPosition: number,
	) => void;

	setDraggedTask: (taskId: string | null) => void;
	setDraggedOverList: (listId: string | null) => void;
	clearError: () => void;
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
			assigneeName: null,
			priority: input.priority,
			status: "To Do",
			dueDate: input.dueDate ? new Date(input.dueDate) : null,
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
							assigneeName: null,
						} as KanbanTask)
					: task,
			),
			isSaving: false,
		}));

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
			tasks: state.tasks.map((task) =>
				task.id === taskId
					? { ...task, listId: newListId, position: newPosition }
					: task,
			),
		})),

	setDraggedTask: (taskId) => set({ draggedTaskId: taskId }),
	setDraggedOverList: (listId) => set({ draggedOverListId: listId }),
	clearError: () => set({ error: null }),
}));
