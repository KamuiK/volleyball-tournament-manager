"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { assignTeamAction, createCourtAction, createTeamAction, deleteCourtAction, deleteTeamAction, renameCourtAction, renameTeamAction, startGroupStageAction } from "@/app/organizer/actions";
import type { loadSetup } from "@/src/tournament/setup";

type Setup = NonNullable<Awaited<ReturnType<typeof loadSetup>>>;

export function SetupForm({ setup }: { setup: Setup }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [teamName, setTeamName] = useState("");
  const [courtName, setCourtName] = useState("");
  const locked = setup.tournament.currentStage !== "setup";
  const groupA = setup.teams.filter((team) => team.groupLabel === "Group A").length;
  const groupB = setup.teams.filter((team) => team.groupLabel === "Group B").length;

  function run(action: () => Promise<{ ok: boolean; message?: string; field?: string }>, clear?: () => void) {
    startTransition(async () => {
      try {
        const result = await action();
        setFeedback(result.message ?? (result.ok ? "Saved." : "The change could not be saved."));
        setFieldError(!result.ok && "field" in result ? result.field ?? "" : "");
        if (result.ok) { clear?.(); router.refresh(); }
      } catch {
        setFeedback("The change was not saved. Your entered values are still available; try again.");
        setFieldError("");
      }
    });
  }
  function submit(event: FormEvent<HTMLFormElement>, action: (name: string) => Promise<{ ok: boolean; message?: string }>, clear: () => void) {
    event.preventDefault();
    const name = String(new FormData(event.currentTarget).get("name") ?? "");
    run(() => action(name), clear);
  }

  return <main className="setup-main">
    <header className="setup-header"><p className="auth-eyebrow">Organizer</p><h1 id="setup-title">{setup.tournament.name}</h1><p>Current stage: <strong>{setup.tournament.currentStage === "setup" ? "Preparation" : "Group stage"}</strong></p></header>
    <section className="setup-summary" aria-labelledby="summary-heading"><h2 id="summary-heading">Setup summary</h2><p>{setup.teams.length} teams · Group A: {groupA} · Group B: {groupB} · {setup.courts.length} courts</p><p>{locked ? "Setup is locked." : "Ready to start when there are 10–12 assigned teams, 5–6 in each group, and at least one court."}</p></section>
    {feedback && <p id="setup-feedback" className={fieldError ? "setup-error" : "setup-feedback"} role={fieldError ? "alert" : "status"}>{feedback}</p>}
    {locked && <p className="setup-error" role="note">The group stage has started, so tournament setup can no longer be edited. Use a reset to return to preparation.</p>}
    <section aria-labelledby="teams-heading" className="setup-section"><h2 id="teams-heading">Teams</h2>
      {!setup.teams.length && <p>No teams yet. Add the tournament teams below.</p>}
      <ul className="setup-list">{setup.teams.map((team) => <li key={team.id} className="setup-row">
        <form action={(formData) => run(() => renameTeamAction(team.id, String(formData.get("name") ?? "")))} className="setup-inline-form"><label htmlFor={`team-${team.id}`}>Team name</label><input id={`team-${team.id}`} name="name" defaultValue={team.name} maxLength={160} disabled={locked || pending} aria-invalid={fieldError === "name"} aria-describedby={fieldError === "name" ? "setup-feedback" : undefined} /><button className="auth-button auth-button-secondary" disabled={locked || pending}>Save name</button></form>
        <label htmlFor={`group-${team.id}`}>Group for {team.name}</label><select id={`group-${team.id}`} value={team.groupLabel ?? ""} disabled={locked || pending} onChange={(event) => run(() => assignTeamAction(team.id, event.target.value))}><option value="">Unassigned</option><option>Group A</option><option>Group B</option></select>
        <button className="setup-danger" type="button" disabled={locked || pending} onClick={() => run(() => deleteTeamAction(team.id))}>Delete {team.name}</button>
      </li>)}</ul>
      <form className="setup-add" onSubmit={(event) => submit(event, createTeamAction, () => setTeamName(""))}><label htmlFor="new-team">New team name</label><input id="new-team" name="name" value={teamName} onChange={(event) => setTeamName(event.target.value)} maxLength={160} disabled={locked || pending} aria-invalid={fieldError === "name"} aria-describedby={fieldError === "name" ? "setup-feedback" : undefined}/><button className="auth-button" disabled={locked || pending}>{pending ? "Saving…" : "Add team"}</button></form>
    </section>
    <section aria-labelledby="courts-heading" className="setup-section"><h2 id="courts-heading">Courts</h2>{!setup.courts.length && <p>No courts yet. Add at least one named court before starting.</p>}
      <ul className="setup-list">{setup.courts.map((court) => <li key={court.id} className="setup-row"><form className="setup-inline-form" action={(formData) => run(() => renameCourtAction(court.id, String(formData.get("name") ?? "")))}><label htmlFor={`court-${court.id}`}>Court name</label><input id={`court-${court.id}`} name="name" defaultValue={court.name} maxLength={160} disabled={pending} aria-invalid={fieldError === "courtName"} aria-describedby={fieldError === "courtName" ? "setup-feedback" : undefined}/><button className="auth-button auth-button-secondary" disabled={pending}>Save name</button></form><button className="setup-danger" type="button" disabled={pending} onClick={() => { if (window.confirm(`Delete ${court.name}? This removes the court from setup.`)) run(() => deleteCourtAction(court.id)); }}>Delete {court.name}</button></li>)}</ul>
      <form className="setup-add" onSubmit={(event) => submit(event, createCourtAction, () => setCourtName(""))}><label htmlFor="new-court">New court name</label><input id="new-court" name="name" value={courtName} onChange={(event) => setCourtName(event.target.value)} maxLength={160} disabled={pending} aria-invalid={fieldError === "courtName"} aria-describedby={fieldError === "courtName" ? "setup-feedback" : undefined}/><button className="auth-button" disabled={pending}>{pending ? "Saving…" : "Add court"}</button></form>
    </section>
    {!locked && <section className="setup-start"><h2>Start group stage</h2><p>This changes the tournament stage to Groups and locks team names and group assignments. It does not create matches.</p><button type="button" className="auth-button" disabled={pending} onClick={() => { if (window.confirm("Start the group stage? Team names and group assignments will be locked.")) run(() => startGroupStageAction(true)); }}>{pending ? "Saving…" : "Start group stage"}</button></section>}
  </main>;
}
