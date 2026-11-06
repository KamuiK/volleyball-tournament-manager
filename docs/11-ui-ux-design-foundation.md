# UI/UX design foundation

Status: Planned | WP-02A
Created: 2026-11-06

This document establishes the shared UI and interaction decisions for the Volleyball Tournament Manager. It is documentation-first: it does not implement UI, add features, select infrastructure, or claim WCAG conformance.

WP-04 through WP-11 apply these patterns during implementation. WP-12 verifies the final implementation.

Business rules remain defined in [Functional requirements](03-functional-requirements.md) and the [Tournament format and scoring baseline](tournament-format-baseline.md). This document describes presentation and interaction only; if a screen question appears to conflict with those sources, follow the approved rules and resolve the discrepancy through the project approval process.

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

| Token role | Purpose                       | Usage guidance                                                                                                |
| ---------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `action`   | Primary interactive emphasis  | Primary buttons, links, and key calls to action; keep text and icons legible against the action fill          |
| `success`  | Successful or confirmed state | Successful save or completed progression; pair with a short status label or icon                              |
| `warning`  | Attention without failure     | Stale data, unresolved tie, or non-blocking caution; include a concise explanation                            |
| `error`    | Failure or invalid state      | Validation errors, failed saves, conflicts, and blocked transitions; include a recovery action where possible |
| `surface`  | Page and card background      | Page background, cards, panels, and table containers; allow nested surfaces to remain distinguishable         |
| `border`   | Separation and boundaries     | Card borders, dividers, input borders, and table rules; do not use as the only status indicator               |
| `text`     | Primary and secondary text    | Headings, body text, labels, helper text, and metadata; use adequate contrast on every surface                |
| `focus`    | Keyboard focus                | `:focus-visible` outlines and focus indicators; ensure the outline contrasts with adjacent surfaces           |

The visual direction is minimal, clean, and content-first, with an Apple-like mobile-web feel without copying a proprietary operating-system interface. Use a token-based light theme that can accept a future palette and dark-theme adaptation. MVP does not include theme switching or dark mode.

Use one consistent, minimal outline icon style. Lucide is the recommended default if icons are needed. Do not use SF Symbols in the web application; Apple licenses them for Apple-platform software. Icons supplement labels and never replace a necessary text label.

Status must never rely on color alone. Pair color with readable status text, a clearly named icon, or another non-color visual cue. The same rule applies to errors, success, warnings, disabled states, and selected states.

### Typography

Use the system font stack `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`. Use this compact type scale as a starting point; values are relative so text can resize:

| Role            | Starting size | Typical use                                                          |
| --------------- | ------------: | -------------------------------------------------------------------- |
| Page title      |       1.75rem | One title per screen                                                 |
| Section heading |      1.375rem | Main content sections                                                |
| Subheading      |      1.125rem | Cards and grouped content                                            |
| Body            |          1rem | Main reading and controls                                            |
| Secondary       |      0.875rem | Supporting metadata                                                  |
| Helper/status   |      0.875rem | Hints and concise status; do not make essential instructions smaller |

Use a comfortable body line height (about 1.5) and tighter heading line heights (about 1.2). Do not introduce a large typographic system. Ensure text remains readable and usable at 200% zoom.

### Spacing

Use a consistent 4px-based spacing scale: 4, 8, 12, 16, 24, 32, and 48px. Use 4–8px for tight related items, 12–16px for control padding and card content, 24–32px between sections, and 16px page gutters on narrow screens. Choose the smallest value that preserves clear grouping; avoid one-off spacing values without a layout need. At 320 CSS pixels, content must reflow without clipping or overlap.

### Border radius

Use a small radius scale: 0px for square edges where appropriate, 4px for compact controls and inputs, and 8px for cards and panels.

Avoid decorative or oversized radii.

### Focus-visible styling

Every keyboard-focusable control must have a clearly visible `:focus-visible` indicator. Use a 2–3px outline in the `focus` role with a 2px offset where space allows. The indicator must remain visible against adjacent surfaces and must not rely on color alone; use a defined outline shape and do not clip it with overflow rules.

Do not remove default focus indicators without providing an equivalent visible replacement.

When a dialog opens, move focus into it and keep keyboard focus within it until it closes. Return focus to the control that opened it on close. Routine data refreshes must not move focus.

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
- Present the consequence before confirmation. Use a dialog for high-impact actions where interruption is appropriate; for a simpler removal, use an inline confirmation pattern that still makes Cancel and Confirm explicit.
- Give Cancel a clear, immediately available action. On cancellation, leave the user's current view and entered values intact.

### Forms

Forms must provide:

- A visible label for every input.
- Helper text where the purpose or constraint is not obvious.
- Inline validation messages that explain what is wrong and how to fix it.
- Error messages associated with the relevant field where practical.
- A saving state that prevents duplicate submission.
- Retention of entered values after a failed save.
- No premature success indication.
- Keep labels visible when fields contain values; placeholder text is not a label.
- State validation constraints before submission when they are known. Validate on submission and, where useful, after the user has interacted with a field; avoid announcing errors on every keystroke.
- Identify invalid fields in text and associate the error with its field. On submit failure, focus an error summary or the first invalid field and preserve all entered values.
- After a successful save, show a concise confirmation and return focus predictably without unexpectedly changing the surrounding view.

### Cards, lists, and tables

- Use cards for compact, self-contained items such as a match, court, or team.
- Use lists for sequential or repeatable content.
- Use tables for standings and other data that benefits from aligned columns.
- Provide meaningful table headers.
- Ensure tables remain usable on narrow screens; use a clearly contained horizontal-scroll region only when necessary.
- Do not fabricate data in empty states.
- On narrow screens, prefer stacked match/team cards for content that does not need column comparison. Keep repeated card labels explicit so each item is understandable when read out of context.
- For tables, use a caption or nearby heading, column headers, and row headers where they aid understanding. Keep horizontal scrolling within a labeled table region rather than making the whole page scroll sideways.

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
- Use a stable loading message or skeleton only when it does not suggest that placeholder values are real data. For errors, state what failed, whether saved data is still current, and the next available action.

## Reusable component inventory

This inventory names patterns for later packages; it does not authorize implementation in WP-02A.

| Component or pattern      | Use and minimum behavior                                                                         |
| ------------------------- | ------------------------------------------------------------------------------------------------ |
| Button                    | Primary, secondary, and destructive variants; text label; visible focus and disabled/busy states |
| Input and form field      | Input with a visible label, optional helper, validation, and error association                   |
| Label                     | Persistent visible name for every input                                                          |
| Helper text               | Short constraint or instruction linked to the field where practical                              |
| Validation message        | Specific issue and correction guidance, shown near the affected field                            |
| Error message             | Plain-language failure, impact, and recovery action where available                              |
| Card                      | Bounded, self-contained match, team, court, or summary content                                   |
| Badge                     | Short text status with a non-color cue                                                           |
| List pattern              | Repeated items with consistent headings, actions, and empty state                                |
| Table pattern             | Caption/heading, meaningful headers, responsive contained overflow if needed                     |
| Empty state               | What is absent and the next relevant action or explanation                                       |
| Loading state             | Retrieval/saving progress without false result data; prevent duplicate submission when saving    |
| Error state               | Failure explanation and recovery; preserve input or last successful public data                  |
| Confirmation pattern      | Clear consequence with Cancel and Confirm; dialog or inline form as appropriate                  |
| Page shell and navigation | Shared page structure, current location, and accessible navigation for organizer or public use   |

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
Show the tournament name and current stage in the page context. Group related tasks in a simple navigation structure, indicate the current location in text or semantics, and keep high-frequency actions reachable without making every screen compete for equal emphasis. Access control and mutation authorization are governed by later implementation packages; the interface must not imply that public visitors can edit.

### Public shell

The public shell should prioritize quick access to:

- Home or tournament overview
- Groups
- Matches and results
- Standings
- Bracket
- Placements

Public navigation must work without login and remain understandable on a phone.
Keep the same public navigation order across screens and clearly identify the selected section. Make the tournament identity visible, keep the page read-only, and provide refresh status near the content it describes.

## Score-entry pattern

The score-entry pattern applies to group matches, knockout matches, and the optional third-place match.

### Set-score inputs

- Provide clearly labeled inputs for each set.
- Use numeric inputs appropriate for volleyball scores.
- Show the current match phase and its applicable validation rules.
- Prevent submission of invalid or incomplete scores.
- Clearly distinguish a not-yet-entered result from a played draw or administrative forfeit.
- Present each set as a labeled pair of team score fields, with team names repeated or otherwise kept unambiguous. Use input modes that make numeric entry convenient on mobile without assuming every browser provides the same numeric keypad.
- Put a short, phase-specific rules hint near the fields and link its details to the approved functional requirements and format baseline. The interface must not invent or restate conflicting scoring rules.
- Explain invalid or incomplete values in text beside the relevant field or in a summary. Do not silently clamp or alter a score.

### Saving and recovery

- Show a saving state while a result is being submitted.
- Prevent duplicate submissions while saving.
- On failure, retain all entered values.
- Explain the failure in text; do not claim success prematurely.
- Allow correction only while the relevant stage remains open.
- Confirm before replacing or discarding an existing entered result where the action is destructive.
- While saving, label the action as in progress, prevent repeat submission, and keep the entered scores visible. On a failed save, identify that the result was not saved and offer retry while retaining the form. On success, show the saved result and a clear correction action only when permitted by the stage state.
- If another operation has locked the stage, explain why editing is unavailable and preserve the entered form for copying or review where feasible; do not imply the edit succeeded.

## Public update patterns

Public pages must support:

- Manual refresh.
- A visible last-successful-check time.
- A stale-data warning after a failed or delayed check.
- Preservation of filters, current view, scroll position, and focus during updates.
- Retention of the last successful data during a connection failure.
- A timestamp label with an unambiguous local time or relative age (for example, “Updated 2 minutes ago”) and a visible manual refresh action.
- Automatic checks about every 5 minutes while the page is visible and a check when the visitor returns. Updates remain enabled with no user pause control; periodic checks may suspend while the page is in the background.
- A stale-data message that distinguishes the last successful update from the failed check and offers retry. Keep the last successful content available while showing that it may be out of date.
- Match cards that distinguish assigned upcoming matches from completed results without implying that an assigned match is currently being played.
- Standings with readable rank, team, and statistic labels; bracket paths that remain understandable on narrow screens; and placements that label each determined or joint placement in text.

Do not imply verified live match status. Public upcoming games show assigned, uncompleted matches only.

## Screen specifications

These are low-fidelity specifications, not final visual designs. Each screen must use the shared tokens and patterns above.

### Tournament setup

**Purpose:** Let the organizer create teams, assign groups, and manage courts.

**Required states:**

- Empty setup state.
- Team list with team-name fields and explicit group assignment controls; identify the two groups consistently.
- Court list with named courts, add action, and delete action with a clear explanation when deletion is unavailable.
- Validation and conflict messages.
- Setup summary showing configured teams, group allocation, and courts before an explicit action to start the group stage.
- Confirmation and resulting locked/setup state after the stage transition, following approved rules.

**Low-fidelity layout:** Page title and stage → setup summary → Teams section with one team row per entry and group control → Courts section with named rows and add/remove actions → validation summary → primary “Start group stage” action. On phones, each row stacks its name and control; no essential action depends on a wide table.

**Mapped work package:** WP-04.

### Court assignment and public upcoming games

**Purpose:** Let the organizer assign eligible matches to courts and let spectators see assigned upcoming games.

**Required states:**

- Organizer assignment list in stable round-robin order.
- Court selection and assignment controls.
- Conflict, move, and removal feedback.
- Public upcoming-games list showing assigned uncompleted matches.
- Empty state when no matches are assigned.
- Assignment list grouped or filtered by group/round, with an unmistakable unassigned/assigned label and a court control for each eligible match.
- Feedback after assignment, move, or removal, plus a plain-language conflict explanation and a next step.

**Low-fidelity layout:** Organizer: title and assignment guidance → optional group/round filters → match rows/cards with teams, round identity, assignment state, and court selector → inline conflict or save feedback. Public: “Upcoming games” heading → assigned uncompleted match cards with teams, group/round, and court → updated time → empty or stale state as applicable.

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
- Group selector or clear group headings so visitors can tell which standings they are viewing.
- Distinguish played results, missing results, and provisional standings using text and symbols in addition to color.

**Low-fidelity layout:** Group heading and match list → each match card shows teams, round, result status, and organizer result action → selected match opens labeled set-score form → standings section/table with a clear provisional label and horizontally contained overflow only if required.

**Mapped work package:** WP-07.

### Tie resolution and stage transitions

**Purpose:** Let the organizer resolve qualification ties and explicitly advance stages.

**Required states:**

- Tie explanation and affected teams.
- Lot-outcome recording without score modification.
- Blocked-transition explanation.
- Explicit stage-confirmation action.
- Locked-result indication.
- Explain which ranking criteria left the teams tied and identify the affected places/qualification slots using the approved requirements as source.
- Show the organizer-recorded lot outcome as a distinct recorded decision, not as a score or match result.
- Before transition, summarize what becomes locked and what stage opens; provide clear Cancel and Confirm choices.

**Low-fidelity layout:** Tie alert → tied teams and affected qualification positions → organizer entry for the already-decided lot outcome → recorded outcome summary → transition readiness checklist/blockers → explicit stage-transition confirmation.

**Mapped work package:** WP-08.

### Knockout bracket and progression

**Purpose:** Show bracket structure, participants, results, and progression.

**Required states:**

- Bracket slots before participants are known.
- Quarterfinal, semifinal, and final progression.
- Result display and entry access where authorized.
- Locked-stage indication.
- Empty or not-yet-known participant states.
- Keep each bracket match identifiable independent of display position or court; label round and match, show participants or “to be determined,” result, and progression state.
- Provide a stacked match-list presentation on small screens if a visual bracket would require page-wide horizontal scrolling.

**Low-fidelity layout:** Bracket heading and round navigation → round sections containing match cards → each card shows match label, two participant/slot rows, result or pending state, and winner progression. At wider widths, connect round columns visually; on mobile, retain the same order in a vertical sequence.

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
- Keep forfeit selection separate from ordinary set-score entry and label the selected team/outcome in text. Show the resulting public status distinctly.
- Explain when placements are pending, determined, or joint; do not imply a lower-place ranking beyond the approved rules.

**Low-fidelity layout:** Optional third-place setting and consequence → match/result card or disabled explanation → separate forfeit action and confirmation → placement summary with explicit labels and pending/joint states.

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
- Manual refresh and visible last-successful-check time; automatic updates remain enabled with no pause control.
- Home overview links to each public section and surfaces upcoming assigned games, recent completed results, and update age without implying live play.
- Groups screen presents teams and their group standings; matches screen offers clear group/round sections; standings screen presents a labeled table; bracket screen presents match progression; placements screen labels determined, pending, and joint outcomes.
- Each page includes a consistent navigation landmark, page heading, selected section, and read-only presentation.

**Low-fidelity layout:** Shared header with tournament identity → primary public navigation → page heading and optional section filters → content cards/table → refresh/update status and state-specific feedback. Avoid organizer controls in the public shell.

**Mapped work package:** WP-11.

## Accessibility implementation rules

### Layout

- Design mobile-first for a 320 CSS-pixel viewport.
- Avoid clipped controls, overlapping text, and horizontally cramped forms.
- Use a clearly contained horizontal-scroll region only for inherently wide data such as standings or brackets.
- Preserve usability at 200% text zoom.

### Touch targets

- Primary buttons and score-entry controls target at least 44×44 CSS pixels.
- Other controls should meet a 24×24 CSS-pixel target, with enough spacing that adjacent controls can be selected separately. Prefer 44×44 for frequently used mobile controls.

### Contrast and status

- Maintain 4.5:1 contrast for normal text and 3:1 contrast for large text.
- Do not rely on color alone to communicate status, errors, success, or warnings.
- Pair visual status with text or an accessible icon name.

### Labels and tables

- Label every input visibly.
- Use meaningful table headers for standings and result data.
- Explain errors in text, including what is wrong and how to resolve it.
- Use programmatic label and error relationships as well as visible text; ensure icon-only controls have an accessible name and are not used where a text label is needed to understand the action.
- Keep row and column context available for table cells. At narrow widths, contained horizontal scrolling must be keyboard reachable and have a short accessible label or instruction.

### Focus and updates

- Preserve scroll position, filters, current view, and focus during public updates.
- Do not deliberately steal focus during routine background updates.
- Provide a visible focus indicator for keyboard users.
- After navigation or a user-triggered content change, move focus only when needed to orient the user, such as to the new page heading or an error summary. Preserve focus during background polling and do not reset scroll or filters when data changes.
- If refreshed content changes the focused item's position or removes it, move focus to a nearby stable heading or status message and explain the change.

### Destructive actions

- Provide clear Cancel and Confirm choices.
- State the exact destructive consequence.
- Do not imply recovery or undo after a reset.
- Make Cancel and Confirm equally clear as choices, with focus initially placed on the safer Cancel action for high-impact confirmations. On cancellation, return focus to the invoking control.

## Screen inventory

| Screen or state                                              | Primary user            | Work package |
| ------------------------------------------------------------ | ----------------------- | ------------ |
| Tournament setup: teams, groups, courts                      | Organizer               | WP-04        |
| Court assignment                                             | Organizer               | WP-06        |
| Public upcoming games                                        | Spectator               | WP-06        |
| Group match list and result entry                            | Organizer               | WP-07        |
| Group standings                                              | Organizer and spectator | WP-07        |
| Tie resolution                                               | Organizer               | WP-08        |
| Stage transition and lock states                             | Organizer               | WP-08        |
| Knockout bracket                                             | Organizer and spectator | WP-09        |
| Knockout result entry                                        | Organizer               | WP-09        |
| Third-place control and result                               | Organizer               | WP-10        |
| Forfeit entry and confirmation                               | Organizer               | WP-10        |
| Placements                                                   | Organizer and spectator | WP-10        |
| Public home                                                  | Spectator               | WP-11        |
| Public groups                                                | Spectator               | WP-11        |
| Public matches and results                                   | Spectator               | WP-11        |
| Public standings                                             | Spectator               | WP-11        |
| Public bracket                                               | Spectator               | WP-11        |
| Public placements                                            | Spectator               | WP-11        |
| Public refresh, stale-data, loading, empty, and error states | Spectator               | WP-11        |

## Implementation boundary

This document does not implement UI or select implementation details. A later, separately approved package may introduce shared styling tokens or base UI primitives.

WP-04 through WP-11 must apply these patterns. WP-12 remains the final quality, accessibility, and deployment verification package.
