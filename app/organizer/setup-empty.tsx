"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createTournamentAction } from "@/app/organizer/actions";
import { signOutOrganizer } from "@/app/login/actions";

export function SetupEmpty({ recovering = false }: { recovering?: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  function create() {
    startTransition(async () => {
      try {
        const result = await createTournamentAction();
        setMessage(result.message ?? (result.ok ? "Tournament created." : "The tournament could not be created."));
        if (result.ok) router.refresh();
      } catch {
        setMessage("The tournament could not be created. Try again.");
      }
    });
  }

  return (
    <main className="auth-main">
      <section aria-labelledby="organizer-heading" className="auth-card">
        <p className="auth-eyebrow">Organizer</p>
        <h1 id="organizer-heading">{recovering ? "Finish tournament setup" : "No current tournament"}</h1>
        <p>{recovering ? "Complete the fixed groups for the current tournament before setting up teams and courts." : "Create the current tournament to begin team, group, and court setup."}</p>
        {message && <p className="auth-message" role="status">{message}</p>}
        <button className="auth-button" type="button" onClick={create} disabled={pending}>
          {pending ? "Saving…" : recovering ? "Complete tournament setup" : "Create tournament"}
        </button>
        <form action={signOutOrganizer}>
          <button className="auth-button auth-button-secondary" type="submit">Sign out</button>
        </form>
      </section>
    </main>
  );
}
