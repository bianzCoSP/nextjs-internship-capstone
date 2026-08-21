// TODO: Task 5.3 - Set up client-side state management with Zustand

/*
TODO: Implementation Notes for Interns:

UI state management store for:
- Modal states (create project, create task, etc.)
- Sidebar state
- Theme preferences
- Loading states
- Error states
- Notifications/toasts

Install: pnpm add zustand

Example structure:
import { create } from 'zustand'

interface UIState {
  // Modal states
  isCreateProjectModalOpen: boolean
  isCreateTaskModalOpen: boolean
  isTaskDetailModalOpen: boolean
  selectedTaskId: string | null

  // UI states
  sidebarOpen: boolean
  theme: 'light' | 'dark'

  // Loading states
  isLoading: boolean
  loadingMessage: string

  // Actions
  openCreateProjectModal: () => void
  closeCreateProjectModal: () => void
  openCreateTaskModal: () => void
  closeCreateTaskModal: () => void
  openTaskDetailModal: (taskId: string) => void
  closeTaskDetailModal: () => void
  toggleSidebar: () => void
  setTheme: (theme: 'light' | 'dark') => void
  setLoading: (loading: boolean, message?: string) => void
}

export const useUIStore = create<UIState>((set) => ({
  // ... implementation
}))
*/

import { create } from "zustand";

interface UIState {
	isSidebarOpen: boolean;
	openSidebar: () => void;
	closeSidebar: () => void;
	toggleSidebar: () => void;
}

// Placeholder to prevent import errors
export const useUIStore = create<UIState>((set) => ({
	isSidebarOpen: false,
	openSidebar: () => set({ isSidebarOpen: true }),
	closeSidebar: () => set({ isSidebarOpen: false }),
	toggleSidebar: () =>
		set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
