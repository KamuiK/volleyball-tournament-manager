import { readFile, readdir } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import { neon, neonConfig } from "@neondatabase/serverless";
import { describe, expect, it } from "vitest";

const migrationPath = resolve(
  process.cwd(),
  "drizzle/0000_confused_marvel_boy.sql"
);
const databaseUrl = process.env.DATABASE_URL;
const confirmedDevelopmentDatabase = process.env.WP04_CONFIRMED_DEVELOPMENT_DATABASE === "1";

describe("initial database migration", () => {
  it("defines the tournament model and required integrity indexes", async () => {
    const migration = await readFile(migrationPath, "utf8");

    for (const table of [
      "tournaments",
      "teams",
      "groups",
      "team_groups",
      "courts",
      "matches",
      "match_sets",
      "court_assignments",
      "lot_decisions",
      "placements"
    ]) {
      expect(migration).toContain(`CREATE TABLE "${table}"`);
    }

    expect(migration).toContain("CREATE TYPE \"public\".\"tournament_stage\"");
    expect(migration).toContain("CREATE TYPE \"public\".\"match_stage\"");
    expect(migration).toContain("CREATE TYPE \"public\".\"match_result_type\"");
    expect(migration).toContain("matches_distinct_teams_check");
    for (const index of [
      "teams_tournament_name_ci_idx",
      "courts_tournament_name_ci_idx",
      "groups_tournament_label_idx",
      "match_sets_match_set_idx",
      "court_assignments_match_idx",
      "lot_decisions_group_rank_idx",
      "placements_tournament_team_idx"
    ]) {
      expect(migration).toContain(index);
    }

    expect(migration).toContain("teams_tournament_name_ci_idx");
    expect(migration).toContain("lower(\"name\")");
    expect(migration).toContain("tournaments_one_current_idx");
    expect(migration).toContain('"is_current" = true');
    expect(migration).toContain("court_assignments_active_court_idx");
    expect(migration).toContain('"released_at" is null');
    expect(migration).toContain("court_assignments_match_idx");
  });

  it("declares cascading ownership and retains released assignment rows", async () => {
    const migration = await readFile(migrationPath, "utf8");
    const drizzlePath = resolve(process.cwd(), "drizzle");
    const followupFile = (await readdir(drizzlePath)).find((file) =>
      /^0001_.*\.sql$/.test(file)
    );
    const deferredFile = (await readdir(drizzlePath)).find((file) =>
      /^0002_.*\.sql$/.test(file)
    );
    expect(followupFile).toBeDefined();
    expect(deferredFile).toBeDefined();
    const followup = await readFile(resolve(drizzlePath, followupFile!), "utf8");
    const deferredMigration = await readFile(
      resolve(drizzlePath, deferredFile!),
      "utf8"
    );

    expect(migration).toContain(
      'FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE cascade'
    );
    expect(migration).toContain(
      'FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade'
    );
    expect(migration).toContain('"court_id") REFERENCES "public"."courts"("id") ON DELETE restrict');
    expect(followup).toContain('ON DELETE no action');
    expect(deferredMigration).toContain("DEFERRABLE INITIALLY DEFERRED");
  });
});

describe.skipIf(!databaseUrl || !confirmedDevelopmentDatabase)("Neon development migration", () => {
  it("has applied the initial migration and key database constraints", async () => {
    neonConfig.disableWarningInBrowsers = true;
    const sql = neon(databaseUrl!);
    const [tables, indexes, checks, foreignKeys, courtForeignKeys, migrationRecords] =
      await Promise.all([
      sql`select table_name from information_schema.tables where table_schema = 'public' and table_name = any(array['tournaments', 'teams', 'groups', 'team_groups', 'courts', 'matches', 'match_sets', 'court_assignments', 'lot_decisions', 'placements'])`,
      sql`select indexname, indexdef from pg_indexes where schemaname = 'public' and indexname = any(array['teams_tournament_name_ci_idx', 'tournaments_one_current_idx', 'court_assignments_active_court_idx', 'court_assignments_match_idx'])`,
      sql`select conname, pg_get_constraintdef(oid) as definition from pg_constraint where conname = 'matches_distinct_teams_check'`,
      sql`select count(*)::int as count from pg_constraint where contype = 'f' and connamespace = 'public'::regnamespace and conrelid::regclass::text = any(array['court_assignments', 'courts', 'groups', 'lot_decisions', 'match_sets', 'matches', 'placements', 'team_groups', 'teams'])`,
      sql`select count(*)::int as count from pg_constraint where conname = 'court_assignments_court_id_courts_id_fk' and confdeltype = 'a' and condeferrable and condeferred`,
      sql`select count(*)::int as count from drizzle.__drizzle_migrations`
      ]);

    expect(tables).toHaveLength(10);
    expect(indexes).toHaveLength(4);
    const indexDefinitions = indexes.map((index) => index.indexdef);
    expect(indexDefinitions.some((definition) => /lower\(/i.test(definition))).toBe(true);
    expect(indexDefinitions.some((definition) => /where .*is_current = true/i.test(definition))).toBe(
      true
    );
    expect(
      indexDefinitions.some((definition) => /where .*released_at is null/i.test(definition))
    ).toBe(true);
    expect(checks).toHaveLength(1);
    expect(Number(foreignKeys[0]?.count)).toBe(18);
    expect(Number(courtForeignKeys[0]?.count)).toBe(1);
    expect(Number(migrationRecords[0]?.count)).toBe(3);
  });

  it("blocks deleting an assigned court but cascades tournament deletion", async () => {
    const sql = neon(databaseUrl!);
    const tournamentId = randomUUID();
    const groupId = randomUUID();
    const courtId = randomUUID();
    const secondCourtId = randomUUID();
    const matchId = randomUUID();
    const secondMatchId = randomUUID();

    try {
      await sql`insert into tournaments (id, name) values (${tournamentId}, 'WP-02 cascade test')`;
      await sql`insert into groups (id, tournament_id, label) values (${groupId}, ${tournamentId}, 'cascade-test')`;
      await sql`insert into courts (id, tournament_id, name) values (${courtId}, ${tournamentId}, 'cascade-test')`;
      await sql`insert into courts (id, tournament_id, name) values (${secondCourtId}, ${tournamentId}, 'cascade-test-2')`;
      await sql`insert into matches (id, tournament_id, stage, sequence, group_id) values (${matchId}, ${tournamentId}, 'groups', 1, ${groupId})`;
      await sql`insert into matches (id, tournament_id, stage, sequence, group_id) values (${secondMatchId}, ${tournamentId}, 'groups', 2, ${groupId})`;
      await sql`insert into court_assignments (match_id, court_id) values (${matchId}, ${courtId})`;
      await sql`insert into court_assignments (match_id, court_id) values (${secondMatchId}, ${secondCourtId})`;

      await expect(sql`delete from courts where id = ${courtId}`).rejects.toThrow(
        /foreign key constraint/i
      );

      await sql`delete from matches where id = ${secondMatchId}`;
      const matchAssignmentRows = await sql`select id from court_assignments where match_id = ${secondMatchId}`;
      expect(matchAssignmentRows).toHaveLength(0);

      await sql`delete from tournaments where id = ${tournamentId}`;

      const [tournamentRows, groupRows, courtRows, matchRows, assignmentRows] =
        await Promise.all([
          sql`select id from tournaments where id = ${tournamentId}`,
          sql`select id from groups where id = ${groupId}`,
          sql`select id from courts where id = any(array[${courtId}, ${secondCourtId}]::uuid[])`,
          sql`select id from matches where id = any(array[${matchId}, ${secondMatchId}]::uuid[])`,
          sql`select id from court_assignments where match_id = any(array[${matchId}, ${secondMatchId}]::uuid[])`
        ]);

      expect(tournamentRows).toHaveLength(0);
      expect(groupRows).toHaveLength(0);
      expect(courtRows).toHaveLength(0);
      expect(matchRows).toHaveLength(0);
      expect(assignmentRows).toHaveLength(0);
    } finally {
      await sql`delete from court_assignments where match_id = ${matchId}`;
      await sql`delete from court_assignments where match_id = ${secondMatchId}`;
      await sql`delete from matches where id = ${matchId}`;
      await sql`delete from matches where id = ${secondMatchId}`;
      await sql`delete from courts where id = ${courtId}`;
      await sql`delete from courts where id = ${secondCourtId}`;
      await sql`delete from groups where id = ${groupId}`;
      await sql`delete from tournaments where id = ${tournamentId}`;
    }
  });
});
