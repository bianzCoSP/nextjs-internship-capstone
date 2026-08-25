ALTER TABLE "tasks" RENAME COLUMN "assignee_id" TO "creator_id";--> statement-breakpoint
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_assignee_id_users_id_fk";
--> statement-breakpoint
DROP INDEX "tasks_assignee_id_idx";--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tasks_creator_id_idx" ON "tasks" USING btree ("creator_id");