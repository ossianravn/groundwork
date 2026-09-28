# Failure and edge-state gallery

Status: implemented core gallery, awaiting review (2026-09-27). Shell: Reference. Primary inventory ownership: EDGE-05; implemented specimens also expose EDGE-01, EDGE-02, EDGE-03, EDGE-06, EDGE-09, AUTH-08, SETT-02 and SETT-13. Inline editing (EDGE-04), asynchronous button geometry (EDGE-07) and route progress (EDGE-08) remain deferred.

## User goal

Inspect and reproduce important states without breaking a real workflow.

## Routes and composition

| Route | Ordered page composition (in addition to shell) |
| --- | --- |
| `/reference/states/:scenario` | Scenario navigation; actual shared example in selected state; available recovery action; state description and links to the owning page/shell (EDGE-01 through EDGE-09, AUTH-08). |

## Actions and outcomes

Supported scenario keys: loading, first-use, no-results, forbidden, not-found, server-error, offline, reconnecting, session-expired, update-available, dirty-form, save-failed and destructive-action. Each scenario exercises its real component composition with a deterministic fixture; Reset returns to its starting state. Retry, Clear filters and Sign in show their actual transition in the fixture. HTTP error specimens do not imply the gallery itself returned that status.

## States to demonstrate

Every listed scenario has an entry state and a reachable recovery/result. `/reference/states` redirects to loading; unknown scenario keys show a not-found view with a return to the gallery. Specimen errors do not throw an actual route exception; existing application route boundaries remain separate.

The compact, grouped selector changes the URL and shows one example at a time. Browser history restores the selected scenario with its starting fixture. Each example remounts on Reset or scenario change, owns an isolated `useWorkspace` instance, and reuses shared product compositions. It cannot change the main demo workspace. Source disclosures and links to Projects/Team settings sit outside the specimen.

| Scenario | Interaction and result |
| --- | --- |
| loading | Skeleton remains pending until the external Resolve request control reveals the real Projects table; focus moves to results. |
| first-use | EmptyProjects opens the shared ProjectForm. Validation precedes local creation, which replaces the empty view with its new record. |
| no-results | The real search starts with no matches. Clear filters restores the collection and search focus. |
| forbidden / not-found | Back to projects returns to the allowed collection; it does not grant access or recreate a missing record. |
| server-error | Try again resolves the fixed failure into Projects results. |
| offline / reconnecting | Editing remains available; saving retains values and explains the blocked outcome. Reconnect, or the external Restore connection control, enables normal saving. |
| session-expired | Sign in opens a local fixture-account dialog. Cancel preserves the expired state; continuing restores saving with the draft intact. No password is collected. |
| update-available | Update now advances a local version fixture and retains the draft. This does not reload the browser. |
| dirty-form | Leave editor shows saved project details; Resume editing returns to the retained draft. Cancel explicitly discards it. |
| save-failed | The named rejection is visible with the entered draft. Retry save runs shared validation and the normal project mutation. |
| destructive-action | The existing member dialog requires reassignment of Leo’s projects. Cancel leaves records intact; confirming atomically removes the membership and assigns its projects to the chosen member. |

## Responsive and accessible behavior

Uses the matching shadcn Base UI/base-nova Skeleton plus existing Alert, Empty, Button, Select and Dialog compositions. The table keeps horizontal overflow inside its own region; shared project fields retain bounded desktop columns and stack in narrow containers. The loading fixture uses static placeholders, an `aria-busy` region and an explicit completion control. No endless announcements, forced animation or artificial request timers. Save feedback occupies a reserved line; form errors and modal focus reuse their existing owners.

## Data and persistence

Load named fixtures from scenarios.json and relevant domain datasets through the shared data owner. Error, permission, session and recovery demonstrations remain synthetic. Actual missing routes or asset-load failures still need appropriate local/hosting handling; gallery error codes do not claim corresponding HTTP response statuses.

Follows the confirmed [static JSON demo-data contract](../../demo-data.md). Scenario metadata is in `src/demo/data/scenarios.json`; project/team records and mutations come from the existing data owner. Nothing here changes appearance persistence. Connectivity, session and update controls are explicit local simulations; production auth, offline storage, service workers, real HTTP responses and network retry policy are outside this delivery.

Inherits [shared shells](../../shells.md), the [quality contract](../../quality.md) and [proposed UX corrections](../../ux-decisions.md). Route authority: [sitemap](../../sitemap.md).
