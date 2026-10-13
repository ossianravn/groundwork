import {
  defaultInterfaceFont,
  interfaceFonts,
  resolveInterfaceFont,
  type InterfaceFont,
} from "./fonts"
import { previewFrame } from "./preview-frame"
import { accents, defaultAccent, type Accent } from "./accents"
import { colorTokens, type ThemeColors } from "./color-tokens"

export type Appearance = "light" | "dark" | "system"

export type { Accent }

export type Radius = "subtle" | "rounded"

export type Density = "comfortable" | "compact"

export type HeaderSurface = "glass" | "solid" | "system"

export interface ThemeSettings {
  appearance: Appearance
  accent: Accent
  radius: Radius
  density: Density
  headerSurface: HeaderSurface
  font: InterfaceFont
}

export const defaultTheme: ThemeSettings = {
  appearance: "light",
  accent: defaultAccent,
  radius: "rounded",
  density: "comfortable",
  headerSurface: "glass",
  font: defaultInterfaceFont.value,
}

export const themeStorageKey = "groundwork.theme.v1"

/** The values each saved preference may take; anything else falls back to the default. */
export const themeChoices: {
  [Key in keyof ThemeSettings]: readonly ThemeSettings[Key][]
} = {
  appearance: ["light", "dark", "system"],
  accent: accents.map((accent) => accent.value),
  radius: ["subtle", "rounded"],
  density: ["comfortable", "compact"],
  headerSurface: ["glass", "solid", "system"],
  font: interfaceFonts.map((font) => font.value),
}

/** Decodes each saved choice independently, keeping the host's default for any it cannot use. */
export function normalizeTheme(
  saved: unknown,
  defaults: ThemeSettings = defaultTheme,
): ThemeSettings {
  const record: Record<string, unknown> =
    typeof saved === "object" && saved !== null ? { ...saved } : {}

  const pick = <Key extends keyof ThemeSettings>(key: Key) => {
    const value = record[key]
    const allowed: readonly unknown[] = themeChoices[key]

    // SAFETY: value is one of this key's allowed values.
    return allowed.includes(value)
      ? (value as ThemeSettings[Key])
      : defaults[key]
  }

  return {
    appearance: pick("appearance"),
    accent: pick("accent"),
    radius: pick("radius"),
    density: pick("density"),
    headerSurface: pick("headerSurface"),
    font: pick("font"),
  }
}

export function readTheme(
  defaults: ThemeSettings = defaultTheme,
): ThemeSettings {
  const preview = previewFrame()?.themePreview

  if (preview) return preview.settings

  // Server rendering has no storage; hosts apply the saved theme before paint with themeScript().
  if (typeof localStorage === "undefined") return defaults

  try {
    return normalizeTheme(
      JSON.parse(localStorage.getItem(themeStorageKey) ?? "null"),
      defaults,
    )
  } catch (error) {
    console.warn("Theme preferences could not be read; using defaults.", error)

    return defaults
  }
}

export function applyTheme(
  theme: ThemeSettings,
  root = document.documentElement,
  colors?: ThemeColors,
) {
  const dark =
    theme.appearance === "dark" ||
    (theme.appearance === "system" &&
      (previewFrame()?.ownerDocument.defaultView ?? window).matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches)

  root.classList.toggle("dark", dark)
  root.style.colorScheme = dark ? "dark" : "light"
  root.dataset.accent = theme.accent
  root.dataset.radius = theme.radius
  root.dataset.density = theme.density
  root.dataset.headerSurface = theme.headerSurface
  root.style.setProperty(
    "--font-interface",
    resolveInterfaceFont(theme.font).family,
  )

  const overrides =
    colors ??
    (root === document.documentElement
      ? previewFrame()?.themePreview?.colors
      : undefined)

  const current = overrides?.[dark ? "dark" : "light"] ?? {}

  for (const name of colorTokens) root.style.removeProperty(`--${name}`)

  for (const [name, value] of Object.entries(current))
    root.style.setProperty(`--${name}`, value)
}

export function saveTheme(theme: ThemeSettings) {
  try {
    localStorage.setItem(themeStorageKey, JSON.stringify(theme))

    return true
  } catch (error) {
    console.warn(
      "Theme preferences could not be saved for the next visit.",
      error,
    )

    return false
  }
}
