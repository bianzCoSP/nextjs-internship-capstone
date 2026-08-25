import { and, eq, ilike, inArray, ne, notInArray, or, sql } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import {
	comments,
	lists,
	projectMembers,
	projects,
	taskAssignees,
	tasks,
	users,
} from "./schema";
import { generateUniqueProjectSlug, generateUniqueTaskSlug } from "./slug";

type NewProject = Omit<typeof projects.$inferInsert, "slug">;
type UpdateProject = Partial<typeof projects.$inferInsert>;
type NewList = typeof lists.$inferInsert;
type NewTask = Omit<typeof tasks.$inferInsert, "slug">;
type UpdateTask = Partial<typeof tasks.$inferInsert>;
type NewUser = typeof users.$inferInsert;
type UpdateUser = Partial<typeof users.$inferInsert>;
type NewComment = Omit<
	typeof comments.$inferInsert,
	"id" | "createdAt" | "updatedAt"
>;

const DEFAULT_LIST_NAMES = ["To Do", "In Progress", "Review", "Done"];

export const queries = {
	projects: {
		getAll: async () => {
			const rows = await db
				.select({
					id: projects.id,
					name: projects.name,
					slug: projects.slug,
					description: projects.description,
					status: projects.status,
					color: projects.color,
					dueDate: projects.dueDate,
					ownerId: projects.ownerId,
					ownerName: users.name,
					updatedAt: projects.updatedAt,
					memberCount:
						sql<number>`count(distinct ${projectMembers.userId})`.mapWith(
							Number,
						),
					totalTasks: sql<number>`count(distinct ${tasks.id})`.mapWith(Number),
					doneTasks:
						sql<number>`count(distinct case when ${tasks.status} = 'Done' then ${tasks.id} end)`.mapWith(
							Number,
						),
				})
				.from(projects)
				.innerJoin(users, eq(users.id, projects.ownerId))
				.leftJoin(projectMembers, eq(projectMembers.projectId, projects.id))
				.leftJoin(lists, eq(lists.projectId, projects.id))
				.leftJoin(tasks, eq(tasks.listId, lists.id))
				.groupBy(projects.id, users.id);

			return rows.map((p) => ({
				...p,
				progress:
					p.totalTasks > 0 ? Math.round((p.doneTasks / p.totalTasks) * 100) : 0,
			}));
		},
		getAllForUser: async (userId: string) => {
			const memberProjectIds = db
				.select({ projectId: projectMembers.projectId })
				.from(projectMembers)
				.where(eq(projectMembers.userId, userId));

			const rows = await db
				.select({
					id: projects.id,
					name: projects.name,
					slug: projects.slug,
					description: projects.description,
					status: projects.status,
					color: projects.color,
					dueDate: projects.dueDate,
					ownerId: projects.ownerId,
					ownerName: users.name,
					updatedAt: projects.updatedAt,
					memberCount:
						sql<number>`count(distinct ${projectMembers.userId})`.mapWith(
							Number,
						),
					totalTasks: sql<number>`count(distinct ${tasks.id})`.mapWith(Number),
					doneTasks:
						sql<number>`count(distinct case when ${tasks.status} = 'Done' then ${tasks.id} end)`.mapWith(
							Number,
						),
				})
				.from(projects)
				.innerJoin(users, eq(users.id, projects.ownerId))
				.leftJoin(projectMembers, eq(projectMembers.projectId, projects.id))
				.leftJoin(lists, eq(lists.projectId, projects.id))
				.leftJoin(tasks, eq(tasks.listId, lists.id))
				.where(inArray(projects.id, memberProjectIds))
				.groupBy(projects.id, users.id);

			return rows.map((p) => ({
				...p,
				progress:
					p.totalTasks > 0 ? Math.round((p.doneTasks / p.totalTasks) * 100) : 0,
			}));
		},
		getById: async (id: string) => {
			const [project] = await db
				.select()
				.from(projects)
				.where(eq(projects.id, id));
			return project ?? null;
		},
		getBySlug: async (slug: string) => {
			const [row] = await db
				.select({
					id: projects.id,
					name: projects.name,
					slug: projects.slug,
					description: projects.description,
					status: projects.status,
					color: projects.color,
					dueDate: projects.dueDate,
					ownerId: projects.ownerId,
					ownerName: users.name,
					createdAt: projects.createdAt,
					updatedAt: projects.updatedAt,
				})
				.from(projects)
				.innerJoin(users, eq(users.id, projects.ownerId))
				.where(eq(projects.slug, slug));
			return row ?? null;
		},
		getMembers: async (projectId: string) => {
			return await db
				.select({
					id: users.id,
					name: users.name,
					email: users.email,
				})
				.from(projectMembers)
				.innerJoin(users, eq(users.id, projectMembers.userId))
				.where(eq(projectMembers.projectId, projectId))
				.orderBy(users.name);
		},
		isMember: async (projectId: string, userId: string) => {
			const [row] = await db
				.select({ id: projectMembers.id })
				.from(projectMembers)
				.where(
					and(
						eq(projectMembers.projectId, projectId),
						eq(projectMembers.userId, userId),
					),
				);
			return !!row;
		},
		addMember: async (projectId: string, userId: string) => {
			const [existing] = await db
				.select({ id: projectMembers.id })
				.from(projectMembers)
				.where(
					and(
						eq(projectMembers.projectId, projectId),
						eq(projectMembers.userId, userId),
					),
				);

			if (existing) return null;

			const [member] = await db
				.insert(projectMembers)
				.values({ projectId, userId })
				.returning();
			return member ?? null;
		},
		addMembers: async (projectId: string, userIds: string[]) => {
			if (userIds.length === 0) return [];

			const uniqueUserIds = [...new Set(userIds)];

			const existing = await db
				.select({ userId: projectMembers.userId })
				.from(projectMembers)
				.where(
					and(
						eq(projectMembers.projectId, projectId),
						inArray(projectMembers.userId, uniqueUserIds),
					),
				);
			const existingIds = new Set(existing.map((row) => row.userId));
			const newUserIds = uniqueUserIds.filter((id) => !existingIds.has(id));

			if (newUserIds.length === 0) return [];

			return await db
				.insert(projectMembers)
				.values(newUserIds.map((userId) => ({ projectId, userId })))
				.returning();
		},
		create: async (data: NewProject) => {
			const slug = await generateUniqueProjectSlug(data.name);
			const [project] = await db
				.insert(projects)
				.values({ ...data, slug })
				.returning();

			if (project) {
				await db.insert(projectMembers).values({
					projectId: project.id,
					userId: project.ownerId,
				});

				await queries.lists.createDefaultsForProject(project.id);
			}

			return project;
		},
		update: async (id: string, data: UpdateProject) => {
			const updates: UpdateProject = { ...data, updatedAt: new Date() };

			if (data.name) {
				const [current] = await db
					.select({ name: projects.name, slug: projects.slug })
					.from(projects)
					.where(eq(projects.id, id));

				if (current && current.name !== data.name) {
					updates.slug = await generateUniqueProjectSlug(data.name);
				} else if (current) {
					updates.slug = current.slug;
				}
			}

			const [project] = await db
				.update(projects)
				.set(updates)
				.where(eq(projects.id, id))
				.returning();
			return project ?? null;
		},
		delete: async (id: string) => {
			const projectLists = await db
				.select({ id: lists.id })
				.from(lists)
				.where(eq(lists.projectId, id));
			const listIds = projectLists.map((l) => l.id);

			if (listIds.length > 0) {
				const projectTasks = await db
					.select({ id: tasks.id })
					.from(tasks)
					.where(inArray(tasks.listId, listIds));
				const taskIds = projectTasks.map((t) => t.id);

				if (taskIds.length > 0) {
					await db.delete(comments).where(inArray(comments.taskId, taskIds));
					await db
						.delete(taskAssignees)
						.where(inArray(taskAssignees.taskId, taskIds));
					await db.delete(tasks).where(inArray(tasks.listId, listIds));
				}

				await db.delete(lists).where(eq(lists.projectId, id));
			}

			await db.delete(projectMembers).where(eq(projectMembers.projectId, id));
			await db.delete(projects).where(eq(projects.id, id));
		},
	},
	lists: {
		getById: async (id: string) => {
			const [list] = await db.select().from(lists).where(eq(lists.id, id));
			return list ?? null;
		},
		getByProject: async (projectId: string) => {
			return await db
				.select()
				.from(lists)
				.where(eq(lists.projectId, projectId))
				.orderBy(lists.position);
		},
		create: async (data: NewList) => {
			const [list] = await db.insert(lists).values(data).returning();
			return list;
		},
		createDefaultsForProject: async (projectId: string) => {
			return await db
				.insert(lists)
				.values(
					DEFAULT_LIST_NAMES.map((name, position) => ({
						name,
						projectId,
						position,
					})),
				)
				.returning();
		},
	},
	tasks: {
		getByProject: async (projectId: string) => {
			const rows = await db
				.select({
					id: tasks.id,
					title: tasks.title,
					slug: tasks.slug,
					description: tasks.description,
					listId: tasks.listId,
					priority: tasks.priority,
					status: tasks.status,
					dueDate: tasks.dueDate,
					position: tasks.position,
					createdAt: tasks.createdAt,
					updatedAt: tasks.updatedAt,
				})
				.from(tasks)
				.innerJoin(lists, eq(lists.id, tasks.listId))
				.where(eq(lists.projectId, projectId))
				.orderBy(tasks.position);

			const taskIds = rows.map((row) => row.id);
			const assigneeRows = taskIds.length
				? await db
						.select({
							taskId: taskAssignees.taskId,
							id: users.id,
							name: users.name,
						})
						.from(taskAssignees)
						.innerJoin(users, eq(users.id, taskAssignees.userId))
						.where(inArray(taskAssignees.taskId, taskIds))
				: [];

			const assigneesByTask = new Map<string, { id: string; name: string }[]>();
			for (const row of assigneeRows) {
				const bucket = assigneesByTask.get(row.taskId) ?? [];
				bucket.push({ id: row.id, name: row.name });
				assigneesByTask.set(row.taskId, bucket);
			}

			return rows.map((row) => ({
				...row,
				assignees: assigneesByTask.get(row.id) ?? [],
			}));
		},
		getByList: async (listId: string) => {
			return await db
				.select()
				.from(tasks)
				.where(eq(tasks.listId, listId))
				.orderBy(tasks.position);
		},
		getBySlug: async (slug: string) => {
			const [row] = await db
				.select({
					id: tasks.id,
					title: tasks.title,
					slug: tasks.slug,
					description: tasks.description,
					priority: tasks.priority,
					status: tasks.status,
					dueDate: tasks.dueDate,
					completionDate: tasks.completionDate,
					createdAt: tasks.createdAt,
					updatedAt: tasks.updatedAt,
					listId: tasks.listId,
					listName: lists.name,
					projectId: projects.id,
					projectName: projects.name,
					projectSlug: projects.slug,
					creatorId: tasks.creatorId,
					creatorName: users.name,
				})
				.from(tasks)
				.innerJoin(lists, eq(lists.id, tasks.listId))
				.innerJoin(projects, eq(projects.id, lists.projectId))
				.innerJoin(users, eq(users.id, tasks.creatorId))
				.where(eq(tasks.slug, slug));

			if (!row) return null;

			const assignees = await db
				.select({ id: users.id, name: users.name })
				.from(taskAssignees)
				.innerJoin(users, eq(users.id, taskAssignees.userId))
				.where(eq(taskAssignees.taskId, row.id));

			return { ...row, assignees };
		},
		create: async (data: NewTask) => {
			const slug = await generateUniqueTaskSlug(data.title);
			const [task] = await db
				.insert(tasks)
				.values({ ...data, slug })
				.returning();
			return task;
		},
		setAssignees: async (taskId: string, userIds: string[]) => {
			await db.delete(taskAssignees).where(eq(taskAssignees.taskId, taskId));
			if (userIds.length > 0) {
				await db
					.insert(taskAssignees)
					.values(userIds.map((userId) => ({ taskId, userId })));
			}
		},
		update: async (id: string, data: UpdateTask) => {
			const [task] = await db
				.update(tasks)
				.set({ ...data, updatedAt: new Date() })
				.where(eq(tasks.id, id))
				.returning();
			return task ?? null;
		},
		delete: async (id: string) => {
			await db.delete(comments).where(eq(comments.taskId, id));
			await db.delete(taskAssignees).where(eq(taskAssignees.taskId, id));
			await db.delete(tasks).where(eq(tasks.id, id));
		},
		reorder: async (listId: string, orderedIds: string[]) => {
			await Promise.all(
				orderedIds.map((id, index) =>
					db
						.update(tasks)
						.set({ position: index, updatedAt: new Date() })
						.where(and(eq(tasks.id, id), eq(tasks.listId, listId))),
				),
			);
		},
		move: async ({
			taskId,
			destinationListId,
			sourceOrderedIds,
			destinationOrderedIds,
		}: {
			taskId: string;
			destinationListId: string;
			sourceOrderedIds: string[];
			destinationOrderedIds: string[];
		}) => {
			await db
				.update(tasks)
				.set({ listId: destinationListId, updatedAt: new Date() })
				.where(eq(tasks.id, taskId));

			await Promise.all([
				...destinationOrderedIds.map((id, index) =>
					db
						.update(tasks)
						.set({ position: index, updatedAt: new Date() })
						.where(eq(tasks.id, id)),
				),
				...sourceOrderedIds.map((id, index) =>
					db
						.update(tasks)
						.set({ position: index, updatedAt: new Date() })
						.where(eq(tasks.id, id)),
				),
			]);
		},
	},
	comments: {
		getByTask: async (taskId: string) => {
			return await db
				.select({
					id: comments.id,
					content: comments.content,
					createdAt: comments.createdAt,
					authorId: comments.authorId,
					authorName: users.name,
				})
				.from(comments)
				.innerJoin(users, eq(users.id, comments.authorId))
				.where(eq(comments.taskId, taskId))
				.orderBy(comments.createdAt);
		},
		create: async (data: NewComment) => {
			const [comment] = await db.insert(comments).values(data).returning();
			return comment;
		},
		delete: async (id: string) => {
			await db.delete(comments).where(eq(comments.id, id));
		},
	},
	users: {
		getAll: async () => {
			return await db.select().from(users);
		},
		getByClerkId: async (clerkId: string) => {
			const [user] = await db
				.select()
				.from(users)
				.where(eq(users.clerkId, clerkId));
			return user ?? null;
		},
		getTeammates: async (userId: string) => {
			const memberProjectIds = db
				.select({ projectId: projectMembers.projectId })
				.from(projectMembers)
				.where(eq(projectMembers.userId, userId));

			const rows = await db
				.select({
					id: users.id,
					name: users.name,
					email: users.email,
					role: users.role,
					sharedProjectCount:
						sql<number>`count(distinct ${projectMembers.projectId})`.mapWith(
							Number,
						),
				})
				.from(projectMembers)
				.innerJoin(users, eq(users.id, projectMembers.userId))
				.where(
					and(
						inArray(projectMembers.projectId, memberProjectIds),
						ne(projectMembers.userId, userId),
					),
				)
				.groupBy(users.id);

			return rows.sort((a, b) => b.sharedProjectCount - a.sharedProjectCount);
		},

		search: async (query: string, excludeIds: string[] = []) => {
			const trimmed = query.trim();
			if (!trimmed) return [];

			const pattern = `%${trimmed}%`;
			const nameOrEmailMatch = or(
				ilike(users.name, pattern),
				ilike(users.email, pattern),
			);

			const rows = await db
				.select({ id: users.id, name: users.name, email: users.email })
				.from(users)
				.where(
					excludeIds.length > 0
						? and(nameOrEmailMatch, notInArray(users.id, excludeIds))
						: nameOrEmailMatch,
				)
				.orderBy(users.name)
				.limit(10);

			return rows;
		},
		create: async (data: NewUser) => {
			const [user] = await db.insert(users).values(data).returning();
			return user;
		},
		update: async (clerkId: string, data: UpdateUser) => {
			const [user] = await db
				.update(users)
				.set({ ...data, updatedAt: new Date() })
				.where(eq(users.clerkId, clerkId))
				.returning();
			return user ?? null;
		},
		delete: async (clerkId: string) => {
			await db.delete(users).where(eq(users.clerkId, clerkId));
		},
		getByIds: async (ids: string[]) => {
			if (ids.length === 0) return [];
			return await db
				.select({ id: users.id, name: users.name })
				.from(users)
				.where(inArray(users.id, ids));
		},
	},
	analytics: {
		getForUser: async (userId: string) => {
			const memberProjectIds = db
				.select({ projectId: projectMembers.projectId })
				.from(projectMembers)
				.where(eq(projectMembers.userId, userId));

			const [summary] = await db
				.select({
					totalTasks: sql<number>`count(distinct ${tasks.id})`.mapWith(Number),
					doneTasks:
						sql<number>`count(distinct case when ${tasks.status} = 'Done' then ${tasks.id} end)`.mapWith(
							Number,
						),
					completedLast7Days:
						sql<number>`count(distinct case when ${tasks.status} = 'Done' and ${tasks.completionDate} >= now() - interval '7 days' then ${tasks.id} end)`.mapWith(
							Number,
						),
					avgCompletionDays: sql<
						number | null
					>`avg(case when ${tasks.status} = 'Done' then extract(epoch from (${tasks.completionDate} - ${tasks.createdAt})) / 86400 end)`.mapWith(
						(v) => (v === null ? null : Number(v)),
					),
				})
				.from(tasks)
				.innerJoin(lists, eq(lists.id, tasks.listId))
				.where(inArray(lists.projectId, memberProjectIds));

			const [memberStats] = await db
				.select({
					teamMembers:
						sql<number>`count(distinct ${projectMembers.userId})`.mapWith(
							Number,
						),
				})
				.from(projectMembers)
				.where(inArray(projectMembers.projectId, memberProjectIds));

			const projectProgress = await db
				.select({
					id: projects.id,
					name: projects.name,
					totalTasks: sql<number>`count(distinct ${tasks.id})`.mapWith(Number),
					doneTasks:
						sql<number>`count(distinct case when ${tasks.status} = 'Done' then ${tasks.id} end)`.mapWith(
							Number,
						),
				})
				.from(projects)
				.leftJoin(lists, eq(lists.projectId, projects.id))
				.leftJoin(tasks, eq(tasks.listId, lists.id))
				.where(inArray(projects.id, memberProjectIds))
				.groupBy(projects.id)
				.orderBy(projects.name);

			const teamActivity = await db
				.select({
					date: sql<string>`to_char(${tasks.completionDate}, 'YYYY-MM-DD')`,
					completed: sql<number>`count(distinct ${tasks.id})`.mapWith(Number),
				})
				.from(tasks)
				.innerJoin(lists, eq(lists.id, tasks.listId))
				.where(
					and(
						inArray(lists.projectId, memberProjectIds),
						eq(tasks.status, "Done"),
						sql`${tasks.completionDate} >= now() - interval '6 days'`,
					),
				)
				.groupBy(sql`to_char(${tasks.completionDate}, 'YYYY-MM-DD')`)
				.orderBy(sql`to_char(${tasks.completionDate}, 'YYYY-MM-DD')`);

			return {
				velocity: summary?.completedLast7Days ?? 0,
				efficiency:
					summary && summary.totalTasks > 0
						? Math.round((summary.doneTasks / summary.totalTasks) * 100)
						: 0,
				teamMembers: memberStats?.teamMembers ?? 0,
				avgTaskDays: summary?.avgCompletionDays
					? Math.round(summary.avgCompletionDays * 10) / 10
					: 0,
				projectProgress: projectProgress.map((p) => ({
					id: p.id,
					name: p.name,
					progress:
						p.totalTasks > 0
							? Math.round((p.doneTasks / p.totalTasks) * 100)
							: 0,
				})),
				teamActivity,
			};
		},
	},
};

export type AnalyticsData = Awaited<
	ReturnType<typeof queries.analytics.getForUser>
>;
