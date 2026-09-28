import { afterEach, expect, it, vi } from "vitest"
import { defaultTheme, readTheme } from "./preferences"

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

it("adds the default font to existing saved preferences without resetting their other choices", () => {
  const saved = {
    appearance: "dark",
    accent: "teal",
    radius: "subtle",
    density: "compact",
    headerSurface: "solid",
  }

  vi.stubGlobal("localStorage", { getItem: () => JSON.stringify(saved) })

  expect(readTheme()).toEqual({ ...saved, font: "geist" })
})

it("decodes each saved choice independently and retains a supported font", () => {
  const saved = {
    appearance: "system",
    accent: ["teal"],
    radius: null,
    density: "compact",
    headerSurface: 1,
    font: "source-sans-3",
  }

  vi.stubGlobal("localStorage", { getItem: () => JSON.stringify(saved) })

  expect(readTheme()).toEqual({
    ...defaultTheme,
    appearance: "system",
    density: "compact",
    font: "source-sans-3",
  })
})

it.each(["null", '"dark"', '{"font":"unavailable"}'])(
  "uses defaults for unsupported saved data: %s",
  (saved) => {
    vi.stubGlobal("localStorage", { getItem: () => saved })

    expect(readTheme()).toEqual(defaultTheme)
  },
)

it("recovers from malformed saved JSON and reports the read failure", () => {
  vi.stubGlobal("localStorage", { getItem: () => "{" })
  const warning = vi.spyOn(console, "warn").mockImplementation(() => undefined)

  expect(readTheme()).toEqual(defaultTheme)
  expect(warning).toHaveBeenCalledOnce()
})
