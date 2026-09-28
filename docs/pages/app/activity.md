# Workspace activity

Status: implemented local workflow; awaiting review. Shell: App. Primary inventory ownership: TABL-08.

## User goal

Understand who changed what, narrow the history and inspect the affected project.

## Delivered composition and behavior

`/app/demo/activity` provides search, member/event-type/snapshot-relative date filters, date-grouped semantic lists and Load more. Filters and the visible page count are URL-backed. Mobile keeps search visible and groups the remaining filters in a popover.

Each event names its actor, action, project and date. Details open a dialog. New project edits, owner assignments and status changes capture actual before/after fields; historic fixtures show their known action and task count without inventing a diff. These fixtures have dates, not precise timestamps. Missing actors and projects have readable fallbacks; unavailable projects have no broken link.

Project links retain Activity filters and the loaded page count. Returning restores the collection position and a useful focus target. Overview's Show all activity and workspace navigation lead here. Empty history and no matching results have distinct states; clearing filters restores the list.

## Data and limits

Activity uses static JSON and the shared in-memory project owner. Successful local mutations append events, and reload/reset restores fixtures. This is a local demonstration, not an immutable audit service. Search can match linked project and member names. Newest events appear first, including successive events on the same date.

Loading older events is synchronous. Network loading/failure, restricted history, exact timestamps and production audit retention are deferred rather than simulated on this page.

Inherits the [demo-data contract](../../demo-data.md), [shared shell](../../shells.md), [quality contract](../../quality.md) and [sitemap](../../sitemap.md).
