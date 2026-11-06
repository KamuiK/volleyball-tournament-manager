import {
  boolean,
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
};

export const tournamentStage = pgEnum("tournament_stage", [
  "setup",
  "groups",
  "quarterfinals",
  "semifinals",
  "final_stage",
  "finalized"
]);

export const matchStage = pgEnum("match_stage", [
  "groups",
  "quarterfinals",
  "semifinals",
  "final",
  "third_place"
]);

export const matchResultType = pgEnum("match_result_type", [
  "unplayed",
  "normal",
  "forfeit"
]);

export const tournaments = pgTable(
  "tournaments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 160 }).notNull(),
    currentStage: tournamentStage("current_stage").notNull().default("setup"),
    thirdPlaceEnabled: boolean("third_place_enabled").notNull().default(false),
    isCurrent: boolean("is_current").notNull().default(false),
    ...timestamps
  },
  (table) => [
    uniqueIndex("tournaments_one_current_idx")
      .on(table.isCurrent)
      .where(sql`${table.isCurrent} = true`)
  ]
);

export const teams = pgTable(
  "teams",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tournamentId: uuid("tournament_id")
      .notNull()
      .references(() => tournaments.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 160 }).notNull(),
    ...timestamps
  },
  (table) => [
    uniqueIndex("teams_tournament_name_ci_idx").on(
      table.tournamentId,
      sql`lower(${table.name})`
    ),
    index("teams_tournament_idx").on(table.tournamentId)
  ]
);

export const groups = pgTable(
  "groups",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tournamentId: uuid("tournament_id")
      .notNull()
      .references(() => tournaments.id, { onDelete: "cascade" }),
    label: varchar("label", { length: 80 }).notNull(),
    ...timestamps
  },
  (table) => [
    uniqueIndex("groups_tournament_label_idx").on(
      table.tournamentId,
      table.label
    ),
    index("groups_tournament_idx").on(table.tournamentId)
  ]
);

export const teamGroups = pgTable("team_groups", {
  teamId: uuid("team_id")
    .primaryKey()
    .references(() => teams.id, { onDelete: "cascade" }),
  groupId: uuid("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" })
});

export const courts = pgTable(
  "courts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tournamentId: uuid("tournament_id")
      .notNull()
      .references(() => tournaments.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 160 }).notNull(),
    ...timestamps
  },
  (table) => [
    uniqueIndex("courts_tournament_name_ci_idx").on(
      table.tournamentId,
      sql`lower(${table.name})`
    ),
    index("courts_tournament_idx").on(table.tournamentId)
  ]
);

export const matches = pgTable(
  "matches",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tournamentId: uuid("tournament_id")
      .notNull()
      .references(() => tournaments.id, { onDelete: "cascade" }),
    stage: matchStage("stage").notNull(),
    sequence: integer("sequence").notNull(),
    groupId: uuid("group_id").references(() => groups.id, {
      onDelete: "set null"
    }),
    roundNumber: integer("round_number"),
    homeTeamId: uuid("home_team_id").references(() => teams.id, {
      onDelete: "set null"
    }),
    awayTeamId: uuid("away_team_id").references(() => teams.id, {
      onDelete: "set null"
    }),
    isThirdPlace: boolean("is_third_place").notNull().default(false),
    resultType: matchResultType("result_type").notNull().default("unplayed"),
    winnerTeamId: uuid("winner_team_id").references(() => teams.id, {
      onDelete: "set null"
    }),
    lockedAt: timestamp("locked_at", { withTimezone: true }),
    ...timestamps
  },
  (table) => [
    check(
      "matches_distinct_teams_check",
      sql`${table.homeTeamId} is null or ${table.awayTeamId} is null or ${table.homeTeamId} <> ${table.awayTeamId}`
    ),
    index("matches_tournament_idx").on(table.tournamentId),
    index("matches_tournament_stage_idx").on(
      table.tournamentId,
      table.stage
    ),
    index("matches_group_idx").on(table.groupId),
    index("matches_round_idx").on(table.tournamentId, table.roundNumber),
    index("matches_status_idx").on(table.tournamentId, table.resultType)
  ]
);

export const matchSets = pgTable(
  "match_sets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    matchId: uuid("match_id")
      .notNull()
      .references(() => matches.id, { onDelete: "cascade" }),
    setNumber: integer("set_number").notNull(),
    homePoints: integer("home_points").notNull(),
    awayPoints: integer("away_points").notNull()
  },
  (table) => [
    uniqueIndex("match_sets_match_set_idx").on(table.matchId, table.setNumber)
  ]
);

export const courtAssignments = pgTable(
  "court_assignments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    matchId: uuid("match_id")
      .notNull()
      .references(() => matches.id, { onDelete: "cascade" }),
    // This FK is deferred in SQL migrations so tournament cascades can remove
    // matches and their assignment history within the same statement.
    courtId: uuid("court_id")
      .notNull()
      .references(() => courts.id, { onDelete: "no action" }),
    assignedAt: timestamp("assigned_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    releasedAt: timestamp("released_at", { withTimezone: true })
  },
  (table) => [
    uniqueIndex("court_assignments_match_idx").on(table.matchId),
    uniqueIndex("court_assignments_active_court_idx")
      .on(table.courtId)
      .where(sql`${table.releasedAt} is null`)
  ]
);

export const lotDecisions = pgTable(
  "lot_decisions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tournamentId: uuid("tournament_id")
      .notNull()
      .references(() => tournaments.id, { onDelete: "cascade" }),
    groupId: uuid("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    rankPosition: integer("rank_position").notNull(),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    lotRank: integer("lot_rank").notNull(),
    ...timestamps
  },
  (table) => [
    uniqueIndex("lot_decisions_group_rank_idx").on(
      table.tournamentId,
      table.groupId,
      table.rankPosition
    ),
    index("lot_decisions_team_idx").on(table.teamId)
  ]
);

export const placements = pgTable(
  "placements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tournamentId: uuid("tournament_id")
      .notNull()
      .references(() => tournaments.id, { onDelete: "cascade" }),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    placement: integer("placement").notNull(),
    ...timestamps
  },
  (table) => [
    uniqueIndex("placements_tournament_team_idx").on(
      table.tournamentId,
      table.teamId
    ),
    index("placements_tournament_placement_idx").on(
      table.tournamentId,
      table.placement
    )
  ]
);

export type Tournament = typeof tournaments.$inferSelect;
export type NewTournament = typeof tournaments.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type Match = typeof matches.$inferSelect;
export type NewMatch = typeof matches.$inferInsert;
