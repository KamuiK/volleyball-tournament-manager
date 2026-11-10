export type SetupIssue = { field?: string; message: string };

export function normalizeName(value: unknown): string | SetupIssue {
  if (typeof value !== "string") return { message: "Enter a name." };
  const name = value.trim();
  if (!name) return { message: "Enter a name." };
  if (name.length > 160) return { message: "Names must be 160 characters or fewer." };
  return name;
}

export function validateStartReadiness(input: {
  stage: string;
  teamCount: number;
  assignedTeamCount: number;
  groupACount: number;
  groupBCount: number;
  courtCount: number;
}): SetupIssue | null {
  if (input.stage !== "setup") {
    return { message: "The group stage has started, so tournament setup can no longer be edited. Use a reset to return to preparation." };
  }
  if (input.teamCount < 10) return { message: "Add at least 10 teams before starting the group stage." };
  if (input.teamCount > 12) return { message: "Remove teams so there are no more than 12 before starting the group stage." };
  if (input.assignedTeamCount !== input.teamCount) return { message: "Assign every team to Group A or Group B before starting the group stage." };
  if (![5, 6].includes(input.groupACount) || ![5, 6].includes(input.groupBCount)) {
    return { message: `Groups must contain 5–6 teams each. Currently Group A has ${input.groupACount} teams and Group B has ${input.groupBCount} teams.` };
  }
  if (input.courtCount < 1) return { message: "Add at least one court before starting the group stage." };
  return null;
}
