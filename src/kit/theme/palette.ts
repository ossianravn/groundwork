import { converter, formatCss, parse, toGamut, wcagContrast } from "culori"
import type { ColorMode, ColorToken, ThemeColors } from "./color-tokens"

// Derives brand and neutral tokens from one seed colour. Starting points come
// from the shipped accents; lightness then moves until each contrast target
// holds, so any seed yields readable links, fills and soft surfaces.

export type NeutralTint = "none" | "subtle"

export const brandTokens = [
  "brand",
  "brand-foreground",
  "brand-soft",
  "brand-soft-foreground",
] as const satisfies readonly ColorToken[]

// Tokens that hold literal greys in theme.css; tokens defined as var(...)
// follow these automatically.
export const tintTokens = [
  "background",
  "foreground",
  "card",
  "primary",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "border",
  "input",
  "control-indicator",
  "sidebar-border",
] as const satisfies readonly ColorToken[]

export interface ContrastCheck {
  mode: ColorMode
  label: string
  ratio: number
  minimum: number
  adjusted: boolean
}

export interface GeneratedPalette {
  colors: ThemeColors
  checks: ContrastCheck[]
}

type Oklch = { mode: "oklch"; l: number; c: number; h: number; alpha?: number }

const toOklch = converter("oklch")

const inGamut = toGamut("rgb", "oklch")

const linkMinimum = 4.5

function oklch(l: number, c: number, h: number): Oklch {
  const mapped = toOklch(inGamut({ mode: "oklch", l, c, h }))

  return { mode: "oklch", l: mapped.l, c: mapped.c ?? 0, h: mapped.h ?? h }
}

function css(color: Oklch) {
  const round = (value: number, digits: number) => Number(value.toFixed(digits))

  return formatCss({
    ...color,
    l: round(color.l, 3),
    c: round(color.c, 3),
    h: round(color.h, 1),
  })
}

interface Reached {
  color: Oklch
  adjusted: boolean
}

/**
 * Moves lightness by `step` from `start` until the colour reaches `minimum`
 * contrast against `against`, or lightness runs out.
 */
function reach(
  start: Oklch,
  against: string,
  minimum: number,
  step: number,
): Reached {
  let color = start
  let adjusted = false

  while (
    wcagContrast(css(color), against) < minimum &&
    color.l + step >= 0 &&
    color.l + step <= 1
  ) {
    color = oklch(color.l + step, start.c, start.h)
    adjusted = true
  }

  return { color, adjusted }
}

/** The more readable of near-white and a deep tone of the brand hue. */
function foregroundOn(fill: Oklch) {
  const light = oklch(0.99, 0, 0)
  const dark = oklch(0.2, Math.min(fill.c, 0.02), fill.h)

  return wcagContrast(css(light), css(fill)) >=
    wcagContrast(css(dark), css(fill))
    ? light
    : dark
}

function tint(value: string, seed: Oklch, mode: ColorMode) {
  const color = toOklch(parse(value))

  if (!color) return value
  // Chroma peaks at mid-lightness, where greys read as grey most easily.
  const weight = 0.2 + 0.8 * (1 - Math.abs(2 * color.l - 1))
  const strength = mode === "light" ? 0.018 : 0.02
  const c = Math.min(strength * weight, seed.c)

  return css({ ...oklch(color.l, c, seed.h), alpha: color.alpha })
}

export function generatePalette({
  seed,
  tint: neutralTint,
  base,
}: {
  seed: string
  tint: NeutralTint
  base: ThemeColors
}): GeneratedPalette | undefined {
  const parsed = toOklch(parse(seed))

  if (!parsed) return undefined
  const source = oklch(parsed.l, parsed.c, parsed.h ?? 0)
  const colors: ThemeColors = { light: {}, dark: {} }
  const checks: ContrastCheck[] = []

  for (const mode of ["light", "dark"] as const) {
    const tokens = colors[mode]

    if (neutralTint === "subtle")
      for (const token of tintTokens) {
        const value = base[mode][token]

        if (value) tokens[token] = tint(value, source, mode)
      }

    const background = tokens.background ?? base[mode].background ?? "white"
    const light = mode === "light"

    // Links and marks: the seed itself in light mode, a lighter, calmer
    // version in dark mode.
    const brand = reach(
      light ? source : oklch(0.76, Math.min(source.c, 0.12), source.h),
      background,
      linkMinimum,
      light ? -0.01 : 0.01,
    )
    // Text on brand fills is near-white or deep, never exactly the page, so
    // the brand may need to move further for its own label to stay readable.

    const foreground = foregroundOn(brand.color)

    const fill = reach(
      brand.color,
      css(foreground),
      linkMinimum,
      light ? -0.01 : 0.01,
    )

    const soft = light
      ? oklch(0.95, Math.min(source.c * 0.15, 0.03), source.h)
      : oklch(0.28, Math.min(source.c * 0.25, 0.05), source.h)

    const softText = reach(
      light
        ? oklch(0.45, Math.min(source.c * 0.9, 0.17), source.h)
        : oklch(0.84, Math.min(source.c * 0.5, 0.09), source.h),
      css(soft),
      linkMinimum,
      light ? -0.01 : 0.01,
    )

    tokens.brand = css(fill.color)
    tokens["brand-foreground"] = css(foreground)
    tokens["brand-soft"] = css(soft)
    tokens["brand-soft-foreground"] = css(softText.color)

    checks.push(
      {
        mode,
        label: "Links on the background",
        ratio: wcagContrast(tokens.brand, background),
        minimum: linkMinimum,
        adjusted: brand.adjusted || fill.adjusted,
      },
      {
        mode,
        label: "Text on brand fills",
        ratio: wcagContrast(tokens["brand-foreground"], tokens.brand),
        minimum: linkMinimum,
        adjusted: fill.adjusted,
      },
      {
        mode,
        label: "Text on soft brand fills",
        ratio: wcagContrast(
          tokens["brand-soft-foreground"],
          tokens["brand-soft"],
        ),
        minimum: linkMinimum,
        adjusted: softText.adjusted,
      },
    )
  }

  return { colors, checks }
}
