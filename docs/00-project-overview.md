# Project overview and status

Last updated: 6 November 2026

## Project

Volleyball Tournament Manager is a mobile-first web application for managing one current amateur mixed-volleyball tournament. It will support teams, groups, courts, match assignments, completed-match results, standings, knockout progression, and public read-only views.

The MVP supports 10–12 teams in two groups, with manual court assignment and result entry from paper score sheets. Public visitors can view upcoming assigned games, results, standings, and the bracket without an account.

## Approved architecture

- Next.js App Router
- TypeScript with strict mode
- Neon PostgreSQL
- Drizzle ORM
- Next.js Server Actions
- Auth.js
- Vitest
- Playwright
- Vercel hosting
- Public GitHub repository
- Existing Cloudflare-managed domain

The application is English-only at launch. Public pages are read-only. Organizer mutations, resets, settings, and stage transitions require server-side authorization.

## Current status

| Area | Status |
|---|---|
| Phase 1 requirements and MVP scope | Approved |
| Phase 2 architecture | Approved |
| Phase 3 work-package planning | Approved |
| WP-01 repository and local foundation | Complete |
| WP-02 database schema and migrations | Not started; approval required |
| WP-03 organizer authentication | Not started; approval required |
| WP-04 tournament setup | Not started; approval required |
| Public deployment | Not started |

## WP-01 results

WP-01 established the repository baseline and local development foundation.

### Completed

- Created the initial GitHub commit with the approved Phase 1 documentation, WIP README, and .gitignore.
- Created a minimal Next.js App Router application with TypeScript.
- Enabled TypeScript strict mode.
- Added ESLint and Prettier.
- Added Vitest and Playwright.
- Added an accessible home page identifying the Volleyball Tournament Manager.
- Added a Vitest smoke test for the home page.
- Added a Playwright smoke test that loads the home page and checks the application heading.
- Added AGENTS.md with repository and AI-coding-agent conventions.
- Added .env.example with placeholder environment-variable names only.
- Added a GitHub Actions workflow for pushes and pull requests targeting main.
- Configured the project for Vercel compatibility.

### Verification results

| Check | Result |
|---|---|
| ESLint | Passed |
| TypeScript typecheck | Passed |
| Vitest unit smoke test | Passed: 1 test |
| Playwright E2E smoke test | Passed: 1 test |
| Production build | Passed |
| Initial documentation commit | Pushed to main |
| Foundation commit | Pushed to main |

### Security follow-up

The initial dependency installation reported 11 npm audit findings: 8 moderate, 1 high, and 2 critical. The critical and high findings are in development and build tooling, not in the current production runtime:

- `tinypool` critical findings are associated with the Vitest test runner.
- `@vitest/mocker` moderate findings are associated with Vitest.
- `postcss` high findings are associated with Next.js build dependencies.
- `minimatch` moderate findings are associated with TypeScript ESLint tooling.

`npm audit fix --force` was intentionally not run during WP-01 because it would require breaking upgrades to Next.js 16 and Vitest 5.

Before public deployment in WP-12, perform a dedicated dependency-security upgrade and verify:

```bash
npm install next@latest react@latest react-dom@latest eslint-config-next@latest
npm install -D vitest@latest @vitejs/plugin-react@latest
npm audit
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
```

The `esbuild` and `fsevents` install scripts were explicitly approved for this project.

## Next work package

WP-02 — Database schema and migrations is the next approved-candidate package, but it requires explicit approval before implementation.

It will introduce the Neon PostgreSQL connection, Drizzle ORM, initial schema, migration tooling, and database-related environment conventions. It must not implement tournament features beyond the approved data foundation.

## Repository links

- Repository: https://github.com/KamuiK/volleyball-tournament-manager
- Product brief: docs/01-product-brief.md
- Personas and use cases: docs/02-personas-and-use-cases.md
- Functional requirements: docs/03-functional-requirements.md
- Non-functional requirements: docs/04-non-functional-requirements.md
- Open questions and decisions: docs/05-open-questions.md
- Sprint plan: docs/10-sprint-plan.md
