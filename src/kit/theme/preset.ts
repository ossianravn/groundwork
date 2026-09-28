/* oxlint-disable anti-slop/no-unknown-parameters, anti-slop/no-unsafe-dictionary-type, anti-slop/no-runtime-typeof -- This module parses external preset JSON; unknown representations stay inside this boundary until every field is validated. */
import { parse } from "culori"
import { defaultTheme, type ThemeSettings } from "./preferences"
import { interfaceFonts } from "./fonts"
import { accents } from "./accents"

import { colorTokens, type ThemeColors } from "./color-tokens"

export type { ColorToken, ColorMode, ThemeColors } from "./color-tokens"

export interface ThemePreset {
  version: 1
  name: string
  settings: ThemeSettings
  colors: ThemeColors
}

export function newPreset(
  settings = defaultTheme,
  name = "Indigo",
): ThemePreset {
  return {
    version: 1,
    name,
    settings: { ...settings },
    colors: { light: {}, dark: {} },
  }
}

const settingsValues = {
  appearance: ["light", "dark", "system"],
  accent: accents.map((accent) => accent.value),
  radius: ["subtle", "rounded"],
  density: ["comfortable", "compact"],
  headerSurface: ["glass", "solid", "system"],
  font: interfaceFonts.map((font) => font.value),
} as const

function setting<K extends keyof ThemeSettings>(
  settings: Record<string, unknown>,
  key: K,
): ThemeSettings[K] {
  const selected = settingsValues[key].find((item) => item === settings[key])

  if (selected === undefined)
    throw new Error(`Unsupported ${key}: ${String(settings[key])}.`)

  // SAFETY: each keyed list contains only the corresponding ThemeSettings values.
  return selected as ThemeSettings[K]
}

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Expected a preset object.")

  // SAFETY: the check above established a non-null, non-array object; values remain unknown.
  return value as Record<string, unknown>
}

function exactKeys(
  value: Record<string, unknown>,
  supported: readonly string[],
) {
  const unknown = Object.keys(value).filter((key) => !supported.includes(key))

  if (unknown.length)
    throw new Error(`Unsupported fields: ${unknown.join(", ")}.`)
}

export function decodePreset(input: string): ThemePreset {
  const value = object(JSON.parse(input))
  exactKeys(value, ["version", "name", "settings", "colors"])

  if (value.version !== 1)
    throw new Error("This preset version is not supported. Use version 1.")

  if (typeof value.name !== "string" || !value.name.trim())
    throw new Error("Give the preset a name.")
  const settings = object(value.settings)
  exactKeys(settings, Object.keys(settingsValues))
  const colors = object(value.colors)
  exactKeys(colors, ["light", "dark"])
  const parsedColors: ThemeColors = { light: {}, dark: {} }

  for (const mode of ["light", "dark"] as const) {
    const tokens = object(colors[mode])
    exactKeys(tokens, colorTokens)

    for (const key of colorTokens) {
      if (!(key in tokens)) continue
      const color = tokens[key]

      if (typeof color !== "string" || !parse(color))
        throw new Error(
          `Invalid ${mode} color: ${key}. Use an absolute CSS color.`,
        )
      parsedColors[mode][key] = color
    }
  }

  return {
    version: 1,
    name: value.name.trim(),
    settings: {
      appearance: setting(settings, "appearance"),
      accent: setting(settings, "accent"),
      radius: setting(settings, "radius"),
      density: setting(settings, "density"),
      headerSurface: setting(settings, "headerSurface"),
      font: setting(settings, "font"),
    },
    colors: parsedColors,
  }
}

export function samePreset(a: ThemePreset, b: ThemePreset) {
  return JSON.stringify(a) === JSON.stringify(b)
}
