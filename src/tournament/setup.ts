import "server-only";
import { and, eq, isNull, sql } from "drizzle-orm";
import { db, type Database } from "@/src/db";
import { courtAssignments, courts, groups, teamGroups, teams, tournaments } from "@/src/db/schema";
import { normalizeName, validateStartReadiness } from "@/src/tournament/setup-validation";

type Transaction = Parameters<Parameters<Database["transaction"]>[0]>[0];
type Tournament = typeof tournaments.$inferSelect;
export type ActionResult = { ok: true; message?: string } | { ok: false; message: string; field?: string };
const failure = (message: string, field?: string): ActionResult => ({ ok: false, message, field });
const stageLockMessage = "The group stage has started, so tournament setup can no longer be edited. Use a reset to return to preparation.";

async function lockCurrentTournament(tx: Transaction) {
  const [tournament] = await tx.select().from(tournaments).where(eq(tournaments.isCurrent, true)).limit(1).for("update");
  return tournament;
}

async function insertFixedGroups(tx: Transaction, tournamentId: string) {
  await tx.insert(groups).values([
    { tournamentId, label: "Group A" },
    { tournamentId, label: "Group B" }
  ]).onConflictDoNothing();
}

/** Explicit, atomic and race-safe creation of the one current tournament. */
export async function createCurrentTournament(): Promise<ActionResult> {
  return db.transaction(async (tx) => {
    let tournament = await lockCurrentTournament(tx);
    if (!tournament) {
      const [created] = await tx.insert(tournaments)
        .values({ name: "Current Tournament", isCurrent: true })
        .onConflictDoNothing({
          target: tournaments.isCurrent,
          where: sql`${tournaments.isCurrent} = true`
        })
        .returning();
      tournament = created ?? await lockCurrentTournament(tx);
    }
    if (!tournament) return failure("The current tournament could not be created. Try again.");
    await insertFixedGroups(tx, tournament.id);
    return { ok: true, message: "Current Tournament is ready for setup." };
  });
}

export async function loadSetup() {
  const [tournament] = await db.select().from(tournaments).where(eq(tournaments.isCurrent, true)).limit(1);
  if (!tournament) return null;
  const [groupRows, teamRows, courtRows] = await Promise.all([
    db.select().from(groups).where(eq(groups.tournamentId, tournament.id)),
    db.select({ id: teams.id, name: teams.name, groupId: teamGroups.groupId, groupLabel: groups.label })
      .from(teams).leftJoin(teamGroups, eq(teamGroups.teamId, teams.id)).leftJoin(groups, eq(teamGroups.groupId, groups.id))
      .where(eq(teams.tournamentId, tournament.id)),
    db.select().from(courts).where(eq(courts.tournamentId, tournament.id))
  ]);
  return { tournament, groups: groupRows, teams: teamRows, courts: courtRows };
}

async function withLockedTournament(
  operation: (tx: Transaction, tournament: Tournament) => Promise<ActionResult>,
  requireSetup = false
): Promise<ActionResult> {
  return db.transaction(async (tx) => {
    const tournament = await lockCurrentTournament(tx);
    if (!tournament) return failure("Current tournament is unavailable. Reload and try again.");
    if (requireSetup && tournament.currentStage !== "setup") return failure(stageLockMessage);
    return operation(tx, tournament);
  });
}

async function uniqueName(
  tx: Transaction,
  table: "team" | "court",
  tournamentId: string,
  name: string,
  exceptId?: string
) {
  const rows = table === "team"
    ? await tx.select({ name: teams.name, id: teams.id }).from(teams).where(eq(teams.tournamentId, tournamentId))
    : await tx.select({ name: courts.name, id: courts.id }).from(courts).where(eq(courts.tournamentId, tournamentId));
  return rows.some((row) => row.id !== exceptId && row.name.toLocaleLowerCase() === name.toLocaleLowerCase());
}

export async function saveTeamName(nameValue: unknown, teamId?: string): Promise<ActionResult> {
  const name = normalizeName(nameValue);
  if (typeof name !== "string") return failure(name.message, "name");
  return withLockedTournament(async (tx, tournament) => {
    if (await uniqueName(tx, "team", tournament.id, name, teamId)) return failure("A team with this name already exists.", "name");
    if (teamId) {
      const [row] = await tx.update(teams).set({ name, updatedAt: new Date() })
        .where(and(eq(teams.id, teamId), eq(teams.tournamentId, tournament.id))).returning();
      return row ? { ok: true, message: "Team name saved." } : failure("That team could not be found. Refresh and try again.");
    }
    const [row] = await tx.insert(teams).values({ tournamentId: tournament.id, name }).returning();
    return row ? { ok: true, message: "Team added." } : failure("The team could not be saved. Try again.");
  }, true);
}

export async function deleteTeam(teamId: string): Promise<ActionResult> {
  return withLockedTournament(async (tx, tournament) => {
    const [membership] = await tx.select({ label: groups.label }).from(teamGroups)
      .innerJoin(groups, eq(groups.id, teamGroups.groupId)).where(eq(teamGroups.teamId, teamId)).limit(1);
    if (membership) return failure(`This team cannot be deleted because it is assigned to ${membership.label}. Remove the team from its group first.`);
    await tx.delete(teams).where(and(eq(teams.id, teamId), eq(teams.tournamentId, tournament.id)));
    return { ok: true, message: "Team deleted." };
  }, true);
}

export async function assignTeam(teamId: string, label: string): Promise<ActionResult> {
  return withLockedTournament(async (tx, tournament) => {
    if (label === "") {
      await tx.delete(teamGroups).where(eq(teamGroups.teamId, teamId));
      return { ok: true, message: "Team removed from its group." };
    }
    if (label !== "Group A" && label !== "Group B") return failure("Choose Group A or Group B.");
    const [group] = await tx.select().from(groups)
      .where(and(eq(groups.tournamentId, tournament.id), eq(groups.label, label))).limit(1);
    if (!group) return failure("The selected group is unavailable. Reload and try again.");
    const [team] = await tx.select().from(teams)
      .where(and(eq(teams.id, teamId), eq(teams.tournamentId, tournament.id))).limit(1);
    if (!team) return failure("That team could not be found. Refresh and try again.");
    await tx.insert(teamGroups).values({ teamId, groupId: group.id })
      .onConflictDoUpdate({ target: teamGroups.teamId, set: { groupId: group.id } });
    return { ok: true, message: `Team assigned to ${label}.` };
  }, true);
}

export async function saveCourtName(nameValue: unknown, courtId?: string): Promise<ActionResult> {
  const name = normalizeName(nameValue);
  if (typeof name !== "string") return failure(name.message, "courtName");
  return withLockedTournament(async (tx, tournament) => {
    if (await uniqueName(tx, "court", tournament.id, name, courtId)) return failure("A court with this name already exists.", "courtName");
    if (courtId) {
      await tx.select({ id: courts.id }).from(courts)
        .where(and(eq(courts.id, courtId), eq(courts.tournamentId, tournament.id))).limit(1).for("update");
      const [active] = await tx.select({ id: courtAssignments.id }).from(courtAssignments)
        .where(and(eq(courtAssignments.courtId, courtId), isNull(courtAssignments.releasedAt))).limit(1);
      if (active) return failure("This court name cannot be changed while it is assigned to an active match. Remove or complete the assignment first.");
      const [row] = await tx.update(courts).set({ name, updatedAt: new Date() })
        .where(and(eq(courts.id, courtId), eq(courts.tournamentId, tournament.id))).returning();
      return row ? { ok: true, message: "Court name saved." } : failure("That court could not be found. Refresh and try again.");
    }
    const [row] = await tx.insert(courts).values({ tournamentId: tournament.id, name }).returning();
    return row ? { ok: true, message: "Court added." } : failure("The court could not be saved. Try again.");
  });
}

export async function deleteCourt(courtId: string): Promise<ActionResult> {
  return withLockedTournament(async (tx, tournament) => {
    await tx.select({ id: courts.id }).from(courts)
      .where(and(eq(courts.id, courtId), eq(courts.tournamentId, tournament.id))).limit(1).for("update");
    const [active] = await tx.select({ id: courtAssignments.id }).from(courtAssignments)
      .where(and(eq(courtAssignments.courtId, courtId), isNull(courtAssignments.releasedAt))).limit(1);
    if (active) return failure("This court cannot be deleted because it is assigned to an active match. Remove or complete the assignment first.");
    const [history] = await tx.select({ id: courtAssignments.id }).from(courtAssignments).where(eq(courtAssignments.courtId, courtId)).limit(1);
    if (history) return failure("This court cannot be deleted because completed match records keep its court history. The court name must remain available.");
    await tx.delete(courts).where(and(eq(courts.id, courtId), eq(courts.tournamentId, tournament.id)));
    return { ok: true, message: "Court deleted." };
  });
}

export async function startGroupStage(): Promise<ActionResult> {
  return withLockedTournament(async (tx, tournament) => {
    const [counts] = await tx.select({
      teamCount: sql<number>`count(distinct ${teams.id})::int`,
      assignedTeamCount: sql<number>`count(distinct ${teamGroups.teamId})::int`,
      groupACount: sql<number>`count(*) filter (where ${groups.label} = 'Group A')::int`,
      groupBCount: sql<number>`count(*) filter (where ${groups.label} = 'Group B')::int`
    }).from(teams).leftJoin(teamGroups, eq(teamGroups.teamId, teams.id))
      .leftJoin(groups, eq(groups.id, teamGroups.groupId)).where(eq(teams.tournamentId, tournament.id));
    const [courtCount] = await tx.select({ count: sql<number>`count(*)::int` }).from(courts).where(eq(courts.tournamentId, tournament.id));
    const issue = validateStartReadiness({
      stage: tournament.currentStage,
      teamCount: counts?.teamCount ?? 0,
      assignedTeamCount: counts?.assignedTeamCount ?? 0,
      groupACount: counts?.groupACount ?? 0,
      groupBCount: counts?.groupBCount ?? 0,
      courtCount: courtCount?.count ?? 0
    });
    if (issue) return failure(issue.message);
    const [updated] = await tx.update(tournaments).set({ currentStage: "groups", updatedAt: new Date() })
      .where(and(eq(tournaments.id, tournament.id), eq(tournaments.currentStage, "setup"))).returning({ id: tournaments.id });
    return updated
      ? { ok: true, message: "Group stage started. Team and group setup is now locked." }
      : failure(stageLockMessage);
  });
}
