# Volleyball Tournament Manager — Sprint Milestone Plan

## Status

- Sprint plan approved on 6 November 2026.
- Phase 3 implementation planning is complete; work-package breakdown approved.
- Sprint 1 starts on Friday 6 November 2026.
- WP-01 is complete.
- WP-02A is complete as of 6 November 2026.
- WP-02 is complete as of 6 November 2026.
- WP-03 is complete as of 10 November 2026.
- Each subsequent work package requires explicit approval before implementation.
- Stay on the Free plan for now; reassess only if usage limits interfere.
- Every handover prompt must begin with a descriptive project, phase, topic, or work-package header.

## Planning assumptions

Four milestone sprints, initially tracked in one-week windows. Dates are planning targets, not delivery commitments. Carry unfinished work forward without skipping dependencies or approval gates.

The earlier estimate of 25–40 hours was inconsistent with the package breakdown. Use 52–83 focused hours as the provisional sprint-level estimate, including review, testing, fixes, and deployment. At 8–12 hours per week, allow approximately 5–10 weeks rather than assuming all work fits into four weeks. Actual velocity will be reviewed after Sprint 1; no scope or approval changes are implied.

## Sprint overview

| Sprint | Initial target dates | Packages | Estimated effort | Milestone |
|---|---|---|---|---|
| 1 — Foundation and setup | 6–12 November 2026 | WP-01–WP-04, including WP-02A | 13–21 hours | Authenticated tournament setup foundation |
| 2 — Group play and courts | 13–19 November 2026 | WP-05–WP-07 | 13–20 hours | Group pairings, assignments, results, standings |
| 3 — Knockouts and public experience | 20–26 November 2026 | WP-08–WP-11 | 18–28 hours | Full tournament flow and public views |
| 4 — Hardening and launch | 27 November–3 December 2026 | WP-12 and fixes/rehearsal | 8–14 hours | Production readiness |
| Total | Dates subject to actual velocity | WP-01–WP-12, including WP-02A | 52–83 hours | Tournament-ready MVP |

Sprint 3 is the highest-load milestone and may need more than one calendar week. Reserve contingency before the tournament; no tournament date has been supplied.

## Sprint 1 — Foundation and tournament setup

Goal: Establish the repository, data foundation, organizer authorization, shared UI/UX design foundation, and tournament setup workflow.

- WP-01: Repository, tooling, and environment setup.
- WP-02A: UI/UX design foundation.
- WP-02: Database schema and migrations.
- WP-03: Organizer authentication and authorization.
- WP-04: Tournament setup: teams, groups, and courts.

### Milestone acceptance

- Local project, linting, test tooling, and environment conventions work.
- Database migrations can be applied and verified.
- Organizer authentication works and mutations enforce server-side authorization.
- WP-02A design tokens, component patterns, screen specifications, accessibility implementation rules, and screen inventory are documented.
- WP-04 and later UI-heavy packages can consume the established patterns.
- No UI implementation, product-feature change, or infrastructure selection occurs as part of WP-02A.
- Organizer can manage team names, group assignments, and named courts.
- Unused courts can be deleted; courts with active assignments cannot be deleted.
- Organizer can explicitly start the group stage.
- Relevant tests and manual checks pass; no secrets or private data are committed.

Demo: “I can set up the tournament and protect organizer actions.”

An early Vercel preview is useful if covered by an approved package. Production domain/HTTPS launch remains part of WP-12; do not expand WP-01–WP-04 to include later-package functionality.

## Sprint 2 — Group play and court operations

Goal: Make the group stage operational.

- WP-05: Group pairings and stable round-robin order.
- WP-06: Court assignment and public upcoming games.
- WP-07: Group results, validation, and standings.

### Milestone acceptance

- Correct round-robin pairings are displayed in stable order, interleaving Groups A and B.
- Organizer can manually assign, move, and remove court assignments.
- One assigned uncompleted match per team and per court is enforced on the server.
- Public upcoming games show assigned uncompleted matches, not verified live status.
- Valid two-set group scores can be entered and corrected.
- Results publish immediately and standings recalculate correctly.
- Qualification ties requiring lot entry and stage transitions remain WP-08 work.

Demo: “I can run group matches and see updated standings.”

## Sprint 3 — Knockouts, placements, and public experience

Goal: Complete tournament progression and public experience.

- WP-08: Tie resolution, stage transitions, and locking.
- WP-09: Knockout bracket, results, and progression.
- WP-10: Third place, forfeits, and placements.
- WP-11: Public pages and automatic updates.

### Milestone acceptance

- Qualification ties can be resolved, including externally drawn lot outcomes.
- Explicit stage transitions enforce completion checks and lock previous stages.
- Quarterfinals, semifinals, final, and optional third-place match work correctly.
- Phase-specific score validation, administrative forfeits, and placements are correct.
- Disabling third place uses the approved signed semifinal point-difference comparison.
- Public groups, matches, results, standings, bracket, and placements work on mobile.
- Public updates check about every 5 minutes while visible and on return, with no user pause control.
- Manual refresh, last successful check, stale-data indication, and stable view state work.

Demo: “I can complete the tournament and spectators can follow it.”

## Sprint 4 — Hardening, resets, and launch

Goal: Verify tournament-day readiness and deploy production.

- WP-12: Resets, quality checks, and deployment.
- Fix integration defects without adding unapproved features.
- Rehearse a complete 12-team tournament.

### Milestone acceptance

- All four reset types work with authorization and destructive confirmation.
- Critical E2E flows and business-rule tests pass.
- Mobile usability, 200% text zoom, labels, contrast, and touch targets are checked.
- No verified WCAG conformance claim is made.
- Agreed performance conditions are tested.
- Save failures preserve input and do not report false success or permit repeated submissions.
- Production URL, HTTPS, organizer login, and persistence across ordinary restarts are verified.
- Public data remains accessible after finalization.

Demo: “The app is deployed and ready for tournament day.”

## Work-package tracker

| ID | Package | Complexity | Dependencies | Status |
|---|---|---|---|---|
| WP-01 | Repository, tooling, and environment setup | S | None | Complete |
| WP-02A | UI/UX design foundation | S | WP-01 | Complete; 6 November 2026 |
| WP-02 | Database schema and migrations | M | WP-01 | Complete; 6 November 2026 |
| WP-03 | Organizer authentication and authorization | M | WP-02 | Complete; 10 November 2026 |
| WP-04 | Tournament setup: teams, groups, and courts | M | WP-02A, WP-03 | Not started; approval required |
| WP-05 | Group pairings and stable round-robin order | M | WP-04; uses WP-02A patterns | Not started; approval required |
| WP-06 | Court assignment and public upcoming games | M | WP-05; uses WP-02A patterns | Not started; approval required |
| WP-07 | Group results, validation, and standings | L | WP-06; uses WP-02A patterns | Not started; approval required |
| WP-08 | Tie resolution, stage transitions, and locking | L | WP-07; uses WP-02A patterns | Not started; approval required |
| WP-09 | Knockout bracket, results, and progression | L | WP-08; uses WP-02A patterns | Not started; approval required |
| WP-10 | Third place, forfeits, and placements | M | WP-09; uses WP-02A patterns | Not started; approval required |
| WP-11 | Public pages and automatic updates | M | WP-06; full value after WP-10; uses WP-02A patterns | Not started; approval required |
| WP-12 | Resets, quality checks, and deployment | M | WP-10, WP-11 | Not started; approval required |

### WP-02A definition of done

- `docs/11-ui-ux-design-foundation.md` defines design tokens, component and interaction patterns, screen specifications, accessibility implementation rules, and the screen inventory.
- The document defines the minimal, clean, content-first visual direction, system-font typography approach, non-SF-Symbols iconography approach, token-based light theme, future palette/dark-theme adaptability boundary, and reusable component inventory.
- Every required screen area is mapped to WP-04 through WP-11.
- Existing tournament, scoring, tie-breaker, stage-lock, forfeit, placement, reset, and authorization rules remain unchanged.
- No application code, styles, components, database migrations, or tests are created.
- The document explicitly does not claim WCAG conformance or select infrastructure.
- WP-12 remains the final quality, accessibility, and deployment verification package.

### WP-02 completion record

Completed on 6 November 2026.

- Added Drizzle ORM, Drizzle Kit, and `@neondatabase/serverless`.
- Added `db:generate`, `db:migrate`, and `db:studio` npm scripts.
- Created the typed Drizzle schema, Neon database client, migration configuration, and initial migration chain.
- Created the tournament, team, group, court, match, set-score, court-assignment, lot-decision, and placement tables.
- Enforced one current tournament, case-insensitive team and court names, one group per team, distinct match participants, unique set numbers, one assignment per match, and one active assignment per court.
- Applied all migrations to the approved Neon development database only; a repeated `npm run db:migrate` succeeded.
- Database integration tests verified direct court-deletion protection, match-deletion cascade behavior, and tournament-deletion cascade behavior.
- `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` passed.
- The court-assignment foreign key uses `ON DELETE NO ACTION` and is `DEFERRABLE INITIALLY DEFERRED`. Preserve this behavior in future migrations so tournament-wide deletion can cascade while direct deletion of a referenced court remains blocked.
- One active assignment per team remains application-level validation for a later work package; it is intentionally not enforced as a database constraint.
- No UI, authentication, business rules, scoring calculations, standings, bracket progression, resets, or public-update behavior were implemented.

### WP-03 completion record

Completed on 10 November 2026. The completion record reflects implementation and test-hardening review; it does not include a production deployment.

- Added Auth.js v5 with GitHub OAuth, JWT sessions, `/login`, protected `/organizer`, and a reusable server-only organizer authorization helper. Organizer access requires a matching configured GitHub login; public pages remain anonymous.
- Pinned the sole added dependency to `next-auth@5.0.0-beta.32`. No schema or migration changes were made.
- `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, and `npm run test:e2e` passed; `git diff --check` passed.
- Unit tests: 42 passed, 2 skipped. The skipped checks are conditional Neon migration tests requiring `DATABASE_URL`; they are unrelated to WP-03 and did not re-verify database migrations in this run.
- The final build passed in an isolated copy without local environment files. An intermediate build in the checkout reported finding `.env.local`; its contents were not displayed or inspected. Do not infer that all commands ran without local environment files.
- E2E passed sequentially: missing-auth configuration, 1 test; configured-but-anonymous configuration and remaining coverage, 4 tests. The servers used port 3217 because port 3000 was occupied; existing processes were not stopped. The tests used fake or empty auth configuration, did not submit OAuth sign-in, and did not contact GitHub.
- Organizer-reported manual checks passed: an allowlisted GitHub account accessed `/organizer`; excluding it through a different valid allowlist value denied access; restoring the allowlist restored access; direct `/organizer` access after sign-out required login; and the public home page remained available while signed out. The login page also passed at 320px width and 200% browser zoom.
- The requested manual VoiceOver/screen-reader check was not performed at the organizer's request. No WCAG conformance claim is made.
- Limitations: automated coverage models `auth()` returning `null` at the authorization boundary, not actual JWT expiration; automated sign-out coverage verifies delegation to Auth.js, not browser-cookie deletion; automated E2E does not exercise external GitHub OAuth. Production deployment and production OAuth configuration remain out of scope.
- Code review found no confirmed authorization bypass. No actual effort estimate or completion commit SHA is recorded.

## Rehearsal checklist

- [ ] Create 12 teams, groups, and courts.
- [ ] Complete group matches and verify assignment conflict prevention.
- [ ] Enter normal results, a 1–1 draw, and a forfeit.
- [ ] Resolve qualification ties, including lot entry.
- [ ] Progress through all knockout rounds and verify stage locks.
- [ ] Test both third-place paths, including equal semifinal differences.
- [ ] Verify automatic public updates, manual refresh, and stale-data behavior on a real phone.
- [ ] Test all reset flows in a non-production environment.
- [ ] Confirm production HTTPS, authorization, and data persistence.

## Tracking cadence

After each package, record completion date, actual effort, tests/manual verification, blockers, and the next approval needed. At each sprint review, compare planned versus actual effort and update target dates explicitly. Sprint membership does not authorize implementation of an unapproved package.

## Next action

WP-01, WP-02A, WP-02, and WP-03 are complete. WP-04 — Tournament setup: teams, groups, and courts — is next and requires separate explicit approval before implementation. See `docs/next-work-package.md` for the WP-04 handoff. No later work package is authorized by this status update.
