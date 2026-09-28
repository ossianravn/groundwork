# Inbox and notifications

Status: local team messaging implemented, awaiting review (2026-09-27). Shell: App. Inventory: TABL-07, SYS-04.

## User goal and composition

Read and send conversations with workspace members, optionally linked to a project. The user explicitly chose Compose and Reply during the Inbox review on 2026-09-27.

`/app/demo/inbox` adapts the inspected [shadcn Mail example](https://v3.shadcn.com/examples/mail): a compact All/Unread toolbar, message list and reading pane. It fills the workspace below the shared header, without a duplicate visible heading, outer card or page gutters. List separators, avatars, unread weight and the selected accent rail establish hierarchy. Below 64rem the same records use list/detail navigation with Back.

New message opens a bounded dialog with one recipient, optional project, subject and body. Send opens the created conversation in All. Replies append to the conversation, move it to the top and update its preview; outgoing previews start with You. Sending a reply marks that conversation read. Self-authored messages do not generate incoming notifications. There are no invented automatic responses. The reply area stays beneath a scrolling thread on desktop; narrow layouts use page scrolling.

Read/unread is explicit. Opening an unread message does not remove it from the Unread list. Mark read updates the row, filter, drawer and counts together; an already open message remains readable even when it leaves the filter. Mark all read and Reset panel sizes live in the toolbar's overflow menu. No inserted success narration shifts the page.

## State and navigation

- `inbox.ts` owns the messaging reducer, thread/post records, compose/reply drafts and read recovery; `use-inbox.ts` installs it above routes. Navigation retains messages and drafts. Closing Compose retains its draft; Cancel discards it. Successful sending clears the associated draft. Reset/reload restores the five incoming fixture conversations and three unread flags; creating a new workspace clears messages and drafts.
- `message` and `filter=unread` are validated URL state. Project links carry that state in `returnTo`; Back to inbox restores the selected message, filter and useful opener focus.
- The global bell opens a Sheet using the same list and read state, projected to incoming posts only. Replies do not replace the incoming notification with the current user's text. Message links close it and open the selected conversation. Open inbox opens the full inbox; Escape returns focus to the bell.
- No selection, no unread messages, empty inbox and unknown message IDs have distinct recovery states. Missing project/member references are rendered as unavailable/former member rather than fabricated data.
- `/app/demo/inbox?scenario=inbox-failure` rejects the first read-status action without changing messages. The visible error offers Try again. Reset clears both messages and failure state; reload rearms the explicitly selected scenario.

## Layout and reusable boundaries

Feature views accept data, actions and link adapters without importing the router. The host owns search parsing, shared state and navigation. The official Base UI/base-nova shadcn Resizable source wraps `react-resizable-panels`. Message, Bubble and Message Scroller compose the thread, with `@shadcn/react` owning scrolling. Existing Dialog, Field, Select, Input and Textarea compose authoring; Alert, Sheet, Toggle Group and Dropdown Menu retain their semantics.

Desktop panels start at 38%/62%; the list can resize from 30% to 55% with the pointer or keyboard. Reset restores the starting proportions. The remaining viewport height contains the toolbar, list and reading pane; the thread owns scrolling above the reply form. Insets and controls use shared density tokens. Below 24rem the New message action uses its compose icon and retains its accessible name so the filter stays on one line.

## Scope and limits

This slice has no backend, real delivery, group conversations, attachments, archive/delete actions, approval decisions, artificial network delay or asynchronous pending state. Only current workspace members can receive new messages/replies; historical messages remain readable after removal. Required recipient/subject/body and stale references are checked without arbitrary length limits. Notification preferences do not retroactively remove existing messages. Pane collapse and richer request types remain planned. Appearance preferences retain their separate persistent owner.

Physical-device and screen-reader conformance are not inferred from the resize library or Chromium checks. Inherits the [quality contract](../../quality.md), [density rules](../../density.md), [shared shells](../../shells.md) and [demo data contract](../../demo-data.md).
