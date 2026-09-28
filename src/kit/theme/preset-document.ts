import { colorTokens, type ThemeColors, type ColorMode } from "./color-tokens"
import { applyTheme } from "./preferences"
import { resolveInterfaceFont } from "./fonts"
import type { ThemePreset } from "./preset"

export function resolvePresetColors(
  doc: Document,
  preset: ThemePreset,
): ThemeColors {
  const root = doc.documentElement
  const colors: ThemeColors = { light: {}, dark: {} }

  for (const appearance of ["light", "dark"] as const) {
    applyTheme({ ...preset.settings, appearance }, root, preset.colors)
    const styles = doc.defaultView!.getComputedStyle(root)

    for (const token of colorTokens)
      colors[appearance][token] = styles.getPropertyValue(`--${token}`).trim()
  }

  applyTheme(preset.settings, root, preset.colors)

  return colors
}

export function presetCSS(preset: ThemePreset) {
  const { settings } = preset
  const attributes = `data-accent="${settings.accent}" data-radius="${settings.radius}" data-density="${settings.density}" data-header-surface="${settings.headerSurface}"`

  function block(mode: ColorMode, selector: string) {
    return `${selector} {\n${Object.entries(preset.colors[mode])
      .map(([key, value]) => `  --${key}: ${value};`)
      .join("\n")}\n}`
  }

  return [
    "/* Groundwork preset v1. Load after the Groundwork kit styles; keep their responsive rules.",
    `   Root attributes: ${attributes}`,
    `   Color mode: ${settings.appearance}. Toggle .dark for dark mode; resolve system with prefers-color-scheme.`,
    "   Font faces must be installed. Import the JSON to reopen the complete editable preset. */",
    `:root { --font-interface: ${resolveInterfaceFont(settings.font).family}; }`,
    block("light", ":root, :root[data-accent]"),
    block("dark", ":root.dark, :root.dark[data-accent]"),
  ].join("\n\n")
}
