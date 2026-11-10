import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next-auth", () => ({
  default: (config: unknown) => ({
    handlers: { GET: vi.fn(), POST: vi.fn() },
    auth: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    config,
  }),
}));
vi.mock("next-auth/providers/github", () => ({ default: { id: "github" } }));

import { authConfig } from "@/src/auth";

describe("Auth.js session configuration", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("uses JWT sessions and only accepts allowlisted GitHub profiles", async () => {
    vi.stubEnv("ORGANIZER_GITHUB_LOGINS", "volley-organizer");

    expect(authConfig.session?.strategy).toBe("jwt");
    expect(
      authConfig.callbacks?.signIn?.({
        profile: { login: "volley-organizer" },
        user: { id: "1", name: "Organizer" },
        account: null as never,
      } as never),
    ).toBe(true);
    expect(
      authConfig.callbacks?.signIn?.({
        profile: { login: "unlisted-user" },
        user: { id: "2", name: "Visitor" },
        account: null as never,
      } as never),
    ).toBe(false);
  });

  it("stores the GitHub login in the signed JWT and exposes it in the session", async () => {
    const token = await authConfig.callbacks?.jwt?.({
      token: { sub: "github-user-id" },
      profile: { login: "volley-organizer" },
      account: null as never,
      user: { id: "github-user-id" },
    } as never);
    expect(token).toMatchObject({ githubLogin: "volley-organizer" });

    const session = await authConfig.callbacks?.session?.({
      session: {
        expires: "2099-01-01T00:00:00.000Z",
        user: { name: "Organizer", email: "x@y.z", image: "x" },
      },
      token: token ?? {},
      user: { id: "github-user-id", email: "x@y.z", emailVerified: null },
    } as never);
    expect(session?.user).toMatchObject({ githubLogin: "volley-organizer" });
  });
});
