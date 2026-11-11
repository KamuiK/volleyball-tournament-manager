"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type Dispatch, type FormEvent, type SetStateAction } from "react";
import {
  assignTeamAction,
  createCourtAction,
  createTeamAction,
  deleteCourtAction,
  deleteTeamAction,
  renameCourtAction,
  renameTeamAction,
  startGroupStageAction
} from "@/app/organizer/actions";
import type { loadSetup } from "@/src/tournament/setup";

type Setup = NonNullable<Awaited<ReturnType<typeof loadSetup>>>;
type ActionResult = { ok: true; message?: string } | { ok: false; message: string; field?: string };
type Feedback = { state: "saving" | "success" | "error"; message: string; field?: string };
type NameFocusRequest = { key: string; entity: string; input: HTMLInputElement; form: HTMLFormElement; activeAtSubmit: Element | null };

function feedbackId(key: string) {
  return `feedback-${key.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}

function LocalFeedback({ feedback, id }: { feedback?: Feedback; id: string }) {
  if (!feedback) return null;
  return <p id={id} className={feedback.state === "error" ? "setup-error" : "setup-feedback"} role={feedback.state === "error" ? "alert" : "status"}>{feedback.message}</p>;
}

export function SetupForm({ setup }: { setup: Setup }) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<Record<string, Feedback>>({});
  const [pendingKeys, setPendingKeys] = useState<Set<string>>(new Set());
  const [busyEntities, setBusyEntities] = useState<Set<string>>(new Set());
  const [teamDrafts, setTeamDrafts] = useState<Record<string, string>>({});
  const [courtDrafts, setCourtDrafts] = useState<Record<string, string>>({});
  const [newTeamDraft, setNewTeamDraft] = useState("");
  const [newCourtDraft, setNewCourtDraft] = useState("");
  const [confirmedTeamNames, setConfirmedTeamNames] = useState<Record<string, string>>({});
  const [confirmedCourtNames, setConfirmedCourtNames] = useState<Record<string, string>>({});
  const [optimisticGroups, setOptimisticGroups] = useState<Record<string, string>>({});
  const [confirmedGroups, setConfirmedGroups] = useState<Record<string, string>>({});
  const [startPending, setStartPending] = useState(false);
  const [startSubmitted, setStartSubmitted] = useState(false);

  // Refs provide synchronous guards so rapid duplicate events cannot get ahead
  // of React's next render and its disabled controls.
  const pendingKeysRef = useRef(new Set<string>());
  const busyEntitiesRef = useRef(new Set<string>());
  const startPendingRef = useRef(false);
  const startSubmittedRef = useRef(false);
  const nameFocusRequestRef = useRef<NameFocusRequest | null>(null);

  const setupLocked = setup.tournament.currentStage !== "setup" || startSubmitted;
  const writesBlocked = startPending || (startSubmitted && setup.tournament.currentStage === "setup");
  const groupA = setup.teams.filter((team) => team.groupLabel === "Group A").length;
  const groupB = setup.teams.filter((team) => team.groupLabel === "Group B").length;
  const hasPendingWrites = pendingKeys.size > 0;

  // Keep successful values displayed across a refresh that returns stale props.
  // Drop each confirmation only when the server props contain that value.
  useEffect(() => {
    const teamNames = new Map(setup.teams.map((team) => [team.id, team.name]));
    setConfirmedTeamNames((current) => Object.fromEntries(Object.entries(current).filter(([id, name]) => teamNames.get(id) !== name)));
    const courtNames = new Map(setup.courts.map((court) => [court.id, court.name]));
    setConfirmedCourtNames((current) => Object.fromEntries(Object.entries(current).filter(([id, name]) => courtNames.get(id) !== name)));
    const groupLabels = new Map(setup.teams.map((team) => [team.id, team.groupLabel ?? ""]));
    setConfirmedGroups((current) => Object.fromEntries(Object.entries(current).filter(([id, label]) => groupLabels.get(id) !== label)));
  }, [setup.teams, setup.courts]);

  // Focus a failed name field only while focus is still in its form (or the
  // disabled input's blur target). If the organizer moved elsewhere, leave it.
  useEffect(() => {
    const request = nameFocusRequestRef.current;
    if (!request || busyEntities.has(request.entity) || feedback[request.key]?.state !== "error") return;
    nameFocusRequestRef.current = null;
    const activeElement = document.activeElement;
    if (activeElement === document.body || activeElement === request.activeAtSubmit || request.form.contains(activeElement)) {
      request.input.focus();
    }
  }, [busyEntities, feedback]);

  function runWrite(
    key: string,
    entity: string,
    action: () => Promise<ActionResult>,
    onSuccess?: (message?: string) => void,
    onFailure?: () => void,
    field?: string
  ) {
    const isTeamWrite = entity === "create-team" || entity.startsWith("team-");
    const transitionStillPending = startSubmittedRef.current && (setup.tournament.currentStage === "setup" || isTeamWrite);
    if (startPendingRef.current || transitionStillPending || pendingKeysRef.current.has(key) || busyEntitiesRef.current.has(entity)) return false;
    pendingKeysRef.current.add(key);
    busyEntitiesRef.current.add(entity);
    setPendingKeys(new Set(pendingKeysRef.current));
    setBusyEntities(new Set(busyEntitiesRef.current));
    setFeedback((current) => ({ ...current, [key]: { state: "saving", message: "Saving…" } }));

    void (async () => {
      let result: ActionResult;
      try {
        result = await action();
      } catch {
        result = { ok: false, message: "The change was not saved. Your entered values are still available; try again." };
      }
      if (result.ok) {
        onSuccess?.(result.message);
        setFeedback((current) => ({ ...current, [key]: { state: "success", message: result.message ?? "Saved." } }));
        router.refresh();
      } else {
        onFailure?.();
        setFeedback((current) => ({ ...current, [key]: { state: "error", message: result.message, field: result.field ?? field } }));
      }
      pendingKeysRef.current.delete(key);
      busyEntitiesRef.current.delete(entity);
      setPendingKeys(new Set(pendingKeysRef.current));
      setBusyEntities(new Set(busyEntitiesRef.current));
    })();
    return true;
  }

  function runStart() {
    if (pendingKeysRef.current.size > 0 || startPendingRef.current || startSubmittedRef.current) return;
    if (!window.confirm("Start the group stage? Team names and group assignments will be locked.")) return;
    startPendingRef.current = true;
    setStartPending(true);
    setFeedback((current) => ({ ...current, start: { state: "saving", message: "Starting group stage…" } }));
    void (async () => {
      let result: ActionResult;
      try {
        result = await startGroupStageAction(true);
      } catch {
        result = { ok: false, message: "The group stage was not started. Try again." };
      }
      if (result.ok) {
        startSubmittedRef.current = true;
        setStartSubmitted(true);
        setFeedback((current) => ({ ...current, start: { state: "success", message: result.message ?? "Group stage started." } }));
        router.refresh();
      } else {
        setFeedback((current) => ({ ...current, start: { state: "error", message: result.message } }));
      }
      startPendingRef.current = false;
      setStartPending(false);
    })();
  }

  function submitName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    return String(new FormData(event.currentTarget).get("name") ?? "");
  }

  function focusFailedName(key: string, entity: string, form: HTMLFormElement) {
    const input = form.querySelector<HTMLInputElement>('input[name="name"]');
    const activeAtSubmit = document.activeElement;
    return () => {
      if (input) nameFocusRequestRef.current = { key, entity, input, form, activeAtSubmit };
    };
  }

  function updateDraft(setter: Dispatch<SetStateAction<Record<string, string>>>, id: string, value: string, saved: string) {
    setter((current) => {
      if (value === saved) {
        const next = { ...current };
        delete next[id];
        return next;
      }
      return { ...current, [id]: value };
    });
  }

  return <main className="setup-main">
    <header className="setup-header"><p className="auth-eyebrow">Organizer</p><h1 id="setup-title">{setup.tournament.name}</h1><p>Current stage: <strong>{setup.tournament.currentStage === "setup" ? "Preparation" : "Group stage"}</strong></p></header>
    <section className="setup-summary" aria-labelledby="summary-heading"><h2 id="summary-heading">Setup summary</h2><p>{setup.teams.length} teams · Group A: {groupA} · Group B: {groupB} · {setup.courts.length} courts</p><p>{setupLocked ? "Setup is locked." : "Ready to start when there are 10–12 assigned teams, 5–6 in each group, and at least one court."}</p></section>
    {setup.tournament.currentStage !== "setup" && <p className="setup-error" role="note">The group stage has started, so tournament setup can no longer be edited. Use a reset to return to preparation.</p>}
    <section aria-labelledby="teams-heading" className="setup-section"><h2 id="teams-heading">Teams</h2>
      {!setup.teams.length && <p>No teams yet. Add the tournament teams below.</p>}
      <ul className="setup-list">{setup.teams.map((team) => {
        const nameKey = `team-name-${team.id}`;
        const groupKey = `team-group-${team.id}`;
        const deleteKey = `team-delete-${team.id}`;
        const entity = `team-${team.id}`;
        const savedName = confirmedTeamNames[team.id] ?? team.name;
        const groupValue = team.id in optimisticGroups
          ? optimisticGroups[team.id]
          : team.id in confirmedGroups
            ? confirmedGroups[team.id]
            : team.groupLabel ?? "";
        const busy = busyEntities.has(entity) || setupLocked;
        const nameFeedback = feedback[nameKey];
        const groupFeedback = feedback[groupKey];
        const deleteFeedback = feedback[deleteKey];
        const nameError = nameFeedback?.state === "error" && nameFeedback.field === "name";
        return <li key={team.id} className="setup-row">
          <form className="setup-inline-form" onSubmit={(event) => {
            const submittedName = submitName(event);
            const focusFailure = focusFailedName(nameKey, entity, event.currentTarget);
            runWrite(nameKey, entity, () => renameTeamAction(team.id, submittedName), () => {
              setConfirmedTeamNames((current) => ({ ...current, [team.id]: submittedName.trim() }));
              setTeamDrafts((current) => current[team.id] === submittedName ? Object.fromEntries(Object.entries(current).filter(([id]) => id !== team.id)) : current);
            }, focusFailure, "name");
          }}>
            <label htmlFor={`team-${team.id}`}>Team name</label>
            <input id={`team-${team.id}`} name="name" value={teamDrafts[team.id] ?? savedName} onChange={(event) => updateDraft(setTeamDrafts, team.id, event.target.value, savedName)} maxLength={160} disabled={busy || writesBlocked} aria-invalid={Boolean(nameError)} aria-describedby={nameError ? feedbackId(nameKey) : undefined} />
            <button className="auth-button auth-button-secondary" disabled={busy || writesBlocked}>Save name</button>
          </form>
          <label htmlFor={`group-${team.id}`}>Group for {team.name}</label>
          <select id={`group-${team.id}`} value={groupValue} disabled={busy || writesBlocked} aria-invalid={groupFeedback?.state === "error"} aria-describedby={groupFeedback?.state === "error" ? feedbackId(groupKey) : undefined} onChange={(event) => {
            const requested = event.target.value;
            const previous = groupValue;
            const started = runWrite(groupKey, entity, () => assignTeamAction(team.id, requested), () => {
              setOptimisticGroups((current) => { const next = { ...current }; delete next[team.id]; return next; });
              setConfirmedGroups((current) => ({ ...current, [team.id]: requested }));
            }, () => {
              setOptimisticGroups((current) => { const next = { ...current }; delete next[team.id]; return next; });
              setConfirmedGroups((current) => ({ ...current, [team.id]: previous }));
            });
            if (started) setOptimisticGroups((current) => ({ ...current, [team.id]: requested }));
          }}>
            <option value="">Unassigned</option><option value="Group A">Group A</option><option value="Group B">Group B</option>
          </select>
          <LocalFeedback feedback={groupFeedback} id={feedbackId(groupKey)} />
          <button className="setup-danger" type="button" disabled={busy || writesBlocked} onClick={() => runWrite(deleteKey, entity, () => deleteTeamAction(team.id))}>Delete {team.name}</button>
          <LocalFeedback feedback={nameFeedback} id={feedbackId(nameKey)} />
          <LocalFeedback feedback={deleteFeedback} id={feedbackId(deleteKey)} />
        </li>;
      })}</ul>
      <form className="setup-add" onSubmit={(event) => {
        const submittedName = submitName(event);
        const focusFailure = focusFailedName("create-team", "create-team", event.currentTarget);
        runWrite("create-team", "create-team", () => createTeamAction(submittedName), () => {
          setNewTeamDraft((current) => current === submittedName ? "" : current);
        }, focusFailure, "name");
      }}>
        <label htmlFor="new-team">New team name</label>
        <input id="new-team" name="name" value={newTeamDraft} onChange={(event) => setNewTeamDraft(event.target.value)} maxLength={160} disabled={setupLocked || writesBlocked || busyEntities.has("create-team")} aria-invalid={feedback["create-team"]?.state === "error" && feedback["create-team"]?.field === "name"} aria-describedby={feedback["create-team"]?.state === "error" ? feedbackId("create-team") : undefined} />
        <button className="auth-button" disabled={setupLocked || writesBlocked || busyEntities.has("create-team")}>{busyEntities.has("create-team") ? "Saving…" : "Add team"}</button>
        <LocalFeedback feedback={feedback["create-team"]} id={feedbackId("create-team")} />
      </form>
    </section>
    <section aria-labelledby="courts-heading" className="setup-section"><h2 id="courts-heading">Courts</h2>{!setup.courts.length && <p>No courts yet. Add at least one named court before starting.</p>}
      <ul className="setup-list">{setup.courts.map((court) => {
        const nameKey = `court-name-${court.id}`;
        const deleteKey = `court-delete-${court.id}`;
        const entity = `court-${court.id}`;
        const savedName = confirmedCourtNames[court.id] ?? court.name;
        const busy = busyEntities.has(entity);
        const nameFeedback = feedback[nameKey];
        const deleteFeedback = feedback[deleteKey];
        const nameError = nameFeedback?.state === "error" && nameFeedback.field === "courtName";
        return <li key={court.id} className="setup-row">
          <form className="setup-inline-form" onSubmit={(event) => {
            const submittedName = submitName(event);
            const focusFailure = focusFailedName(nameKey, entity, event.currentTarget);
            runWrite(nameKey, entity, () => renameCourtAction(court.id, submittedName), () => {
              setConfirmedCourtNames((current) => ({ ...current, [court.id]: submittedName.trim() }));
              setCourtDrafts((current) => current[court.id] === submittedName ? Object.fromEntries(Object.entries(current).filter(([id]) => id !== court.id)) : current);
            }, focusFailure, "courtName");
          }}>
            <label htmlFor={`court-${court.id}`}>Court name</label>
            <input id={`court-${court.id}`} name="name" value={courtDrafts[court.id] ?? savedName} onChange={(event) => updateDraft(setCourtDrafts, court.id, event.target.value, savedName)} maxLength={160} disabled={busy || writesBlocked} aria-invalid={Boolean(nameError)} aria-describedby={nameError ? feedbackId(nameKey) : undefined} />
            <button className="auth-button auth-button-secondary" disabled={busy || writesBlocked}>Save name</button>
          </form>
          <button className="setup-danger" type="button" disabled={busy || writesBlocked} aria-describedby={deleteFeedback?.state === "error" ? feedbackId(deleteKey) : undefined} onClick={() => { if (window.confirm(`Delete ${court.name}? This removes the court from setup.`)) runWrite(deleteKey, entity, () => deleteCourtAction(court.id)); }}>Delete {court.name}</button>
          <LocalFeedback feedback={nameFeedback} id={feedbackId(nameKey)} />
          <LocalFeedback feedback={deleteFeedback} id={feedbackId(deleteKey)} />
        </li>;
      })}</ul>
      <form className="setup-add" onSubmit={(event) => {
        const submittedName = submitName(event);
        const focusFailure = focusFailedName("create-court", "create-court", event.currentTarget);
        runWrite("create-court", "create-court", () => createCourtAction(submittedName), () => {
          setNewCourtDraft((current) => current === submittedName ? "" : current);
        }, focusFailure, "courtName");
      }}>
        <label htmlFor="new-court">New court name</label>
        <input id="new-court" name="name" value={newCourtDraft} onChange={(event) => setNewCourtDraft(event.target.value)} maxLength={160} disabled={writesBlocked || busyEntities.has("create-court")} aria-invalid={feedback["create-court"]?.state === "error" && feedback["create-court"]?.field === "courtName"} aria-describedby={feedback["create-court"]?.state === "error" ? feedbackId("create-court") : undefined} />
        <button className="auth-button" disabled={writesBlocked || busyEntities.has("create-court")}>{busyEntities.has("create-court") ? "Saving…" : "Add court"}</button>
        <LocalFeedback feedback={feedback["create-court"]} id={feedbackId("create-court")} />
      </form>
    </section>
    {!setupLocked && <section className="setup-start"><h2>Start group stage</h2><p>This changes the tournament stage to Groups and locks team names and group assignments. It does not create matches.</p>{hasPendingWrites && <p id="start-writes-pending" role="status">Wait for setup changes to finish saving before starting the group stage.</p>}<button type="button" className="auth-button" disabled={hasPendingWrites || startPending || startSubmitted} aria-describedby={hasPendingWrites ? "start-writes-pending" : undefined} onClick={runStart}>{startPending ? "Saving…" : "Start group stage"}</button><LocalFeedback feedback={feedback.start} id={feedbackId("start")} /></section>}
  </main>;
}
