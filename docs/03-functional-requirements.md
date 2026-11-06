# Functional requirements

Status: Approved MVP baseline | 2026-11-05

## FR-01 — Current tournament and setup
Expose one current tournament only. No tournament picker, history interface, or multi-active management. Support 10–12 team names and two groups (5+5, 5+6, 6+6). Require every team to have one group, valid group sizes, and at least one named court before explicit Start group stage.
Courts require nonempty distinguishable names. Delete unused courts; block deletion with an active assignment. Preserve recorded court names on completed matches.
Do not expose ordinary edits that invalidate already-created results or participants; resets are the supported restart mechanism. Exact setup-edit boundaries are finalized in Phase 2 without weakening stage locks.

## FR-02 — Pairings and ordering
Single round robin within each group. Top four per group qualify; no cross-group points comparison. Show uncompleted group matches in stable round-robin rounds, interleaving groups. A five-team group has two matches and one bye per round; a six-team group has three matches per round. Display order is guidance, not an enforced time/rest schedule.

## FR-03 — Court assignment
Manually assign eligible matches. One uncompleted assigned match per court, per team, and one court per match. Reject conflicts with explanatory messages. Move only to a free court; remove assignments freely while uncompleted. Save of result or forfeit releases court and teams. Maintain historical court information on completed matches. Knockout assignments require an open round and known participants.
Public upcoming games contain assigned uncompleted matches only, showing teams, group/round, court. No court queue, times, or live-start action. Unassigned matches may appear in general lists/bracket.

## FR-04 — Group scoring
Exactly two fully played sets to 21; no two-point advantage; 21–20 valid. No deciding set. Results 2–0, 1–1, 0–2. Win 2 table points, draw 1 each, loss 0.
Rank by: (1) table points; (2) total rally-point difference; (3) total rally points scored; (4) head-to-head if exactly two teams remain tied; (5) drawing lots. Apply criteria to remaining tied teams; head-to-head cannot resolve a drawn direct match. A remaining tie must have an organizer-recorded lot outcome before quarterfinals, without score manipulation.
Difference = points scored minus points conceded across all group sets. Display rank, team, played, wins, draws, losses, points for/against, difference, table points. Incomplete standings are provisional.

## FR-05 — Knockout bracket and scoring
- QF1 A1–B4; QF2 A2–B3; QF3 A3–B2; QF4 A4–B1.
- SF1 winner QF1–winner QF3; SF2 winner QF2–winner QF4.
- Final: semifinal winners; optional third place: semifinal losers.
First two sets to 21, win by two, cap 23 (23–22 valid). At 1–1, deciding set to 11 without two-point advantage. No third set after 2–0; no draws.
Validation accepts only nonnegative integer scores and valid set endings; reject impossible additional points or sets.

## FR-06 — Entry, publication, and corrections
One authorized operator enters completed set scores from physical sheets. Derive match result. Successful save immediately updates public data and calculations; existing clients see it on their next successful check. No approval or audit trail. Permit corrections only in the open stage, subject to score validation. Reject invalid writes without replacing saved data. Result entry does not require a prior court assignment, allowing paper-sheet entry even if assignment was missed.

## FR-07 — Stage control
Explicit transitions: setup → groups → quarterfinals → semifinals → final stage → finalized.
- Start quarterfinals locks all group results and standings, resolves qualifiers.
- Start semifinals locks quarterfinal results.
- Start final stage locks semifinal results.
- Finalize locks final/third-place results as applicable.
Each transition requires complete valid required matches and confirmation. Group transition also requires resolved rankings. No automatic transitions, normal unlocking, or reopening. Block locked edits beyond merely hiding UI controls. Reset is a whole-attempt restart, not selective unlock.

## FR-08 — Third place
Toggle the match until finalization. Enabled: its result determines third/fourth and is required to finalize. Disabled: compare semifinal losers' signed total point differences across their respective semifinal sets, including deciding/forfeit sets. Higher difference third, other fourth; equal means joint third and no fourth. Do not compare other matches or apply further tie-breakers.
One-team forfeit in third-place match awards opponent third. If neither can play, organizer disables match. Confirm discarding an existing third-place result. Removing an uncompleted third-place match also releases its court/team assignments.

## FR-09 — Forfeits and withdrawals
Award 2–0 with 21–0, 21–0; public label Forfeit. Count administrative scores in table totals and semifinal placement comparison. Forfeit applies to one match only. Individual forfeits cover withdrawals, preserving earlier results. No bulk action or dedicated interrupted-match logic. Other exceptional double absences are organizer-resolved outside the app. Do not invent artificial winners automatically.

## FR-10 — Public pages and updating
Public current-tournament groups, match lists, assigned upcoming games, set results, standings, bracket, and determined placements. No login. Check approximately every 30 seconds when visible and on return; pause in background. Provide Refresh, Pause automatic updates, last successful check time. Preserve filters, current view, scroll, and focus during updates. Retain data on connection failure with outdated-data notice. Finalized data remains public; stop periodic checks once final state received.

## FR-11 — Resets
All require authorized access and explicit destructive confirmation, at any stage. No archive or undo.
| Action | Clear | Keep |
|---|---|---|
| Results/progress | Scores, derived progress, knockout participants/progression, stage locks, active assignments | Teams, group membership, court list, settings |
| Groups | Group assignments and dependent matches/results/progress/assignments | Team names, courts, settings |
| Teams | Teams and dependent groups/matches/results/progress/assignments | Courts, settings |
| Everything | All current tournament data including courts/settings | Return to initial setup |
Clear dependent lot decisions and placements when their source results/groups are reset. Results/progress reset retains group membership; pairings may be regenerated. Any reset requiring setup review returns to preparation rather than implicitly starting matches. Exact presentation is a Phase 2/3 detail.

## FR-12 — Empty, loading, error, and edge cases
- Explain empty setup, no published assignments, no results, and not-yet-known bracket participants without fabricated scores.
- Show loading and saving states; prevent repeat submissions.
- Distinguish not-yet-entered from a played draw and an administrative forfeit.
- Keep input after failed saves; never claim success prematurely.
- Describe assignment/deletion conflicts and transition blockers.
- Destructive changes and resets affect public data on the next check.
- Keep final outcome visible until a destructive reset.

## FR-13 — Future boundaries
History-ready design, but no historical UI or retention on reset. English-only with later German possible. Future optional times and scheduling must not define match identity or scoring; schedule edits and result locks must remain separate concepts. No timetable or automated scheduling in MVP.

## UI/UX design foundation

WP-02A establishes a documentation-first UI/UX design foundation for the MVP. It defines reusable design tokens, component and interaction patterns, low-fidelity screen specifications, accessibility implementation rules, and a screen inventory for WP-04 through WP-11.

### Design tokens

Define named, reusable decisions for:

- Color roles: action, success, warning, error, surface, border, text, and focus.
- Typography scale.
- Spacing scale.
- Border radius.
- Focus-visible styling.
- Status indication that does not rely on color alone.

### Component and interaction patterns

Establish lightweight patterns for:

- Buttons, destructive-action confirmation, forms, labels, helper text, validation, and error messages.
- Cards, lists, tables, badges, empty states, loading states, and error states.
- Organizer page shell and navigation.
- Public page shell and navigation.
- Score entry: set-score inputs, validation, saving state, failed-save recovery, correction, and confirmation.
- Public match, standings, bracket, placement, refresh, pause, stale-data, and manual-refresh patterns.

### Screen specifications

Provide low-fidelity wireframes or structured specifications for:

- Tournament setup: teams, groups, and courts.
- Court assignment and public upcoming games.
- Group results and standings.
- Tie resolution and stage transitions.
- Knockout bracket and progression.
- Third place, forfeits, and placements.
- Public home, groups, matches, standings, bracket, and placements.

### Accessibility implementation rules

Establish implementation rules for:

- Mobile-first layout at a 320 CSS-pixel viewport width.
- Usable layout at 200% text zoom.
- Minimum touch-target guidance.
- Contrast expectations.
- Clear labels and meaningful table headers.
- Text explanations for errors.
- Focus behavior and preservation of scroll/view state during updates.
- Clear cancel/confirm choices for destructive actions.

### Application boundaries

WP-02A establishes patterns only. It does not add features, implement UI, select infrastructure, or claim WCAG conformance. WP-04 through WP-11 apply these patterns during implementation; WP-12 verifies the final implementation.

These patterns do not alter FR-01 through FR-13, including scoring, tie-breakers, qualification, stage locks, forfeits, placements, resets, or authorization rules.
