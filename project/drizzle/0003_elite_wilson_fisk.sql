CREATE TYPE "public"."status" AS ENUM('To Do', 'In Progress', 'Review', 'Done');--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "status" "status" DEFAULT 'To Do' NOT NULL;