# Projects data view

Status: dedicated list, inspection/detail, creation/editing, recovery, bulk actions, Table/Cards/Board/Timeline and advanced filters implemented. Shell: App. Primary inventory ownership: TABL-01, TABL-02, TABL-03, TABL-04, TABL-05, TABL-06, TABL-09, TABL-10, TABL-11, TABL-14, NAV-08.

Current runtime: `/app/demo/projects` supports `q`, `status`, `owner`, `sort`, `desc`, `page`, `pageSize`, `advanced` and `inspect`. Status/Owner accept Router JSON arrays or comma-separated IDs; invalid choices drop, unsupported sizes use 5, and pages clamp to available results. Typing replaces the current history entry; filter/sort/page actions push entries. Opening inspection preserves the current query; dismissal clears only `inspect`. Name links open the full detail route, and the trailing Inspect action opens the B Sheet. The inspector offers Open project and Edit project. Column visibility remains session view state, retained across detail navigation. New project and Edit project use the shared routed form.

The host owns return context: the detail URL carries a validated Overview/Projects origin with its query; session state retains view preferences and stable opener IDs. Router scroll restoration uses the canonical results state so an explicit return and history return recover the same view. Selection of a full-detail link with a modifier key retains normal new-tab behavior. Reusable views accept navigation elements/callbacks and do not import the router.

After a route transition, focus moves after the prior overlay's focus cleanup. Returning resolves the current element by its stable ID, rather than keeping a detached DOM reference. When completion or editing removes that result, filters stay intact and the results region receives route-return focus.

## User goal

Find projects, inspect them in context and make changes to a precisely understood selection.

## Routes and composition

| Route | Ordered page composition (in addition to shell) |
| --- | --- |
| `/app/:workspace/projects` | Page header and Create project; search/facets (TABL-02); view toggle (TABL-10); column controls (TABL-03); optional advanced filters (TABL-11); table (TABL-01) or card grid/board (TABL-09); pagination (TABL-05); selection actions (TABL-04); record inspector (TABL-06). |

## Actions and outcomes

Search, facets, sorting, page size/page, view and inspected record have explicit URL state. Filtering resets an invalid page; browser Back restores the prior view. Create opens the create page. Record names are links; an explicit Inspect control opens a Sheet without requiring a mouse-only row click. The inspector has summary/activity and an Edit link; it preserves list state when closed.

## States to demonstrate

**TABL-11 — advanced filters:** one Advanced control opens a bounded dialog; its badge counts applied conditions. Match all/any supports project-name contains/excludes/exact comparisons, Status/Owner is/is-not, Due date on/before/after/inclusive comparisons, and Progress equal/at-least/at-most. Progress compares the rounded percentage displayed in project views; a project without tasks is 0%. Name matching ignores case.

The entire advanced group combines with the existing search and quick facets using AND. Edits stay local until Apply; Cancel, Escape and dismissal discard them. Clear conditions removes the group when applied, retaining quick filters; Reset clears all filters. Invalid or blank values show an associated error and focus the first invalid field. Add/remove preserves useful keyboard focus. More conditions scroll inside the dialog, keeping its actions available.

The `advanced` URL parameter carries `{ match, conditions }` using the Router JSON codec. Decoding validates the complete group, including field/operator compatibility, calendar dates and percentages. A malformed group is discarded as a whole, consistent with existing invalid-query normalization; it is never partially applied. Owner IDs are not restricted to initial fixtures; a removed member remains an explicit unavailable choice. Table, Cards, Board, facet counts, pagination, selection and detail/edit returns use this shared predicate. Applying a filter clears selection and resets the page. Nested groups, saved queries and a query service are outside this delivery.

**TABL-09 — Board:** `view=board` groups all filtered results into the three existing statuses; counts reflect matching records, not a paginated subset. Shared sorting orders each column. Table/Cards retain their page/page-size settings when returning; the Board selector operates across all matching records and names that scope. Narrow columns scroll within the board, leaving the page contained. Empty columns remain available; zero matching results use the shared recovery state. The mobile view switcher becomes a single Select.

**TABL-14 — Timeline:** `view=timeline` shows all matching projects (no pagination) in the shared sort order. Each bar runs from the project's first activity to its due date (the snapshot date when it has no history), filled to its share of completed tasks in the project's colour; the name column shows the due date and percentage, and turns the due date into "Overdue" for unfinished projects past it. Weekly gridlines align with a Monday-first axis; a line marks the snapshot date. The chart scrolls within its own container while names stay pinned. A Month layout (local choice) places due dates on a calendar with previous/next month; on phones it lists only days with projects due. Each row has a screen-reader sentence with status, dates and progress.

Following the inspected [Kibo Kanban composition](https://www.kibo-ui.com/components/kanban), compact cards expose name, task progress, owner and due date. The card menu contains View details and a labelled Move to group. Current status is disabled; entering Completed states how many remaining tasks it will finish. Reopening preserves completed tasks, as approved by the user. Commands use Base UI Menu through a shadcn base-nova adaptation. Inspector focus returns to the card trigger. A successful move adds no visible confirmation row: the new column communicates the result, with a screen-reader-only announcement. Focus returns to the moved card's control, or Projects if filtering removes it. Filters remain intact. `bulkScenario=partial-failure` rejects Website redesign until Retry move; it does not mutate the record or activity on rejection, and the actionable error receives focus.

`@dnd-kit/core` supplies a separate drag handle, leaving links, checkboxes and menu actions independent. Pointer dragging and Left/Right keyboard movement target statuses; Space/Enter picks up or drops, Escape cancels. The overlay previews the destination and remaining-task consequence. Cancelled/outside drops and same-status drops do not mutate data. After cancellation the source card is visible and its handle regains focus. Narrow layouts retain normal scrolling outside the handle and auto-scroll horizontally during dragging. The menu remains the non-drag alternative; manual ordering within columns is not part of this delivery.

**TABL-10 — implemented alternate view:** `view=grid` selects Cards; an absent or unsupported view resolves to Table. URL state is authoritative, including reload and detail/edit returns; no separate localStorage preference overrides it. Switching presentation preserves the current query, facets, sort, page and selection. Cards offer the same inspection, record links, page/all-matching selection and bulk actions. Their sort control remains available when column headers are absent. Hidden Table columns do not remove card metadata. Responsive cards use semantic tokens; description previews show two lines with full prose available in project details. Empty results keep the shared Clear filters action. Loading skeletons remain future coverage because this dataset is synchronous.

**TABL-04 — implemented bulk scope:** row/card checkboxes select stable IDs. Table and Cards share a leading toolbar selector; its checkbox selects the visible page when empty and clears the selection when active. Its mixed/checked state reflects selection across all matching results. The scope popover explicitly offers none, the visible-page count and all matching results. Selection survives sorting/pagination and list inspection, clears on filter changes, and is not persisted across leaving the list route. The table header retains a Selection column label without duplicating the toolbar checkbox.

The selector follows [PatternFly's toolbar bulk-selection composition](https://www.patternfly.org/patterns/bulk-selection/): checkbox and scope/count stay together at the leading edge in both views. Our established page-first shortcut and clearing successful records remain project-specific behavior. Search and facets follow the selector, with Cards sorting at the opposite edge. Selection replaces the filter area with adjacent Assign owner and completion actions; Clear sits at the end. The selector itself remains mounted so focus and position survive the transition. Narrow layouts keep search beside the selector and facets on the next row. An Actions popover contains the batch controls; at the smallest widths its labelled ellipsis trigger keeps the selected toolbar on one line. The selector checkbox and Select none remain available to clear selection. Completion explicitly includes tasks in its visible label when any remain. Feedback stays visible after an action and clears when a new selection begins; failed items retain their feedback and retry until the selection changes.

Assign owner applies the chosen workspace member. Mark complete preserves the existing task-completion consequence and is disabled when every selected record is already complete. Successful/no-op items leave selection; failed items remain selected with named errors and retry. Focus moves to visible feedback, including when a change excludes records from current filters. Demo records and activity update together; no-op repeats produce no new activity. `bulkScenario=partial-failure` rejects Website redesign through the named JSON scenario; Retry failed succeeds through the normal mutation. Network pending is not implemented by this synchronous demo.

**NAV-08 — return to results:** preserve the originating query, sorting, page and useful scroll/focus context across detail/edit. Browser Back restores the previous view. An explicit Back to results link uses the saved origin; direct entry has a default Projects destination. If an edit changes filter membership, show truthful success and the current matching results rather than silently clearing filters. Include filtered origin, direct entry, missing record and changed membership in the browser review.

Loading; refreshing with retained rows; first-use empty; no matches; load error; selected/indeterminate; hidden columns; optional column order; invalid filter; first/last/single page; unknown record; inspector loading/error; pending/failed bulk changes; board move failed; empty column.

## Responsive and accessible behavior

Table, Checkbox, DropdownMenu, Popover, Command, Badge, Pagination, Select, ToggleGroup, Sheet and Card compose the view. Native table headers and sorting remain meaningful. Narrow mode retains key identity/status/actions and exposes other values in detail. Horizontal scrolling is contained; the bulk bar does not cover controls. Board movement includes a Move to menu, with announcements and recovery.

## Data and persistence

Use projects.json with users.json and workspaces.json relationships through the shared demo-data owner. Table, grid, board and inspector share local record state. Search, sorting, filters and pagination run locally while the route owner synchronizes URL state. Stable IDs preserve selection; configured partial-failure scenarios exercise bulk recovery without a server.

Follows the confirmed [static JSON demo-data contract](../../demo-data.md), including shared state, scenario selection and the proposed baseline-reset behavior.

Inherits [shared shells](../../shells.md), the [quality contract](../../quality.md) and [proposed UX corrections](../../ux-decisions.md). Route authority: [sitemap](../../sitemap.md).
