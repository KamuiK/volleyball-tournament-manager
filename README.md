# Volleyball Tournament Manager

**WIP — Work in progress.**

A mobile-first web application for managing a mixed volleyball tournament: teams, courts, match assignments, results, standings, and knockout progression.

## Status

This repository is in the early setup phase.

- Phase 1 requirements and MVP scope: approved
- Phase 2 architecture: approved
- Phase 3 work-package planning: approved
- WP-01 — Repository, tooling, and environment setup: approved
- Implementation: not started

## Project documentation

- [Product brief](docs/01-product-brief.md)
- [Personas and use cases](docs/02-personas-and-use-cases.md)
- [Functional requirements](docs/03-functional-requirements.md)
- [Non-functional requirements](docs/04-non-functional-requirements.md)
- [Open questions and decisions](docs/05-open-questions.md)
- [Sprint plan](docs/10-sprint-plan.md)
- [Tournament format baseline](docs/tournament-format-baseline.md)

## Scope

The MVP supports one current amateur mixed-volleyball tournament with 10–12 teams, two groups, manual court assignment, completed-match result entry, standings, knockout progression, and public mobile-first views.

The application is English-only at launch. Public pages are read-only and do not require an account. Organizer mutations, resets, settings, and stage transitions will require server-side authorization.

## Intended technology

The approved architecture is:

- Next.js App Router
- TypeScript
- Neon PostgreSQL
- Drizzle ORM
- Next.js Server Actions
- Auth.js
- Vitest
- Playwright
- Vercel hosting
- Public GitHub repository

The local foundation, database schema, authentication, and tournament functionality are introduced in later approved work packages.

## Development

Local setup instructions will be added once the Stage 2 project foundation is created.

## Security

Do not commit secrets, credentials, private configuration, real tournament data, or production logs. The repository is public.
