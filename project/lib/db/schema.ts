import { relations } from "drizzle-orm";
import {
	index,
	integer,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

export const priorityEnum = pgEnum("priority", ["low", "medium", "high"]);

export const users = pgTable("users", {
	id: uuid("id").primaryKey().defaultRandom(),
	clerkId: text("clerk_id").notNull().unique(),
	email: text("email").notNull().unique(),
	name: text("name").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const projects = pgTable(
	"projects",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		name: text("name").notNull(),
		description: text("description"),
		ownerId: uuid("owner_id")
			.notNull()
			.references(() => users.id),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
		dueDate: timestamp("due_date"),
	},
	(table) => [
		index("projects_owner_id_idx").on(table.ownerId),
		index("projects_due_date_idx").on(table.dueDate),
	],
);

export const lists = pgTable(
	"lists",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		name: text("name").notNull(),
		projectId: uuid("project_id")
			.notNull()
			.references(() => projects.id),
		position: integer("position").notNull(),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(table) => [
		index("lists_project_id_idx").on(table.projectId),
		index("lists_project_position_idx").on(table.projectId, table.position),
	],
);

export const tasks = pgTable(
	"tasks",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		title: text("title").notNull(),
		description: text("description"),
		listId: uuid("list_id")
			.notNull()
			.references(() => lists.id),
		assigneeId: uuid("assignee_id").references(() => users.id),
		priority: priorityEnum("priority").notNull().default("medium"),
		dueDate: timestamp("due_date"),
		position: integer("position").notNull(),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(table) => [
		index("tasks_list_id_idx").on(table.listId),
		index("tasks_list_position_idx").on(table.listId, table.position),
		index("tasks_assignee_id_idx").on(table.assigneeId),
		index("tasks_due_date_idx").on(table.dueDate),
		index("tasks_priority_idx").on(table.priority),
	],
);

export const comments = pgTable(
	"comments",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		content: text("content").notNull(),
		taskId: uuid("task_id")
			.notNull()
			.references(() => tasks.id),
		authorId: uuid("author_id")
			.notNull()
			.references(() => users.id),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(table) => [
		index("comments_task_id_idx").on(table.taskId),
		index("comments_author_id_idx").on(table.authorId),
		index("comments_task_created_at_idx").on(table.taskId, table.createdAt),
	],
);

// Relations

export const usersRelations = relations(users, ({ many }) => ({
	projects: many(projects),
	assignedTasks: many(tasks),
	comments: many(comments),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
	owner: one(users, { fields: [projects.ownerId], references: [users.id] }),
	lists: many(lists),
}));

export const listsRelations = relations(lists, ({ one, many }) => ({
	project: one(projects, {
		fields: [lists.projectId],
		references: [projects.id],
	}),
	tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
	list: one(lists, { fields: [tasks.listId], references: [lists.id] }),
	assignee: one(users, { fields: [tasks.assigneeId], references: [users.id] }),
	comments: many(comments),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
	task: one(tasks, { fields: [comments.taskId], references: [tasks.id] }),
	author: one(users, { fields: [comments.authorId], references: [users.id] }),
}));
