import { afterEach, expect, it, vi } from "vitest"
import { decodePreset, newPreset } from "./preset"
import { presetCSS } from "./preset-document"
import { readPresets, writePresets } from "./preset-storage"

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

it("round-trips both palettes and appearance choices through saved JSON and CSS", () => {
  const preset = newPreset()
  preset.name = "Studio"
  preset.settings = {
    appearance: "system",
    accent: "teal",
    font: "inter",
    radius: "subtle",
    density: "compact",
    headerSurface: "solid",
  }
  preset.colors = {
    light: { primary: "oklch(0.51 0.195 278)", "primary-foreground": "#fff" },
    dark: { primary: "#aabbcc", "primary-foreground": "#112233" },
  }
  let stored = "[]"
  vi.stubGlobal("localStorage", {
    getItem: () => stored,
    setItem: (_key: string, value: string) => {
      stored = value
    },
  })
  expect(writePresets([preset])).toBe("")
  expect(readPresets()).toEqual({ presets: [preset], error: "" })
  expect(decodePreset(JSON.stringify(preset))).toEqual(preset)
  const css = presetCSS(preset)
  expect(css).toContain("--primary: oklch(0.51 0.195 278)")
  expect(css).toContain(":root.dark, :root.dark[data-accent]")
  expect(css).toContain("--primary: #aabbcc")
  expect(css).toContain('data-density="compact"')
  expect(css).toContain('data-radius="subtle"')
  expect(css).toContain("Inter Variable")
})

it("rejects unsupported imports before they can enter the preset library", () => {
  const valid = newPreset()

  for (const invalid of [
    { ...valid, version: 2 },
    { ...valid, settings: { ...valid.settings, font: "missing" } },
    { ...valid, colors: { light: { primary: "var(--unknown)" }, dark: {} } },
    {
      ...valid,
      colors: { light: { primary: "red; background: url(/x)" }, dark: {} },
    },
    { ...valid, colors: { light: { unknown: "red" }, dark: {} } },
  ])
    expect(() => decodePreset(JSON.stringify(invalid))).toThrow()
})

it("reports unavailable persistence without discarding the caller's draft", () => {
  const preset = newPreset()
  vi.stubGlobal("localStorage", {
    getItem: () => "{",
    setItem: () => {
      throw new Error("storage unavailable")
    },
  })
  const warning = vi.spyOn(console, "warn").mockImplementation(() => undefined)
  expect(readPresets().error).toContain("could not be read")
  expect(writePresets([preset])).toContain("Your draft is still here")
  expect(preset).toEqual(newPreset())
  expect(warning).toHaveBeenCalledTimes(2)
})
