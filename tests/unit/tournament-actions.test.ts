import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/src/auth/authorization", () => ({ requireOrganizer: vi.fn() }));
vi.mock("@/src/tournament/setup", () => ({
  createCurrentTournament: vi.fn(), saveTeamName: vi.fn(), deleteTeam: vi.fn(), assignTeam: vi.fn(), saveCourtName: vi.fn(), deleteCourt: vi.fn(), startGroupStage: vi.fn()
}));

import { requireOrganizer } from "@/src/auth/authorization";
import * as setup from "@/src/tournament/setup";
import { assignTeamAction, createCourtAction, createTeamAction, createTournamentAction, deleteCourtAction, deleteTeamAction, renameCourtAction, renameTeamAction, startGroupStageAction } from "@/app/organizer/actions";

describe("protected organizer setup actions", () => {
  beforeEach(() => { vi.clearAllMocks(); });
  it("calls requireOrganizer before each protected operation", async () => {
    vi.mocked(setup.saveTeamName).mockResolvedValue({ ok: true });
    vi.mocked(setup.deleteTeam).mockResolvedValue({ ok: true });
    vi.mocked(setup.assignTeam).mockResolvedValue({ ok: true });
    vi.mocked(setup.saveCourtName).mockResolvedValue({ ok: true });
    vi.mocked(setup.deleteCourt).mockResolvedValue({ ok: true });
    vi.mocked(setup.startGroupStage).mockResolvedValue({ ok: true });
    vi.mocked(setup.createCurrentTournament).mockResolvedValue({ ok: true });
    await createTournamentAction();
    await createTeamAction("A"); await renameTeamAction("t", "A"); await deleteTeamAction("t"); await assignTeamAction("t", "Group A");
    await createCourtAction("Court"); await renameCourtAction("c", "Court"); await deleteCourtAction("c"); await startGroupStageAction(true);
    expect(requireOrganizer).toHaveBeenCalledTimes(9);
    expect(setup.createCurrentTournament).toHaveBeenCalledOnce();
    expect(setup.startGroupStage).toHaveBeenCalledOnce();
  });
  it("does not start without explicit confirmation", async () => {
    const result = await startGroupStageAction(false);
    expect(result).toMatchObject({ ok: false, message: "Confirm that you want to start the group stage." });
    expect(setup.startGroupStage).not.toHaveBeenCalled();
  });

  it("does not create a tournament when organizer authorization redirects", async () => {
    vi.mocked(requireOrganizer).mockRejectedValueOnce(new Error("redirect:/login?error=AccessDenied"));
    await expect(createTournamentAction()).rejects.toThrow("redirect:/login?error=AccessDenied");
    expect(setup.createCurrentTournament).not.toHaveBeenCalled();
  });
});
