CREATE TYPE "public"."energy_level" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."playbook_item_type" AS ENUM('meal', 'comfort_media', 'comfort_activity', 'sensory_aid');--> statement-breakpoint
CREATE TABLE "anchor_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"task_name" varchar(255) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_anchor_task_status" (
	"id" serial PRIMARY KEY NOT NULL,
	"daily_log_id" integer NOT NULL,
	"anchor_task_id" integer NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"log_date" date NOT NULL,
	"energy_level" "energy_level" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "daily_logs_log_date_unique" UNIQUE("log_date")
);
--> statement-breakpoint
CREATE TABLE "future_goals" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"next_physical_step" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "noodles_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"log_date" date NOT NULL,
	"activity_type" varchar(100) NOT NULL,
	"duration_minutes" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "playbook_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"item_type" "playbook_item_type" NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"energy_level_required" integer
);
--> statement-breakpoint
DROP TABLE "activity_logs" CASCADE;--> statement-breakpoint
DROP TABLE "invitations" CASCADE;--> statement-breakpoint
DROP TABLE "team_members" CASCADE;--> statement-breakpoint
DROP TABLE "teams" CASCADE;--> statement-breakpoint
ALTER TABLE "anchor_tasks" ADD CONSTRAINT "anchor_tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_anchor_task_status" ADD CONSTRAINT "daily_anchor_task_status_daily_log_id_daily_logs_id_fk" FOREIGN KEY ("daily_log_id") REFERENCES "public"."daily_logs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_anchor_task_status" ADD CONSTRAINT "daily_anchor_task_status_anchor_task_id_anchor_tasks_id_fk" FOREIGN KEY ("anchor_task_id") REFERENCES "public"."anchor_tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_logs" ADD CONSTRAINT "daily_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "role";