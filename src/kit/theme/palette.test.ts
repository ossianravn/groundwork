import { describe, expect, it } from "vitest"
import { converter, parse } from "culori"
import { generatePalette } from "./palette"
import type { ThemeColors } from "./color-tokens"

const toOklch = converter("oklch")

// Resolved values from theme.css, as the playground passes them.
const base: ThemeColors = {
  light: {
    background: "oklch(0.995 0.001 270)",
    foreground: "oklch(0.23 0.012 270)",
    "muted-foreground": "oklch(0.49 0.014 270)",
  },
  dark: {
    background: "oklch(0.155 0.005 270)",
    foreground: "oklch(0.95 0.004 270)",
    border: "oklch(1 0 0 / 10%)",
  },
}

describe("generatePalette", () => {
  it.each([
    "#facc15", // yellow: far too light for links on white
    "#84cc16",
    "#06b6d4",
    "#dc2626",
    "#f5f5f5",
    "#111111",
    "#6b7280",
    "oklch(0.51 0.195 278)",
  ])("keeps every brand pairing readable for %s", (seed) => {
    const palette = generatePalette({ seed, tint: "subtle", base })!

    for (const check of palette.checks)
      expect(
        check.ratio,
        `${check.mode}: ${check.label}`,
      ).toBeGreaterThanOrEqual(check.minimum)
  })

  it("keeps a readable seed as the light brand and reports adjustments", () => {
    const indigo = generatePalette({
      seed: "oklch(0.51 0.195 278)",
      tint: "none",
      base,
    })!

    const yellow = generatePalette({ seed: "#facc15", tint: "none", base })!

    expect(indigo.colors.light.brand).toBe("oklch(0.51 0.195 278)")
    expect(indigo.checks[0].adjusted).toBe(false)
    expect(yellow.checks[0].adjusted).toBe(true)
  })

  it("tints neutrals at their own lightness and alpha, and only when asked", () => {
    const tinted = generatePalette({ seed: "#dc2626", tint: "subtle", base })!
    const plain = generatePalette({ seed: "#dc2626", tint: "none", base })!
    const before = toOklch(parse(base.light["muted-foreground"]!))!
    const after = toOklch(parse(tinted.colors.light["muted-foreground"]!))!
    const border = toOklch(parse(tinted.colors.dark.border!))!

    expect(after.l).toBeCloseTo(before.l, 2)
    expect(after.h).toBeCloseTo(toOklch(parse("#dc2626"))!.h!, 0)
    expect(border.alpha).toBeCloseTo(0.1)
    expect(plain.colors.light["muted-foreground"]).toBeUndefined()
  })

  it("leaves greys untinted for a grey seed", () => {
    const palette = generatePalette({ seed: "#808080", tint: "subtle", base })!
    const foreground = toOklch(parse(palette.colors.light.foreground!))!

    expect(foreground.c).toBeLessThan(0.001)
  })

  it("rejects a value that is not a colour", () => {
    expect(generatePalette({ seed: "brand", tint: "none", base })).toBe(
      undefined,
    )
  })
})
