ALTER TABLE "tasks" ALTER COLUMN "due_date" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "completion_date" timestamp;