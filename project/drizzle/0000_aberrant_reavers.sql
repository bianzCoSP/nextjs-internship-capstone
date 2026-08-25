CREATE TYPE "public"."priority" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('To Do', 'In Progress', 'Review', 'Done');--> statement-breakpoint
CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content" text NOT NULL,
	"task_id" uuid NOT NULL,
	"author_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"project_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"status" "status" DEFAULT 'To Do' NOT NULL,
	"color" text DEFAULT '#4a89a9' NOT NULL,
	"owner_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"due_date" timestamp,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "task_assignees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"list_id" uuid NOT NULL,
	"creator_id" uuid NOT NULL,
	"priority" "priority" DEFAULT 'medium' NOT NULL,
	"status" "status" DEFAULT 'To Do' NOT NULL,
	"due_date" timestamp NOT NULL,
	"completion_date" timestamp,
	"position" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id" text NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"role" text DEFAULT 'Unassigned' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lists" ADD CONSTRAINT "lists_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_assignees" ADD CONSTRAINT "task_assignees_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_assignees" ADD CONSTRAINT "task_assignees_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_list_id_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."lists"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "comments_task_id_idx" ON "comments" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "comments_author_id_idx" ON "comments" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "comments_task_created_at_idx" ON "comments" USING btree ("task_id","created_at");--> statement-breakpoint
CREATE INDEX "lists_project_id_idx" ON "lists" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "lists_project_position_idx" ON "lists" USING btree ("project_id","position");--> statement-breakpoint
CREATE INDEX "project_members_project_id_idx" ON "project_members" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_members_user_id_idx" ON "project_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "project_members_project_user_idx" ON "project_members" USING btree ("project_id","user_id");--> statement-breakpoint
CREATE INDEX "projects_owner_id_idx" ON "projects" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "projects_due_date_idx" ON "projects" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "projects_slug_idx" ON "projects" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "task_assignees_task_id_idx" ON "task_assignees" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "task_assignees_user_id_idx" ON "task_assignees" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "task_assignees_task_user_idx" ON "task_assignees" USING btree ("task_id","user_id");--> statement-breakpoint
CREATE INDEX "tasks_list_id_idx" ON "tasks" USING btree ("list_id");--> statement-breakpoint
CREATE INDEX "tasks_list_position_idx" ON "tasks" USING btree ("list_id","position");--> statement-breakpoint
CREATE INDEX "tasks_creator_id_idx" ON "tasks" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "tasks_due_date_idx" ON "tasks" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "tasks_priority_idx" ON "tasks" USING btree ("priority");