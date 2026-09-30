# Project detail, creation and editing

Status: core detail/create/edit/save-recovery workflow implemented and accepted; rich descriptions, tag selection/creation and related links added on 2026-09-27. Shell: App. Primary inventory ownership: SETT-02, SETT-10, SETT-11, SETT-12, SETT-13, EDGE-04. Contextual name/owner/date editing is implemented; attachments remain planned.

Current detail: identity/status, description, owner, due date, task progress, explicit completion and newest-first related activity. The page and B inspector share the progress/action owner. There is no in-page back link: the top bar's trail names the page the project was opened from (Projects, Overview, Inbox, Assistant, Analytics, Activity or Search) and its link returns there with the same query, restoring focus to the opened record; direct entry names the default Projects list. The editor's trail is origin › project › Edit, and the project crumb keeps the origin. On phones, where parent crumbs are hidden, a back arrow before the title goes to the nearest one. Missing or reload-lost records explain the demo reset boundary. Edit opens the shared routed form.

## User goal

Understand a project, create one and make reliable edits without losing work.

## Current core form

The form edits name, formatted description, owner and due date; description is optional. Name and due-date validation (`validateProjectFields`) is shared with inline editing. Editing preserves status and completed-task counts; completion remains an explicit detail/inspector action. Successful create/edit opens the saved detail with visible feedback and updates shared records/activity atomically.

The Tiptap editor supports bold, italic, bullet/numbered lists, links and undo/redo through a compact shadcn toolbar with labelled icon tooltips. Link editing opens a contextual popover and returns focus to the editor. Pasted content uses the same limited schema. The accepted Name/Owner and Description/Due date composition remains bounded and stacks on narrow screens. Details and Activity changes render formatting; cards and the inspector derive plain-text previews. The [Reference editor](http://127.0.0.1:5173/reference/components/rich-text) provides isolated edit/read/Cancel behavior. Markdown source mode, media, uploads and collaboration are not implemented.

Approved draft policy: navigation retains a separate in-session draft per new/edited project. Back retains it; Cancel discards it and returns to the originating results for creation or the saved detail for editing. Save clears that draft, reset/reload clears all drafts, and appearance persistence stays separate. Invalid submit focuses the first invalid field. A fresh `?scenario=save-failure` editor entry rejects its first valid save, retains input and offers Retry save; retry succeeds once. Normal saves are synchronous and have no artificial pending state. See the editor review for reproduction and tested limits.

## Tags and related links

One Tags and links disclosure sits below the accepted primary field grid. It opens for populated values; empty new-project extras start collapsed. The Base UI/shadcn multiple Combobox searches existing tags and offers Create for a new trimmed name directly in its list. Matching ignores capitalization and preserves the existing tag's spelling; blank names and duplicate selections are omitted. Creation adds a removable, labelled chip to the project draft, without a dialog or immediate workspace mutation. Save canonicalizes against currently saved project tags, then makes new names available in other editors. Cancel/reload discards unsaved tags. Draft-only selections remain selectable; there is no separate tag registry or arbitrary item limit.

Related links use URL and optional label columns, stacked on narrow screens. Add link reveals a row and focuses its URL; removing a row focuses its next or previous neighbour, or Add link when none remain. Stable row IDs keep validation attached to the right link. Save ignores fully blank rows, trims values and requires a complete HTTP/HTTPS URL for populated rows, following the existing web-link convention. There is no item-count or input-length limit. Invalid submit reveals the disclosure and focuses the first invalid URL when primary fields are valid.

Tags and links share the existing per-project navigation drafts, Cancel discard, rejection/retry, atomic save and reload/reset behavior. Details omit empty sections and show saved tags and labelled external links. Activity records and displays actual before/after collections. Table/Cards/Board retain their existing primary information. Fixtures include example tags and two real documentation links on Design system.

## Contextual editing on details

The name has a labelled pencil action beside the title; activation reveals a bounded Input with explicit Save/Cancel. Blur does not save or discard; Enter submits and Escape cancels. The properties rail has one **Edit** action beside its Details heading: a dialog edits owner, due date, tags and links together (the same Select, DatePicker, tag and link fields as the full editor) and saves them at once. Cancel, Escape or the close button discard the dialog's changes, and each opening starts from the saved project; focus returns to Edit and "Details saved." is announced. The full editor remains the entry point for description and colour. Only active workspace members are assignable.

Inline and full editing share the same per-project draft. Navigation retains it and an Unsaved marker identifies unfinished inline fields. Saving commits only the active field against current saved values, leaving other draft fields untouched, even if those fields are invalid. Cancel/Escape restores only this field. A baseline reconciles untouched fields with newer saved values so returning to the full editor does not undo a completed inline save. Full-form Cancel still discards the entire project draft; reset/reload clears all drafts.

Validation errors stay beside the field and focus it. A fresh `?scenario=save-failure` detail draft rejects its first changed save (inline name or details dialog), retains input and offers Retry save. The simulation applies to each newly created draft; normal local saves remain synchronous. Unchanged saves produce no Activity event. A successful change updates shared records/history, returns focus to its pencil action and announces the result to assistive technology; the changed value is the visible feedback, with no inserted success banner. Production concurrency/conflict handling is not implemented.

## Tasks

The project page lists the project's tasks in its main column (TABL-12). Open tasks come first (eight, then Show all), followed by the add field and a collapsed Completed list. Completing a task leaves it in place, ticked and struck through, for 1.6 seconds (the counts and progress update at once); it then fades into Completed. Unticking it within that time keeps it open, and if its checkbox had focus, focus moves to the neighbouring task when it leaves. Each row has a checkbox named by the title (`aria-labelledby`; only the checkbox completes a task, so clicking the title or the row's empty space changes nothing and the text stays selectable), an assignee select (active members or Unassigned) and actions to move it up or down among tasks in the same state, or delete it.

- Counts are derived. `tasks.json` holds 218 named tasks whose done/total match the original figures (Brand refresh 24/32); `withTaskCounts` recomputes a project's counts after every task change, so progress, tables, cards, board and Overview agree.
- Completing a task records one completion in Activity for the snapshot date, so the Overview and Analytics charts include it. Reopening it the same day removes that record; earlier history stays.
- Mark complete (and bulk or board completion) completes remaining tasks, and Undo restores them. Deleting a task offers Undo in a toast. Removing a workspace member returns their open tasks to Unassigned.
- A completed project shows its tasks read-only, with a note to reopen it.
- Keyboard: completing a task moves focus to the next open task (or the add field); reopening one focuses it in the open list. A polite status announces each change.

## Comments

Comments follow tasks on the project page (TABL-13), oldest first. The composer is a labelled textarea: typing @ lists matching active members under the field; arrow keys choose, Enter or Tab inserts "@Full Name", and Escape closes the list while keeping focus. Ctrl or ⌘ + Enter posts; an empty post shows an error and returns focus to the field.

- Bodies store mentions as `@{memberId}` tokens (`src/demo/project-comments.ts`), so a mention survives name changes; views render the current name, highlighted.
- Posting records a Comment event ("commented on the project") in Activity.
- `comments.json` is the single source for the inbox's "Mentioned you in a comment" entries: a teammate's comment that mentions the current user becomes an inbox entry, unread when it is from the last day. Mentioning someone else sends nothing in this single-user demo.

## Files

Files share the side column with progress (SETT-15); on narrow screens they follow progress. Each file shows a thumbnail (images) or a document icon, its size and date. Selecting one opens a preview dialog with who added it, Download (when the file has contents) and Remove. The dialog opens on its title so Enter cannot remove by accident; after removal focus moves to the Files heading and a toast offers Undo.

- Uploads: drop files or Choose files (touch devices show only the button). Each upload shows labelled progress; the demo times it rather than sending anything. Files over 10 MB are refused before starting with a reason and Dismiss.
- `?scenario=upload-failure` interrupts the first upload at 60% with a message, Retry and Dismiss; Retry completes normally.
- `files.json` holds sample attachments; images are real files under `public/images`, and PDFs are metadata only and say so. Uploaded files use object URLs held in memory (`use-project-files.ts`), so reset and reload remove them.

## Broader planned routes and composition

| Route | Ordered page composition (in addition to shell) |
| --- | --- |
| `/app/:workspace/projects/new` | Page header; project form with name, status, owner, tags (SETT-11), description editor (SETT-10), optional attachment (SETT-03) and related-link rows (SETT-12); Create/Cancel; dirty-save feedback (SETT-02). |
| `/app/:workspace/projects/:projectId` | Project header and actions; summary fields including an inline-edit example (EDGE-04); description; attachments/links; activity (TABL-08); Edit link. |
| `/app/:workspace/projects/:projectId/edit` | Project identity/header; same form composition as creation with loaded data; Save/Cancel; unsaved-change feedback (SETT-02). |

## Actions and outcomes

Creation and editing share the form pattern. Required fields reflect the illustrative schema; optional sections are visibly optional. Entering inline-edit mode exposes Save/Cancel, with Escape cancelling. The rich editor's toolbar remains discoverable without selection/hover. Adding/removing a link row preserves sensible focus. On success, show the saved result and return to detail; Cancel returns to the caller's view after any agreed dirty-work handling. Detail retains an explicit Back to results action with the originating query and view state. A direct entry without list context returns to the default project list.

## States to demonstrate

**SETT-13 — validated submission and recovery:** compose labelled Field controls, explicit requiredness, field-associated repair messages and useful focus after an invalid submit. The same validation contract serves create, edit and inline editing. Retain input after a named rejected-save scenario; retry uses the retained values and creates one successful mutation. Show success where the person can see it and preserve result context. Initial, invalid, corrected, pending where applicable, rejected/retry and saved states are distinct. Pending feedback represents actual work, not an artificial delay in normal local saves. Error summaries are appropriate when the form's length makes offscreen errors difficult to find, not mandatory decoration for every short form.

New/loaded; loading; field errors; tags empty/selected/duplicate; editor empty/focused/selection; upload pending/failed; dirty/saving/saved; save rejected; concurrent update conflict; deleted record; read-only access; file/link unavailable.

## Responsive and accessible behavior

Use FieldGroup/Field/FieldSet, Input, Select, Textarea or chosen rich editor, Combobox-style tag control, Button and shared form actions. Every row's remove control identifies its row. Form actions stay reachable above the keyboard. Reduced motion is respected; no hidden formatting-only-on-hover requirement.

## Data and persistence

Plain-text project fixtures convert to a Tiptap JSON document at their entry boundary. That document is the canonical description in records, drafts and new before/after history; formatting-only edits count as changes. Read views use the same schema through Tiptap's React static renderer. Create/edit update shared local state and affected views; scenarios.json supplies the named first-save failure. Failed saves retain formatted input. Conflict and attachment examples remain planned; fixture files stay unchanged.

Follows the confirmed [static JSON demo-data contract](../../demo-data.md), including shared state, scenario selection and the proposed baseline-reset behavior.

Inherits [shared shells](../../shells.md), the [quality contract](../../quality.md) and [proposed UX corrections](../../ux-decisions.md). Route authority: [sitemap](../../sitemap.md).
