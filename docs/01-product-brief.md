# Product brief

Status: Approved MVP baseline
Approval date: 2026-11-05
Phase: 1 — Requirements

## Purpose
Provide a mobile-first web application for operating one current amateur mixed-volleyball tournament: teams, courts, match assignments, results, standings, and knockout progression.

## Target users
- Organizer/results operator: prepares the tournament, assigns courts, enters paper-sheet results, corrects errors, and advances stages.
- Players and spectators: view upcoming assigned games, results, standings, and bracket without login.

## Tournament context
- 10–12 teams, two groups: 5+5, 5+6, or 6+6.
- Each group plays a single round robin; its top four qualify for quarterfinals.
- Team information consists only of team names.
- Mixed-team composition and skill eligibility are enforced outside the application.
- Paper score sheets are collected and entered by one active operator/client after matches.
- Court assignment is manual. Timed scheduling is excluded.
- Rules source: Mixed_Volleyball_Regelblaetter_ueberarbeitet.pdf, supplemented by approved workshop decisions below and in the functional requirements.

## Success criteria
- The organizer can prepare teams, groups, and courts, then explicitly start play.
- Court and team assignment conflicts cannot be saved.
- Valid saved results immediately affect public data, standings, and applicable progression.
- Stage confirmation permanently locks earlier results in the normal workflow.
- The tournament works with or without a third-place match.
- Spectators can use the public pages on phones without accounts.
- Reset actions clearly identify and delete the intended data without requiring an archive.

## Explicit non-goals
- Timed scheduling, durations, rest optimization, automatic court allocation, or court queues.
- Live rally scoring, court-side accounts, and multi-operator editing workflows.
- Players, rosters, contacts, origins, skill-level fields, or statistics.
- Notifications, multiple active tournaments, seasons, historical browsing, or tournament selection.
- German translations at launch, audit history, backup/restore, or export features.
- Interrupted-match handling, bulk withdrawals, arbitrary tournament formats, or a general scoring-rule editor.
- Dedicated keyboard/screen-reader testing or a verified WCAG conformance claim.

## Future considerations, not MVP features
- A manually maintained public timetable; automatic scheduling is a separate uncommitted capability.
- German localization.
- Historical views for organizers and spectators. Underlying design must support historical tournaments, but no history interface or retained-new-event workflow is required now.

## Prioritized backlog
All items below are Must have; ordering is a product sequence, not approved implementation work packages.
1. Authorized organizer access, team/court setup, group allocation, and setup validation.
2. Group pairings and stable round-robin display order.
3. Court assignment, conflict prevention, and public upcoming games.
4. Completed result entry, validation, correction, and group standings.
5. Tie resolution, explicit stage transitions, and locking.
6. Knockout bracket and advancement.
7. Optional third-place match and alternative placement.
8. Forfeits and individual withdrawal handling.
9. Public mobile pages and automatic updates.
10. Granular resets and full reset.
11. Agreed quality checks, HTTPS, persistence, and public deployment.
12. English-only delivery with history/timetable/localization-ready design review.

## Assumptions
- One active operator/client; paper sheets remain the operational source for checking entries.
- Organizers confirm stages before authorizing the next round on court.
- No reliable live match-start status is available.
- Only group ranks and explicitly determined knockout placements are required; no full ranking of all eliminated teams.
- Reset discards an attempt and is not historical archiving.

## Next phase
Architecture may begin after requirements consolidation. Do not implement before architecture/planning and explicit approval of a work package.
