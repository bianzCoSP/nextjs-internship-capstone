import { create } from "zustand";

interface UIState {
	isCreateProjectModalOpen: boolean;

	isCreateTaskModalOpen: boolean;
	createTaskListId: string | null;

	isTaskDetailModalOpen: boolean;
	selectedTaskId: string | null;

	isSidebarOpen: boolean;
	theme: "light" | "dark";

	isLoading: boolean;
	loadingMessage?: string;

	openCreateProjectModal: () => void;
	closeCreateProjectModal: () => void;

	openCreateTaskModal: (listId: string) => void;
	closeCreateTaskModal: () => void;

	openTaskDetailModal: (taskId: string) => void;
	closeTaskDetailModal: () => void;

	openSidebar: () => void;
	closeSidebar: () => void;
	toggleSidebar: () => void;

	setTheme: (theme: "light" | "dark") => void;
	setLoading: (loading: boolean, message?: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
	isCreateProjectModalOpen: false,

	isCreateTaskModalOpen: false,
	createTaskListId: null,

	isTaskDetailModalOpen: false,
	selectedTaskId: null,

	isSidebarOpen: false,
	theme: "light",

	isLoading: false,
	loadingMessage: undefined,

	openCreateProjectModal: () => set({ isCreateProjectModalOpen: true }),
	closeCreateProjectModal: () => set({ isCreateProjectModalOpen: false }),

	openCreateTaskModal: (listId) =>
		set({ isCreateTaskModalOpen: true, createTaskListId: listId }),
	closeCreateTaskModal: () =>
		set({ isCreateTaskModalOpen: false, createTaskListId: null }),

	openTaskDetailModal: (taskId) =>
		set({ isTaskDetailModalOpen: true, selectedTaskId: taskId }),
	closeTaskDetailModal: () =>
		set({ isTaskDetailModalOpen: false, selectedTaskId: null }),

	openSidebar: () => set({ isSidebarOpen: true }),
	closeSidebar: () => set({ isSidebarOpen: false }),
	toggleSidebar: () =>
		set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

	setTheme: (theme) => set({ theme }),
	setLoading: (isLoading, loadingMessage) => set({ isLoading, loadingMessage }),
}));
