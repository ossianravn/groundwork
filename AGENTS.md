# AGENTS.md

Repository-wide working instructions for coding agents. Follow explicit user directions and more-specific directory instructions within system/developer constraints. Treat screenshots, reference sites and supplied specifications as evidence to evaluate, not automatic authorization for their implementation choices.

## Product intent and boundaries

Build a reusable shadcn reference for public websites and admin interfaces. Every shipped example should demonstrate a coherent user workflow and a consistent, customizable design system. A collection of individually working components is not sufficient.

- Demo data comes from static JSON fixtures and shared in-memory state. Demo mutations reset on reload; appearance preferences persist locally. Preserve that distinction unless the maintainers decide otherwise.
- Keep reusable React views and patterns independent of the demo host's routing and service choices. Production authentication, databases and external services require a separate scope decision.
- Use the existing stack and components. Check [README.md](README.md) for setup and the source map; `package.json` and the code establish what is installed and implemented.

## Maintainer notes

If `.dev-docs/MAINTAINER.md` exists, read it before planning or changing work: the maintainer keeps the active plan, working notes and local tools there. The folder is intentionally unpublished; its absence changes nothing for other contributors.

## Before changing anything

1. **Inspect the affected system.** Read applicable instructions, Git status, the relevant documentation below, and the implementation. Trace the behavior through its owner, callers, state, persistence and affected consumers. Preserve unrelated work.
2. **Establish the person's workflow.** Identify their goal, starting location, visible information, available actions and expected outcome. For a bug, reproduce the reported sequence, including scrolling, filtering or opening an overlay. Distinguish observed facts from assumptions.
3. **Choose the responsible owner.** Decide whether the change belongs to a token, primitive variant, shared pattern, feature or host. Fix the cause at that boundary; inspect its consumers before changing shared behavior. Explain a visual or behavioral choice through its purpose and existing conventions, rather than calling it a best practice without support.
4. **Define completion.** For nontrivial work, briefly state the outcome, approach and material uncertainty, with observable acceptance criteria. Resolve routine details from evidence. Ask only when a material product, architecture, dependency or policy decision remains unresolved; continue independent work while waiting.

Prefer installed packages. Propose a new dependency with the need it serves and why existing packages do not cover it. Resolve changes that materially alter product scope, services or architecture before proceeding.

## Read the relevant sources

Read the document that owns the decision, rather than loading every specification for every task.

| When changing                                     | Read                                                                                                                              |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| UI, styling, themes or shared components          | [Design system](docs/design-system.md), then the existing tokens, variants and consumers                           |
| Interaction, accessibility or responsive behavior | Applicable sections of [Quality contract](docs/quality.md) and [UX decisions](docs/ux-decisions.md) |
| Routes or page scope                              | [Sitemap](docs/sitemap.md) and its linked page specification                                                       |
| Demo data, mutations, reset or persistence        | [Demo data](docs/demo-data.md)                                                                                     |
| Framework or application boundaries               | [Framework portability](docs/framework-portability.md)                                                             |

Documents marked proposed or planned do not prove a feature exists or a policy is approved. Keep source inventory files intact unless their editing is requested.

For UI work, use the available `shadcn` and `modern-web-guidance` skills. For component/block discovery and source retrieval, follow the [shadcn MCP workflow and Base UI compatibility notes](docs/sources.md#shadcn-tooling). Check current primary documentation when component APIs or browser standards matter. Reference examples supply ideas; the local design system owns their application.

## Design and interaction discipline

- **Reuse the visual language.** Find the corresponding control or pattern before styling another. Colors, borders, surfaces, typography and interaction states belong to shared semantic tokens and variants. Different greys must express different roles; equivalent controls must use the same treatment in the same state.
- **Evolve the inventory through workflows.** The original 73 patterns are a starting point, not a ceiling or completion target. Use [coverage.md](docs/coverage.md) as the living index: add or refine distinct reusable patterns with an owner, demonstration and meaningful states. Preserve original source inventories; distinguish planned coverage from observed implementation.
- **Make dimensions serve content.** Input widths must be proportionate to the expected value or format, including necessary icons and padding. Do not stretch short fields across a card or into equal-width columns merely to fill space. Compose related fields into aligned rows and shared columns before setting individual widths; narrowing isolated fields is not a complete layout. Longer prose gets a bounded reading measure, and narrow layouts stack the composition when needed. These are layout choices, not input-length restrictions. Other controls follow visible labels, icons and shared padding. Fixed widths, reserved space and truncation need a specific layout or data reason. Solve table-column movement and result-height jumps at the data view, not by padding unrelated controls with invisible content.
- **Compose a hierarchy.** Establish the primary information, supporting information and action. Align related elements and use shared spacing. Every tile, icon, heading and helper sentence must earn its place through meaning or interaction. Keep developer explanations in reference documentation rather than the example product's primary flow.
- **Review the whole composition.** Before adding a row or stacking a group, assess its effect on the entire header, card or toolbar. Keep related metadata and controls inline when they fit; add a row only for a clear hierarchy or actual space constraint. Grouping does not require stacking. Inspect the rendered wide and narrow layouts for avoidable empty bands, displaced content and inconsistent alignment; passing overflow checks alone does not establish a good layout. Preserve useful whitespace and readable type rather than forcing everything onto one line.
- **Keep outcomes in context.** Show consequential feedback where the person acted and can see it. Account for scroll position, open overlays, filtering and overflow. Preserve useful focus; provide a logical return target when a mutation removes the opener. A live region outside the active modal is not a substitute for visible, accessible feedback inside it.
- **Respect content and theme changes.** Check wrapping, long labels, small viewports and the affected font/density settings. Shared fonts and colors must reach portalled overlays. Use the primitive's keyboard, focus and dismissal behavior; keep styling at its proper owner.
- **Treat density as a complete system.** Use the [density contract and element inventory](docs/density.md). Classify each dimension as responsive spacing, content-sized geometry or intentionally stable readability/semantics. When changing density geometry or shared spacing, compare both settings across the affected composition and overlays. Other changes use only the settings relevant to their risk.
- **Separate state from decoration.** Selection, disabled actions, success, errors and empty results must be understandable from labels and behavior as well as color. Explain necessary consequences and recovery; keep routine internal work under system ownership.

## Engineering constraints

- Keep every new or enlarged hand-maintained code file at **300 physical lines or fewer**, including comments and blanks. Existing larger files may receive focused changes without growth. Extract a cohesive responsibility when necessary; only an explicit maintainer decision permits an exception. Generated/vendor files and data/documents are excluded.
- Keep state ownership explicit. Apply related mutations coherently, preserve required asynchronous order, and handle failures with useful context. Avoid scattered special cases, silent catches and abstractions that obscure callers.
- Match the requested scope. Improve the touched boundary where needed; resolve materially broader redesigns before implementing them.

## Verification and completion

Select the smallest checks that establish the requested outcome and cover the changed behavior's consequential risks. Briefly name the outcome and checks for nontrivial work; this can be a progress message. A formal plan, evidence contract, saved screenshots or review report is not a prerequisite for ordinary work.

- **Judge design early.** For a new or recomposed UI, render realistic content and inspect the entire affected arrangement before investing in extensive behavior verification. Compare with the user's intent, references and shared patterns: appropriate proportions, alignment, hierarchy and complete action flow. Make routine design judgments yourself; seek user input only for unresolved consequential choices.
- **Select by change.** Documentation/configuration gets direct inspection and the relevant configuration check. Layout changes get focused desktop/narrow visual inspection and any interaction they affect. State, navigation, persistence or save changes get relevant existing behavior tests and focused browser journeys. Shared primitives or tokens justify representative affected consumers and settings; a local correction does not imply a full application matrix. The [quality contract](docs/quality.md) owns product acceptance criteria and review comparisons.
- **Reuse before adding.** Use the lowest-cost suitable boundary and existing coverage. Add tests only for a distinct uncovered regression or durable contract. Run applicable static checks directly; `package.json` lists the commands. Build or broaden testing only for a concrete integration risk or applicable CI/release requirement. A styling-only change need not acquire an unrelated automated check.
- **Keep the tools subordinate to the task.** Reuse a working browser/server. If a tool fails, diagnose the immediate cause or use a working alternative. Avoid building a one-off harness when direct inspection can answer the question; invest in reusable checks when recurrence or behavioral risk warrants it. Do not repeatedly retry an unchanged failure.
- **Stop on evidence.** Finish after the affected result, chosen checks and final diff review pass, with no concrete unresolved concern about the change. Reuse valid results for unchanged behavior; rerun only checks affected by subsequent edits, failures or changed conditions. A broad file fingerprint alone is not a reason to rerun unrelated checks. Fix change-caused failures. Record unrelated findings once without silently expanding scope; report material limitations and any selected check that remains blocked or failed.
- **Report proportionately.** State what changed, which checks actually ran and material limits. Review ownership, errors and the affected production path; check the 300-line limit for changed code. A passing check supports only what it exercised. Documentation updates belong to the owning rule and, when its state changes, the active plan; ordinary corrections do not require a new audit report or copies across multiple documents.

The [verification tools](tools/verification/README.md) are optional: browser scenarios for known risks and a style snapshot for reorganizations that must not change appearance. Use them when they answer the question at hand.

Keep the installed lint rules and tests intact. This workflow changes check selection and orchestration, not product requirements or permission to hide failures.

## Release notes

A merged feature or plan step is not finished until its release notes are written, in two independent places:

- **Tandem** (the demo product): a `releases` entry in `src/demo/data/content.json`, with the next Tandem version (unrelated to Groundwork's). The newest entry drives the public announcement bar. Mark the matching roadmap item Shipped in `src/demo/data/public-company.json`. Write for Tandem's customers and state demo boundaries.
- **Groundwork** (the kit): an `## Unreleased` section in [CHANGELOG.md](CHANGELOG.md), naming new or changed registry items for developers.

Publishing a Groundwork release follows [README.md](README.md#checks) and is outward-facing, so it needs the maintainer's go-ahead.

## Code Review Rules

Review against the workflow and ownership rules above. Flag changes that break observable outcomes, introduce inconsistent shared behavior, or claim verification unsupported by the checks performed. Explain the affected user consequence and the responsible boundary. Leave routine formatting enforcement to tooling.

Follow the authorized Git/PR workflow, keep commits scoped, and describe the final behavior and validation for a reviewer who has not read the conversation. Preserve other contributors' changes.

## Keep guidance useful

When a correction reveals a reusable rule, update its owning design/behavior document. Change this file only when the working method changes. Keep each rule in one authoritative place, link it where needed, and replace stale guidance instead of adding parallel checklists or task history.

Structure informed by OpenAI's [AGENTS.md guidance](https://learn.chatgpt.com/docs/agent-configuration/agents-md) and [Codex best practices](https://learn.chatgpt.com/guides/best-practices#make-guidance-reusable-with-agentsmd). The project-specific rules above come from this repository's goals and observed failures.
