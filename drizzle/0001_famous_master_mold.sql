ALTER TABLE "court_assignments" DROP CONSTRAINT "court_assignments_court_id_courts_id_fk";
--> statement-breakpoint
ALTER TABLE "court_assignments" ADD CONSTRAINT "court_assignments_court_id_courts_id_fk" FOREIGN KEY ("court_id") REFERENCES "public"."courts"("id") ON DELETE no action ON UPDATE no action;