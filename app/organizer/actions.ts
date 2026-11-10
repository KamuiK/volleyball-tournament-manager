"use server";

import { requireOrganizer } from "@/src/auth/authorization";
import { assignTeam, createCurrentTournament, deleteCourt, deleteTeam, saveCourtName, saveTeamName, startGroupStage, type ActionResult } from "@/src/tournament/setup";

async function save(action: () => Promise<ActionResult>): Promise<ActionResult> {
  try { return await action(); }
  catch { return { ok: false, message: "The change was not saved. Check the current data and try again." }; }
}

export async function createTournamentAction(): Promise<ActionResult> {
  await requireOrganizer();
  return save(createCurrentTournament);
}

export async function createTeamAction(name: string): Promise<ActionResult> { await requireOrganizer(); return save(() => saveTeamName(name)); }
export async function renameTeamAction(teamId: string, name: string): Promise<ActionResult> { await requireOrganizer(); return save(() => saveTeamName(name, teamId)); }
export async function deleteTeamAction(teamId: string): Promise<ActionResult> { await requireOrganizer(); return save(() => deleteTeam(teamId)); }
export async function assignTeamAction(teamId: string, group: string): Promise<ActionResult> { await requireOrganizer(); return save(() => assignTeam(teamId, group)); }
export async function createCourtAction(name: string): Promise<ActionResult> { await requireOrganizer(); return save(() => saveCourtName(name)); }
export async function renameCourtAction(courtId: string, name: string): Promise<ActionResult> { await requireOrganizer(); return save(() => saveCourtName(name, courtId)); }
export async function deleteCourtAction(courtId: string): Promise<ActionResult> { await requireOrganizer(); return save(() => deleteCourt(courtId)); }
export async function startGroupStageAction(confirmed: boolean): Promise<ActionResult> {
  await requireOrganizer();
  if (confirmed !== true) return { ok: false, message: "Confirm that you want to start the group stage." };
  return save(() => startGroupStage());
}
