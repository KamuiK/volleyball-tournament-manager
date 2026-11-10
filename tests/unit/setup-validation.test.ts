import { describe, expect, it } from "vitest";
import { normalizeName, validateStartReadiness } from "@/src/tournament/setup-validation";

describe("setup name validation", () => {
  it("trims names and rejects blank or overlong values", () => {
    expect(normalizeName("  Team One  ")).toBe("Team One");
    expect(normalizeName("  ")).toMatchObject({ message: "Enter a name." });
    expect(normalizeName("x".repeat(161))).toMatchObject({ message: "Names must be 160 characters or fewer." });
  });
});

describe("group stage readiness", () => {
  const ready = { stage: "setup", teamCount: 10, assignedTeamCount: 10, groupACount: 5, groupBCount: 5, courtCount: 1 };
  it.each([[10, 5, 5], [11, 5, 6], [12, 6, 6]])("accepts supported split %i / %i / %i", (teamCount, groupACount, groupBCount) => {
    expect(validateStartReadiness({ ...ready, teamCount, assignedTeamCount: teamCount, groupACount, groupBCount })).toBeNull();
  });
  it("reports team count, missing assignment, group split, court and stage blockers", () => {
    expect(validateStartReadiness({ ...ready, teamCount: 9 })).toMatchObject({ message: "Add at least 10 teams before starting the group stage." });
    expect(validateStartReadiness({ ...ready, assignedTeamCount: 9 })).toMatchObject({ message: "Assign every team to Group A or Group B before starting the group stage." });
    expect(validateStartReadiness({ ...ready, groupACount: 4 })).toMatchObject({ message: expect.stringContaining("Group A has 4 teams") });
    expect(validateStartReadiness({ ...ready, courtCount: 0 })).toMatchObject({ message: "Add at least one court before starting the group stage." });
    expect(validateStartReadiness({ ...ready, stage: "groups" })).toMatchObject({ message: expect.stringContaining("Use a reset") });
  });
});
