import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const actions = vi.hoisted(() => ({
  assignTeamAction: vi.fn(),
  createCourtAction: vi.fn(),
  createTeamAction: vi.fn(),
  deleteCourtAction: vi.fn(),
  deleteTeamAction: vi.fn(),
  renameCourtAction: vi.fn(),
  renameTeamAction: vi.fn(),
  startGroupStageAction: vi.fn()
}));
const refresh = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));
vi.mock("@/app/organizer/actions", () => actions);

import { SetupForm } from "@/app/organizer/setup-form";

function makeSetup(teamOneGroup = "Group A", teamTwoGroup = "Group B", courtCount = 1) {
  return {
    tournament: { id: "tournament-1", name: "Current Tournament", currentStage: "setup" },
    groups: [{ id: "group-a", label: "Group A" }, { id: "group-b", label: "Group B" }],
    teams: [
      { id: "team-1", name: "Alpha", groupId: teamOneGroup === "Group A" ? "group-a" : "group-b", groupLabel: teamOneGroup },
      { id: "team-2", name: "Beta", groupId: teamTwoGroup === "Group A" ? "group-a" : "group-b", groupLabel: teamTwoGroup }
    ],
    courts: Array.from({ length: courtCount }, (_, index) => ({ id: `court-${index + 1}`, name: `Court ${index + 1}`, tournamentId: "tournament-1" }))
  } as unknown as Parameters<typeof SetupForm>[0]["setup"];
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

describe("organizer setup local state", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    actions.assignTeamAction.mockResolvedValue({ ok: true, message: "Team assigned." });
    actions.createCourtAction.mockResolvedValue({ ok: true });
    actions.createTeamAction.mockResolvedValue({ ok: true });
    actions.deleteCourtAction.mockResolvedValue({ ok: true });
    actions.deleteTeamAction.mockResolvedValue({ ok: true });
    actions.renameCourtAction.mockResolvedValue({ ok: true });
    actions.renameTeamAction.mockResolvedValue({ ok: true });
    actions.startGroupStageAction.mockResolvedValue({ ok: true });
    vi.stubGlobal("confirm", vi.fn(() => true));
  });

  it("shows an optimistic group choice, keeps it through stale props, then reconciles updated props", async () => {
    const assignment = deferred<{ ok: boolean; message: string }>();
    actions.assignTeamAction.mockReturnValueOnce(assignment.promise);
    const staleSetup = makeSetup("Group A");
    const view = render(<SetupForm setup={staleSetup} />);
    const group = screen.getByLabelText("Group for Alpha") as HTMLSelectElement;

    fireEvent.change(group, { target: { value: "Group B" } });
    expect(group.value).toBe("Group B");
    expect(screen.getByText("Saving…")).toBeInTheDocument();
    expect(screen.getByLabelText("Group for Beta")).toBeEnabled();
    expect(screen.getByRole("button", { name: "Start group stage" })).toBeDisabled();

    await act(async () => assignment.resolve({ ok: true, message: "Team assigned." }));
    expect(group.value).toBe("Group B");

    view.rerender(<SetupForm setup={makeSetup("Group A")} />);
    expect(screen.getByLabelText("Group for Alpha")).toHaveValue("Group B");
    view.rerender(<SetupForm setup={makeSetup("Group B")} />);
    await waitFor(() => expect(screen.getByLabelText("Group for Alpha")).toHaveValue("Group B"));
  });

  it("keeps a second optimistic group value above the previous confirmation, including Unassigned through retry", async () => {
    const first = deferred<{ ok: boolean; message: string }>();
    const second = deferred<{ ok: boolean; message: string }>();
    const retry = deferred<{ ok: boolean; message: string }>();
    actions.assignTeamAction.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise).mockReturnValueOnce(retry.promise);
    const view = render(<SetupForm setup={makeSetup("Group A")} />);
    const group = screen.getByLabelText("Group for Alpha") as HTMLSelectElement;

    fireEvent.change(group, { target: { value: "Group B" } });
    await act(async () => first.resolve({ ok: true, message: "Assigned." }));
    view.rerender(<SetupForm setup={makeSetup("Group A")} />);
    expect(group).toHaveValue("Group B");

    fireEvent.change(group, { target: { value: "Group A" } });
    expect(group).toHaveValue("Group A");
    expect(screen.getByText("Saving…")).toBeInTheDocument();
    expect(actions.assignTeamAction).toHaveBeenLastCalledWith("team-1", "Group A");
    await act(async () => second.resolve({ ok: false, message: "Assignment failed." }));
    expect(group).toHaveValue("Group B");

    fireEvent.change(group, { target: { value: "" } });
    expect(group).toHaveValue("");
    expect(actions.assignTeamAction).toHaveBeenLastCalledWith("team-1", "");
    await act(async () => retry.resolve({ ok: false, message: "Unassignment failed." }));
    expect(group).toHaveValue("Group B");

    fireEvent.change(group, { target: { value: "" } });
    expect(group).toHaveValue("");
    await act(async () => actions.assignTeamAction.mock.results[3]?.value);
    expect(group).toHaveValue("");
    view.rerender(<SetupForm setup={makeSetup("Group A")} />);
    expect(group).toHaveValue("");
  });

  it("rolls a failed assignment back to the last confirmed membership with local feedback", async () => {
    actions.assignTeamAction.mockResolvedValueOnce({ ok: false, message: "Group assignment was rejected." });
    render(<SetupForm setup={makeSetup("Group A")} />);
    const group = screen.getByLabelText("Group for Alpha");
    fireEvent.change(group, { target: { value: "Group B" } });

    await waitFor(() => expect(group).toHaveValue("Group A"));
    const row = group.closest("li");
    expect(within(row as HTMLElement).getByRole("alert")).toHaveTextContent("Group assignment was rejected.");
    expect(group).toHaveAttribute("aria-invalid", "true");
  });

  it("rolls back the group selector when the assignment promise rejects", async () => {
    actions.assignTeamAction.mockRejectedValueOnce(new Error("network failure"));
    render(<SetupForm setup={makeSetup("Group A")} />);
    const group = screen.getByLabelText("Group for Alpha");
    fireEvent.change(group, { target: { value: "Group B" } });

    await waitFor(() => expect(group).toHaveValue("Group A"));
    expect(within(group.closest("li") as HTMLElement).getByRole("alert")).toHaveTextContent("The change was not saved.");
  });

  it("retains drafts after failed and rejected saves and associates field errors locally", async () => {
    actions.renameTeamAction.mockResolvedValueOnce({ ok: false, message: "A team with this name already exists.", field: "name" });
    render(<SetupForm setup={makeSetup()} />);
    const teamInput = screen.getAllByLabelText("Team name", { selector: "input" })[0];
    fireEvent.change(teamInput, { target: { value: "Edited Alpha" } });
    fireEvent.submit(teamInput.closest("form") as HTMLFormElement);

    await waitFor(() => expect(teamInput).toHaveAttribute("aria-invalid", "true"));
    expect(screen.getAllByLabelText("Team name", { selector: "input" })[1]).toHaveAttribute("aria-invalid", "false");
    expect(teamInput).toHaveValue("Edited Alpha");
    const errorId = teamInput.getAttribute("aria-describedby");
    expect(errorId).toBeTruthy();
    expect(document.getElementById(errorId as string)).toHaveTextContent("A team with this name already exists.");

    actions.renameTeamAction.mockRejectedValueOnce(new Error("network failure"));
    fireEvent.submit(teamInput.closest("form") as HTMLFormElement);
    await waitFor(() => expect(within(teamInput.closest("li") as HTMLElement).getByRole("alert")).toHaveTextContent("Your entered values are still available"));
    expect(teamInput).toHaveValue("Edited Alpha");
  });

  it("disables only the saving name input, focuses it on failure, and does not steal focus after the user moves", async () => {
    const save = deferred<{ ok: boolean; message: string; field: string }>();
    actions.renameTeamAction.mockReturnValueOnce(save.promise);
    render(<SetupForm setup={makeSetup()} />);
    const alpha = screen.getAllByLabelText("Team name", { selector: "input" })[0] as HTMLInputElement;
    const beta = screen.getAllByLabelText("Team name", { selector: "input" })[1] as HTMLInputElement;
    fireEvent.change(alpha, { target: { value: "Edited Alpha" } });
    alpha.focus();
    fireEvent.submit(alpha.closest("form") as HTMLFormElement);
    expect(alpha).toBeDisabled();
    expect(beta).toBeEnabled();
    expect(screen.getByLabelText("Group for Beta")).toBeEnabled();
    beta.focus();

    await act(async () => save.resolve({ ok: false, message: "Name rejected.", field: "name" }));
    expect(beta).toHaveFocus();
    expect(alpha).toHaveValue("Edited Alpha");
    expect(alpha).toHaveAttribute("aria-invalid", "true");
  });

  it("focuses the failed name input but leaves focus unchanged after a successful save", async () => {
    actions.renameTeamAction.mockResolvedValueOnce({ ok: false, message: "Name rejected.", field: "name" });
    render(<SetupForm setup={makeSetup()} />);
    const alpha = screen.getAllByLabelText("Team name", { selector: "input" })[0] as HTMLInputElement;
    fireEvent.change(alpha, { target: { value: "Edited Alpha" } });
    fireEvent.submit(alpha.closest("form") as HTMLFormElement);
    await waitFor(() => expect(alpha).toHaveFocus());

    const beta = screen.getAllByLabelText("Team name", { selector: "input" })[1] as HTMLInputElement;
    const group = screen.getByLabelText("Group for Beta");
    fireEvent.change(beta, { target: { value: "Edited Beta" } });
    group.focus();
    fireEvent.submit(beta.closest("form") as HTMLFormElement);
    await waitFor(() => expect(beta).toHaveValue("Edited Beta"));
    expect(group).toHaveFocus();
  });

  it("preserves a successful name through stale props and reconciles updated props", async () => {
    const view = render(<SetupForm setup={makeSetup()} />);
    const alpha = screen.getAllByLabelText("Team name", { selector: "input" })[0];
    fireEvent.change(alpha, { target: { value: "Renamed Alpha" } });
    fireEvent.submit(alpha.closest("form") as HTMLFormElement);
    await waitFor(() => expect(alpha).toHaveValue("Renamed Alpha"));

    view.rerender(<SetupForm setup={makeSetup()} />);
    expect(screen.getAllByLabelText("Team name", { selector: "input" })[0]).toHaveValue("Renamed Alpha");
    const updated = makeSetup();
    updated.teams[0].name = "Renamed Alpha";
    view.rerender(<SetupForm setup={updated} />);
    await waitFor(() => expect(screen.getAllByLabelText("Team name", { selector: "input" })[0]).toHaveValue("Renamed Alpha"));
  });

  it("keeps unrelated controls enabled during a pending court operation", async () => {
    const courtSave = deferred<{ ok: boolean; message: string }>();
    actions.renameCourtAction.mockReturnValueOnce(courtSave.promise);
    render(<SetupForm setup={makeSetup("Group A", "Group B", 2)} />);
    const courtInput = screen.getAllByLabelText("Court name", { selector: "input" })[0] as HTMLInputElement;
    fireEvent.change(courtInput, { target: { value: "Main Court" } });
    fireEvent.submit(courtInput.closest("form") as HTMLFormElement);

    expect(courtInput).toBeDisabled();
    expect(screen.getAllByLabelText("Court name", { selector: "input" })[1]).toBeEnabled();
    expect(screen.getByRole("button", { name: "Delete Court 2" })).toBeEnabled();
    expect(screen.getAllByLabelText("Team name", { selector: "input" })[0]).toBeEnabled();
    expect(screen.getByLabelText("Group for Alpha")).toBeEnabled();
    await act(async () => courtSave.resolve({ ok: true, message: "Saved." }));
  });

  it("keeps unrelated entities enabled and guards rapid same-entity duplicate submissions", async () => {
    const assignment = deferred<{ ok: boolean; message: string }>();
    actions.assignTeamAction.mockReturnValue(assignment.promise);
    render(<SetupForm setup={makeSetup()} />);
    const group = screen.getByLabelText("Group for Alpha");

    act(() => {
      fireEvent.change(group, { target: { value: "Group B" } });
      fireEvent.change(group, { target: { value: "Group A" } });
    });

    expect(actions.assignTeamAction).toHaveBeenCalledTimes(1);
    expect(group).toHaveValue("Group B");
    expect(screen.getByRole("button", { name: "Delete Beta" })).toBeEnabled();
    expect(screen.getByLabelText("Group for Beta")).toBeEnabled();
    expect(screen.getByRole("button", { name: "Start group stage" })).toBeDisabled();
    await act(async () => assignment.resolve({ ok: true, message: "Saved." }));
  });

  it("prevents writes while Start is pending and prevents Start while a write is pending", async () => {
    const teamSave = deferred<{ ok: boolean; message: string }>();
    actions.renameTeamAction.mockReturnValueOnce(teamSave.promise);
    const view = render(<SetupForm setup={makeSetup()} />);
    const input = screen.getAllByLabelText("Team name", { selector: "input" })[0];
    fireEvent.change(input, { target: { value: "Alpha edit" } });
    act(() => {
      fireEvent.submit(input.closest("form") as HTMLFormElement);
      fireEvent.click(screen.getByRole("button", { name: "Start group stage" }));
    });
    expect(actions.startGroupStageAction).not.toHaveBeenCalled();
    const start = screen.getByRole("button", { name: "Start group stage" });
    expect(start).toBeDisabled();
    expect(screen.getByText(/Wait for setup changes to finish saving/)).toBeInTheDocument();
    await act(async () => teamSave.resolve({ ok: true, message: "Saved." }));

    const startAction = deferred<{ ok: boolean; message: string }>();
    actions.startGroupStageAction.mockReturnValueOnce(startAction.promise);
    act(() => {
      fireEvent.click(start);
      fireEvent.submit(screen.getByLabelText("New court name").closest("form") as HTMLFormElement);
    });
    expect(actions.startGroupStageAction).toHaveBeenCalledTimes(1);
    expect(actions.createCourtAction).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Saving…" })).toBeDisabled();

    const addCourt = screen.getByRole("button", { name: "Add court" });
    expect(addCourt).toBeDisabled();
    fireEvent.click(addCourt);
    expect(actions.createCourtAction).not.toHaveBeenCalled();

    await act(async () => startAction.resolve({ ok: true, message: "Started." }));
    view.rerender(<SetupForm setup={{ ...makeSetup(), tournament: { id: "tournament-1", name: "Current Tournament", currentStage: "groups" } } as Parameters<typeof SetupForm>[0]["setup"]} />);
    expect(screen.getByRole("button", { name: "Add court" })).toBeEnabled();
    fireEvent.change(screen.getByLabelText("New court name"), { target: { value: "Court 2" } });
    fireEvent.submit(screen.getByLabelText("New court name").closest("form") as HTMLFormElement);
    await waitFor(() => expect(actions.createCourtAction).toHaveBeenCalledWith("Court 2"));
  });

  it("preserves an unrelated unsaved draft when refreshed props update another entity", async () => {
    const view = render(<SetupForm setup={makeSetup()} />);
    const alpha = screen.getAllByLabelText("Team name", { selector: "input" })[0];
    fireEvent.change(alpha, { target: { value: "Unsaved Alpha" } });
    const beta = screen.getAllByLabelText("Team name", { selector: "input" })[1];
    fireEvent.change(beta, { target: { value: "Beta saved" } });
    fireEvent.submit(beta.closest("form") as HTMLFormElement);

    await waitFor(() => expect(actions.renameTeamAction).toHaveBeenCalledWith("team-2", "Beta saved"));
    view.rerender(<SetupForm setup={makeSetup("Group A", "Group B")} />);
    expect(screen.getAllByLabelText("Team name", { selector: "input" })[0]).toHaveValue("Unsaved Alpha");
    expect(screen.getAllByLabelText("Team name", { selector: "input" })[1]).toHaveValue("Beta saved");
  });

  it("releases the write block and shows local feedback when Start fails", async () => {
    actions.startGroupStageAction.mockResolvedValueOnce({ ok: false, message: "Readiness changed. Review setup." });
    render(<SetupForm setup={makeSetup()} />);
    fireEvent.click(screen.getByRole("button", { name: "Start group stage" }));

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Readiness changed. Review setup."));
    expect(screen.getByLabelText("New team name")).toBeEnabled();
    expect(screen.getByRole("button", { name: "Add team" })).toBeEnabled();
    fireEvent.change(screen.getByLabelText("New team name"), { target: { value: "Can edit again" } });
    fireEvent.submit(screen.getByLabelText("New team name").closest("form") as HTMLFormElement);
    await waitFor(() => expect(actions.createTeamAction).toHaveBeenCalledWith("Can edit again"));
  });
});
