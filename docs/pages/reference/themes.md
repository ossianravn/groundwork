# Theme playground

Status: implemented, awaiting review (2026-09-27). Shell: Reference. Inventory owner: SYS-01.

## User workflow

At `/reference/themes`, choose a shipped or saved preset, compare Light/Dark/System, and open Customize for appearance choices, semantic colors or contrast pairs. The preview switches between the actual public product page, dashboard, project table and settings form. Its controls, navigation and portalled overlays work within a separate document and demo session.

The outer editor retains the site's appearance. Edits made through an embedded Appearance panel update the draft and do not write site preferences. System mode follows the outer window's OS media preference, rather than the iframe's inherited color scheme. Reset preview restarts the embedded workflow without changing the draft.

## Editing and persistence

- The shared controls select font, density, corners and header surface. Choosing an accent restores its shipped color values.
- Colors exposes one semantic role at a time, with a labelled CSS value, native picker and paired foreground where available. Invalid input stays visible with an error and leaves the last valid preview in place. No arbitrary input-length restriction.
- Save preset stores a named version on this device. Reusing a name explicitly offers “Replace saved preset.” Storage failure keeps the draft and offers export/retry. Discard changes restores the selected/saved baseline.
- Drafts survive host navigation. Reload restores the last saved preset; ordinary site preferences and record fixtures are separate. No action writes repository files or changes another user's account.

## Import, export and ownership

Version 1 JSON contains a name, all six shared appearance settings and both color palettes. Imports validate supported fields, choices and absolute CSS colors before replacing the current draft; imports are not automatically saved. Errors remain in the dialog and preserve existing work.

Exports resolve all 38 supported color tokens for both modes from the preview document. JSON reopens the full editable preset. CSS exports those same values and the font family, for loading after the shared Tandem stylesheet. Its header specifies the root attributes for accent/radius/density/header and the mode class; font assets must be installed. Shared responsive geometry stays in the existing stylesheet. CSS is not an import format or a standalone theme engine. Copy has a manual-selection fallback; Download offers the generated JSON/CSS file.

`src/features/reference/themes.json` contains shipped preset names/accent identifiers only. `src/styles/` remains the palette-value owner. `src/theme/preset.ts` owns the versioned import contract, `preset-document.ts` resolves/exports values, and `use-preset-library.ts` owns host draft/library state. Saved presets use `groundwork.presets.v1`; ordinary appearance keeps its existing namespace.

## Contrast and responsive behavior

Culori parses colors and calculates six selected foreground/surface ratios in both modes. Text pairs use 4.5:1 and the raw focus-color/card pair uses 3:1. Transparent pairs are marked unmeasured. These results do not cover composited rings, every interactive state or complete accessibility conformance; colors are never silently corrected.

The compact toolbar recomposes on narrow screens. Detailed editing lives in a Sheet, and transfer/save use the shared Dialog. The preview follows its available width and has its own vertical scrolling. Shared primitives retain keyboard, focus, reduced-motion and forced-color behavior; this delivery does not claim physical-device or assistive-technology conformance.

Missing-font simulations, additional high-contrast presets and exhaustive contrast-state coverage remain later work. The supported font catalog supplies installed faces with system fallbacks.

Primary references: [shadcn themes](https://ui.shadcn.com/themes), [Base UI Dialog](https://base-ui.com/react/components/dialog), and [Culori parsing and contrast APIs](https://culorijs.org/api/). The [design system](../../design-system.md) and [demo data contract](../../demo-data.md) remain authoritative.
