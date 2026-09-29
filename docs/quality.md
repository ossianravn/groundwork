# Quality and accessibility contract

Status: acceptance criteria and review procedure, not a report of conformance. Recorded runtime evidence covers Overview and its overlays. The Projects workflow is now authorized; apply the relevant criteria below and its active-plan acceptance criteria as it is implemented. Other future-page criteria apply when those pages are authorized. Source review date: 2026-09-24; review procedure updated 2026-09-25.

Target WCAG 2.2 AA for the shipped demo and its complete workflows. W3C currently identifies WCAG 3 as a developing draft, so it is a direction to monitor rather than the conformance target. [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [WCAG 3 introduction](https://www.w3.org/WAI/standards-guidelines/wcag/wcag3-intro/)

## Shared acceptance criteria

| Area | Acceptance |
| --- | --- |
| Structure | Meaningful page titles and headings, labelled navigation, native controls, one main landmark, effective skip link; reading order follows the task |
| Keyboard | All primary tasks work without a pointer; visible focus, sensible order and no keyboard trap; shortcuts supplement visible controls |
| Color | At least 4.5:1 text contrast, or 3:1 for qualifying large text; applicable non-text controls/indicators meet 3:1; meaning is not conveyed by color alone |
| Forms | Visible labels; appropriate autocomplete/input modes; clear requiredness; errors identify both field and repair; submitted values survive a recoverable failure |
| Status | Announce consequential success/error/progress changes appropriately without stealing focus or announcing every keystroke; important errors remain discoverable |
| Content | Descriptive links, useful alt text, captions/transcripts for supplied media, comprehensible labels and concrete recovery actions |

These summarize selected requirements; conformance requires all applicable criteria, not only this table. [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

## Interaction-specific checks

- Pointer targets satisfy the 24 by 24 CSS-pixel AA criterion or its applicable exceptions, including spacing. Prefer more generous targets for primary touch actions; 44 by 44 is a design preference here, not the universal AA threshold. [Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- Sticky headers, bottom navigation and feedback bars cannot entirely obscure focused controls. Aim to keep the full control visible. Test combinations, not each overlay in isolation. [Focus Not Obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html)
- Content reflows at a 320 CSS-pixel viewport without page-wide two-dimensional scrolling. Genuine two-dimensional content, such as a data table, can have its own scroll region while the surrounding page reflows. Also verify enlarged text and text spacing. [Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
- Modal dialogs have a name, move focus inside, contain the tab sequence, support appropriate dismissal and return focus to a logical place. A non-modal inspector has different focus behavior; do not combine the two models accidentally. [WAI dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- Route navigation exposes the destination title/heading and moves focus into its main content without undoing scroll restoration. When a mobile navigation Sheet closes because a destination was chosen, its dismissal must not restore focus to the previous menu trigger. Ordinary dismissal still returns to that trigger. Keep result-link DOM identity stable across URL-only inspector changes so dismissal can return to the actual opener; use a useful results target when a mutation removes it.
- Board movement works by a single-pointer control without dragging. Keyboard drag support alone does not satisfy the pointer alternative. [Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html)
- Authentication supports paste, password managers and suitable alternatives to cognitive-function tests. Keep error and recovery flows operable. [Accessible Authentication](https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html)
- Moving content has pause/stop/hide controls where required. Reduced motion is respected throughout; motion does not carry the only explanation of a state change. [Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)

## Responsive and resilient behavior

Each page specifies its narrow-layout behavior. Use content needs to choose breakpoints; do not infer a person's input method solely from screen width. Keyboard, touch, coarse pointers, zoom and long translated labels can coexist.

The same operation has distinguishable initial loading, background refresh, first-use empty, no-results, recoverable failure and permission states where applicable. Keep successful content during background fetches. A persistent failure explains what the user can do; internal retries do not require supervision.

Formatting uses a defined locale, currency where relevant, and explicit time-zone semantics. Ambiguous dates, silent timezone conversion and red/green-only status encoding are not acceptable reference examples. A direction-aware layout should allow RTL adoption, but full translation coverage is a separate product scope decision.

## Performance

Use Core Web Vitals as measured outcomes: LCP at most 2.5 seconds, INP at most 200 milliseconds, CLS at most 0.1 at the 75th percentile, assessed for mobile and desktop. Lab checks help diagnose; they do not substitute for real-user measurement after deployment. [Web Vitals](https://web.dev/articles/vitals)

Do not load the rich editor, chart system or reference playground into every route. Reserve image/chart space, serve suitable image sizes and keep route-specific interactions responsive. Browser support and actual datasets determine whether virtualization or newer rendering features are justified.

## Check selection and milestone review

The [repository verification policy](../AGENTS.md#verification-and-completion) owns per-change selection and stopping. The criteria above describe the intended product; they are not a checklist to execute after every edit. Inspect the changed composition early with realistic content, then exercise the behavior and settings affected by the change. Enlarged text, keyboard/focus, color, density and browser conditions are selected for an actual risk or requested review; avoid multiplying independent axes into a universal matrix.

At an agreed phase or release review, assess complete shipped journeys and the remaining accessibility coverage. Depending on what exists and changed, this can include navigation, project filtering/inspection/editing, theme changes, and later authorized authentication/contact/access flows. Keyboard, responsive/reflow, enlarged text and text spacing, automated accessibility scans, screen-reader sampling, shipped presets, forced colors and reduced motion belong to that broader acceptance scope. Reuse valid prior evidence and identify remaining gaps. Automated scans and shadcn do not establish complete conformance.

The confirmed implementation uses [static JSON demo data](demo-data.md). Check fixture relationships, coherent local mutations, baseline reset and reproducible state transitions. No live integration or server-authorization tests belong to this template scope. Simulated permission/session states demonstrate UX, not security enforcement; a downstream product that adds a backend needs its own integration and authorization verification.

## Overview review procedure

This is a comparison guide for the affected composition; the inventory is not a mandatory per-edit suite. Separate three kinds of requirement. Accessibility criteria such as contrast, focus and reflow come from their cited standards. Project decisions such as control heights, typography and density come from the design system. Composition choices require a reason tied to the person's task and comparison with the rendered page; using shadcn or a token alone does not validate them.

1. **Define the expected relationship before checking the result.** For the affected role, name its peer controls, expected shared properties and any justified differences. Use the design system and density inventory; challenge an exception whose only reason is that the implementation already uses it. Example: chart period, Status and Owner define visible data and share standard control geometry; a pagination group can use a consistently smaller secondary role.
2. **Compare the actual composition and states.** Inspect the complete page and active overlay, then compare peer controls under the same density, font and state. Measure where useful and inspect the screenshot. Equal padding values do not prove equal visible spacing; an element's rectangle does not prove that it paints, can be hit or remains readable.
3. **Exercise the consequence.** Use open → act → observe → dismiss/return, including focus, scroll, feedback and changed data. Include the distinct risks introduced or affected by the change, such as an empty field, an open menu, a long title or increased text. Allow transitions and fonts to settle before measuring.
4. **Report the result at its actual scope.** State what was inspected and any material failed or unexamined criterion. A concise completion message normally suffices; update the owning document or active plan when its decisions, status or known limits change. Save detailed evidence when it will support a regression, handoff or agreed milestone. Direct CSS probes establish layout, not preference persistence. Fix in-scope failures; keep unrelated findings visible without turning them into an automatic extension of the task.

Use the inventory to select relevant comparisons. At a foundations review, cover the agreed scope; for focused changes, revisit only affected relationships and consumers.

| Compare | Observable review criterion |
| --- | --- |
| Chart selector, table search/filter/Columns controls, form fields and Appearance selector | Same role and state have consistent height, typography, corners, surface, padding logic and icon alignment. Different roles have an explicit task/layout reason. Action labels determine control width; input widths follow expected values/formats, with a separate bounded measure for prose. Compare empty and realistically populated forms: short fields must not stretch across spare card space or equal columns. Judge the complete arrangement too: related rows share column edges, and narrowing individual fields alone is insufficient. Equal width is not a goal. |
| Default, hover, keyboard focus, selected, disabled and invalid states | State meaning remains clear. Equivalent controls share the focus treatment through one owner; a composed control does not accidentally stack two indicators. Evaluate visibility and applicable contrast, not just token names. |
| Page, card, panel, dialog and toolbar compositions | Related edges, headings, metadata and actions align intentionally. Visible glyph spacing, internal gutters and scrollbars do not create accidental extra bands. Header/body/footer insets follow their owning roles. |
| Chart tooltip, axis/data view, activity preview/expanded view | Label/value pairs remain separated and readable. Numbers and dates agree across representations. Overflow cues clear at endpoints; details can be revealed by the supported keyboard/pointer paths. |
| Each shipped overlay: navigation, Appearance, project details, project search, Status, Owner, Columns and Select menus | Check the overlay's bounds, content overflow, title/close relationship, focus, scrolling, return target and actions. For scroll-lock changes, compare background width, content coordinates and scroll position before, during and after opening/closing, including transitions. Passing Appearance does not cover Dialog or every Popover. |
| Responsive and customization combinations | Check narrow layouts and affected enlarged-text, font/density, light/dark, coarse-pointer and forced-color conditions. Check the overflowing child, including a portal, rather than relying only on document scroll width. Separate text-resize probes from actual browser zoom. |
| Complete action paths | Period changes, search/filter/reset, sort/columns/pagination, activity expansion, create/complete, demo reset and preference restore produce visible, coherent outcomes in the user's current location. Reuse valid recorded checks for unchanged paths. |

For scrollbar/layout checks, launch `agent-browser` with `--hide-scrollbars false` in a fresh session. Its default hides native scrollbars and exercises a different Base UI scroll-lock path. Confirm a real inset scrollbar is present before opening (`innerWidth > document.documentElement.clientWidth` on the overflowing page), then check both background geometry and the overlay's outer-edge painting/hit testing. Keep the ordinary hidden/overlay-scrollbar path as a separate comparison. Use pointer coordinates for an already-visible sticky-header control if locator automation scrolls it before clicking; distinguish that harness movement from an application shift.

An explicitly scoped overall foundations signoff requires a disposition for its inventory rows and resolution of confirmed in-scope defects; a list of unrelated passing checks is insufficient. Preserve known unverified platform/accessibility coverage explicitly.

## Verification status

The original documentation task checked both source files, source-ID coverage, route-to-spec mapping, local links and source preservation. An interactive Overview now exists. Requirements for future pages above are not claims that those pages have been implemented or tested.

Current verification is focused Chromium inspection, keyboard interaction, static color-pair measurements, automated accessibility scans and the repository's existing tests. A full screen-reader pass, native calendar pointer interaction and cross-browser checks remain unverified; no complete WCAG conformance or production performance claim is made. Record those limits when presenting this phase for review.
