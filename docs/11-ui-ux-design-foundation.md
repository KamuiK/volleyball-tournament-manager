# UI/UX design foundation

Status: Planned | WP-02A
Created: 2026-11-06

This document establishes the shared UI and interaction decisions for the Volleyball Tournament Manager. It is documentation-first: it does not implement UI, add features, select infrastructure, or claim WCAG conformance.

WP-04 through WP-11 apply these patterns during implementation. WP-12 verifies the final implementation.

## Scope

### In scope

- Named design tokens for color, typography, spacing, radius, focus, and status communication.
- Lightweight component and interaction patterns.
- Low-fidelity wireframes or structured screen specifications.
- Accessibility implementation rules.
- A screen inventory mapped to WP-04 through WP-11.

### Out of scope

- New product features.
- Changes to tournament rules, scoring, tie-breakers, qualification, stage locks, forfeits, placements, or reset behavior.
- German localization, translation switching, themes, dark mode, animations, illustrations, or a comprehensive design system.
- WCAG conformance claims.
- Database, ORM, hosting, deployment, or authentication implementation decisions.
- Implementation of WP-04 or later work packages.
- A large Figma project or full component library.

A later, separately approved package may implement a minimal shared styling-token or base-UI-primitive foundation. This package does not implement it.

## Design tokens

Use semantic names rather than hard-coded values in feature work. Exact CSS variable names and values are implementation details for a later approved package.

| Token role | Purpose | Usage guidance |
|---|---|---|
| `action` | Primary interactive emphasis | Primary buttons, primary links, and key calls to action |
| `success` | Successful or confirmed state | Successful save, completed progression, or confirmed state |
| `warning` | Attention without failure | Stale data, unresolved tie, or non-blocking caution |
| `error` | Failure or invalid state | Validation errors, failed saves, conflicts, and blocked transitions |
| `surface` | Page and card background | Page background, cards, panels, and table containers |
| `border` | Separation and boundaries | Card borders, dividers, input borders, and table rules |
| `text` | Primary and secondary text | Headings, body text, labels, helper text, and metadata |
| `focus` | Keyboard and assistive-tech focus | `:focus-visible` outlines and focus indicators |

Status must never rely on color alone. Pair color with text, an icon with an accessible name, or another non-color visual cue.

### Typography

Define a small, consistent type scale:

- Page title
- Section heading
- Subheading
- Body text
- Secondary or metadata text
- Small helper or status text

Do not introduce a large typographic system. Use relative units and ensure text remains readable and usable at 200% zoom.

### Spacing

Define a small spacing scale for:

- Component internal padding
- Gaps between related controls
- Gaps between sections
- Page-level margins

Use consistent spacing rather than ad-hoc values. Spacing must support a 320 CSS-pixel viewport without clipping or overlap.

### Border radius

Define a small radius scale:

- No radius, where appropriate
- Small radius for inputs and compact controls
- Medium radius for cards and panels

Avoid decorative or oversized radii.

### Focus-visible styling

Every keyboard-focusable control must have a clearly visible `:focus-visible` indicator. The indicator must use the focus token and must not rely on color alone.

Do not remove default focus indicators without providing an equivalent visible replacement.

## Component patterns

### Buttons

- Use one primary action style for the main action on a screen or form.
- Use secondary styles for less prominent actions.
- Use destructive styles only for actions that delete, discard, reset, or irreversibly change data.
- Disable submit controls while a save is in progress to prevent duplicate submissions.
- Keep button labels specific: for example, “Save result”, “Remove assignment”, or “Start quarterfinals”.

### Destructive actions

Destructive actions require an explicit confirmation pattern.

- State exactly what will be removed or changed.
- Identify the affected scope, such as a court, result, group, or entire tournament attempt.
- Provide clear Cancel and Confirm choices.
- Do not imply that data can be recovered after a reset.
- Do not use a destructive action as the default or visually primary choice.

### Forms

Forms must provide:

- A visible label for every input.
- Helper text where the purpose or constraint is not obvious.
- Inline validation messages that explain what is wrong and how to fix it.
- Error messages associated with the relevant field where practical.
- A saving state that prevents duplicate submission.
- Retention of entered values after a failed save.
- No premature success indication.

### Cards, lists, and tables

- Use cards for compact, self-contained items such as a match, court, or team.
- Use lists for sequential or repeatable content.
- Use tables for standings and other data that benefits from aligned columns.
- Provide meaningful table headers.
- Ensure tables remain usable on narrow screens; use a clearly contained horizontal-scroll region only when necessary.
- Do not fabricate data in empty states.

### Badges and status

Use badges for concise status such as:

- Assigned
- Unassigned
- Completed
- Forfeit
- Provisional
- Locked
- Final

Always pair a badge with readable text. Do not communicate status through color alone.

### Empty, loading, and error states

- Empty states explain what is missing and what the user can do next.
- Loading states indicate that content is being retrieved without implying a false result.
- Error states explain the problem in plain text and preserve the user’s input or view where applicable.
- Saving failures retain entered values and clearly state that the save did not succeed.

## Page shells

### Organizer shell

The organizer shell should make the current tournament stage and primary management areas clear:

- Tournament setup
- Courts and assignments
- Group matches and results
- Standings and tie resolution
- Knockout progression
- Placements
- Resets and settings

Navigation must remain usable on a 320 CSS-pixel viewport. Avoid hidden or ambiguous controls for critical organizer actions.

### Public shell

The public shell should prioritize quick access to:

- Home or tournament overview
- Groups
- Matches and results
- Standings
- Bracket
- Placements

Public navigation must work without login and remain understandable on a phone.

## Score-entry pattern

The score-entry pattern applies to group matches, knockout matches, and the optional third-place match.

### Set-score inputs

- Provide clearly labeled inputs for each set.
- Use numeric inputs appropriate for volleyball scores.
- Show the current match phase and its applicable validation rules.
- Prevent submission of invalid or incomplete scores.
- Clearly distinguish a not-yet-entered result from a played draw or administrative forfeit.

### Saving and recovery

- Show a saving state while a result is being submitted.
- Prevent duplicate submissions while saving.
- On failure, retain all entered values.
- Explain the failure in text; do not claim success prematurely.
- Allow correction only while the relevant stage remains open.
- Confirm before replacing or discarding an existing entered result where the action is destructive.

## Public update patterns

Public pages must support:

- Manual refresh.
- Pause and resume of automatic updates.
- A visible last-successful-check time.
- A stale-data warning after a failed or delayed check.
- Preservation of filters, current view, scroll position, and focus during updates.
- Retention of the last successful data during a connection failure.

Do not imply verified live match status. Public upcoming games show assigned, uncompleted matches only.

## Screen specifications

These are low-fidelity specifications, not final visual designs. Each screen must use the shared tokens and patterns above.

### Tournament setup

**Purpose:** Let the organizer create teams, assign groups, and manage courts.

**Required states:**

- Empty setup state.
- Team list with group assignment controls.
- Court list with add and delete actions.
- Validation and conflict messages.
- Explicit action to start the group stage.

**Mapped work package:** WP-04.

### Court assignment and public upcoming games

**Purpose:** Let the organizer assign eligible matches to courts and let spectators see assigned upcoming games.

**Required states:**

- Organizer assignment list in stable round-robin order.
- Court selection and assignment controls.
- Conflict, move, and removal feedback.
- Public upcoming-games list showing assigned uncompleted matches.
- Empty state when no matches are assigned.

**Mapped work package:** WP-06.

### Group results and standings

**Purpose:** Let the organizer enter or correct completed group results and let everyone view standings.

**Required states:**

- Match list with result-entry access.
- Set-score entry form.
- Saving, failed-save, and correction states.
- Standings table with meaningful headers.
- Provisional standings indication.
- Empty state before results exist.

**Mapped work package:** WP-07.

### Tie resolution and stage transitions

**Purpose:** Let the organizer resolve qualification ties and explicitly advance stages.

**Required states:**

- Tie explanation and affected teams.
- Lot-outcome recording without score modification.
- Blocked-transition explanation.
- Explicit stage-confirmation action.
- Locked-result indication.

**Mapped work package:** WP-08.

### Knockout bracket and progression

**Purpose:** Show bracket structure, participants, results, and progression.

**Required states:**

- Bracket slots before participants are known.
- Quarterfinal, semifinal, and final progression.
- Result display and entry access where authorized.
- Locked-stage indication.
- Empty or not-yet-known participant states.

**Mapped work package:** WP-09.

### Third place, forfeits, and placements

**Purpose:** Support the optional third-place match, forfeits, and final placements.

**Required states:**

- Third-place enable/disable control.
- Forfeit selection and confirmation.
- Public forfeit labeling.
- Placement display for third and fourth where determined.
- Joint-third state when applicable.
- Confirmation before discarding an entered third-place result.

**Mapped work package:** WP-10.

### Public home, groups, matches, standings, bracket, and placements

**Purpose:** Give spectators a mobile-first, read-only tournament view.

**Required states:**

- Public home or overview.
- Groups and standings.
- Match lists and results.
- Bracket.
- Placements.
- Loading, empty, stale-data, and error states.
- Refresh and pause controls.

**Mapped work package:** WP-11.

## Accessibility implementation rules

### Layout

- Design mobile-first for a 320 CSS-pixel viewport.
- Avoid clipped controls, overlapping text, and horizontally cramped forms.
- Use a clearly contained horizontal-scroll region only for inherently wide data such as standings or brackets.
- Preserve usability at 200% text zoom.

### Touch targets

- Primary buttons and score-entry controls target at least 44×44 CSS pixels.
- Other controls meet a 24×24 CSS-pixel target or use appropriate spacing exceptions.

### Contrast and status

- Maintain 4.5:1 contrast for normal text and 3:1 contrast for large text.
- Do not rely on color alone to communicate status, errors, success, or warnings.
- Pair visual status with text or an accessible icon name.

### Labels and tables

- Label every input visibly.
- Use meaningful table headers for standings and result data.
- Explain errors in text, including what is wrong and how to resolve it.

### Focus and updates

- Preserve scroll position, filters, current view, and focus during public updates.
- Do not deliberately steal focus during routine background updates.
- Provide a visible focus indicator for keyboard users.

### Destructive actions

- Provide clear Cancel and Confirm choices.
- State the exact destructive consequence.
- Do not imply recovery or undo after a reset.

## Screen inventory

| Screen or state | Primary user | Work package |
|---|---|---|
| Tournament setup: teams, groups, courts | Organizer | WP-04 |
| Court assignment | Organizer | WP-06 |
| Public upcoming games | Spectator | WP-06 |
| Group match list and result entry | Organizer | WP-07 |
| Group standings | Organizer and spectator | WP-07 |
| Tie resolution | Organizer | WP-08 |
| Stage transition and lock states | Organizer | WP-08 |
| Knockout bracket | Organizer and spectator | WP-09 |
| Knockout result entry | Organizer | WP-09 |
| Third-place control and result | Organizer | WP-10 |
| Forfeit entry and confirmation | Organizer | WP-10 |
| Placements | Organizer and spectator | WP-10 |
| Public home | Spectator | WP-11 |
| Public groups | Spectator | WP-11 |
| Public matches and results | Spectator | WP-11 |
| Public standings | Spectator | WP-11 |
| Public bracket | Spectator | WP-11 |
| Public placements | Spectator | WP-11 |
| Public refresh, pause, stale-data, loading, empty, and error states | Spectator | WP-11 |

## Implementation boundary

This document does not implement UI or select implementation details. A later, separately approved package may introduce shared styling tokens or base UI primitives.

WP-04 through WP-11 must apply these patterns. WP-12 remains the final quality, accessibility, and deployment verification package.
