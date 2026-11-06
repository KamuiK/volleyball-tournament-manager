# Personas and use cases

Status: Approved MVP baseline | 2026-11-05

## Personas
- Organizer/results operator: one authorized person preparing and running the current tournament through the application.
- Player/spectator: a public visitor, usually on a phone, checking assigned games and published outcomes.

## Must-have user stories

## Shared UI/UX patterns

Organizer and public workflows use the shared UI/UX patterns established by WP-02A. Forms use clear labels, helper text, validation messages, saving states, and text-based error explanations. Empty, loading, error, destructive-confirmation, and status states follow the same patterns across organizer and public views.

These patterns do not change any tournament, scoring, authorization, stage-lock, reset, or public-access requirement.

### US-01 — Prepare teams and groups
As an organizer, I want to enter team names and assign teams to two groups, so that the tournament has valid participants and pairings.
Acceptance criteria:
- Support 10, 11, or 12 teams with group sizes 5+5, 5+6, or 6+6.
- Each team belongs to exactly one group before play starts.
- No extra participant fields are required.
- Explicitly starting the group stage exposes all group pairings to the organizer.

### US-02 — Manage courts
As an organizer, I want to add named courts and delete unused courts, so that assignments reflect the playing facilities.
Acceptance criteria:
- Require a nonempty, distinguishable name and at least one court before starting play.
- Block deletion while a court holds an uncompleted assigned match.
- Deletion never deletes results; completed matches retain recorded court information.

### US-03 — Assign matches
As an organizer, I want to assign eligible matches to courts, so that players know where to play.
Acceptance criteria:
- Show all uncompleted group matches, assigned or unassigned, in stable round-robin order.
- Allow selection outside that suggested order.
- Permit one uncompleted assignment per court and per team, and one court per match.
- Explain conflicts; allow moving or removing an assignment.
- Result/forfeit saves and assignment removal release resources.
- Apply assignment to open knockout rounds with known participants.
- Assignment conflicts, removal, and movement use the established form, error, confirmation, and status patterns.

### US-04 — View upcoming games
As a player, I want to see assigned upcoming games and court names, so that I know where my team should play.
Acceptance criteria:
- Display both teams, group/round, and court without login.
- Unassigned matches are excluded from this view.
- Completed matches leave this view.
- Do not imply verified live status or a start time.

### US-05 — Enter and correct results
As an operator, I want to enter completed paper-sheet results, so that public results and standings are accurate.
Acceptance criteria:
- Validate individual set scores against the match phase.
- Derive the result; publish and recalculate immediately on save.
- Allow corrections only in an open stage.
- Reject invalid changes without overwriting saved data.
- No approval step or change history.
- Score entry uses the established set-score input, validation, saving, failed-save recovery, correction, and confirmation patterns.

### US-06 — Review standings and resolve ties
As an organizer, I want correctly ranked groups and recorded lot outcomes, so that qualification is settled before knockout play.
Acceptance criteria:
- Apply the exact ordered criteria in the functional requirements.
- Do not compare raw standings across unequal groups.
- Record an externally decided lot outcome without modifying scores.
- Block knockout transition while ranking remains unresolved.

### US-07 — Advance stages
As an organizer, I want to confirm stages explicitly, so that reviewed results become final.
Acceptance criteria:
- Require completed valid current-stage matches and explicit confirmation.
- Lock earlier results and determine the next-round participants.
- Never advance automatically after a result save.
- Reject edits to locked results; no ordinary reopening workflow.

### US-08 — Determine third place
As an organizer, I want an optional third-place match, so that the tournament works whether or not it is played.
Acceptance criteria:
- Toggle until tournament finalization.
- If played, use its result; if disabled, compare semifinal losers' semifinal point differences.
- Equal differences mean joint third with no fourth place.
- Count all semifinal sets and forfeit scores.
- Confirm before discarding an entered third-place result.

### US-09 — Record forfeits
As an organizer, I want to record a match forfeit, so that standings and progression reflect an absent team.
Acceptance criteria:
- Select the forfeiting team; award the opponent 2–0, 21–0 and 21–0.
- Label the public result as a forfeit and count administrative points.
- Handle withdrawals by individual forfeits; retain earlier results.
- If neither team can play third place, disable it and use the fallback.

### US-10 — Follow public outcomes
As a spectator, I want public standings, results, and bracket updates, so that I can follow the current tournament.
Acceptance criteria:
- Public access without login, including after finalization.
- Approximately 5-minute visible-page checks and a check on return; updates stay enabled while the page is visible.
- Manual refresh, last successful check, and stale-data warning; no pause control.
- Preserve view, filters, and scroll position during updates.
- Public refresh, stale-data, loading, empty, and error states use the established shared patterns.

### US-11 — Reset an attempt
As an organizer, I want granular resets and a full reset, so that I can discard testing or restart an abandoned event.
Acceptance criteria:
- Provide results/progress, groups, teams, and full reset actions.
- Follow dependency clearing rules in the functional requirements.
- Explicitly confirm destructive consequences; no undo or archival requirement.
- Permit reset at any stage, including after finalization.
- Reset actions use the established destructive-action confirmation pattern.

## Other priorities
- Should have: none committed outside the Must-have baseline.
- Could have later: German UI, historical views, manually maintained timetable.
- Won't have in MVP: automatic scheduling, live rally scoring, player data, notifications, export/backups, audit history, multi-active-tournament management.
