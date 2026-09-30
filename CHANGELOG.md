# Changelog

Releases of Groundwork, the kit and its shadcn registry. Install a release by its tag, such as `npx shadcn add ossianravn/groundwork/kit#v0.2.0`; every part an item brings is pinned to the same release. Tandem's own release notes, part of the demo, live in `src/demo/data/content.json`. Changes merged since the last release collect under an Unreleased heading at the top.

## Unreleased

- `shell`: the icon buttons at either end of the workspace top bar align their icon, rather than their hit area, with the page's content edge at every width (previously only on phones).
- `data-table`: `TablePagination` shows page controls only when there is more than one page. Faceted filter and facet drawer triggers mark an applied filter with `data-active`, and an unapplied one has a dashed outline.
- Demo: the projects list defaults to 10 rows (the whole sample on one page) and reveals the sort icon of unsorted columns on hover or focus; project pages move to a main column with a properties rail and no framed panels; the Assistant's history can be hidden on wide screens.

## v0.2.0 — 2026-09-30

The registry grows from 44 to 67 items, and Tandem gains an assistant, tasks, timelines and a larger public site that show them in use.

### AI and chat

- A new `ai` item with 22 presentational chat components, modelled on the AI SDK's message model and Vercel's AI Elements: Conversation, Message response (streaming markdown), Prompt input with attachments, Suggestions, Message actions, Reasoning, Tool, Sources and inline citations, Chain of thought, Plan, Confirmation, Question, Queue, Model selector, Context usage, Reply branches, Checkpoint, Artifact, Agent and Open in chat. They take status, text and handlers and import nothing from `ai`, so any client can drive them.
- Developer output: `code-block` (Shiki highlighting coloured by `--syntax-*` tokens), `snippet`, `terminal` (ANSI colours as theme roles, follows streaming output), `file-tree`, `commit`, `test-results` and `stack-trace`. `shimmer` marks working labels.
- Tandem Assistant at `/app/demo/assistant`: real `useChat` over a scripted local transport, with tool approval, history, versions and settings. The coding-agent specimen at `/reference/specimens/coding-agent` shows the developer components together.

### Components

- Feedback: `toast` and `use-toast` with undo, `spinner`, `progress`, `switch`, `kbd`, and a loading state on Button.
- Dates: `calendar`, `date-picker` and `date-range-picker`.
- Overlays and scrolling: `context-menu`, `hover-card`, `drawer`, `scroll-area` and `carousel`.
- Shell: announcement bar, route progress bar, bottom tab bar, cookie consent banner and a workspace switcher.

### Demo and reference

- Projects gain task lists, comments with @mentions, files, a Timeline view, saved views, CSV import and a workspace search page; new workspaces get a getting-started list.
- The public site adds customers, integrations, about, roadmap and status pages.
- The pattern catalogue grows to 140 IDs, 139 with working examples; bottom tabs, cookie consent and the coding agent have reference specimens.
- A Docker image hosts the demo.

## v0.1.1 — 2026-09-28

- Release commits pin every item's registry dependencies to the release tag, since shadcn does not pass a tag on to dependencies.

## v0.1.0 — 2026-09-28

- First registry release: tokens, styles and theme runtime (`base`), the kit's shadcn components, `data-table`, `rich-text`, `shell`, `theme-panel` and the whole `kit`.
