import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/src/auth";
import { hasOrganizerAuthConfiguration, isOrganizerGithubLogin } from "@/src/auth/organizer-logins";

export async function requireOrganizer() {
  if (!hasOrganizerAuthConfiguration(process.env)) {
    redirect("/login?error=SignInUnavailable");
  }

  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=%2Forganizer");
  }

  if (!isOrganizerGithubLogin(session.user.githubLogin, process.env.ORGANIZER_GITHUB_LOGINS)) {
    redirect("/login?error=AccessDenied");
  }

  return session.user;
}
