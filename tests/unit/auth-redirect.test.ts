import { describe, expect, it } from "vitest";
import { safeInternalRedirect } from "@/src/auth/redirect";

const fallback = "/organizer";

describe("safeInternalRedirect", () => {
  it.each([
    ["/organizer", "/organizer"],
    ["/organizer/teams", "/organizer/teams"],
    ["/organizer?stage=groups", "/organizer?stage=groups"],
    ["/organizer#teams", "/organizer#teams"],
    ["/organizer?stage=groups#teams", "/organizer?stage=groups#teams"],
  ])("preserves valid internal target %s", (target, expected) => {
    expect(safeInternalRedirect(target)).toBe(expected);
  });

  it.each([
    "https://outside.example/path",
    "http://outside.example/",
    "//outside.example/path",
    "/\\\\outside.example/path",
    "http://[invalid",
    "",
    "organizer",
  ])("falls back for invalid or external target %s", (target) => {
    expect(safeInternalRedirect(target)).toBe(fallback);
  });

  it.each(["/%2F%2Foutside.example/path", "/%5C%5Coutside.example/path"])(
    "keeps encoded target local when URL parsing keeps it same-origin: %s",
    (target) => {
      const result = safeInternalRedirect(target);
      expect(result).toBe(target);
      expect(new URL(result, "http://localhost").origin).toBe("http://localhost");
    },
  );

  it("normalizes a control character to a same-origin path", () => {
    const result = safeInternalRedirect("/organizer\u0000panel");

    expect(result).toBe("/organizer%00panel");
    expect(new URL(result, "http://localhost").origin).toBe("http://localhost");
  });

  it.each([undefined, null, 12, {}, Symbol("redirect")])(
    "uses the fallback for non-string input (%s)",
    (target) => {
      expect(safeInternalRedirect(target)).toBe(fallback);
    },
  );
});
