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

const storageKey = "groundwork.theme.v1"

export function readTheme(): ThemeSettings {
  if (typeof window !== "undefined") {
    const preview = previewFrame()?.themePreview

    if (preview) return preview.settings
  }

  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? "null") ?? {}

    return {
      appearance:
        saved.appearance === "dark"
          ? "dark"
          : saved.appearance === "system"
            ? "system"
            : "light",
      accent:
        accents.find((accent) => accent.value === saved.accent)?.value ??
        defaultAccent,
      radius: saved.radius === "subtle" ? "subtle" : "rounded",
      density: saved.density === "compact" ? "compact" : "comfortable",
      headerSurface:
        saved.headerSurface === "solid"
          ? "solid"
          : saved.headerSurface === "system"
            ? "system"
            : "glass",
      font:
        interfaceFonts.find((font) => font.value === saved.font)?.value ??
        defaultTheme.font,
    }
  } catch (error) {
    console.warn("Theme preferences could not be read; using defaults.", error)

    return defaultTheme
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
    localStorage.setItem(storageKey, JSON.stringify(theme))

    return true
  } catch (error) {
    console.warn(
      "Theme preferences could not be saved for the next visit.",
      error,
    )

    return false
  }
}
