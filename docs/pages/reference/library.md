# Reference home and primitive catalogue

Status: first delivery accepted; linked to the pattern catalogue (2026-09-27). Shell: Reference. Primary inventory ownership: Reference infrastructure; no new inventory ID.

## User goal

Find a reusable example and inspect the building blocks used by the actual demo.

## Routes and composition

| Route | Ordered page composition (in addition to shell) |
| --- | --- |
| `/reference` | Compact documentation navigation; grouped component links; real workflow links; shared-token and source locations. |
| `/reference/components` | URL-backed text/category search; documented component names, purposes and categories; no-results recovery. |
| `/reference/components/:component` | Heading; live Preview/Code tabs; reset/copy; usage and keyboard notes; disclosed implementation paths and related inventory IDs; actual workflow and official Base UI documentation links. |

## Actions and outcomes

Search by component name, related inventory ID or task, combined with a category. The initial ten entries are Button, Input, Select, Checkbox, Radio Group, Dialog, Tabs, Alert, Empty and Table; Rich text editor and Tooltip followed, and Switch, Progress, Keyboard key and Toast were added with the 2026-09-29 foundations (Button gained its loading state). These are documented examples, not a count of every installed primitive or completed pattern. Clicking View in context navigates within the running demo; official documentation opens a labelled new tab.

Search/category survive opening a detail and returning to the catalogue. The selected Preview/Code tab is URL-backed; changing it preserves preview state. Reset remounts the current example. Code is loaded from that example's actual source by the Vite host, rather than a separately maintained string. Copy reports completion; clipboard refusal selects the code for manual copying and explains recovery.

## States to demonstrate

Implemented: no matches and missing component; primary/secondary/disabled buttons; required email error and focus; select, checkbox and radio selection; dialog save/discard; manually activated tabs; local alert retry; empty-results recovery; semantic table with contained horizontal overflow. Preview state is isolated from workspace mutations. Theme/font/density preferences use the same appearance owner as the demo, including portalled controls.

Deferred: exhaustive primitive variants, loading/pending scenarios, layout/typography groups, theme playground, state gallery and broad forced-colors/screen-reader review. Static search has no artificial loading state. Related pattern IDs now link to the [pattern detail pages](patterns.md); the introduction and shared navigation also reach the catalogue.

## Responsive and accessible behavior

Use shared Input Group, Select, Tabs, Sheet and labelled controls. Desktop navigation becomes a mobile menu; following a menu link dismisses it and focuses the new main content. Preview controls retain their primitive semantics. Source panels contain long lines without widening the page. Show developer details here, not in the sample product's normal workflow.

## Data and persistence

Load illustrative content from the shared JSON datasets. Catalogue metadata describes the actual reusable components and their source/documentation links; executable components remain code, not JSON. Render the same components used by the demo and avoid duplicating upstream documentation.

Metadata lives in `src/features/reference/components.json`; reusable examples and views are in that feature. The host supplies routing adapters and imports raw example source in `src/app/reference-examples.ts`. JSON fixtures supply sample projects/members. Leaving a component or resetting its example clears local preview state; appearance persists through the existing owner. No dependency or external service was added.

Follows the confirmed [static JSON demo-data contract](../../demo-data.md).

Inherits [shared shells](../../shells.md), the [quality contract](../../quality.md) and [proposed UX corrections](../../ux-decisions.md). Route authority: [sitemap](../../sitemap.md).


## Verification � 2026-09-27

TypeScript, changed-code ESLint/anti-slop, Prettier and two catalogue/source/search contracts passed. Chromium review covered 1440/390/320px, representative Dark/Compact, search/category round trip, missing/no-results recovery, required-email error/focus, preview state across tabs, clipboard write completion and injected refusal/manual selection, dialog save/Escape and returned focus, keyboard tab activation, empty recovery and router navigation to real context. All ten previews rendered at 320px. Source panels were corrected to contain horizontal overflow. No full variant matrix, physical-device or screen-reader conformance claim.
