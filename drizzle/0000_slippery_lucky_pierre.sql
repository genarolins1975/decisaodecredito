CREATE TABLE "assignment_extensions" (
	"id" text PRIMARY KEY NOT NULL,
	"assignment_id" text NOT NULL,
	"user_id" text,
	"group_id" text,
	"due_at" timestamp with time zone NOT NULL,
	"reason" text NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assignment_steps" (
	"id" text PRIMARY KEY NOT NULL,
	"assignment_id" text NOT NULL,
	"number" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"page_slug" text,
	"expected_outputs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"requires_delivery" boolean DEFAULT false NOT NULL,
	"due_at" timestamp with time zone,
	"position" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assignments" (
	"id" text PRIMARY KEY NOT NULL,
	"class_id" text NOT NULL,
	"unit_id" text,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"objectives" text,
	"prerequisites" text,
	"materials" text,
	"deliverables" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"allowed_formats" jsonb DEFAULT '["pdf","zip","csv","ipynb","md","link"]'::jsonb NOT NULL,
	"max_file_mb" integer DEFAULT 50 NOT NULL,
	"mode" text DEFAULT 'individual' NOT NULL,
	"due_at" timestamp with time zone,
	"late_policy" jsonb DEFAULT '{"acceptLate":true,"penaltyPerDayPct":0,"startedBeforeDeadlineCounts":false}'::jsonb NOT NULL,
	"rubric_version_id" text,
	"weight" numeric(6, 3),
	"status" text DEFAULT 'draft' NOT NULL,
	"blind_test_enabled" boolean DEFAULT false NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attempts" (
	"id" text PRIMARY KEY NOT NULL,
	"activity_id" text NOT NULL,
	"user_id" text NOT NULL,
	"attempt_no" integer DEFAULT 1 NOT NULL,
	"client_request_id" text NOT NULL,
	"answer" jsonb NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"is_correct" boolean,
	"saved_at" timestamp with time zone DEFAULT now() NOT NULL,
	"submitted_at" timestamp with time zone,
	"server_time" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attendance_checkins" (
	"id" text PRIMARY KEY NOT NULL,
	"window_id" text NOT NULL,
	"user_id" text NOT NULL,
	"code_used" text,
	"result" text NOT NULL,
	"reason" text,
	"server_time" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_hash" text,
	"user_agent" text
);
--> statement-breakpoint
CREATE TABLE "attendance_history" (
	"id" text PRIMARY KEY NOT NULL,
	"record_id" text NOT NULL,
	"from_status" text,
	"to_status" text NOT NULL,
	"reason" text NOT NULL,
	"changed_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attendance_records" (
	"id" text PRIMARY KEY NOT NULL,
	"meeting_id" text NOT NULL,
	"user_id" text NOT NULL,
	"status" text NOT NULL,
	"source" text DEFAULT 'checkin' NOT NULL,
	"reason" text,
	"decided_by" text,
	"decided_at" timestamp with time zone DEFAULT now() NOT NULL,
	"review_requested" text,
	"review_requested_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "attendance_windows" (
	"id" text PRIMARY KEY NOT NULL,
	"meeting_id" text NOT NULL,
	"kind" text DEFAULT 'checkin' NOT NULL,
	"opens_at" timestamp with time zone NOT NULL,
	"closes_at" timestamp with time zone NOT NULL,
	"late_after" timestamp with time zone,
	"code_secret" text NOT NULL,
	"rotation_seconds" integer DEFAULT 60 NOT NULL,
	"max_attempts" integer DEFAULT 10 NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"actor_user_id" text,
	"action" text NOT NULL,
	"entity" text NOT NULL,
	"entity_id" text,
	"class_id" text,
	"details" jsonb,
	"ip_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blind_submissions" (
	"id" text PRIMARY KEY NOT NULL,
	"blind_test_id" text NOT NULL,
	"group_id" text,
	"user_id" text NOT NULL,
	"file_id" text NOT NULL,
	"freeze_id" text,
	"submission_no" integer NOT NULL,
	"validation" jsonb,
	"metrics" jsonb,
	"is_exception" boolean DEFAULT false NOT NULL,
	"exception_reason" text,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blind_tests" (
	"id" text PRIMARY KEY NOT NULL,
	"assignment_id" text NOT NULL,
	"dataset_id" text,
	"oot_file_id" text,
	"labels_file_id" text,
	"release_policy" text DEFAULT 'apos_congelamento' NOT NULL,
	"max_submissions" integer DEFAULT 1 NOT NULL,
	"feedback_level" text DEFAULT 'recibo' NOT NULL,
	"expected_ids" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chapters" (
	"id" text PRIMARY KEY NOT NULL,
	"unit_id" text NOT NULL,
	"number" integer NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"central_question" text,
	"prerequisites" text,
	"learn" text,
	"motivation" text,
	"activity" text,
	"uses" text,
	"theme_color" text,
	"theme_soft" text,
	"position" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "classes" (
	"id" text PRIMARY KEY NOT NULL,
	"edition_id" text NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"archive_policy" text DEFAULT 'read_only' NOT NULL,
	"timezone" text DEFAULT 'America/Sao_Paulo' NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_imports" (
	"id" text PRIMARY KEY NOT NULL,
	"edition_id" text NOT NULL,
	"source_file" text NOT NULL,
	"source_sha256" text NOT NULL,
	"summary" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"short_name" text NOT NULL,
	"professor_name" text NOT NULL,
	"institution" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "datasets" (
	"id" text PRIMARY KEY NOT NULL,
	"edition_id" text NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"product" text,
	"population" text,
	"emphasis" text,
	"version" text DEFAULT '1' NOT NULL,
	"status" text DEFAULT 'pendente' NOT NULL,
	"file_id" text,
	"dictionary_file_id" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "editions" (
	"id" text PRIMARY KEY NOT NULL,
	"course_id" text NOT NULL,
	"year" integer NOT NULL,
	"label" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"content_version_note" text,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"to_email" text NOT NULL,
	"to_user_id" text,
	"enrollment_id" text,
	"invite_id" text,
	"class_id" text,
	"subject" text NOT NULL,
	"body_text" text NOT NULL,
	"body_html" text,
	"status" text DEFAULT 'queued' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"max_attempts" integer DEFAULT 5 NOT NULL,
	"next_attempt_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_error" text,
	"provider_message_id" text,
	"accepted_at" timestamp with time zone,
	"dedupe_key" text,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enrollments" (
	"id" text PRIMARY KEY NOT NULL,
	"class_id" text NOT NULL,
	"user_id" text,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"role" text DEFAULT 'aluno' NOT NULL,
	"status" text DEFAULT 'autorizado' NOT NULL,
	"activated_at" timestamp with time zone,
	"suspended_at" timestamp with time zone,
	"ended_at" timestamp with time zone,
	"status_reason" text,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "files" (
	"id" text PRIMARY KEY NOT NULL,
	"storage_key" text NOT NULL,
	"original_name" text NOT NULL,
	"mime" text NOT NULL,
	"size" integer DEFAULT 0 NOT NULL,
	"sha256" text,
	"owner_user_id" text,
	"class_id" text,
	"purpose" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "gmail_connections" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_user_id" text NOT NULL,
	"email_address" text NOT NULL,
	"refresh_token_enc" text NOT NULL,
	"access_token_enc" text,
	"access_token_expires_at" timestamp with time zone,
	"scopes" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone,
	"last_error" text,
	"last_error_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "grade_history" (
	"id" text PRIMARY KEY NOT NULL,
	"grade_id" text NOT NULL,
	"snapshot" jsonb NOT NULL,
	"reason" text NOT NULL,
	"changed_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grades" (
	"id" text PRIMARY KEY NOT NULL,
	"assignment_id" text NOT NULL,
	"class_id" text NOT NULL,
	"submission_id" text,
	"user_id" text NOT NULL,
	"rubric_version_id" text,
	"scores" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"total" numeric(8, 3),
	"status" text DEFAULT 'nao_corrigido' NOT NULL,
	"comments" text,
	"feedback_file_id" text,
	"individual_defense" jsonb,
	"graded_by" text,
	"graded_at" timestamp with time zone,
	"published_at" timestamp with time zone,
	"published_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "group_members" (
	"group_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"left_at" timestamp with time zone,
	CONSTRAINT "group_members_group_id_user_id_pk" PRIMARY KEY("group_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "groups" (
	"id" text PRIMARY KEY NOT NULL,
	"class_id" text NOT NULL,
	"name" text NOT NULL,
	"dataset_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invites" (
	"id" text PRIMARY KEY NOT NULL,
	"enrollment_id" text NOT NULL,
	"token_hash" text NOT NULL,
	"kind" text DEFAULT 'activation' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"superseded_at" timestamp with time zone,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "live_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"meeting_id" text NOT NULL,
	"class_id" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"current_page_id" text,
	"state_version" integer DEFAULT 0 NOT NULL,
	"opened_at" timestamp with time zone,
	"closed_at" timestamp with time zone,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "materials" (
	"id" text PRIMARY KEY NOT NULL,
	"edition_id" text NOT NULL,
	"unit_id" text,
	"title" text NOT NULL,
	"kind" text DEFAULT 'leitura' NOT NULL,
	"description" text,
	"url" text,
	"file_id" text,
	"citation" text,
	"status" text DEFAULT 'published' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meetings" (
	"id" text PRIMARY KEY NOT NULL,
	"class_id" text NOT NULL,
	"unit_id" text,
	"number" integer NOT NULL,
	"title" text NOT NULL,
	"scheduled_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"location" text,
	"video_url" text,
	"status" text DEFAULT 'planned' NOT NULL,
	"counts_for_attendance" boolean DEFAULT true NOT NULL,
	"replacement_of_id" text,
	"preparation" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "model_freezes" (
	"id" text PRIMARY KEY NOT NULL,
	"assignment_id" text NOT NULL,
	"group_id" text,
	"user_id" text,
	"manifest_file_id" text,
	"manifest_sha256" text NOT NULL,
	"artifact_hashes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"model_version" text NOT NULL,
	"frozen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"frozen_by" text,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "notices" (
	"id" text PRIMARY KEY NOT NULL,
	"class_id" text NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"published_at" timestamp with time zone,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"class_id" text,
	"kind" text NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"link" text,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "page_versions" (
	"id" text PRIMARY KEY NOT NULL,
	"page_id" text NOT NULL,
	"version_no" integer NOT NULL,
	"title" text NOT NULL,
	"objective" text,
	"support" text,
	"connection" text,
	"time_budget" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"blocks" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"teacher_guide" jsonb,
	"change_note" text,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"id" text PRIMARY KEY NOT NULL,
	"chapter_id" text NOT NULL,
	"slug" text NOT NULL,
	"number" integer NOT NULL,
	"position" integer NOT NULL,
	"level" text DEFAULT 'essencial' NOT NULL,
	"level_120" text DEFAULT 'assincrono',
	"minutes" integer DEFAULT 0 NOT NULL,
	"origin" text,
	"status" text DEFAULT 'published' NOT NULL,
	"published_version_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"phone" text,
	"linkedin_url" text,
	"onboarding_completed_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "question_versions" (
	"id" text PRIMARY KEY NOT NULL,
	"question_id" text NOT NULL,
	"version_no" integer NOT NULL,
	"label" text,
	"prompt" text NOT NULL,
	"options" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"answer_key" jsonb,
	"feedback" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" text PRIMARY KEY NOT NULL,
	"edition_id" text NOT NULL,
	"page_id" text,
	"slug" text NOT NULL,
	"kind" text NOT NULL,
	"current_version_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"key" text PRIMARY KEY NOT NULL,
	"window_start" timestamp with time zone NOT NULL,
	"count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rubric_versions" (
	"id" text PRIMARY KEY NOT NULL,
	"rubric_id" text NOT NULL,
	"version_no" integer NOT NULL,
	"definition" jsonb NOT NULL,
	"change_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rubrics" (
	"id" text PRIMARY KEY NOT NULL,
	"edition_id" text NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"current_version_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session_activities" (
	"id" text PRIMARY KEY NOT NULL,
	"live_session_id" text NOT NULL,
	"question_version_id" text NOT NULL,
	"page_id" text,
	"round" text DEFAULT 'unica' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"time_limit_s" integer,
	"max_attempts" integer DEFAULT 1 NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"opened_at" timestamp with time zone,
	"closes_at" timestamp with time zone,
	"closed_at" timestamp with time zone,
	"released_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone,
	"revoked_reason" text,
	"ip_hash" text,
	"user_agent" text
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "step_progress" (
	"id" text PRIMARY KEY NOT NULL,
	"step_id" text NOT NULL,
	"group_id" text,
	"user_id" text,
	"status" text DEFAULT 'pendente' NOT NULL,
	"note" text,
	"updated_by" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "study_responses" (
	"id" text PRIMARY KEY NOT NULL,
	"class_id" text NOT NULL,
	"user_id" text NOT NULL,
	"question_version_id" text NOT NULL,
	"answer" jsonb NOT NULL,
	"is_correct" boolean,
	"attempt_no" integer DEFAULT 1 NOT NULL,
	"client_request_id" text NOT NULL,
	"server_time" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "submission_files" (
	"submission_id" text NOT NULL,
	"file_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "submission_files_submission_id_file_id_pk" PRIMARY KEY("submission_id","file_id")
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" text PRIMARY KEY NOT NULL,
	"assignment_id" text NOT NULL,
	"class_id" text NOT NULL,
	"group_id" text,
	"submitter_user_id" text NOT NULL,
	"version_no" integer DEFAULT 1 NOT NULL,
	"status" text DEFAULT 'rascunho' NOT NULL,
	"is_current" boolean DEFAULT true NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"submitted_at" timestamp with time zone,
	"late" boolean DEFAULT false NOT NULL,
	"effective_due_at" timestamp with time zone,
	"members_snapshot" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"links" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"note" text,
	"receipt_hash" text,
	"returned_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "units" (
	"id" text PRIMARY KEY NOT NULL,
	"edition_id" text NOT NULL,
	"kind" text DEFAULT 'aula' NOT NULL,
	"number" integer NOT NULL,
	"title" text NOT NULL,
	"deliverable" text,
	"planned_minutes" integer DEFAULT 180 NOT NULL,
	"break_minutes" integer DEFAULT 15 NOT NULL,
	"position" integer NOT NULL,
	"status" text DEFAULT 'published' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"password_hash" text,
	"must_change_password" boolean DEFAULT false NOT NULL,
	"is_staff" boolean DEFAULT false NOT NULL,
	"email_verified_at" timestamp with time zone,
	"disabled_at" timestamp with time zone,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "assignment_extensions" ADD CONSTRAINT "assignment_extensions_assignment_id_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."assignments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignment_extensions" ADD CONSTRAINT "assignment_extensions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignment_extensions" ADD CONSTRAINT "assignment_extensions_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignment_extensions" ADD CONSTRAINT "assignment_extensions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignment_steps" ADD CONSTRAINT "assignment_steps_assignment_id_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."assignments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_rubric_version_id_rubric_versions_id_fk" FOREIGN KEY ("rubric_version_id") REFERENCES "public"."rubric_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_activity_id_session_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."session_activities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_checkins" ADD CONSTRAINT "attendance_checkins_window_id_attendance_windows_id_fk" FOREIGN KEY ("window_id") REFERENCES "public"."attendance_windows"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_checkins" ADD CONSTRAINT "attendance_checkins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_history" ADD CONSTRAINT "attendance_history_record_id_attendance_records_id_fk" FOREIGN KEY ("record_id") REFERENCES "public"."attendance_records"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_history" ADD CONSTRAINT "attendance_history_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_meeting_id_meetings_id_fk" FOREIGN KEY ("meeting_id") REFERENCES "public"."meetings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_decided_by_users_id_fk" FOREIGN KEY ("decided_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_windows" ADD CONSTRAINT "attendance_windows_meeting_id_meetings_id_fk" FOREIGN KEY ("meeting_id") REFERENCES "public"."meetings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_windows" ADD CONSTRAINT "attendance_windows_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blind_submissions" ADD CONSTRAINT "blind_submissions_blind_test_id_blind_tests_id_fk" FOREIGN KEY ("blind_test_id") REFERENCES "public"."blind_tests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blind_submissions" ADD CONSTRAINT "blind_submissions_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blind_submissions" ADD CONSTRAINT "blind_submissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blind_submissions" ADD CONSTRAINT "blind_submissions_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blind_submissions" ADD CONSTRAINT "blind_submissions_freeze_id_model_freezes_id_fk" FOREIGN KEY ("freeze_id") REFERENCES "public"."model_freezes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blind_tests" ADD CONSTRAINT "blind_tests_assignment_id_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blind_tests" ADD CONSTRAINT "blind_tests_dataset_id_datasets_id_fk" FOREIGN KEY ("dataset_id") REFERENCES "public"."datasets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blind_tests" ADD CONSTRAINT "blind_tests_oot_file_id_files_id_fk" FOREIGN KEY ("oot_file_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blind_tests" ADD CONSTRAINT "blind_tests_labels_file_id_files_id_fk" FOREIGN KEY ("labels_file_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_edition_id_editions_id_fk" FOREIGN KEY ("edition_id") REFERENCES "public"."editions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_imports" ADD CONSTRAINT "content_imports_edition_id_editions_id_fk" FOREIGN KEY ("edition_id") REFERENCES "public"."editions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "datasets" ADD CONSTRAINT "datasets_edition_id_editions_id_fk" FOREIGN KEY ("edition_id") REFERENCES "public"."editions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "datasets" ADD CONSTRAINT "datasets_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "datasets" ADD CONSTRAINT "datasets_dictionary_file_id_files_id_fk" FOREIGN KEY ("dictionary_file_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "editions" ADD CONSTRAINT "editions_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_messages" ADD CONSTRAINT "email_messages_to_user_id_users_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_messages" ADD CONSTRAINT "email_messages_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_messages" ADD CONSTRAINT "email_messages_invite_id_invites_id_fk" FOREIGN KEY ("invite_id") REFERENCES "public"."invites"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_messages" ADD CONSTRAINT "email_messages_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_messages" ADD CONSTRAINT "email_messages_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gmail_connections" ADD CONSTRAINT "gmail_connections_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grade_history" ADD CONSTRAINT "grade_history_grade_id_grades_id_fk" FOREIGN KEY ("grade_id") REFERENCES "public"."grades"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grade_history" ADD CONSTRAINT "grade_history_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grades" ADD CONSTRAINT "grades_assignment_id_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grades" ADD CONSTRAINT "grades_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grades" ADD CONSTRAINT "grades_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grades" ADD CONSTRAINT "grades_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grades" ADD CONSTRAINT "grades_rubric_version_id_rubric_versions_id_fk" FOREIGN KEY ("rubric_version_id") REFERENCES "public"."rubric_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grades" ADD CONSTRAINT "grades_feedback_file_id_files_id_fk" FOREIGN KEY ("feedback_file_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grades" ADD CONSTRAINT "grades_graded_by_users_id_fk" FOREIGN KEY ("graded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grades" ADD CONSTRAINT "grades_published_by_users_id_fk" FOREIGN KEY ("published_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "groups" ADD CONSTRAINT "groups_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "groups" ADD CONSTRAINT "groups_dataset_id_datasets_id_fk" FOREIGN KEY ("dataset_id") REFERENCES "public"."datasets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invites" ADD CONSTRAINT "invites_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invites" ADD CONSTRAINT "invites_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_sessions" ADD CONSTRAINT "live_sessions_meeting_id_meetings_id_fk" FOREIGN KEY ("meeting_id") REFERENCES "public"."meetings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_sessions" ADD CONSTRAINT "live_sessions_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_sessions" ADD CONSTRAINT "live_sessions_current_page_id_pages_id_fk" FOREIGN KEY ("current_page_id") REFERENCES "public"."pages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_sessions" ADD CONSTRAINT "live_sessions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "materials" ADD CONSTRAINT "materials_edition_id_editions_id_fk" FOREIGN KEY ("edition_id") REFERENCES "public"."editions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "materials" ADD CONSTRAINT "materials_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "materials" ADD CONSTRAINT "materials_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_freezes" ADD CONSTRAINT "model_freezes_assignment_id_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_freezes" ADD CONSTRAINT "model_freezes_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_freezes" ADD CONSTRAINT "model_freezes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_freezes" ADD CONSTRAINT "model_freezes_manifest_file_id_files_id_fk" FOREIGN KEY ("manifest_file_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_freezes" ADD CONSTRAINT "model_freezes_frozen_by_users_id_fk" FOREIGN KEY ("frozen_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notices" ADD CONSTRAINT "notices_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notices" ADD CONSTRAINT "notices_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_versions" ADD CONSTRAINT "page_versions_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_versions" ADD CONSTRAINT "page_versions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pages" ADD CONSTRAINT "pages_chapter_id_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_versions" ADD CONSTRAINT "question_versions_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_edition_id_editions_id_fk" FOREIGN KEY ("edition_id") REFERENCES "public"."editions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rubric_versions" ADD CONSTRAINT "rubric_versions_rubric_id_rubrics_id_fk" FOREIGN KEY ("rubric_id") REFERENCES "public"."rubrics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rubrics" ADD CONSTRAINT "rubrics_edition_id_editions_id_fk" FOREIGN KEY ("edition_id") REFERENCES "public"."editions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_activities" ADD CONSTRAINT "session_activities_live_session_id_live_sessions_id_fk" FOREIGN KEY ("live_session_id") REFERENCES "public"."live_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_activities" ADD CONSTRAINT "session_activities_question_version_id_question_versions_id_fk" FOREIGN KEY ("question_version_id") REFERENCES "public"."question_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_activities" ADD CONSTRAINT "session_activities_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "step_progress" ADD CONSTRAINT "step_progress_step_id_assignment_steps_id_fk" FOREIGN KEY ("step_id") REFERENCES "public"."assignment_steps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "step_progress" ADD CONSTRAINT "step_progress_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "step_progress" ADD CONSTRAINT "step_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "step_progress" ADD CONSTRAINT "step_progress_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_responses" ADD CONSTRAINT "study_responses_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_responses" ADD CONSTRAINT "study_responses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_responses" ADD CONSTRAINT "study_responses_question_version_id_question_versions_id_fk" FOREIGN KEY ("question_version_id") REFERENCES "public"."question_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission_files" ADD CONSTRAINT "submission_files_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission_files" ADD CONSTRAINT "submission_files_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_assignment_id_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_submitter_user_id_users_id_fk" FOREIGN KEY ("submitter_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "units" ADD CONSTRAINT "units_edition_id_editions_id_fk" FOREIGN KEY ("edition_id") REFERENCES "public"."editions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "assignment_steps_uq" ON "assignment_steps" USING btree ("assignment_id","number");--> statement-breakpoint
CREATE UNIQUE INDEX "assignments_class_slug_uq" ON "assignments" USING btree ("class_id","slug");--> statement-breakpoint
CREATE UNIQUE INDEX "attempts_user_attempt_uq" ON "attempts" USING btree ("activity_id","user_id","attempt_no");--> statement-breakpoint
CREATE UNIQUE INDEX "attempts_req_uq" ON "attempts" USING btree ("user_id","client_request_id");--> statement-breakpoint
CREATE INDEX "checkins_window_user_idx" ON "attendance_checkins" USING btree ("window_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "attendance_records_uq" ON "attendance_records" USING btree ("meeting_id","user_id");--> statement-breakpoint
CREATE INDEX "audit_entity_idx" ON "audit_log" USING btree ("entity","entity_id");--> statement-breakpoint
CREATE INDEX "audit_class_idx" ON "audit_log" USING btree ("class_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "chapters_unit_slug_uq" ON "chapters" USING btree ("unit_id","slug");--> statement-breakpoint
CREATE UNIQUE INDEX "classes_edition_code_uq" ON "classes" USING btree ("edition_id","code");--> statement-breakpoint
CREATE UNIQUE INDEX "courses_slug_uq" ON "courses" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "datasets_edition_code_uq" ON "datasets" USING btree ("edition_id","code");--> statement-breakpoint
CREATE UNIQUE INDEX "editions_course_label_uq" ON "editions" USING btree ("course_id","label");--> statement-breakpoint
CREATE UNIQUE INDEX "email_dedupe_uq" ON "email_messages" USING btree ("dedupe_key");--> statement-breakpoint
CREATE INDEX "email_status_idx" ON "email_messages" USING btree ("status","next_attempt_at");--> statement-breakpoint
CREATE UNIQUE INDEX "enrollments_class_email_uq" ON "enrollments" USING btree ("class_id","email");--> statement-breakpoint
CREATE INDEX "enrollments_user_idx" ON "enrollments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "files_class_idx" ON "files" USING btree ("class_id");--> statement-breakpoint
CREATE UNIQUE INDEX "grades_assignment_user_uq" ON "grades" USING btree ("assignment_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "groups_class_name_uq" ON "groups" USING btree ("class_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "invites_hash_uq" ON "invites" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "invites_enrollment_idx" ON "invites" USING btree ("enrollment_id");--> statement-breakpoint
CREATE INDEX "meetings_class_idx" ON "meetings" USING btree ("class_id");--> statement-breakpoint
CREATE INDEX "notifications_user_idx" ON "notifications" USING btree ("user_id","read_at");--> statement-breakpoint
CREATE UNIQUE INDEX "page_versions_uq" ON "page_versions" USING btree ("page_id","version_no");--> statement-breakpoint
CREATE UNIQUE INDEX "pages_chapter_slug_uq" ON "pages" USING btree ("chapter_id","slug");--> statement-breakpoint
CREATE UNIQUE INDEX "prt_hash_uq" ON "password_reset_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "question_versions_uq" ON "question_versions" USING btree ("question_id","version_no");--> statement-breakpoint
CREATE UNIQUE INDEX "questions_edition_slug_uq" ON "questions" USING btree ("edition_id","slug");--> statement-breakpoint
CREATE UNIQUE INDEX "rubric_versions_uq" ON "rubric_versions" USING btree ("rubric_id","version_no");--> statement-breakpoint
CREATE UNIQUE INDEX "rubrics_edition_slug_uq" ON "rubrics" USING btree ("edition_id","slug");--> statement-breakpoint
CREATE INDEX "session_activities_session_idx" ON "session_activities" USING btree ("live_session_id");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "study_responses_req_uq" ON "study_responses" USING btree ("user_id","client_request_id");--> statement-breakpoint
CREATE INDEX "study_responses_user_q_idx" ON "study_responses" USING btree ("user_id","question_version_id");--> statement-breakpoint
CREATE INDEX "submissions_assignment_idx" ON "submissions" USING btree ("assignment_id");--> statement-breakpoint
CREATE INDEX "submissions_group_idx" ON "submissions" USING btree ("group_id");--> statement-breakpoint
CREATE UNIQUE INDEX "units_edition_number_uq" ON "units" USING btree ("edition_id","kind","number");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_uq" ON "users" USING btree ("email");