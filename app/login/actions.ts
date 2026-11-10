"use server";

import { signIn, signOut } from "@/src/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import { hasOrganizerAuthConfiguration } from "@/src/auth/organizer-logins";
import { safeInternalRedirect } from "@/src/auth/redirect";

export async function signInWithGitHub(formData: FormData) {
  if (!hasOrganizerAuthConfiguration(process.env)) {
    redirect("/login?error=SignInUnavailable");
  }

  const redirectTo = safeInternalRedirect(formData.get("callbackUrl"));

  try {
    await signIn("github", { redirectTo });
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    redirect("/login?error=SignInFailed");
  }
}

export async function signOutOrganizer() {
  await signOut({ redirectTo: "/login?status=signedOut" });
}
