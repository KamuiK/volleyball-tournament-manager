import { signOutOrganizer } from "@/app/login/actions";
import { requireOrganizer } from "@/src/auth/authorization";

export const dynamic = "force-dynamic";

export default async function OrganizerPage() {
  const organizer = await requireOrganizer();

  return (
    <main className="auth-main">
      <section aria-labelledby="organizer-heading" className="auth-card">
        <p className="auth-eyebrow">Organizer</p>
        <h1 id="organizer-heading">Tournament management</h1>
        <p>Signed in as {organizer.githubLogin}.</p>
        <p>Tournament setup will be available in a later work package.</p>
        <form action={signOutOrganizer}>
          <button className="auth-button auth-button-secondary" type="submit">
            Sign out
          </button>
        </form>
      </section>
    </main>
  );
}
