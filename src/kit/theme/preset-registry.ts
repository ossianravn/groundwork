import type { ColorMode } from "./color-tokens"
import type { ThemePreset } from "./preset"

// A preset as a shadcn registry item. `shadcn add` writes the file beside the
// kit's styles and appends its @import to kit.css, after theme.css. The
// override selectors then win over the defaults and every accent block.
// Assumes the Groundwork layout: kit.css at src/kit/styles/.

export interface ThemeRegistryItem {
  $schema: string
  name: string
  type: "registry:theme"
  title: string
  description: string
  files: {
    path: string
    type: "registry:file"
    target: string
    content: string
  }[]
  css: Record<string, Record<string, never>>
}

/** A file-safe item name, such as "studio-north" for "Studio North". */
export function registryName(name: string) {
  const slug = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-+|-+$/gu, "")

  return slug || "groundwork-theme"
}

/**
 * The installed theme file, formatted as Prettier would leave it. The font
 * stays an appearance setting: applyTheme sets it at runtime.
 */
function themeFile(preset: ThemePreset, name: string) {
  const block = (mode: ColorMode, selectors: string[]) => {
    const tokens = Object.entries(preset.colors[mode])
      .map(([token, value]) => `  --${token}: ${value};\n`)
      .join("")

    return `${selectors.join(",\n")} {\n${tokens}}\n`
  }

  return [
    `/* Groundwork theme "${name}", exported from the theme playground.\n   Loads after the kit tokens and overrides them in light and dark mode. */\n`,
    // Light values must not leak into dark mode when a token is set only in
    // light, so the light block excludes .dark rather than relying on order.
    block("light", [":root:not(.dark)", ":root:not(.dark)[data-accent]"]),
    block("dark", [":root.dark", ":root.dark[data-accent]"]),
  ].join("\n")
}

export function presetRegistryItem(preset: ThemePreset): ThemeRegistryItem {
  const name = registryName(preset.name)
  const path = `themes/${name}.css`

  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name,
    type: "registry:theme",
    title: preset.name,
    description: `Groundwork theme "${preset.name}": light and dark color tokens.`,
    files: [
      {
        path,
        type: "registry:file",
        target: `src/kit/styles/${path}`,
        content: themeFile(preset, name),
      },
    ],
    css: { [`@import "./${path}"`]: {} },
  }
}
