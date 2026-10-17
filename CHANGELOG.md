# Changelog

Releases of Groundwork, the kit and its shadcn registry. Install a release by its tag, such as `npx shadcn add ossianravn/groundwork/kit#v0.4.0`; every part an item brings is pinned to the same release. Tandem's own release notes, part of the demo, live in `src/demo/data/content.json`. Changes merged since the last release collect under an Unreleased heading at the top.

## Unreleased

The first steps of a layout pass: spacing tokens named for their role, checks that keep pages on them, a quieter workspace top bar, and one anatomy for chart headers, dialog footers and avatars. Plus additions to menus, Select and the AI components.

### Tokens

- `base`: role spacing tokens on a 4px ramp (`--space-1` to `--space-12`): `--gap-inline`, `--gap-control`, `--gap-item`, `--gap-group`, `--gap-zone` and `--gap-section` between things, and `--inset-page`, `--inset-card`, `--inset-panel` and `--inset-row` inside them, with compact-density and phone values. The old names (`--control-gap`, `--content-gap`, `--stack-gap`, `--section-gap`, `--item-padding`, `--card-padding`, `--panel-padding`, `--page-padding` and `--row-padding`) remain as deprecated aliases until a later release removes them.
- `base`: `--text-feature` (20px, Tailwind's `text-xl`) completes the type ramp of 12, 14, 16, 20, 28 and 32px, and `--control-height-xs` adds a 28px control (24px compact). Weights are 400, 500 and 600: `b` and `strong` are 600, and the shell's 650 is now 600. The `rounded-2xl` to `rounded-4xl` radii are gone, and `badge` is fully rounded.
- `base`: `--backdrop` (Tailwind's `bg-backdrop`) dims the page behind `dialog`, `sheet` and `drawer`, which no longer blur it.

### Shell

- `shell`: `TopbarSearch` (new) is a magnifier that expands in place into a field, with results below. Escape or a click outside collapses it, and Escape returns focus to the magnifier. **Breaking:** `WorkspaceShell`'s `search` is now a slot for it; it was a `{ label, onOpen, … }` config for a button that opened a palette.
- `shell`: `TopbarSearch` takes `shouldFilter={false}` for a host that filters its own results, such as a menu that matches whole words or caps each group; by default cmdk still filters.
- `shell`: **Breaking:** `WorkspaceShell` no longer draws an appearance button or takes `onCustomize`; offer Appearance from the account menu instead. An `AccountMenuItem` can now be an action (`{ id, onSelect }`) as well as a link.
- `shell`: `PageActions` takes secondary actions in `more` (buttons or router links). They show as outline buttons on wide screens and in a ⋯ menu on phones.
- `shell`: the sidebar's brand row is as tall as the top bar, so the logo sits on the breadcrumb's axis; the brand link carries `data-slot="sidebar-brand"`. The current breadcrumb is styled by its `breadcrumb-current` class, so a parent link that the router marks `aria-current` keeps the parent weight. The top bar's styles moved from `shell.css` to a new `topbar.css`.

### Patterns

- `chart`: **Breaking:** `ChartHeader` is one anatomy for every chart. `title` now names what the chart shows and renders as a heading (h3, or `headingLevel="h2"` for a chart that is a page section of its own). The key figure moves to a new `figure` slot (a `ChartTotal` or a series picker), then come `description` (a one-line takeaway) and the scope controls. `ChartTotal` renders a paragraph unless `as` asks for a heading, and its unit is muted body text.
- `dialog`: `DialogFooter` sits on the dialog's surface, without the grey band, rule or negative margins; its actions wrap and stay right-aligned, primary last.
- `member-avatar`: initials sit on a soft tint of one of the six `--hue-*` hues, chosen from the person's name, so a person keeps one colour everywhere.
- `dropdown-menu`: `DropdownMenuCheckboxItem`, an option that turns on and off and shows a check at the end of its row when on.
- `toggle`: the small size's text is 14px (it was 12.8px, off the type ramp), which `toggle-group` items share.
- `theme-panel`: appearance choices have two selected states. Choices with a preview (Theme, Density) are tiles with an ink edge and a check badge; the others (Accent colour, Corners, Header surface) form one segmented control whose chosen segment takes the toggle group's fill. `AppearanceChoices` options take a `mark` to lead a segment's label, which accents use for their swatch, and the label now reads Accent colour. The font picker stacks under its label at a font name's width.

### Menus, Select and AI components

- `select`: the trigger's text no longer ends in "▼". Base UI's Select icon renders that character by default, and it landed inside the chevron svg, so a trigger's text content read "Ava Morgan▼".
- `ai` (prompt input): a textarea `onPaste` that calls `preventDefault()` now keeps pasted files out of the composer's own attachments, as `onKeyDown` already does for Enter. Before, files a host took over also landed in the composer's list.
- `ai` (message response): `MessageResponse` takes `plugins`, `remarkPlugins` and `rehypePlugins` and passes them to Streamdown, for math (`@streamdown/math`) or to change how markdown and HTML are read. A list you pass replaces Streamdown's default for it. The reference example shows model-written HTML as text.
- `ai` (reasoning): `Reasoning` takes `open` and `onOpenChange` for a host that keeps its openness, a `label` in place of Thinking… and Thought for… (such as a duration stored with a restored reply), and children other than markdown text, which render as given.
- `ai` (tool): `ToolHeader` takes a `status` node that replaces the state badge, for your own word for an outcome, such as Retried for a failed call the assistant tried again.
- `ai` (attachments): `Attachment` takes `onOpen`; the thumbnail, or the chip's icon and name, then becomes a button named "Open <name>" (its name underlines on hover), with the remove button still beside it. The reference example opens a preview.
- `dropdown-menu`: `DropdownMenuRadioGroup` and `DropdownMenuRadioItem`, for a choice among exclusive options; the chosen item shows a check at the end of its row. The item now brings `lucide-react`. `context-menu` re-exports them as `ContextMenuRadioGroup` and `ContextMenuRadioItem`. Tandem's board cards use them for Move to.

### Repository

- The layout contract counts a framed control group (`data-control-group`, like an input group) as one control when it checks a toolbar's heights.
- The layout contract checks a code snippet's 13px monospace as code, like code blocks and terminals, rather than against the type ramp.
- `npm run lint` includes `lint:spacing`, which reports raw spacing in demo code against a per-file baseline, and `npm run check:layout` checks each workspace page's anatomy in a browser. See [Checks](README.md#checks).

## v0.5.0 — 2026-10-13

The kit now runs in server-rendered React frameworks. It was checked in a Next.js 15 App Router app (Datastream): the workspace shell and theme panel render on the server, hydrate without mismatches, and a saved appearance applies before the first paint.

### Server rendering

- `base` (theme): `themeScript({ defaults })` returns an inline script that applies the saved appearance to `<html>` before the first paint; render it first in the document head. A test keeps it in agreement with `applyTheme(readTheme())`.
- `base` (theme): `useTheme` no longer reads storage or the preview frame while rendering, so server rendering no longer throws `window is not defined`, and hydration renders the defaults before the saved theme loads. `readTheme` returns the defaults where there is no storage; `previewFrame` returns `null` where there is no window.
- `base` (theme): hosts choose their own defaults, which apply when nothing is saved and to Restore defaults: `useTheme({ defaults })`, `readTheme(defaults)` and `themeScript({ defaults })`. New exports `themeChoices`, `themeStorageKey` and `normalizeTheme`.
- Modules that use React hooks or context start with `"use client"`, so React Server Components can import kit components directly. Modules that only export values (tokens, preferences, `themeScript`) stay importable on the server.

### Registry

- Packages that only stylesheets import (`shadcn`, `tw-animate-css` and the `@fontsource-variable` fonts) are now development dependencies: they compile at build time, so they no longer ship as runtime dependencies (the `shadcn` CLI brought about 100 packages with it).

## v0.4.0 — 2026-10-09

The registry grows from 71 to 72 items with `answer`: interactive answers that a model composes from a library of components and the kit draws while they stream, with edits and choices that travel back to the model. Tandem's Assistant uses them to catch you up on a project, plan how a project can land and balance the team's work; the reference shows how to connect a real model.

### Interactive answers

- `answer` (new item): `AnswerRenderer` draws an answer a model composes from a library of components (a display tool's streaming input), holding unfinished parts with placeholders and leaving out unknown or invalid ones. `defineAnswerComponent` pairs a Zod props schema with a component, a description for the model and a text form; `createAnswerLibrary` validates answers, reads them as text, and gives the tool's schema and a prompt description (`describe`). `useAnswerState` and `useAnswerAction` connect edits and actions to the host. Generic blocks: Heading, Text, Figures, Section, Callout and Form, with their schemas in `answer-schemas`. Brings `zod`.
- Form: a choice of one option or checks for several, kept with the answer and sent as the person's next message, worded as a sentence, with the values attached through `onAction`. Answer state is plain JSON (`AnswerValue`, `AnswerState`), so a host can keep it with the conversation and send it with the next request.
- Connecting a model: `toolSchema()` gives the display tool's input as a Standard Schema with its JSON Schema, which the AI SDK takes in `tool({ inputSchema })` without casts; `toolInputSchema()` gives plain JSON Schema for a provider's own API. Validation is as lenient as the renderer: a part it can't draw is left out rather than failing the whole answer.

### Demo and reference

- Reference: `/reference/components/answer` replays an answer as it streams, keeps the form's state and shows the message it sends, and adds Connect a model: a type-checked AI SDK route (tested against the AI SDK's mock model), the tool's schema and the prompt description. Component pages can carry a guide after their usage notes.
- The Assistant's Catch up answer is built from components and streamed as a `showAnswer` call. The question asking which project a status update is for names its action.
- "Can we land Website redesign by 8 October?" answers with a plan: a projection, who finishes when and grouped changes that stay linked as the person edits them, an Adjust the plan form, and Apply the plan through an approval that reassigns tasks and posts deferred ones as a comment. Estimates come from a small capacity model (`src/demo/capacity.ts`).
- "Who is overloaded?" answers with a plan across the team's projects, recomposed from the same components: who has what (stacked by project), when each project lands against its due date, and suggested moves. Applying goes through one approval that reassigns tasks across projects. The Conversation panel lists answers and applied plans under Outputs.
- Patterns AI-28 to AI-30 are catalogued.

## v0.3.1 — 2026-10-07

- `base`: in the collapsed navigation rail, the workspace switcher's monogram sits in the middle of the rail like its icons (it sat at the start of the row).

## v0.3.0 — 2026-10-05

The registry grows from 67 to 71 items with a chart system and small charts, components for an agent's background runs, and a kit that fits stricter TypeScript and Biome setups. Tandem shows them in Analytics, across its pages and on project Agent tabs.

### Charts

- `chart`: adds `ChartHeader` and `ChartTotal`, `ChartSeriesPicker` (totals that choose the series) and `ChartSeriesToggle` (a legend that shows and hides series), `ChartDataTable` (Show data), `ChartState` (loading, empty, failed) and `chart-colors` (`seriesColor`, `hueColor`, `maxSeries`). `ChartContainer` no longer clips an end tick label that Recharts places just past the plot.
- New items: `sparkline` (with `trendLabel`), `radial-progress`, `calendar-heatmap` and `uptime-strip`, each accessible without the pointer (a named trend, a meter, a keyboard grid, an uptime summary in words). `calendar-heatmap` days are square and size between `--heatmap-cell-min` and `--heatmap-cell`, so a narrow screen can fill its width before the weeks scroll; its caption never sets the figure's width, so the grid holds still as the pointer moves.
- `base` (theme): `--chart-5` is now sky (was green) so adjacent series stay apart for colour-blind readers; new `--chart-violet` … `--chart-green` tokens follow the record hues in light mode and have their own darker steps in dark mode. Themes that override `--chart-5` are unaffected.
- Reference: `/reference/charts` shows every chart in the kit by family (Area, Bar, Line, Pie, Radar, Radial, Small charts, Tooltip): a live preview on the demo's data, that variant's code, and where Tandem uses it, or Reference only.

### AI and agents

- `ai`: `WorkflowRunSummary`, `WorkflowSteps` and `WorkflowStep` (with `WorkflowRunBadge`) for an agent's background run on a record: state, timing and progress, then each step by state with what it found, how long it took and, on the current step, the decision it needs.
- `ai`: `TaskPlan`, the agent's own plan for a request (title, progress and tasks to do, in progress, done, dropped or blocked), docked above the composer. `Reasoning` takes `onOpenDetails` to open finished reasoning in a host's panel instead of unfolding in place.
- `shimmer`: one sweep every 1.4s (was 2.2s) with a wider bright band, and a `variant="rainbow"` that sweeps the theme's categorical hues, mixed toward the text colour for legibility. `Reasoning` uses it while it streams.
- `code-block` and `terminal`: their focusable scroll areas take `role="region"`, as `ChartDataTable` does, so their labels name them.

### Components and shell

- `badge`: a `count` variant for tallies beside a heading or results control ("6", "38 events").
- `data-table`: `TablePagination` shows page controls only when there is more than one page. Faceted filter and facet drawer triggers mark an applied filter with `data-active`, and an unapplied one has a dashed outline. `TableViewOptions` wraps its label in `.table-view-options-label`, so a host can show only the icon in a tight toolbar.
- `shell`: the icon buttons at either end of the workspace top bar align their icon, rather than their hit area, with the page's content edge at every width. On phones, where parent crumbs are hidden, the top bar shows the nearest linked parent crumb as a back arrow (`.breadcrumb-back`) before the page title; the root crumb is `.breadcrumb-root`. The workspace identity row is a named group.

### Using the kit

- TypeScript: every shipped file compiles under `noUncheckedIndexedAccess` and the Vite template's stricter settings (`noFallthroughCasesInSwitch`, `noUncheckedSideEffectImports`, `erasableSyntaxOnly`, plus `noImplicitReturns` and `noImplicitOverride`); `tsconfig.kit.json` checks this in `npm run typecheck`. `exactOptionalPropertyTypes` and `noPropertyAccessFromIndexSignature` are not supported yet.
- README: a TypeScript, formatting and linting section with a tested Biome setup (format once with `biome check --write`, Tailwind CSS parsing, and overrides for the kit's deliberate ARIA patterns), so the kit can stay inside Biome rather than be excluded.

### Demo and reference

- Analytics is organised into Delivery (tasks completed and added, the change in open tasks, cycle time, with Compare with previous period and a 90-day period), Projects (a burn-up with a projection and due line, previous-period bars, projects by status, share of open work) and Workload (open tasks per person, contributors, a radar comparing two people). Patterns DVIZ-06 to DVIZ-10 and DVIZ-12 are catalogued.
- Small charts across Tandem: Overview sparklines, completion rings on project cards, a calendar heatmap on Activity, API key and webhook usage in Settings, and the uptime strip on the status page (DVIZ-11, DVIZ-13, DVIZ-14). Tasks carry `createdAt`/`completedAt` over about 90 days, with Activity extended to match.
- Project pages gain an Agent tab that runs a status report or launch plan in the background, stops for review before posting or adding tasks, and recovers from a failed step (`?scenario=run-failure`). The Assistant streams a working plan for multi-step replies and gains a Conversation panel (Work, Outputs, Sources).
- Project pages move to a main column with a properties rail, put Tasks, Comments and Activity in tabs, and edit owner, due date, tags and links together in a Details dialog; tasks switch between Open and Completed and have rich-text descriptions. Records drop their in-page back row: the breadcrumb's parent returns to the page they were opened from. Workspace pages start at the content edge on wide screens.
- Charts and toolbars fit phones: legends sit on the content edge with Show data at the end, the Activity calendar fills the width, and Activity's toolbar gives search its own row.

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
