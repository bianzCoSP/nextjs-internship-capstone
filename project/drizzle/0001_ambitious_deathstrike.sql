ALTER TABLE "projects" ALTER COLUMN "slug" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "slug" text;--> statement-breakpoint
CREATE INDEX "tasks_slug_idx" ON "tasks" USING btree ("slug");--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_slug_unique" UNIQUE("slug");