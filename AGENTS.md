# Repository conventions

## Project

Volleyball Tournament Manager is a mobile-first web application for managing one current mixed volleyball tournament. The approved MVP covers teams, groups, courts, match assignments, results, standings, knockout progression, and public read-only views.

## Working rules

- Implement only explicitly approved work packages.
- Keep changes small and focused; do not perform unrelated refactoring.
- Use conventional commit messages.
- Use TypeScript strict mode.
- Keep public pages read-only and accessible without authentication.
- Enforce organizer authorization, validation, assignment conflicts, stage locks, and progression rules on the server in later work packages.
- Keep match identity independent of court, display order, and future start times.
- Design data and interfaces so historical tournaments, German localization, and an optional public timetable can be added later.
- Never commit secrets, credentials, private configuration, real tournament data, or production logs.
- The repository is public; treat all committed content as public.

## Quality gates

Before finishing a change:

1. Run `npm run lint`.
2. Run `npm run typecheck`.
3. Run `npm test`.
4. Run `npm run build`.
5. Run `npm run test:e2e` when UI behavior changes.
6. Summarize changed files and manual verification steps.

## Commands

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run format
```

## Testing

- Use Vitest for business logic and component-level smoke tests.
- Use Playwright for user-visible E2E smoke tests.
- Add tests for scoring, ranking, qualification, locking, authorization, assignment conflicts, and reset behavior as those features are implemented.
- Do not claim WCAG conformance; maintain the practical accessibility baseline instead.

## Current scope

WP-01 establishes the repository and local foundation only. Database schema, migrations, authentication, tournament setup, scoring, standings, court assignment, knockout progression, public updating, and resets belong to later approved work packages.
