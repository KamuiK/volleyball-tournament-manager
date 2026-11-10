# Volleyball Tournament Manager

**Work in progress.**

A mobile-first web application for managing a mixed volleyball tournament: teams, courts, match assignments, results, standings, and knockout progression.

## Current status

- Phase 1 requirements and MVP scope: approved
- Phase 2 architecture: approved
- Phase 3 work-package planning: approved
- WP-01 — Repository, tooling, and environment setup: complete
- WP-02A — UI/UX design foundation: complete
- WP-02 — Database schema and migrations: complete
- WP-03 — Organizer authentication and authorization: next
- Implementation is in progress

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

The application is English-only at launch. Public pages are read-only and do not require an account. Organizer mutations, resets, settings, and stage transitions require server-side authorization.

## Technology

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

## Repository structure

- `app/` — Next.js App Router application
- `src/` — shared application source code
- `docs/` — product, architecture, and planning documentation
- `drizzle/` — database migrations
- `tests/` — automated tests
- `.github/` — repository and CI configuration

## Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

### Organizer authentication (local)

1. Create a GitHub OAuth App in GitHub Developer Settings. Set its authorization callback URL to `http://localhost:3000/api/auth/callback/github`.
2. Copy `enviroments/.env.example` to the ignored `.env.local` file in the repository root.
3. Set `AUTH_SECRET` to a newly generated value (`openssl rand -base64 32`), set `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET` to the OAuth App values, and set `ORGANIZER_GITHUB_LOGINS` to the comma-separated GitHub usernames allowed to organize.
4. Start the app with `npm run dev`, open `/login`, and complete GitHub sign-in. Verify `/organizer` is available to an allowlisted account and rejected for a non-allowlisted account; verify `/` remains public. Sign out using the control on `/organizer`.

Automated tests use mocked sessions and do not require OAuth credentials. Never put real secrets or personal allowlist values in tracked files. Provider credentials and GitHub callback behavior require a separate manual local check.

Run linting and tests:

```bash
npm run lint
npm run test
```

Database migrations are managed with Drizzle and target Neon PostgreSQL. Environment-specific configuration is stored outside version control.

## Security

Do not commit secrets, credentials, private configuration, real tournament data, or production logs. The repository is public.
