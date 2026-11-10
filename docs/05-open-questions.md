# Decisions, open questions, and deferred items

Baseline approved: 2026-11-05
Requirements consolidated from the approved workshop. No architecture or implementation approval implied.

## Decision register
All decisions below were agreed on 2026-11-05.

| ID | Topic / options considered | Decision |
|---|---|---|
| D-01 | 10-team-only versus 10–12; alternate formats | 10–12, two groups; retain existing rules document |
| D-02 | 11/12-team grouping and qualification | 5+6 / 6+6; top four per group |
| D-03 | Standard best-of-three versus supplied rules | Supplied phase-specific scoring and tie-breakers |
| D-04 | Timed schedule versus no schedule | No times/optimization in MVP; public timetable future feature |
| D-05 | Organizer/live scorekeepers/captains | One operator enters collected paper-sheet results |
| D-06 | Approval versus immediate publication | New results and corrections publish on save |
| D-07 | Dependency edits versus stage locks | Explicit stage confirmations; locked prior results; no reopening |
| D-08 | Required/optional third-place match | Optional, changeable until finalization |
| D-09 | No match / fallback placement | Semifinal signed point difference; equal means joint third |
| D-10 | Manual versus automatic public refresh | Always-enabled ~5-minute visible checks, return check, manual refresh, last successful check, stale indication; no user pause control |
| D-11 | English/German/bilingual | English-only, German-ready |
| D-12 | Local-only/public access | Public before event; existing Cloudflare domain; HTTPS |
| D-13 | Rosters versus team-level details | Team names only |
| D-14 | Multiple events/history interface | One current event; history-ready design, no history UI |
| D-15 | Archive resets versus discard | Discard reset attempts; granular and full reset |
| D-16 | Forfeit score and ranking impact | 2–0, 21–0/21–0, include administrative points |
| D-17 | Neither team available for third place | Disable match, use semifinal comparison |
| D-18 | Dedicated withdrawal/unfinished logic | Individual forfeits for withdrawals; no unfinished-match workflow |
| D-19 | Audit history and backup/export | Excluded |
| D-20 | Exceptional double absence elsewhere | Organizer resolves outside application |
| D-21 | Accessibility testing breadth | Practical baseline; no dedicated keyboard/screen-reader test pass |
| D-22 | Court setup and upcoming view | Named courts, manual assignments, public assigned matches |
| D-23 | Court queues/simultaneous assignments | One uncompleted match per court and per team |
| D-24 | Scope approval | Updated full MVP approved at 23:52 CET |
| D-25 | UI/UX design foundation | Add WP-02A as a documentation-first UI/UX design-foundation package. Scope: design tokens, component and interaction patterns, wireframes/screen specifications, accessibility implementation rules, and screen inventory. Exclusions: no implementation, no new features, no full design system, no localization, no WCAG conformance claim. Dependency: WP-01. Blocks: WP-04 and later UI-heavy packages. Decision date: 2026-11-06. |
| D-26 | Visual direction, typography, icons, and theming | Minimal, clean, content-first Apple-like mobile-web direction; system font stack; Lucide-style minimal icons rather than SF Symbols; token-based light theme with future palette/dark-mode adaptability; small reusable component inventory. No theme switching, dark mode, localization, or full design system in MVP. Decision date: 2026-11-06. |

## Open product-scope questions
None blocking the approved MVP baseline. New requirements require explicit scope review.

## Phase 2 decisions — intentionally deferred
| ID | Topic | Options / direction | Status |
|---|---|---|---|
| P2-01 | Hosting | Evaluate Vercel, Cloudflare, or homelab/Docker against approved needs; domain provider does not dictate host | Open |
| P2-02 | Stack, storage, ORM, migrations | Small conventional stack; reversible choices; persistent data and history-ready boundaries | Open |
| P2-03 | Organizer authentication | GitHub OAuth through Auth.js v5; GitHub username allowlist via `ORGANIZER_GITHUB_LOGINS`; JWT sessions; exact dependency pin `next-auth@5.0.0-beta.32`; no public registration or user-management interface | Resolved; decision date: 2026-11-10. WP-03 complete; verification results and limitations are recorded in `docs/10-sprint-plan.md`. Production OAuth configuration remains deferred to deployment. |
| P2-04 | Domain and deployment | Exact hostname, DNS, HTTPS, environments, secrets, maintenance | Open |
| P2-05 | Verification | Repeatable device/network and spectator-load profile, browsers, unit/integration/E2E tooling | Open |
| P2-06 | Pairing details | Deterministic round-robin/interleave algorithm, handling unequal round sizes, presentation | Open; preserve approved stable guidance order |
| P2-07 | Setup safeguards | Team-name ambiguity validation and safe editing boundaries after play starts | Open; cannot invalidate recorded results |
| P2-08 | Tie entry UI | Record organizer-performed lot outcome without changing scores | Open implementation detail |
| P2-09 | Reset presentation | State after each granular reset, setting defaults, dependent-data clearing | Open implementation detail; destructive boundaries fixed |
| P2-10 | Repository and agents | Git/GitHub, AGENTS.md, Codex Free workflow; later Hermes/OpenRouter compatibility | Open |

## Carry-forward design checks
- Match identity independent of court, display order, or future start time.
- Results/standings do not require schedule information.
- Represent bracket slots before participants are known.
- Court assignment conflicts use uncompleted assignments, not live-status detection.
- Locking results must not inherently lock future timetable editing.
- Historical tournament separation possible without adding historical UI now.
- Localization possible later; no speculative paid tooling or scheduling engine.

## Assumptions and accepted limitations
- One active operator/client; no concurrency editing interface.
- Upcoming means assigned and without a recorded result, not verified live.
- Paper entry can lag play; a court cannot receive another assignment until released by result entry or explicit unassignment.
- Signed semifinal point difference is an accepted placement convention despite different opponents/set counts.
- No automatic third/fourth assignment beyond agreed rules; no comprehensive lower-place ranking.
- Archived history is not created by reset; retention/start-next-event workflow remains future work.
- Stage transitions are operational approvals, confirmed before next-stage play.

## Next steps
1. Review these consolidated documents for transcription errors, not reopen approved scope implicitly.
2. Begin Phase 2 architecture and technical setup evaluation.
3. Produce architecture/setup/deployment/model documents, README and AGENTS drafts.
4. Plan implementation work packages only after architecture decisions.
5. No implementation until work-package breakdown and first package are explicitly approved.
