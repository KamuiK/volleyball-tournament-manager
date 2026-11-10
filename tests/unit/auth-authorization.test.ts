import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/src/auth", () => ({ auth: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: (destination: string) => {
    throw new Error(`redirect:${destination}`);
  },
}));

import { auth } from "@/src/auth";
import { requireOrganizer } from "@/src/auth/authorization";
import {
  hasOrganizerAuthConfiguration,
  isOrganizerGithubLogin,
  parseOrganizerGithubLogins,
} from "@/src/auth/organizer-logins";

const authorizedSession = {
  user: { githubLogin: "volley-organizer", name: "Organizer" },
  expires: "2099-01-01T00:00:00.000Z",
};
type TestSession = {
  user: { githubLogin?: string; name?: string };
  expires: string;
};
const mockedAuth = vi.mocked(auth as unknown as () => Promise<TestSession | null>);

describe("organizer authorization", () => {
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

  it("rejects a null session at the boundary, including an expired-session outcome", async () => {
    mockedAuth.mockResolvedValueOnce(null);

    await expect(requireOrganizer()).rejects.toThrow("redirect:/login?callbackUrl=%2Forganizer");
  });

  it("rejects a session user without a GitHub login", async () => {
    mockedAuth.mockResolvedValueOnce({
      expires: authorizedSession.expires,
      user: { name: "Account without GitHub login" },
    });

    await expect(requireOrganizer()).rejects.toThrow("redirect:/login?error=AccessDenied");
  });

  it("rejects an authenticated account outside the allowlist", async () => {
    mockedAuth.mockResolvedValueOnce({
      ...authorizedSession,
      user: { githubLogin: "another-account", name: "Visitor" },
    });

    await expect(requireOrganizer()).rejects.toThrow("redirect:/login?error=AccessDenied");
  });

  it("allows an authenticated account on the allowlist", async () => {
    mockedAuth.mockResolvedValueOnce(authorizedSession);

    await expect(requireOrganizer()).resolves.toMatchObject({ githubLogin: "volley-organizer" });
  });

  it("rejects an existing session after its GitHub login is removed from the allowlist", async () => {
    mockedAuth.mockResolvedValueOnce(authorizedSession);
    vi.stubEnv("ORGANIZER_GITHUB_LOGINS", "different-authorized-login");

    await expect(requireOrganizer()).rejects.toThrow("redirect:/login?error=AccessDenied");
  });

  it.each([undefined, "", "valid-login,not a login", "valid-login,"])(
    "fails closed for a missing or malformed organizer allowlist (%s)",
    async (allowlist) => {
      if (allowlist === undefined) {
        vi.stubEnv("ORGANIZER_GITHUB_LOGINS", undefined);
      } else {
        vi.stubEnv("ORGANIZER_GITHUB_LOGINS", allowlist);
      }

      await expect(requireOrganizer()).rejects.toThrow("redirect:/login?error=SignInUnavailable");
      expect(mockedAuth).not.toHaveBeenCalled();
    },
  );
});

describe("organizer GitHub login configuration", () => {
  it("normalizes configured usernames and checks them case-insensitively", () => {
    expect(parseOrganizerGithubLogins("Volley-Organizer, second-user")).toEqual(
      new Set(["volley-organizer", "second-user"]),
    );
    expect(isOrganizerGithubLogin("VOLLEY-ORGANIZER", "volley-organizer")).toBe(true);
    expect(isOrganizerGithubLogin("not-authorized", "volley-organizer")).toBe(false);
  });

  it("rejects missing credentials and allowlists as incomplete configuration", () => {
    expect(
      hasOrganizerAuthConfiguration({
        AUTH_SECRET: "secret",
        AUTH_GITHUB_ID: "client",
        AUTH_GITHUB_SECRET: "credential",
        ORGANIZER_GITHUB_LOGINS: "",
        NODE_ENV: "test",
      }),
    ).toBe(false);
  });
});
