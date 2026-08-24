"use client";

import {
	closestCorners,
	DndContext,
	type DragCancelEvent,
	type DragEndEvent,
	type DragOverEvent,
	DragOverlay,
	type DragStartEvent,
	PointerSensor,
	useDroppable,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	SortableContext,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MoreHorizontal } from "lucide-react";
import { useMemo, useRef } from "react";
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
	position: number;
}

interface KanbanBoardProps {
	lists: KanbanList[];
	tasks: KanbanTask[];
	projectId: string;
	projectSlug: string;
}

function findListId(
	id: string,
	tasks: KanbanTask[],
	lists: KanbanList[],
): string | undefined {
	if (lists.some((list) => list.id === id)) return id;
	return tasks.find((task) => task.id === id)?.listId;
}

function SortableTaskCard({ task }: { task: KanbanTask }) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: task.id, data: { type: "task", listId: task.listId } });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={`cursor-grab touch-none active:cursor-grabbing ${
				isDragging ? "opacity-40" : ""
			}`}
			{...attributes}
			{...listeners}
		>
			<TaskCard task={task} />
		</div>
	);
}

function KanbanColumn({
	list,
	tasks,
}: {
	list: KanbanList;
	tasks: KanbanTask[];
}) {
	const { setNodeRef, isOver } = useDroppable({
		id: list.id,
		data: { type: "list" },
	});

	return (
		<div className="shrink-0 w-[85vw] sm:w-80 lg:flex-1 lg:min-w-75 h-full">
			<div className="flex flex-col h-full max-h-full rounded-xl bg-platinum-100/60 dark:bg-outer_space-400/40 border border-french_gray-300/60 dark:border-paynes_gray-400/40">
				<div className="shrink-0 px-4 py-3 border-b border-french_gray-300/60 dark:border-paynes_gray-400/40">
					<div className="flex items-center justify-between">
						<h3 className="font-semibold text-outer_space-500 dark:text-platinum-500">
							{list.name}
							<span className="ml-2 px-2 py-1 text-xs bg-french_gray-300/60 dark:bg-paynes_gray-400/40 rounded-full">
								{tasks.length}
							</span>
						</h3>
						<button
							type="button"
							className="p-1 hover:bg-platinum-500/50 dark:hover:bg-paynes_gray-400/30 rounded"
						>
							<MoreHorizontal size={16} />
						</button>
					</div>
				</div>

				<SortableContext
					items={tasks.map((task) => task.id)}
					strategy={verticalListSortingStrategy}
				>
					<div
						ref={setNodeRef}
						className={`p-3 space-y-3 flex-1 overflow-y-auto scrollbar-thin rounded-b-xl transition-colors ${
							isOver ? "bg-blue_munsell-500/5" : ""
						}`}
					>
						{tasks.map((task) => (
							<SortableTaskCard key={task.id} task={task} />
						))}
						<CreateTaskButton listId={list.id} />
					</div>
				</SortableContext>
			</div>
		</div>
	);
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
	const draggedTaskId = useBoardStore((state) => state.draggedTaskId);
	const setDraggedTask = useBoardStore((state) => state.setDraggedTask);

	const isCreateTaskModalOpen = useUIStore(
		(state) => state.isCreateTaskModalOpen,
	);
	const createTaskListId = useUIStore((state) => state.createTaskListId);
	const closeCreateTaskModal = useUIStore(
		(state) => state.closeCreateTaskModal,
	);

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
	);

	const dragStartTasksRef = useRef<KanbanTask[] | null>(null);

	const tasksByListId = useMemo(() => {
		const grouped = new Map<string, KanbanTask[]>();
		for (const list of lists) grouped.set(list.id, []);
		for (const task of tasks) {
			const bucket = grouped.get(task.listId);
			if (bucket) bucket.push(task);
			else grouped.set(task.listId, [task]);
		}
		for (const bucket of grouped.values()) {
			bucket.sort((a, b) => a.position - b.position);
		}
		return grouped;
	}, [lists, tasks]);

	const activeTask = draggedTaskId
		? tasks.find((task) => task.id === draggedTaskId)
		: null;

	function handleDragStart(event: DragStartEvent) {
		dragStartTasksRef.current = useBoardStore.getState().tasks;
		setDraggedTask(event.active.id as string);
	}

	function handleDragOver(event: DragOverEvent) {
		const { active, over } = event;
		if (!over) return;

		const activeId = active.id as string;
		const overId = over.id as string;
		if (activeId === overId) return;

		const state = useBoardStore.getState();
		const activeTaskState = state.tasks.find((task) => task.id === activeId);
		if (!activeTaskState) return;

		const destListId = findListId(overId, state.tasks, lists);
		if (!destListId) return;

		if (activeTaskState.listId === destListId) {
			return;
		}

		const destTasks = state.tasks
			.filter((task) => task.listId === destListId && task.id !== activeId)
			.sort((a, b) => a.position - b.position);
		const overIndex = destTasks.findIndex((task) => task.id === overId);
		const newIndex = overIndex >= 0 ? overIndex : destTasks.length;

		state.moveTaskLocal(activeId, destListId, newIndex);
	}

	function handleDragCancel(_event: DragCancelEvent) {
		setDraggedTask(null);
		if (dragStartTasksRef.current) {
			useBoardStore.setState({ tasks: dragStartTasksRef.current });
		}
		dragStartTasksRef.current = null;
	}

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;
		setDraggedTask(null);

		if (!over) {
			if (dragStartTasksRef.current) {
				useBoardStore.setState({ tasks: dragStartTasksRef.current });
			}
			dragStartTasksRef.current = null;
			return;
		}

		const activeId = active.id as string;
		const overId = over.id as string;
		const state = useBoardStore.getState();

		const destListId = findListId(overId, state.tasks, lists);

		if (!destListId) {
			if (dragStartTasksRef.current) {
				useBoardStore.setState({ tasks: dragStartTasksRef.current });
			}
			dragStartTasksRef.current = null;
			return;
		}

		const destTasks = state.tasks
			.filter((task) => task.listId === destListId)
			.sort((a, b) => a.position - b.position);

		const overIndex = destTasks.findIndex((task) => task.id === overId);
		const newIndex = overIndex >= 0 ? overIndex : destTasks.length;

		if (dragStartTasksRef.current) {
			useBoardStore.setState({ tasks: dragStartTasksRef.current });
		}
		dragStartTasksRef.current = null;

		useBoardStore.getState().moveTask(activeId, destListId, newIndex);
	}

	if (lists.length === 0) {
		return (
			<div className="rounded-xl border border-dashed border-french_gray-300 dark:border-paynes_gray-400 p-12 text-center">
				<p className="text-paynes_gray-500 dark:text-french_gray-400">
					This project doesn't have any columns yet.
				</p>
			</div>
		);
	}

	return (
		<div className="h-full min-h-125">
			<DndContext
				sensors={sensors}
				collisionDetection={closestCorners}
				onDragStart={handleDragStart}
				onDragOver={handleDragOver}
				onDragEnd={handleDragEnd}
				onDragCancel={handleDragCancel}
			>
				<div className="flex space-x-4 md:space-x-6 overflow-x-auto pb-4 h-full">
					{lists.map((list) => (
						<KanbanColumn
							key={list.id}
							list={list}
							tasks={tasksByListId.get(list.id) ?? []}
						/>
					))}
				</div>

				<DragOverlay>
					{activeTask ? (
						<div className="rotate-2 shadow-xl rounded-lg">
							<TaskCard task={activeTask} />
						</div>
					) : null}
				</DragOverlay>
			</DndContext>

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
