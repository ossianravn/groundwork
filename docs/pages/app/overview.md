# Overview and analytics

Status: Overview and core Analytics implemented; extended chart variants and asynchronous scenarios remain proposed. Shell: App. Primary inventory ownership: DVIZ-01, DVIZ-02, DVIZ-03, DVIZ-04, DVIZ-05.

## User goal

Understand workspace activity and investigate the numbers that need attention.

## Routes and composition

| Route | Ordered page composition (in addition to shell) |
| --- | --- |
| `/app/:workspace/overview` | Page header; period filter (DVIZ-05); a small set of contextual metrics (DVIZ-01); time-series overview (DVIZ-02); recent activity (TABL-08); links to Projects and Analytics. |
| `/app/:workspace/analytics` | Page header; date range and segment controls (DVIZ-05); time-series chart (DVIZ-02); grouped/stacked bars (DVIZ-03); categorical breakdown (DVIZ-04); accessible data view. |

## Actions and outcomes

Figures with a period filter share that scope and period. The first overview separates the workspace snapshot (explicit reference date) from historical task completion (its own 7/14/30-day selector). Snapshot totals do not pretend to be historical counts. A metric links to a meaningful filtered record view when supported. Legends change visible series without hiding the underlying data alternative. Date changes are shareable in the URL; do not reset the user's other filters.

Implemented first-page action outcomes:

| Action | Visible result and continuation |
| --- | --- |
| Create project | Invalid submission focuses the first error; correcting a field clears its error. Success opens the new project's details with a creation confirmation, regardless of table filters. Closing returns to New project. Cancelling creates nothing. |
| Inspect or complete | The sheet shows the selected record. Completion updates its status, task totals and visible footer feedback without closing it. Closing returns to the opener, or the table when filtering removed it. |
| Global project search | Search results open the selected record; closing details returns to the page's search control. The search dialog and its scrollable results fit short screens. |
| Filter or clear | Counts and results update together. Clearing no-match results returns focus to Search projects. Per-facet clearing and toolbar reset retain focus when their controls become disabled. |
| Sort, change columns or page | Header buttons cycle ascending/descending/unsorted and expose `aria-sort`. Columns toggles optional columns without changing row filters. Rows per page offers 5/10/20; first/previous/next/last controls and range feedback reflect actual results. Filtering returns to page one; sorting applies before pagination. |
| Expand activity | Show all activity reveals the full fixture history in the same-height scroll region; Show recent restores the latest four and scrolls that region to the top. The footer reports the event count. |
| Collapse navigation | Desktop navigation becomes an icon rail with hover/focus tooltips. The toggle remains in the header; mobile keeps a full-label sheet. |
| Reset demo data | Restores the fixtures and confirms beside Reset demo data in the active desktop/mobile navigation. Appearance and table filters remain separate preferences/view state. |
| Change appearance or restore defaults | The page and overlays update immediately. A persistent footer reports saving/restoration, or explains when browser storage failed and the change applies only to the current session. |

The resulting view, selected control state or local status supplies feedback; routine actions do not also need a global success banner.

## States to demonstrate

The full list below is planned for analytics/reference work. It is not the current Overview's implemented state inventory; see the action table above and [demo-data contract](../../demo-data.md) for current behavior.

Initial loading; background refresh; no data for range; unavailable comparison; partial chart failure; positive/negative/neutral trend with domain meaning; one/many series; anomalous point; custom-range error.

## Responsive and accessible behavior

The implemented overview project table includes name search and searchable multi-select Status and Owner facets. Choices combine with OR within a facet and AND across facets/search. Counts respect the other active filters, excluding the facet's own selection. Clearing a facet and resetting all filters remain available; no-match results announce the count and offer a clear action. Priority is not a property of the current project fixtures.

Filter triggers fit their visible icon, label and active selection count. No count badge or empty slot is rendered without a selection. Columns use stable widths with the project name taking remaining space; hiding columns reduces the table's minimum width. TanStack Table v9 owns sorting, column visibility and pagination. The default five-row page keeps this overview compact while the six fixture projects exercise a real second page. The results area reserves the lesser of the chosen page size and unfiltered record count, including in the no-match state, so filtering and short last pages do not clamp document scroll. Narrow screens wrap controls and contain horizontal scrolling inside the table. Dedicated Projects and Analytics routes are implemented; Projects includes Table, Cards and Board views. The active plan records their delivery status.

Chart, Card, Tabs where there are panels, Calendar, Popover and Select compose the view. Charts resize with their container and have clear labels/units plus readable data or summaries. Keyboard and touch users can access values without hovering. Stacking cards must preserve a sensible comparison order.

## Data and persistence

### Implemented Analytics — 2026-09-27

`/app/demo/analytics` reuses the accepted Overview chart/card composition and adapts the [shadcn horizontal bar](https://ui.shadcn.com/charts/bar) and [Chart](https://ui.shadcn.com/docs/components/base/chart) patterns. It adds no dependencies. The page-level period (7/14/30 days) and project selection scope all three charts to the same activity records, inclusive of both date boundaries. Date/project choices live in validated search parameters, with the reference fixture date as the end date.

The time series counts completed tasks per day. Project bars and the contributor donut aggregate those same tasks by project ID and activity actor respectively; current owner reassignment does not rewrite historical credit. Contributor colors retain member identity across sorting/filter changes. The literal task counts remain available without hover in legends/data views. Project table names open existing details; `projectView=data` retains that view alongside filters on return. The host's results memory restores useful focus and scroll.

The current project name labels the report, while activity supplies historical counts. Snapshot task totals can include work completed before the available activity history; they are not interchangeable with a selected-period completion total. No previous-period percentages are shown because the fixtures do not provide complete comparison coverage.

Zero-completion ranges produce a zero time series and empty breakdowns. Unknown project filters show an unavailable state with All projects recovery. Session mutations update these views; Reset/reload restores fixtures. No new analytics fixture or parallel state owner is introduced.

Custom ranges, grouped/stacked bars, multi-series legend filtering, prior-period comparisons and named asynchronous loading/failure scenarios remain planned. Data views are scoped alternatives, not complete screen-reader or physical-device conformance evidence.

Current totals derive from projects.json through the shared demo-data owner; activity.json supplies historical events. The workspace fixture's reference date anchors repeatable date ranges. Local project mutations update summaries and history together. A lazy chart loading fallback exists; named chart loading/failure scenarios remain planned.

Follows the confirmed [static JSON demo-data contract](../../demo-data.md), including shared state and implemented baseline reset. Scenario selection remains future work.

Inherits [shared shells](../../shells.md), the [quality contract](../../quality.md) and [proposed UX corrections](../../ux-decisions.md). Route authority: [sitemap](../../sitemap.md).
