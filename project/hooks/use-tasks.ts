// TODO: Task 4.4 - Build task creation and editing functionality
// TODO: Task 5.4 - Implement optimistic UI updates for smooth interactions

/*
TODO: Implementation Notes for Interns:

Custom hook for task data management:
- Fetch tasks for a project
- Create new task
- Update task
- Delete task
- Move task between lists
- Bulk operations

Features:
- Optimistic updates for smooth UX
- Real-time synchronization
- Conflict resolution
- Undo functionality
- Batch operations

Example structure:
export function useTasks(projectId: string) {
  const queryClient = useQueryClient()
  
  const {
    data: tasks,
    isLoading,
    error
  } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => queries.tasks.getByProject(projectId),
    enabled: !!projectId
  })
  
  const createTask = useMutation({
    mutationFn: queries.tasks.create,
    onMutate: async (newTask) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['tasks', projectId] })
      const previousTasks = queryClient.getQueryData(['tasks', projectId])
      queryClient.setQueryData(['tasks', projectId], (old: Task[]) => [...old, { ...newTask, id: 'temp-' + Date.now() }])
      return { previousTasks }
    },
    onError: (err, newTask, context) => {
      // Rollback on error
      queryClient.setQueryData(['tasks', projectId], context?.previousTasks)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
    }
  })
  
  return {
    tasks,
    isLoading,
    error,
    createTask: createTask.mutate,
    isCreating: createTask.isPending
  }
}
*/

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queries } from "@/lib/db/index";

// Placeholder to prevent import errors
export function useTasks(projectId: string) {
	const queryClient = useQueryClient();

	const {
		data: tasks,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["tasks", projectId],
		queryFn: () => queries.tasks.getByProject(projectId),
		enabled: !!projectId,
	});

	const createTask = useMutation({
		mutationFn: queries.tasks.create,
		onMutate: async (newTask) => {
			await queryClient.cancelQueries({ queryKey: ["tasks", projectId] });
			const previousTasks = queryClient.getQueryData(["tasks", projectId]);
			queryClient.setQueryData(["tasks", projectId], (old: Task[]) => [
				...old,
				{ ...newTask, id: "temp-" + Date.now() },
			]);
			return { previousTasks };
		},
		onError: (err, newTask, context) => {
			queryClient.setQueryData(["tasks", projectId], context?.previousTasks);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
		},
	});

	return {
		tasks,
		isLoading,
		error,
		createTask: createTask.mutate,
		isCreating: createTask.isPending,
	};
}
