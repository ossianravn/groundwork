# Sources and evidence notes

Reviewed: 2026-09-24. These are live sources inspected on that date, not an archived snapshot of every product version. Recheck APIs and browser support when implementation begins; pin selected dependency versions then.

## Local evidence

- [Component inventory](inventory/shadcn-fullstack-template-spec.csv): 73 rows with unique IDs across eight categories.
- [Expanded details](inventory/table-spec-details.md): the same 73 IDs; differences in optionality and recipes are recorded in [UX decisions](ux-decisions.md).
- The project directory initially contained only these two files. No package manifest, application code, installed design system or framework choice was present.
- Subsequent user direction confirms static JSON files as the demo-data source. This resolves the earlier open backend-scope question; the template does not require a live application backend. See [demo data](demo-data.md).

## Inspiration and implementation guidance

### Working reference shortlist — 2026-09-26

The user identified that assembling shadcn primitives without following a coherent, established composition has produced weak layouts. The existing Shadcn Admin reference remains the visual starting point. Use the following sources by purpose; catalog size or use of shadcn does not establish design quality.

| Priority / source | Use in this project | Limits |
| --- | --- | --- |
| Primary visual reference: [Shadcn Admin](https://shadcn-admin.netlify.app/users) | The user-supplied admin direction: complete pages, toolbars, settings, density and hierarchy | Inspect the relevant live workflow and narrow state before adapting it; earlier review is recorded below |
| Primary implementation/composition: [official shadcn blocks](https://ui.shadcn.com/blocks) and [Base UI component examples](https://ui.shadcn.com/docs/components/base/data-table) | Start from a matching block or example, including dashboard-01, rather than composing every arrangement from scratch | Match the project's Base UI / base-nova stack; a primitive example alone does not settle page layout |
| Interaction reference: [Carbon data tables](https://carbondesignsystem.com/components/data-table/usage/) | Toolbar anatomy, selection, batch actions, pagination and action hierarchy | Borrow the relevant interaction, preserving our visual tokens; Carbon styling and every policy are not automatically adopted |
| Interaction reference: [PatternFly bulk selection](https://www.patternfly.org/patterns/bulk-selection/) | Explicit selection scope and shared behavior across tables, lists and cards | Its toolbar selector includes page/all/none and selection-state guidance. Its placement and post-action policy differ from other systems; choose a coherent pattern that fits the agreed behavior, rather than mixing rules |
| Discovery: [Awesome Components](https://github.com/wundercorp/awesome-components) | Find candidate references with screenshots, rendered HTML and prompts | Its README describes a BuilderStudio component-prompt directory. This review did not audit individual components or establish production readiness; trace useful entries to their source before adoption |
| Motion/visual exploration: [Forever Components index](https://forevercomponents.com/components/) | Find animation, feedback and visual-effect ideas when the workflow calls for them | Its index describes self-contained HTML/CSS/JS examples. It is not a shadcn-native admin design system or a general authority for toolbar/form composition |

The official blocks catalog, Carbon usage guide, PatternFly pattern, Awesome Components README, and Forever homepage/index were inspected on 2026-09-26. These are reference roles, not blanket endorsements or accessibility audits.

For an affected workflow, choose the closest complete reference and inspect its resting, active and narrow composition before coding. State the chosen reference and necessary adaptations briefly. Preserve the relationship between selection, actions and content; do not combine unrelated fragments merely because each component exists. Reuse a suitable pattern with our tokens and data, and explain departures through an actual user need. This is part of the existing early design judgment, not an additional audit or approval cycle.

### shadcn tooling

Inbox messaging (2026-09-27): the project-aware CLI retrieved and added the official Base UI/base-nova Message, Bubble and Message Scroller sources, preserving the customized Button. `@shadcn/react` supplies message scrolling. Existing Base UI Dialog/Field/Select/Input/Textarea compose the authoring workflow. Jev supported subject-based correspondence and a flush workspace with one toolbar; no separate chat-room navigation or service was introduced.

The shadcn MCP is connected and was exercised on 2026-09-26. Use it with the local `shadcn` skill: the skill supplies implementation guidance; the MCP supplies registry discovery and examples. The [official MCP documentation](https://ui.shadcn.com/docs/mcp) describes its capabilities. The tested project uses Base UI / `base-nova`; the built-in `@shadcn` registry resolves even though `components.json` declares no additional named registries.

#### Working sequence

1. Inspect the existing local pattern and choose a complete reference from the shortlist above. Use MCP `search_items_in_registries` to find relevant components or blocks, then `get_item_examples_from_registries` for their composition. Inspect the rendered reference as well: source retrieval does not establish layout quality.
2. Check returned imports and APIs against the project. The tested MCP named lookup does **not preserve the project's style/base**: `@shadcn/select` reported Radix dependencies and `data-table-demo` returned `new-york-v4` code using `asChild`. For Base UI implementation source, use the project-aware CLI from this repository, for example `npx.cmd shadcn@latest view @shadcn/select`. Use the Base UI documentation links returned by `npx.cmd shadcn@latest info --json` for usage examples. An explicit `https://ui.shadcn.com/r/styles/base-nova/select.json` also resolved correctly through MCP item lookup, but that tool returned metadata rather than file contents.
3. Adapt the selected composition to existing tokens, components and agreed behavior. When installation is needed, `get_add_command_for_items` can prepare the command; inspect the proposed change before executing it and follow the existing dependency authorization rule. Discovery does not authorize replacing customized primitives or adding dependencies.
4. Apply the existing proportionate verification flow to the change. Reuse successful discovery results; use the CLI for missing or incompatible MCP output rather than repeating both paths routinely. Tool availability adds no separate audit cycle.

#### Connection test results — 2026-09-26

| Check | Observed result |
| --- | --- |
| MCP `get_project_registries` | Returned `@shadcn` |
| MCP search and example retrieval for `data-table` | Found `data-table-demo` and returned complete example code; the example was New York/Radix, requiring adaptation for this project |
| MCP item lookup for named and explicit-URL `select` | Both responded; named lookup reported Radix, while the explicit base-nova URL matched the CLI metadata. Neither lookup exposed source contents |
| MCP `get_add_command_for_items` | Returned `npx shadcn@latest add @shadcn/select`; command generation only, no installation |
| Project CLI `info --json` and `view @shadcn/select` | Confirmed Vite/Base UI/base-nova and retrieved source importing `@base-ui/react/select` |

The search result's inline add command rendered as `[object Promise]`; the dedicated add-command tool worked. The installed shadcn MCP implementation passes only registry configuration into item resolution, omitting style/base, consistent with the observed mismatch. These are tooling limitations, not reasons to change the application's Base UI stack. This check changed documentation only; component installation and application behavior were not exercised.

Follow-up availability check: `select` and the 11-file `dashboard-01` block resolved for base-nova through the CLI. The exact `data-table-demo` registry item did not, although the official Base UI Data Table guide exists. Prefer a matching implementation when available; otherwise adapt a suitable reference's component APIs and styling while preserving its composition. Base UI/base-nova is the implementation foundation, not a restriction on design references.

### Earlier source inspection

| Source | What was inspected | Use and limits |
| --- | --- | --- |
| [Shadcn Admin](https://shadcn-admin.netlify.app/) | Live dashboard and Tasks page, navigation tree, screenshot of dashboard | Inspiration for sidebar/topbar, data density, grouped controls and application layout; no claim of a full accessibility audit |
| [shadcn/ui](https://ui.shadcn.com/) | Component/library entry point and available documentation | Reference library structure and current component vocabulary |
| [shadcn theming](https://ui.shadcn.com/docs/theming) | Semantic CSS variables, foreground pairs, theme extension | Basis for central theme contract |
| [shadcn Field](https://ui.shadcn.com/docs/components/base/field) | Current form composition | Use Field-based composition when compatible with the chosen shadcn base; source inventory's Form names are not a pinned API |
| [shadcn Data Table](https://ui.shadcn.com/docs/components/base/data-table) | Composed table guidance | Starting point for shared table patterns; individual data views still own their columns and behavior |
| [dnd-kit keyboard sensor](https://dndkit.com/legacy/api-documentation/sensors/keyboard/) and [drag overlay](https://dndkit.com/legacy/api-documentation/draggable/drag-overlay/) | Documentation matching installed `@dnd-kit/core` 6.3.1 | Board handle, column-based keyboard coordinates and overlay outside scrolling content; existing Move to menu remains available |
| [Tailwind theme variables](https://tailwindcss.com/docs/theme) | Current theme-variable model | Conditional implementation guidance if Tailwind 4 is chosen |
| [Modern Web Guidance](https://github.com/GoogleChrome/modern-web-guidance) | CLI search and retrieved forms/design-token-reactivity guides | Supplemental guidance; their suggested policies are evaluated against the user's requirements and primary standards |

The admin reference exposes example-only navigation and controls. This proposal takes its composition as inspiration and requires an observable outcome for every control shipped in the demo. It does not inherit the reference's framework, providers, disabled destinations or random sample copy.

## Standards and platform references

| Source | Decision supported |
| --- | --- |
| [WCAG 2.2](https://www.w3.org/TR/WCAG22/) | Proposed AA accessibility target |
| [WCAG 3 introduction](https://www.w3.org/WAI/standards-guidelines/wcag/wcag3-intro/) | WCAG 3 remains developing guidance |
| [Target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) | Distinguish the AA requirement from larger touch-target preferences |
| [Focus not obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html) | Interaction of focus and sticky UI |
| [Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) | Narrow layouts and meaningful table exceptions |
| [Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html) | Animated marketing examples |
| [Accessible authentication](https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html) | Password managers, paste and authentication alternatives |
| [Dragging movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html) | Non-drag pointer controls |
| [WAI table pattern](https://www.w3.org/WAI/ARIA/apg/patterns/table/) | Native semantics and sortable table controls |
| [WAI grid pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/) | Distinguish a data table from a composite grid widget |
| [WAI modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) | Focus handling and modal interaction |
| [MDN navigator.onLine](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine) | Connectivity flag is not proof of service availability |
| [Web Vitals](https://web.dev/articles/vitals) | Performance metrics and field-versus-lab distinction |

## Rich project descriptions (2026-09-27)

The compact toolbar adapts the [Tiptap simple editor](https://tiptap.dev/docs/ui-components/templates/simple-editor) to existing Base UI/shadcn Toggle Group, Button, Tooltip and Popover controls. The [React installation](https://tiptap.dev/docs/editor/getting-started/install/react), [static renderer](https://tiptap.dev/docs/editor/api/utilities/static-renderer) and [Link extension](https://tiptap.dev/docs/editor/extensions/marks/link) own API guidance. Added the MIT-licensed Tiptap core, React, ProseMirror, StarterKit and static-renderer packages; no hosted service. Jev supported keeping the existing bounded form and one limited toolbar. The project shares one schema across editing, paste, previews and rendering; reference source retrieval does not substitute Radix components for the installed Base UI stack.

## Advanced project filtering (2026-09-27)

The [React Query Builder composition](https://react-querybuilder.js.org/docs/components/querybuilder) supplies the field/operator/value and all/any reference. The implementation uses the installed [Base UI Dialog](https://ui.shadcn.com/docs/components/base/dialog), [Select](https://ui.shadcn.com/docs/components/base/select), Field, Input and Button primitives. The shadcn registry search did not supply an advanced builder; no replacement component framework was added. Jev supported a bounded dialog for multiple editable conditions, keeping the existing toolbar compact. The local shared predicate and URL owner implement the accepted flat scope; there is no query service or new dependency.

## Project tags and related links (2026-09-27)

The project CLI retrieved the matching Base UI/base-nova [Combobox](https://ui.shadcn.com/docs/components/base/combobox) and [Collapsible](https://ui.shadcn.com/docs/components/base/collapsible); existing customized Button/Input/Textarea/InputGroup files were preserved. Chips were extracted into a cohesive module to respect the 300-line rule and accept an accessible remove label. Shared density tokens govern chip/control geometry. No package dependency was added. Existing Field/Input/Button primitives compose repeatable URL/label rows. Jev preferred one disclosure, initially open for populated values, over always-visible extras or separate editing dialogs; the local accepted form grid remains authoritative.

Inline tag creation follows the option-in-list composition from the [Base UI creatable Combobox example](https://base-ui.com/react/components/combobox#creatable). The name is already supplied in the picker, so this implementation adds it directly to the draft without the example's additional dialog. The shared tag/save boundary owns trimming and case-insensitive reuse. Chip popups reserve no height for an input inside the popup, since their input sits outside it.

### UI consistency check-up — 2026-09-27

- [Shadcnblocks landing pages](https://www.shadcnblocks.com/pages/landing-page) and [pricing pages](https://www.shadcnblocks.com/pages/pricing-page) join the reference shortlist. Inspected their galleries and the free Landing page 1 / Pricing page 2 descriptions; the web reader received 403 for embedded live previews. No paid code or whole-page package was imported.
- [Chatdeck](https://chatdeck-saas-landing-page.vercel.app/) was inspected in Chromium, including its hero and feature grid. Its connected heading/description groups, aligned icon/content columns and contained product preview inform composition. Its promotional claims and content are not copied.
- Pricing comparison uses the explicit headers, icon cells and mobile horizontal-scrolling approach described in [Shadcnblocks Compare 1](https://www.shadcnblocks.com/block/compare1), adapted to three plans and existing Base UI Table/Accordion. Jev favored the matrix over repeating plan cards. No paid source or new dependency was imported.
- [dnd-kit Sortable](https://dndkit.com/legacy/presets/sortable/overview/) supplies card-level sorting, per-lane contexts and keyboard coordinates compatible with installed core 6.3.1. Added `@dnd-kit/sortable` and declared `@dnd-kit/utilities` for transforms. Installed Base UI/shadcn Avatar, Badge, Button and menus remain the visual primitives. Jev supported shared-owner corrections and natural-height recent activity on narrow layouts.

### Contextual project editing — 2026-09-27

The shadcn MCP inline-edit search returned no matching item. The implementation composes the installed Base UI Input, Select, Button and [Field](https://ui.shadcn.com/docs/components/base/field) primitives instead of adding another package. Explicit Save/Cancel and no blur commit follow the existing local UX decision for EDGE-04. Jev preferred actions beside values over another menu or replacing the summary card; the local UI retains shared spacing, semantic colors and content-sized fields.

## Interpretation

The sitemap, three-surface structure, project-management example, file organization, theme playground and proposed defaults are design recommendations synthesized for this request. They are not prescribed by WCAG or claimed as universal industry standards. The package does not certify legal compliance, endorse a particular backend provider or promise accessibility before implementation and testing.
