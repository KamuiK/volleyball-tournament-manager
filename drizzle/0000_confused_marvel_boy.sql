CREATE TYPE "public"."match_result_type" AS ENUM('unplayed', 'normal', 'forfeit');--> statement-breakpoint
CREATE TYPE "public"."match_stage" AS ENUM('groups', 'quarterfinals', 'semifinals', 'final', 'third_place');--> statement-breakpoint
CREATE TYPE "public"."tournament_stage" AS ENUM('setup', 'groups', 'quarterfinals', 'semifinals', 'final_stage', 'finalized');--> statement-breakpoint
CREATE TABLE "court_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"match_id" uuid NOT NULL,
	"court_id" uuid NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"released_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "courts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tournament_id" uuid NOT NULL,
	"name" varchar(160) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tournament_id" uuid NOT NULL,
	"label" varchar(80) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lot_decisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tournament_id" uuid NOT NULL,
	"group_id" uuid NOT NULL,
	"rank_position" integer NOT NULL,
	"team_id" uuid NOT NULL,
	"lot_rank" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "match_sets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"match_id" uuid NOT NULL,
	"set_number" integer NOT NULL,
	"home_points" integer NOT NULL,
	"away_points" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "matches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tournament_id" uuid NOT NULL,
	"stage" "match_stage" NOT NULL,
	"sequence" integer NOT NULL,
	"group_id" uuid,
	"round_number" integer,
	"home_team_id" uuid,
	"away_team_id" uuid,
	"is_third_place" boolean DEFAULT false NOT NULL,
	"result_type" "match_result_type" DEFAULT 'unplayed' NOT NULL,
	"winner_team_id" uuid,
	"locked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "matches_distinct_teams_check" CHECK ("matches"."home_team_id" is null or "matches"."away_team_id" is null or "matches"."home_team_id" <> "matches"."away_team_id")
);
--> statement-breakpoint
CREATE TABLE "placements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tournament_id" uuid NOT NULL,
	"team_id" uuid NOT NULL,
	"placement" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_groups" (
	"team_id" uuid PRIMARY KEY NOT NULL,
	"group_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tournament_id" uuid NOT NULL,
	"name" varchar(160) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tournaments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(160) NOT NULL,
	"current_stage" "tournament_stage" DEFAULT 'setup' NOT NULL,
	"third_place_enabled" boolean DEFAULT false NOT NULL,
	"is_current" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "court_assignments" ADD CONSTRAINT "court_assignments_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "court_assignments" ADD CONSTRAINT "court_assignments_court_id_courts_id_fk" FOREIGN KEY ("court_id") REFERENCES "public"."courts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courts" ADD CONSTRAINT "courts_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "groups" ADD CONSTRAINT "groups_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lot_decisions" ADD CONSTRAINT "lot_decisions_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lot_decisions" ADD CONSTRAINT "lot_decisions_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lot_decisions" ADD CONSTRAINT "lot_decisions_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_sets" ADD CONSTRAINT "match_sets_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_home_team_id_teams_id_fk" FOREIGN KEY ("home_team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_away_team_id_teams_id_fk" FOREIGN KEY ("away_team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_winner_team_id_teams_id_fk" FOREIGN KEY ("winner_team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "placements" ADD CONSTRAINT "placements_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "placements" ADD CONSTRAINT "placements_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_groups" ADD CONSTRAINT "team_groups_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_groups" ADD CONSTRAINT "team_groups_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "court_assignments_match_idx" ON "court_assignments" USING btree ("match_id");--> statement-breakpoint
CREATE UNIQUE INDEX "court_assignments_active_court_idx" ON "court_assignments" USING btree ("court_id") WHERE "court_assignments"."released_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "courts_tournament_name_ci_idx" ON "courts" USING btree ("tournament_id",lower("name"));--> statement-breakpoint
CREATE INDEX "courts_tournament_idx" ON "courts" USING btree ("tournament_id");--> statement-breakpoint
CREATE UNIQUE INDEX "groups_tournament_label_idx" ON "groups" USING btree ("tournament_id","label");--> statement-breakpoint
CREATE INDEX "groups_tournament_idx" ON "groups" USING btree ("tournament_id");--> statement-breakpoint
CREATE UNIQUE INDEX "lot_decisions_group_rank_idx" ON "lot_decisions" USING btree ("tournament_id","group_id","rank_position");--> statement-breakpoint
CREATE INDEX "lot_decisions_team_idx" ON "lot_decisions" USING btree ("team_id");--> statement-breakpoint
CREATE UNIQUE INDEX "match_sets_match_set_idx" ON "match_sets" USING btree ("match_id","set_number");--> statement-breakpoint
CREATE INDEX "matches_tournament_idx" ON "matches" USING btree ("tournament_id");--> statement-breakpoint
CREATE INDEX "matches_tournament_stage_idx" ON "matches" USING btree ("tournament_id","stage");--> statement-breakpoint
CREATE INDEX "matches_group_idx" ON "matches" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "matches_round_idx" ON "matches" USING btree ("tournament_id","round_number");--> statement-breakpoint
CREATE INDEX "matches_status_idx" ON "matches" USING btree ("tournament_id","result_type");--> statement-breakpoint
CREATE UNIQUE INDEX "placements_tournament_team_idx" ON "placements" USING btree ("tournament_id","team_id");--> statement-breakpoint
CREATE INDEX "placements_tournament_placement_idx" ON "placements" USING btree ("tournament_id","placement");--> statement-breakpoint
CREATE UNIQUE INDEX "teams_tournament_name_ci_idx" ON "teams" USING btree ("tournament_id",lower("name"));--> statement-breakpoint
CREATE INDEX "teams_tournament_idx" ON "teams" USING btree ("tournament_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tournaments_one_current_idx" ON "tournaments" USING btree ("is_current") WHERE "tournaments"."is_current" = true;