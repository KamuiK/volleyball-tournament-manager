import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { signIn, signOut } = vi.hoisted(() => ({ signIn: vi.fn(), signOut: vi.fn() }));
vi.mock("@/src/auth", () => ({ signIn, signOut }));

vi.mock("next/navigation", () => ({
  redirect: (destination: string) => {
    throw new Error(`redirect:${destination}`);
  },
}));

import { signInWithGitHub, signOutOrganizer } from "@/app/login/actions";

describe("authentication actions", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetAllMocks();
  });

  beforeEach(() => {
    vi.stubEnv("AUTH_SECRET", "test-only-secret");
    vi.stubEnv("AUTH_GITHUB_ID", "test-client-id");
    vi.stubEnv("AUTH_GITHUB_SECRET", "test-client-secret");
    vi.stubEnv("ORGANIZER_GITHUB_LOGINS", "volley-organizer");
  });

  it("rejects incomplete configuration with a safe message", async () => {
    process.env.AUTH_GITHUB_SECRET = "";
    await expect(signInWithGitHub(new FormData())).rejects.toThrow(
      "redirect:/login?error=SignInUnavailable",
    );
    expect(signIn).not.toHaveBeenCalled();
  });

  it("uses a safe local fallback for an external redirect target", async () => {
    const formData = new FormData();
    formData.set("callbackUrl", "https://attacker.example/path");
    await signInWithGitHub(formData);

    expect(signIn).toHaveBeenCalledWith("github", { redirectTo: "/organizer" });
  });

  it("returns only generic feedback when sign-in fails", async () => {
    signIn.mockRejectedValueOnce(new Error("sensitive provider failure"));

    await expect(signInWithGitHub(new FormData())).rejects.toThrow(
      "redirect:/login?error=SignInFailed",
    );
  });

  it("rethrows a successful Next.js redirect from Auth.js", async () => {
    const redirectSignal = Object.assign(new Error("redirect"), {
      digest: "NEXT_REDIRECT;push;/organizer;303;",
    });
    signIn.mockRejectedValueOnce(redirectSignal);

    await expect(signInWithGitHub(new FormData())).rejects.toBe(redirectSignal);
  });

  it("delegates sign-out to Auth.js with a safe return target", async () => {
    await signOutOrganizer();

    expect(signOut).toHaveBeenCalledWith({ redirectTo: "/login?status=signedOut" });
  });
});
