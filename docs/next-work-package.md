# Volleyball Tournament Manager — WP-04 handoff

Last updated: 10 November 2026

## Purpose

Read this file first when starting the next work-package thread. It records the current handoff, not permission to implement. Inspect the latest repository state and report discrepancies before proceeding.

## Current status

- Phase 1 MVP scope, Phase 2 architecture, and Phase 3 work-package breakdown: approved.
- WP-01 — Repository, tooling, and environment setup: complete.
- WP-02A — UI/UX design foundation: complete; 6 November 2026.
- WP-02 — Database schema and migrations: complete; 6 November 2026.
- WP-03 — Organizer authentication and authorization: complete; 10 November 2026.
- WP-04 — Tournament setup: teams, groups, and courts: next; not started; implementation approval required.
- WP-05 and later: not started; separate approval required.

The WP-03 completion record and verification limitations are in `docs/10-sprint-plan.md`. This handoff and the WP-03 implementation/completion documentation are local working-tree changes; they are not committed or available on `main` yet. Do not claim otherwise or invent a completion commit SHA.

## Workflow and approval gates

1. Read `AGENTS.md`, this file, and the relevant product, functional, schema, and UI/UX documents.
2. Inspect the current repository state, including uncommitted changes. Verify WP-04 is still next and WP-01, WP-02A, WP-02, and WP-03 remain complete. Report discrepancies before planning implementation.
3. Present a focused WP-04 implementation plan, exact proposed files and tests, data/migration impact, and unresolved decisions.
4. Wait for explicit approval before editing application files or adding dependencies. This handoff is not implementation approval.
5. Keep WP-04 within tournament setup. Obtain separate approval for any scope expansion, dependency addition, or schema/migration change.
6. After implementation, report exact quality-gate outcomes and manual checks. Do not mark WP-04 complete or advance the handoff until implementation and verification have been reviewed.
7. Do not stage, commit, push, create a PR, or perform production operations without explicit approval.

## WP-04 scope

- Goal: implement organizer setup for the one current tournament: team names, assignment to two groups, named courts, setup validation, and the explicit Start group stage action.
- Complexity: M.
- Dependencies: WP-02 database schema and migrations, WP-02A UI/UX design foundation, and WP-03 organizer authentication and authorization.
- Existing stories: `US-01` — Prepare teams and groups; `US-02` — Manage courts. Primary requirement: `FR-01` — Current tournament and setup. Apply the mobile-first and practical accessibility requirements in `docs/04-non-functional-requirements.md` and the tournament setup specification in `docs/11-ui-ux-design-foundation.md`.

### Approved behavior to implement

- Expose one current tournament only. Do not add tournament selection, multiple active tournaments, history, or archive behavior.
- Support 10, 11, or 12 team names, two consistently identified groups, and only group-size splits of 5+5, 5+6, or 6+6.
- Require every team to belong to exactly one group and enforce valid group sizes before starting the group stage.
- Team records contain team names only. Preserve the schema's case-insensitive uniqueness constraint for team names.
- Support named courts. Require nonempty, distinguishable court names and preserve the schema's case-insensitive court-name uniqueness constraint.
- Allow unused courts to be deleted. Block deleting a court with an active assignment, and preserve recorded court names on completed matches.
- Require at least one named court and valid team/group setup before the explicit Start group stage action.
- Protect every organizer server action or handler with the reusable server-side boundary in `src/auth/authorization.ts`; UI visibility or a page redirect alone is insufficient.
- Keep existing public pages anonymous and read-only.

### Boundaries

- Do not implement round-robin match generation or stable pairing order; those belong to WP-05. Resolve the Start group stage/pairing boundary below before implementation rather than silently adding WP-05 behavior.
- Do not implement court assignment, public upcoming games, scoring, standings, later stage transitions, knockout progression, resets, public updating, or deployment; these belong to later packages.
- Use the existing schema and migration chain. No schema or migration change is currently authorized or expected for WP-04. If implementation appears to require one, stop, explain the impact, and obtain approval first.
- Preserve the existing database constraints, particularly the court-assignment court foreign key's `ON DELETE NO ACTION` and `DEFERRABLE INITIALLY DEFERRED` behavior. Do not target a production database.
- Use the existing English UI, design tokens, responsive setup layout, labels, visible focus, text error feedback, and interaction patterns. Do not claim WCAG conformance.
- Do not use real tournament data or expose secrets, credentials, or private configuration.

## Relevant repository context

- `src/db/schema.ts` contains tournaments, teams, groups, team-group membership, courts, matches, and assignments. It includes the one-current-tournament partial unique index, case-insensitive team/court name indexes, and one-group-per-team primary key.
- `src/db/index.ts` is the existing database client. Migration files and the deferred court-assignment constraint are under `drizzle/`.
- Organizer authentication and the server-only authorization helper were introduced for WP-03; reuse them.
- Routes use `app/`; shared source code uses `src/`. Unit tests are under `tests/unit/`, E2E tests under `tests/e2e/`, and Playwright configuration is at the repository root.
- `docs/02-personas-and-use-cases.md`, `docs/03-functional-requirements.md`, `docs/04-non-functional-requirements.md`, `docs/05-open-questions.md`, `docs/10-sprint-plan.md`, and `docs/11-ui-ux-design-foundation.md` are the detailed scope references.

## Unresolved decisions to raise before implementation

- **Initial current tournament creation and name:** the schema requires a tournament `name`, but the approved product/functional requirements do not specify an initial name, default, or initialization mechanism. Do not invent a label, seed, or tournament-creation flow without agreement.
- **Team-name ambiguity and safe editing boundaries:** `P2-07` remains open. Preserve the database uniqueness constraint and prevent edits that invalidate existing results or participants, but clarify the desired validation feedback and which edits are allowed once play has started.
- **Start group stage versus WP-05 pairings:** `FR-01` and Sprint 1 place the explicit start action in setup, while `US-01` says starting exposes group pairings and WP-05 owns pairings/order. Confirm whether WP-04 only validates and changes the tournament stage, with pairings generated in WP-05, or whether a different boundary is intended. Do not implement pairing generation by assumption.
- **Court edits after stage start:** clarify the intended setup editing boundary consistently with `P2-07`, the active-assignment deletion rule, and preservation of completed-match court names. Do not allow ordinary edits to invalidate recorded results or participants.
- **Existing current-tournament row:** inspect the actual development state without exposing real data or credentials. Agree how WP-04 behaves if no current tournament exists; do not create multiple current tournaments or silently seed production.

## Expected verification areas after approval

- Unit coverage for team-count/group-size validation, complete group membership, required courts, name validation, and setup readiness.
- Direct server-action/handler coverage for anonymous, authenticated-but-unauthorized, and authorized organizer access.
- Database checks against an approved development-only database for relevant uniqueness, deletion, and preservation constraints; never count skipped database checks as passing.
- E2E coverage for the setup flow, validation feedback, active-court deletion blocking, explicit start behavior, mobile layout, and continued public anonymous access, within the agreed WP-04/WP-05 boundary.
- Run the repository quality gates and report exact outcomes. Any manual checks not performed must be labeled not performed.

## Ready-to-use prompt

```text
# Volleyball Tournament Manager — Phase 4 — WP-04: Tournament setup

Read AGENTS.md and inspect the current repository state, including uncommitted changes.
Read docs/next-work-package.md and docs/10-sprint-plan.md. Confirm WP-04 is still next and WP-01, WP-02A, WP-02, and WP-03 are complete. If repository state or the handoff disagrees, stop and report the discrepancy.

Task: WP-04 — Tournament setup: teams, groups, and courts

Goal:
Implement the approved setup workflow for one current tournament: team names, group assignment, named courts, setup validation, and an explicit Start group stage action. Do not implement later work packages.

Read the relevant product/persona/functional/non-functional/open-question/UI-UX documents and inspect the actual schema, migrations, database client, auth helper, routes, tests, and environment conventions.

First, do not modify files or install dependencies. Present a concise plan, exact files and tests, data/migration impact, and unresolved decisions. In particular, resolve or ask about the initial tournament name/creation behavior, P2-07 safe editing rules, and the WP-04 Start group stage versus WP-05 pairings boundary. Wait for explicit implementation approval.

After approval, implement only WP-04. Reuse the WP-03 server-side authorization helper inside every protected server entry point. Preserve the existing schema and migration behavior unless a separately approved change is necessary. Never use production data or expose secrets. Run the required quality gates and report exact outcomes, skipped checks, manual checks, and remaining limitations. Do not mark WP-04 complete, update the handoff, stage, commit, or push until completion is reviewed and separately approved.
```

## Starter message for a new conversation

After this handoff is committed and available on `main`, use the GitHub connector to read `docs/next-work-package.md` from `main` in `KamuiK/volleyball-tournament-manager`. Follow its current handoff instructions, inspect the repository state and referenced WP-04 documents, and present the requested plan. Do not edit files or begin implementation until I explicitly approve the plan.
