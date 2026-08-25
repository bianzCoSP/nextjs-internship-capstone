import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
	isCreateProjectModalOpen: boolean;

	editProjectId: string | null;

	isCreateTaskModalOpen: boolean;
	createTaskListId: string | null;

	isEditTaskModalOpen: boolean;
	editTaskId: string | null;

	isTaskDetailModalOpen: boolean;
	selectedTaskId: string | null;

	isCreateEventModalOpen: boolean;

	isSidebarOpen: boolean;
	theme: "light" | "dark";

	isLoading: boolean;
	loadingMessage?: string;

	openCreateProjectModal: () => void;
	closeCreateProjectModal: () => void;

	openEditProjectModal: (projectId: string) => void;
	closeEditProjectModal: () => void;

	openCreateTaskModal: (listId: string) => void;
	closeCreateTaskModal: () => void;

	openEditTaskModal: (taskId: string) => void;
	closeEditTaskModal: () => void;

	openTaskDetailModal: (taskId: string) => void;
	closeTaskDetailModal: () => void;

	openCreateEventModal: () => void;
	closeCreateEventModal: () => void;

	openSidebar: () => void;
	closeSidebar: () => void;
	toggleSidebar: () => void;

	setTheme: (theme: "light" | "dark") => void;
	setLoading: (loading: boolean, message?: string) => void;
}

export const useUIStore = create<UIState>()(
	persist(
		(set) => ({
			isCreateProjectModalOpen: false,

			editProjectId: null,

			isCreateTaskModalOpen: false,
			createTaskListId: null,

			isEditTaskModalOpen: false,
			editTaskId: null,

			isTaskDetailModalOpen: false,
			selectedTaskId: null,

			isCreateEventModalOpen: false,

			isSidebarOpen: false,
			theme: "light",

			isLoading: false,
			loadingMessage: undefined,

			openCreateProjectModal: () => set({ isCreateProjectModalOpen: true }),
			closeCreateProjectModal: () => set({ isCreateProjectModalOpen: false }),

			openEditProjectModal: (projectId) => set({ editProjectId: projectId }),
			closeEditProjectModal: () => set({ editProjectId: null }),

			openCreateTaskModal: (listId) =>
				set({ isCreateTaskModalOpen: true, createTaskListId: listId }),
			closeCreateTaskModal: () =>
				set({ isCreateTaskModalOpen: false, createTaskListId: null }),

			openEditTaskModal: (taskId) =>
				set({ isEditTaskModalOpen: true, editTaskId: taskId }),
			closeEditTaskModal: () =>
				set({ isEditTaskModalOpen: false, editTaskId: null }),

			openTaskDetailModal: (taskId) =>
				set({ isTaskDetailModalOpen: true, selectedTaskId: taskId }),
			closeTaskDetailModal: () =>
				set({ isTaskDetailModalOpen: false, selectedTaskId: null }),

			openCreateEventModal: () => set({ isCreateEventModalOpen: true }),
			closeCreateEventModal: () => set({ isCreateEventModalOpen: false }),

			openSidebar: () => set({ isSidebarOpen: true }),
			closeSidebar: () => set({ isSidebarOpen: false }),
			toggleSidebar: () =>
				set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

			setTheme: (theme) => set({ theme }),
			setLoading: (isLoading, loadingMessage) =>
				set({ isLoading, loadingMessage }),
		}),
		{
			name: "ui-store",
			partialize: (state) => ({ theme: state.theme }),
			skipHydration: true,
		},
	),
);
