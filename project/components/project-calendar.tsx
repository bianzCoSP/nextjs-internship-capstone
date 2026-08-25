"use client";

import "react-big-calendar/lib/css/react-big-calendar.css";

import { format, getDay, parse, startOfWeek } from "date-fns";
import { enUS } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
	Calendar as BigCalendar,
	dateFnsLocalizer,
	type View,
	Views,
} from "react-big-calendar";

const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
	format,
	parse,
	startOfWeek: () => startOfWeek(new Date(), { locale: enUS }),
	getDay,
	locales,
});

export type CalendarTask = {
	id: string;
	title: string;
	slug: string | null;
	priority: "low" | "medium" | "high";
	status: "To Do" | "In Progress" | "Review" | "Done";
	dueDate: string | Date;
	listId: string;
	projectId: string;
	projectName: string;
	projectSlug: string | null;
	projectColor: string;
};

export type CalendarEvent = {
	id: string;
	title: string;
	description: string | null;
	startDate: string | Date;
	endDate: string | Date;
	allDay: boolean;
	color: string;
	projectId: string | null;
	projectName: string | null;
	projectSlug: string | null;
	creatorId: string;
	creatorName: string;
};

interface ProjectCalendarProps {
	tasks: CalendarTask[];
	events: CalendarEvent[];
}

type CalendarItem = {
	id: string;
	title: string;
	start: Date;
	end: Date;
	allDay: boolean;
	resource:
		| { type: "task"; data: CalendarTask }
		| { type: "event"; data: CalendarEvent };
};

const PRIORITY_COLOR: Record<CalendarTask["priority"], string> = {
	low: "#4a89a9",
	medium: "#d9a441",
	high: "#c0392b",
};

const PRIORITY_LABEL: Record<CalendarTask["priority"], string> = {
	low: "Low",
	medium: "Medium",
	high: "High",
};

function formatEventWhen(event: CalendarEvent) {
	const start = new Date(event.startDate);
	const end = new Date(event.endDate);

	if (!event.allDay) {
		const dateTimeOptions: Intl.DateTimeFormatOptions = {
			dateStyle: "medium",
			timeStyle: "short",
		};
		return `${start.toLocaleString(undefined, dateTimeOptions)} — ${end.toLocaleString(undefined, dateTimeOptions)}`;
	}

	const sameDay = start.toDateString() === end.toDateString();
	const dateLabel = sameDay
		? start.toLocaleDateString()
		: `${start.toLocaleDateString()} — ${end.toLocaleDateString()}`;

	return `All Day · ${dateLabel}`;
}

export function ProjectCalendar({ tasks, events }: ProjectCalendarProps) {
	const router = useRouter();
	const [view, setView] = useState<View>(Views.MONTH);
	const [date, setDate] = useState(new Date());
	const [selected, setSelected] = useState<CalendarItem | null>(null);

	const items = useMemo<CalendarItem[]>(() => {
		const taskItems: CalendarItem[] = tasks.map((task) => {
			const due = new Date(task.dueDate);
			return {
				id: `task-${task.id}`,
				title: task.title,
				start: due,
				end: due,
				allDay: true,
				resource: { type: "task", data: task },
			};
		});

		const eventItems: CalendarItem[] = events.map((event) => ({
			id: `event-${event.id}`,
			title: event.title,
			start: new Date(event.startDate),
			end: new Date(event.endDate),
			allDay: event.allDay,
			resource: { type: "event", data: event },
		}));

		return [...taskItems, ...eventItems];
	}, [tasks, events]);

	const eventPropGetter = (item: CalendarItem) => {
		const isDone =
			item.resource.type === "task" && item.resource.data.status === "Done";
		const backgroundColor =
			item.resource.type === "task"
				? PRIORITY_COLOR[item.resource.data.priority]
				: item.resource.data.color;

		return {
			style: {
				backgroundColor,
				opacity: isDone ? 0.55 : 1,
				border: "none",
				borderRadius: "6px",
				color: "white",
				textDecoration: isDone ? "line-through" : "none",
			},
		};
	};

	const handleSelectEvent = (item: CalendarItem) => {
		setSelected(item);
	};

	const handleOpenTask = (task: CalendarTask) => {
		if (task.projectSlug) {
			router.push(`/projects/${task.projectSlug}`);
		}
	};

	useEffect(() => {
		if (!selected) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				setSelected(null);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [selected]);

	return (
		<div className="bg-white dark:bg-outer_space-500 rounded-lg border border-french_gray-300 dark:border-paynes_gray-400 p-6">
			<div className="flex items-center gap-4 mb-4 text-xs text-paynes_gray-500 dark:text-french_gray-400">
				<span className="inline-flex items-center gap-1.5">
					<span
						className="h-2.5 w-2.5 rounded-full"
						style={{ backgroundColor: PRIORITY_COLOR.high }}
					/>
					High Priority
				</span>
				<span className="inline-flex items-center gap-1.5">
					<span
						className="h-2.5 w-2.5 rounded-full"
						style={{ backgroundColor: PRIORITY_COLOR.medium }}
					/>
					Medium Priority
				</span>
				<span className="inline-flex items-center gap-1.5">
					<span
						className="h-2.5 w-2.5 rounded-full"
						style={{ backgroundColor: PRIORITY_COLOR.low }}
					/>
					Low Priority
				</span>
				<span className="inline-flex items-center gap-1.5">
					<span className="h-2.5 w-2.5 rounded-full bg-blue_munsell-500" />
					Event
				</span>
			</div>

			<div className="h-162.5">
				<BigCalendar
					localizer={localizer}
					events={items}
					startAccessor="start"
					endAccessor="end"
					view={view}
					onView={(v) => setView(v)}
					date={date}
					onNavigate={(d) => setDate(d)}
					views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
					eventPropGetter={eventPropGetter}
					onSelectEvent={handleSelectEvent}
					popup
				/>
			</div>

			{selected && (
				<div className="fixed inset-0 z-50 flex items-center justify-center">
					<button
						type="button"
						aria-label="Close dialog"
						className="absolute inset-0 bg-black/20 backdrop-blur-sm cursor-default"
						onClick={() => setSelected(null)}
					/>

					<div
						role="dialog"
						aria-modal="true"
						aria-labelledby="calendar-item-title"
						className="relative bg-white dark:bg-outer_space-500 rounded-lg p-6 w-full max-w-sm mx-4"
					>
						{selected.resource.type === "task"
							? (() => {
									const task = selected.resource.data;
									return (
										<>
											<h3
												id="calendar-item-title"
												className="text-lg font-semibold text-outer_space-500 dark:text-platinum-500"
											>
												{task.title}
											</h3>
											<p className="text-sm text-paynes_gray-500 dark:text-french_gray-400 mt-1">
												{task.projectName} &middot;{" "}
												{PRIORITY_LABEL[task.priority]} Priority &middot;{" "}
												{task.status}
											</p>
											<p className="text-sm text-paynes_gray-500 dark:text-french_gray-400 mt-1">
												Due {new Date(task.dueDate).toLocaleDateString()}
											</p>
											<div className="flex justify-end gap-3 pt-4">
												<button
													type="button"
													onClick={() => setSelected(null)}
													className="px-4 py-2"
												>
													Close
												</button>
												<button
													type="button"
													onClick={() => handleOpenTask(task)}
													className="px-4 py-2 bg-blue_munsell-500 text-white rounded-lg hover:bg-blue_munsell-600 transition-colors"
												>
													Open project
												</button>
											</div>
										</>
									);
								})()
							: (() => {
									const event = selected.resource.data;
									return (
										<>
											<h3
												id="calendar-item-title"
												className="text-lg font-semibold text-outer_space-500 dark:text-platinum-500"
											>
												{event.title}
											</h3>
											{event.description && (
												<p className="text-sm text-paynes_gray-500 dark:text-french_gray-400 mt-2">
													{event.description}
												</p>
											)}
											<p className="text-sm text-paynes_gray-500 dark:text-french_gray-400 mt-2">
												{formatEventWhen(event)}
											</p>
											{event.projectName && (
												<p className="text-sm text-paynes_gray-500 dark:text-french_gray-400 mt-1">
													{event.projectName}
												</p>
											)}
											<div className="flex justify-end pt-4">
												<button
													type="button"
													onClick={() => setSelected(null)}
													className="px-4 py-2"
												>
													Close
												</button>
											</div>
										</>
									);
								})()}
					</div>
				</div>
			)}
		</div>
	);
}
