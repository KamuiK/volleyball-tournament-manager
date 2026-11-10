# Volleyball Tournament Manager — WP-03 handoff

Last updated: 10 November 2026

## Purpose

Read this file first when starting the next work-package thread. It records the current handoff, not permission to implement. Inspect the latest repository state and report discrepancies before proceeding.

## Current status

- Phase 1 MVP scope, Phase 2 architecture, and Phase 3 work-package breakdown: approved.
- WP-01 — Repository, tooling, and environment setup: complete.
- WP-02A — UI/UX design foundation: complete.
- WP-02 — Database schema and migrations: complete; development migrations verified.
- WP-03 — Organizer authentication and authorization: next; not started; implementation approval required.
- WP-04 and later: not started; separate approval required.

Status was checked against main on 10 November 2026, at commit 864a2fcf76d34426d8c8d6c106a0354d4d857407. See docs/10-sprint-plan.md for completion details. docs/00-project-overview.md and the Current scope section of AGENTS.md still contain older progress statements; do not interpret those as reversals of completed work. All other applicable AGENTS.md rules remain in force.

## Workflow and approval gates

1. Read AGENTS.md, this file, and the relevant repository documents.
2. Verify the current code and status; do not rely on previous chat history.
3. Present the WP-03 plan, proposed authentication configuration, tests, and unresolved decisions.
4. Wait for explicit approval before editing implementation files or adding dependencies. Committing this handoff does not approve implementation.
5. After implementation, review results and obtain approval for any GitHub write.
6. When completion is verified, update the sprint tracker and stale status documents, and replace this handoff with the next package's status and prompt. Do not mark a package complete solely because code was generated.

## WP-03 scope

- Goal: provide organizer sign-in/sign-out, session handling, and reusable server-side authorization while preserving anonymous public access.
- Complexity: M.
- Dependencies: WP-02 complete; use WP-02A guidance for any login UI.
- Approved architecture: Next.js App Router, strict TypeScript, Auth.js, Server Actions, Neon PostgreSQL, Drizzle ORM, Vitest, and Playwright.
- Covered use cases: organizer accesses protected management functionality; visitors retain anonymous read-only access. Match existing story identifiers where present rather than inventing them.
- Non-goals: tournament setup, scoring, standings, brackets, resets, public-update behavior, production deployment, public registration, or a multi-user administration interface.
- Authentication provider, organizer allowlist identity, session strategy, and required dependencies must be verified from repository decisions or explicitly agreed before implementation. Do not invent missing architecture decisions.

## Ready-to-use prompt

```text
# Volleyball Tournament Manager — Phase 4 — WP-03: Organizer authentication and authorization

Read AGENTS.md and inspect the current repository state.
Read docs/next-work-package.md and verify that WP-03 is still the next package. If the repository has moved on, stop and report the discrepancy.

Task: WP-03 — Organizer authentication and authorization

Goal:
Implement the approved organizer authentication foundation using Auth.js, with server-side authorization for protected organizer operations and anonymous access to public pages. Do not implement later work packages.

Relevant context:
- AGENTS.md
- README.md
- docs/00-project-overview.md (architecture context; some progress statements are stale)
- docs/02-personas-and-use-cases.md
- docs/03-functional-requirements.md
- docs/04-non-functional-requirements.md
- docs/05-open-questions.md
- docs/10-sprint-plan.md (current completion records and package boundaries)
- docs/11-ui-ux-design-foundation.md (relevant login, feedback, and accessibility guidance)
- package.json, existing app/ routes, src/, tests/, and .github/ checks
- Existing Drizzle schema, database client, migration chain, and environment-variable conventions; locate their actual paths before proposing changes

Requirements:
1. Inspect existing authentication decisions and code. Confirm the provider, organizer identity restriction, session strategy, and environment-variable names before implementation. Ask focused questions if those decisions are absent. Auth.js is approved; do not silently substitute another authentication stack.
2. Support organizer sign-in and sign-out, with sessions handled securely through the agreed Auth.js configuration. No public registration or user-management feature.
3. Restrict organizer access to the explicitly configured authorized identity or identities. Successful provider authentication alone must not grant organizer privileges. Never commit actual credentials or personal allowlist values.
4. Provide a reusable server-only authorization boundary for organizer operations. Check authorization inside each protected server action or handler introduced in this package; hiding UI or redirecting a page is not sufficient. Future mutations must be able to reuse this boundary.
5. Demonstrate a protected organizer entry page without implementing WP-04 setup functionality. Anonymous visitors must still be able to access existing public pages.
6. Handle unauthenticated, unauthorized, failed sign-in, missing configuration, and expired-session cases safely. Never expose secrets or sensitive provider errors to the browser or logs. Define safe redirect behavior and reject untrusted external redirect targets.
7. Use a mobile-friendly login experience with explicit labels, keyboard-operable controls, visible focus, and accessible feedback, following the existing design foundation without building an unrelated component library.
8. Add automated coverage for anonymous rejection, authenticated-but-not-authorized rejection, authorized access, sign-out/session behavior, and continued anonymous public access. Cover direct access to protected server entry points, not just UI visibility. Keep automated tests independent of real external provider credentials; document any live-provider manual checks separately.
9. Document configuration names and local verification steps using placeholders only. Explain any provider-console setup needed without configuring production or publishing real credentials.
10. Preserve the existing schema and migration behavior. In particular, the court-assignment foreign key uses ON DELETE NO ACTION and DEFERRABLE INITIALLY DEFERRED. If the selected session strategy requires schema changes, explain why and the migration impact, then obtain approval before proceeding. Never target the production database for tests or migrations.

Constraints:
- Make the smallest change needed.
- Do not modify unrelated files or implement later packages.
- Do not add dependencies without asking; list proposed packages and explain their purpose in the plan.
- Do not change the database schema without explaining the migration impact and obtaining approval.
- Never read, print, commit, or request actual secret values in chat. Use placeholder-only documentation and existing ignored local configuration conventions.
- Add or update tests for authorization and session-related business logic.
- Run npm run lint, npm run typecheck, npm test, npm run build, and npm run test:e2e for UI changes before finishing. Report exact outcomes and any blocked checks; never describe unrun checks as passed.
- Summarize changed files, security considerations, remaining limitations, and manual verification steps.
- Do not mark WP-03 complete or advance the handoff until implementation and verification have been reviewed.
- Do not commit or push without explicit approval.

First, do not modify any files. Present:
1. Your understanding of the task and current repository status
2. A step-by-step implementation plan
3. Files you intend to create or change
4. Tests you intend to add
5. Proposed provider, organizer restriction, session strategy, dependencies, environment-variable names, and any migration impact
6. Any questions or risks

Wait for my approval before implementing.
```

## Definition of done

- Agreed organizer sign-in, sign-out, session handling, and server-side authorization are implemented and tested.
- Existing public pages remain accessible without authentication.
- Login and failure states receive the relevant mobile/accessibility checks.
- Required quality gates pass, or blockers are explicitly reviewed before completion is considered.
- Placeholder-only setup instructions and manual verification results are documented.
- No secrets, production operations, unrelated features, or unapproved schema/dependency changes.
- Reviewed completion is recorded in the sprint tracker; the next handoff identifies WP-04 and preserves its approval gate.

## Starter message for a new thread

Read docs/next-work-package.md on the main branch of KamuiK/volleyball-tournament-manager using the GitHub connector. Follow its current handoff instructions, inspect the referenced repository files, and present the requested plan. Do not modify files or begin implementation until I explicitly approve the plan.
