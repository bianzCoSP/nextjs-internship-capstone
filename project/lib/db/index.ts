// TODO: Task 3.2 - Configure PostgreSQL database (Vercel Postgres or Neon)
// TODO: Task 3.5 - Implement database connection and query utilities

/*
TODO: Implementation Notes for Interns:

1. Choose database provider:
   - Vercel Postgres (recommended for Vercel deployment)
   - Neon (good alternative)
   - Local PostgreSQL for development

2. Set up environment variables:
   - DATABASE_URL
   - POSTGRES_URL (if using Vercel Postgres)

3. Configure Drizzle connection
4. Implement CRUD operations for all entities
5. Add proper error handling
6. Set up connection pooling if needed

Example structure:
import { drizzle } from 'drizzle-orm/vercel-postgres'
import { sql } from '@vercel/postgres'
import * as schema from './schema'

export const db = drizzle(sql, { schema })

export const queries = {
  projects: {
    getAll: async () => { ... },
    getById: async (id: string) => { ... },
    create: async (data: any) => { ... },
    update: async (id: string, data: any) => { ... },
    delete: async (id: string) => { ... },
  },
  // ... other entity queries
}
*/

import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { lists, projectMembers, projects, tasks, users } from "./schema";
import { generateUniqueProjectSlug } from "./slug";

type NewProject = Omit<typeof projects.$inferInsert, "slug">;
type UpdateProject = Partial<typeof projects.$inferInsert>;
type NewList = typeof lists.$inferInsert;
type NewTask = typeof tasks.$inferInsert;
type UpdateTask = Partial<typeof tasks.$inferInsert>;
type NewUser = typeof users.$inferInsert;
type UpdateUser = Partial<typeof users.$inferInsert>;

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
		create: async (data: NewProject) => {
			const slug = await generateUniqueProjectSlug(data.name);
			const [project] = await db
				.insert(projects)
				.values({ ...data, slug })
				.returning();

			if (project) {
				await queries.lists.createDefaultsForProject(project.id);
			}

			return project;
		},
		update: async (id: string, data: UpdateProject) => {
			const updates: UpdateProject = { ...data, updatedAt: new Date() };
			if (data.name) {
				updates.slug = await generateUniqueProjectSlug(data.name);
			}
			const [project] = await db
				.update(projects)
				.set(updates)
				.where(eq(projects.id, id))
				.returning();
			return project ?? null;
		},
		delete: async (id: string) => {
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
					description: tasks.description,
					listId: tasks.listId,
					assigneeId: tasks.assigneeId,
					assigneeName: users.name,
					priority: tasks.priority,
					status: tasks.status,
					dueDate: tasks.dueDate,
					position: tasks.position,
					createdAt: tasks.createdAt,
					updatedAt: tasks.updatedAt,
				})
				.from(tasks)
				.innerJoin(lists, eq(lists.id, tasks.listId))
				.leftJoin(users, eq(users.id, tasks.assigneeId))
				.where(eq(lists.projectId, projectId))
				.orderBy(tasks.position);

			return rows;
		},
		getByList: async (listId: string) => {
			return await db
				.select()
				.from(tasks)
				.where(eq(tasks.listId, listId))
				.orderBy(tasks.position);
		},
		create: async (data: NewTask) => {
			const [task] = await db.insert(tasks).values(data).returning();
			return task;
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
	users: {
		getByClerkId: async (clerkId: string) => {
			const [user] = await db
				.select()
				.from(users)
				.where(eq(users.clerkId, clerkId));
			return user ?? null;
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
	},
};
