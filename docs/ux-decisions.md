# UX decisions and source corrections

Status: source corrections remain recommendations for review unless explicitly adopted. The progressive-disclosure principle below is user-directed guidance, recorded 2026-09-26. The supplied inventory remains unchanged.

The 73 IDs in the original CSV and Markdown match. They are the starting inventory, not a fixed coverage scope or completion target. The user confirmed on 2026-09-25 that the list should expand as useful patterns emerge. The [living coverage index](coverage.md#inventory-development) owns additions, refinements and implementation dispositions; preserve the original files as source snapshots. Each recipe still requires evaluation. A named library is a candidate, and an animation or numerical limit is not a universal UX standard.

The confirmed template runs on static JSON data. References below to server policy, delivery or production authorization describe the real-world behavior being illustrated; named local scenarios demonstrate it without adding live services.

## Progressive disclosure and action surfaces

Show the information and actions people need for their current task and state; reveal the rest when it becomes relevant or they ask for it. Available space is not a reason to display every capability. Reduce the number of competing decisions while keeping the next useful action discoverable. This applies on desktop as well as mobile.

Choose visibility from task importance, frequency, context and consequence. Keep the primary action, essential navigation, active state and feedback needed to proceed visible. Reveal contextual actions when their prerequisites exist, such as bulk actions after selection. Put occasional secondary actions behind a clearly associated overflow trigger. Keep advanced options or supporting detail collapsed when their summary is enough to make the current decision. These are judgments about the workflow, not a fixed number of permitted controls.

Choose the destination separately from the action's placement: an item in a dot menu can act immediately, navigate, or open an editing surface. It does not automatically need a confirmation or modal.

When the changed UI already makes success apparent, let that state communicate the result. Do not add a redundant success sentence, toast or confirmation row, or shift the working layout to narrate the action. Keep focus with the affected control; use a visually hidden announcement when assistive technology needs the outcome. Failures that require recovery remain visible and actionable.

| Surface | Use when |
| --- | --- |
| Inline control or disclosure | The action is frequent or central, or expanding nearby detail helps people read, compare or edit without losing their place. |
| Overflow menu (dots / More actions) | Occasional commands belong to a particular record or group. Give the trigger a meaningful accessible name and keep its association clear. Use a visible label where an unexplained icon would make discovery difficult. |
| Popover | A brief contextual choice, filter or small adjustment benefits from staying anchored to its trigger. Use the appropriate form/select semantics for input; a command menu is not a container for a complex form. |
| Modal dialog | A short, bounded task requires focused attention before returning to the page, or a consequential decision needs explicit resolution. Explain necessary consequences where the decision is made; do not add confirmation merely because an action was hidden. |
| Drawer / Sheet / side panel | Inspection or a related edit benefits from retaining the surrounding page as context and needs more room than a popover. A side panel's shape does not determine whether the background is interactive; use deliberate modal or non-modal behavior. |
| Dedicated page | The task is substantial, needs its own navigation/address, or would become cramped or layered inside an overlay. |

Preserve orientation when revealing or hiding controls: keep selection scope, active filters and changed values apparent through concise summaries or indicators. Keep relevant errors and outcomes visible where the person acts. Do not require opening a menu to discover that work failed. Provide stable, keyboard- and touch-accessible triggers; hover alone is insufficient. Follow the existing [focus and dismissal contract](quality.md#interaction-specific-checks), including returning to a useful location and preserving work through overlay handoffs. Avoid stacking dialogs when one surface or a page can carry the task.

Reassess the composition at narrow widths: secondary actions may move into overflow and a popover may become a sheet when it needs room. Preserve the operation, state and understandable entry point; do not shrink or hide the primary task just to fit. Before adding another visible control or row, judge whether the person needs it now, what reveals it otherwise, and whether the complete open → act → observe → return path is easier to understand. This is part of ordinary design judgment, not an additional validation process.

## Board ordering (2026-09-27)

The user approved a manual Board order retained during the demo session. Named sorts temporarily override it; Manual order restores it. Dragging or Move up/down commits the visible arrangement as manual order. Filtering keeps hidden projects in their existing relative positions. Reordering alone creates no Activity event and changes no task totals. Lane changes still use the shared status mutation: completing finishes remaining tasks; reopening preserves completed tasks. Cancellation or rejected movement leaves saved order/status unchanged; Retry applies the intended move. Navigation retains order; reset/reload clears it.

The full card follows a drag, while sortable siblings expose its destination. Keyboard arrows and directional actions in the card menu complement pointer dragging. Routine success is visible in the new position, with no inserted success row.

## Source differences

| Pattern | Difference | Proposed treatment |
| --- | --- | --- |
| SYS-01 | CSV lists high contrast; details call it optional | Support forced colors; show a custom high-contrast theme only if approved and tested |
| MKT-07 | CSV lists currency selector; details call it optional | Demonstrate a supported multi-currency variant in reference; show a selector in a product only when prices actually support it |
| TABL-03 | CSV says visibility; details add reordering | Visibility is the default; show reordering as an optional variant with move controls |
| SYS-03 | CSV requests Undo for destructive actions; details narrow this to reversible actions | Offer Undo only when the data operation can reliably restore the result |
| SYS-04 | Details add browser notification permission | In-app notifications are the base; browser push is a separate opt-in capability |
| MKT-11 | Footer details add language/status elements | Include only if they have real destinations and meaningful data; preview variants in reference |

## Revised pattern guidance

| Patterns | Proposed default and reason |
| --- | --- |
| MKT-01, MKT-04 | Transparent blur, bento layouts and hover glow are visual options. Start from legible hierarchy and appropriate content. None is an accessibility or usability requirement. |
| MKT-03, MKT-05, MKT-06 | Static logo layout and user-controlled showcases by default. Animated variants need a usable pause control when applicable, reduced-motion behavior and stable focus. Hover-only pause is insufficient for a persistent animation. See [Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html). |
| MKT-02, MKT-06, MKT-07 | Example testimonials, customer logos and “Most Popular” labels must be identified as sample content; do not invent verified endorsements or popularity evidence. Price comparisons disclose billing basis. |
| MKT-09 | Add FAQ search when it helps people find answers; eight questions is not an evidence-based universal cutoff. |
| MKT-12 | Consent is conditional on the deployed services and applicable requirements. A template with no optional tracking need not interrupt visitors with a banner. The reference variant shows accept, reject and preferences with comparable access; it is not a legal certification. |
| MKT-14 | Do not add CAPTCHA by default. Decide abuse controls from the actual endpoint's needs; an inaccessible challenge would harm completion. Any added limits require the user's agreement. |
| AUTH-01, AUTH-03, AUTH-04, AUTH-07 | Support password managers, autofill and paste. Make OTP verification explicit by default; automatic submission is a separately tested variant. Do not shake fields as the sole error signal. Resend and expiry timing come from a real server policy, not a hard-coded 60 seconds. See [Accessible Authentication](https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html). |
| AUTH-08 | Token refresh is normally system work. An access-token lifetime alone does not justify an inactivity modal. Decide actual session policy before choosing timing; preserve recoverable work through sign-in. |
| NAV-07 | Mobile bottom navigation is an alternative shell for an appropriate small destination set. Avoid auto-hiding the primary way to navigate. |
| DVIZ-01 | Improvement depends on metric meaning: higher error rate is worse. Use a label/direction in addition to color; define comparison periods and unavailable comparisons. |
| DVIZ-02, DVIZ-03, DVIZ-04 | Charts need named units, labelled series and equivalent readable data or summary. Hover is an enhancement; it cannot be the only way to obtain values. |
| TABL-01, TABL-05 | Start with native table semantics and controls in the tab order. Sortable headers and selection do not automatically require an ARIA grid or intercepted arrow keys. [WAI table pattern](https://www.w3.org/WAI/ARIA/apg/patterns/table/) |
| TABL-04 | Show exact selection scope with the object and count: the current page and all matching projects are different choices. Bulk actions replace browsing controls in the same toolbar area rather than adding disconnected selection rows. Keep the selected count, scope choices, actions and Clear together; preserve filters when returning to browsing. Bulk feedback reports partial failure and preserves retryable items. |
| TABL-09, TABL-03 | Board moves and column reordering need a non-drag pointer alternative as well as keyboard operation. A Move to menu or directional controls provide an equivalent path. [Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html) |
| SETT-01 | Use links for distinct settings routes. ARIA tabs describe panels within a widget, not every horizontal or vertical navigation layout. |
| SETT-02, EDGE-04 | Use a clear save policy per form. Default inline editing uses Save/Cancel; blur does not silently discard or commit input. Attach unload handling only for actual unsaved work; do not promise it guarantees recovery. |
| SETT-03 | File picker remains available alongside drag/drop. Cropping is useful for avatars, not all uploads. Client validation improves feedback; real upload enforcement belongs on the server. |
| SETT-08, SETT-11, SETT-12 | Usage thresholds, tag caps and field-array limits must come from domain/provider constraints. The inventory's 85% and unspecified caps are not approved defaults. |
| EDGE-03 | Match confirmation to consequence. Prefer undo for reversible actions; agree the confirmation required for irreversible workspace deletion. Typed confirmation remains a reference variant pending that decision, not a blanket rule. |
| EDGE-06 | Browser online status is unreliable as a service-health test. Recover based on request outcomes; do not disable all work merely because that flag changes. [MDN navigator.onLine](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine) |
| EDGE-08, EDGE-09 | Indicate actual pending work without invented percentages. Update notices must not discard drafts or force reload solely because a deployment changed. |

## Policies deliberately left open

The template uses [static JSON fixtures](demo-data.md) and does not need production providers or policies. Named scenarios can demonstrate expiry, limits, roles and recovery without imposing live restrictions. A downstream product would select its authentication methods, session duration, resend/rate limits, upload limits, retention, role policy, quotas, locales/currencies and consent requirements. Fixture examples are not approved production defaults.

All items remain discoverable in the reference library. A conditional or optional variant is still part of inventory coverage, but it is not automatically enabled on every downstream website.
