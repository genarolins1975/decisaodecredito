ALTER TABLE "study_responses" ADD COLUMN "revealed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "study_responses" ADD COLUMN "disclosed_before" boolean DEFAULT false NOT NULL;