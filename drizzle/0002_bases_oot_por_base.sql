ALTER TABLE "datasets" ADD COLUMN "oot_file_id" text;--> statement-breakpoint
ALTER TABLE "datasets" ADD COLUMN "labels_file_id" text;--> statement-breakpoint
ALTER TABLE "datasets" ADD COLUMN "teacher_file_id" text;--> statement-breakpoint
ALTER TABLE "datasets" ADD CONSTRAINT "datasets_oot_file_id_files_id_fk" FOREIGN KEY ("oot_file_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "datasets" ADD CONSTRAINT "datasets_labels_file_id_files_id_fk" FOREIGN KEY ("labels_file_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "datasets" ADD CONSTRAINT "datasets_teacher_file_id_files_id_fk" FOREIGN KEY ("teacher_file_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;