# Non-functional requirements

Status: Approved MVP baseline | 2026-11-05

## NFR-01 — Mobile-first behavior
Core public and organizer tasks work at 320 CSS-pixel viewport width with no clipped controls or overlapping text. Wide standings/brackets may use a clearly contained horizontal-scroll region. Preserve usability at 200% text zoom. Use English for all interface, validation, confirmation, and accessibility text.

## NFR-02 — Practical accessibility baseline
- Primary buttons and score-entry controls target at least 44×44 CSS pixels.
- Other controls meet a 24×24 CSS-pixel target or appropriate spacing exceptions.
- Text contrast: 4.5:1 normal, 3:1 large text.
- Clear labels, meaningful standard controls/table headers, text explanations of errors; not color alone.
- Preserve view/scroll and do not deliberately steal focus during updates.
- Clear cancel/confirm choices for destructive actions.
- Provide automatic-update pause and manual refresh.
Dedicated keyboard navigation and screen-reader/VoiceOver test passes are excluded. Basic accessible implementation remains expected. Do not claim verified WCAG 2.2 AA conformance.

## NFR-03 — Performance acceptance targets
Under a repeatable mobile device/network profile agreed during Phase 2 and representative 12-team data:
- Main public tournament content visible within 3 seconds.
- Valid save/correction normally completes within 2 seconds.
- Show progress while saving; prevent accidental repeated submission.
- Visible public pages check approximately every 30 seconds and on return.
These are project test targets, not guarantees under all network conditions. Agree load scenario/test method in Phase 2; no paid monitoring implied.

## NFR-04 — Reliability and data integrity
- Saved data survives reloads and ordinary application restarts.
- Failed saves preserve entered values and never show false success.
- Retain last successful public data during network failure; show stale status and retry.
- Reject invalid scores, resource conflicts, locked edits, and incomplete transitions authoritatively.
- Publish a consistent result/standings/bracket state rather than partially applied changes.
- One active writing operator/client is expected; no multi-editor conflict workflow.
- Resets deliberately discard data with no recovery promise.

## NFR-05 — Security and authorization
- Public pages are read-only without login.
- Restrict all mutations, resets, settings, and transitions to authorized organizer access.
- Enforce permissions and stage locks beyond UI visibility.
- HTTPS required; actual authentication/session design belongs to Phase 2.
- Do not store player/contact data or secrets in public output.
- No audit/change history requirement.

## NFR-06 — Backup and export
No application backup/restore or export capability required. No undo after resets and no previous-value recovery after corrections. This does not remove ordinary persistent storage requirements. Provider operational facilities, if any, are not user-facing MVP features.

## NFR-07 — Hosting and maintenance
- Public access before event day via an existing Cloudflare-managed domain.
- Hosting, hostname, deployment, environment, and recovery operations selected in Phase 2.
- Favor simple, maintainable, conventional solutions and no unnecessary paid services.
- No high-availability infrastructure or formal uptime SLA committed.
- No code, stack, ORM, schema, or deployment commands selected in Phase 1.

## NFR-08 — Future adaptability
- One current tournament in MVP UI; design supports historical tournament separation later.
- Reset data need not be retained.
- German can be added without interface redesign; no launch translation/switcher.
- Optional future times/courts/timetable changes must not alter match identity or results.

## Verification scope
Test scoring, ranking, qualification, locks, forfeits, third-place rules, assignments, resets, authorization, and save integrity. Manually verify mobile layout, zoom, targets, contrast, errors, public refresh/offline behavior, and destructive confirmations. Specific unit/integration/E2E tools and browser/device matrix belong to Phase 2. No dedicated keyboard/screen-reader pass.
