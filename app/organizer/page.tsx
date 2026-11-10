import { signOutOrganizer } from "@/app/login/actions";
import { requireOrganizer } from "@/src/auth/authorization";
import { loadSetup } from "@/src/tournament/setup";
import { SetupForm } from "@/app/organizer/setup-form";
import { SetupEmpty } from "@/app/organizer/setup-empty";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function OrganizerPage() {
  await requireOrganizer();
  const setup = await loadSetup();

  if (!setup) {
    return <SetupEmpty />;
  }
  if (!setup.groups.some((group) => group.label === "Group A") || !setup.groups.some((group) => group.label === "Group B")) {
    return <SetupEmpty recovering />;
  }

  return (
    <>
      <SetupForm setup={setup} />
      <form action={signOutOrganizer} className="setup-signout"><button className="auth-button auth-button-secondary" type="submit">Sign out</button></form>
    </>
  );
}
