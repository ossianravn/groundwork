import { expect, it } from "vitest"
import theme from "@/kit/styles/theme.css?raw"
import { chartHues, hueColor, maxSeries, seriesColor } from "./chart-colors"

it("orders series as the theme does and never cycles", () => {
  const order = [1, 2, 3, 4, 5].map(
    (index) =>
      theme.match(
        new RegExp(`--chart-${index}: var\\(--chart-([a-z]+)\\)`),
      )?.[1],
  )

  expect(order).toEqual(chartHues.slice(0, 5))
  expect(seriesColor(0)).toBe("var(--chart-1)")
  expect(seriesColor(5)).toBe(hueColor("green"))
  expect(() => seriesColor(maxSeries)).toThrow(RangeError)
})

it("gives every hue a chart step in light and dark mode", () => {
  for (const hue of chartHues)
    expect(theme.match(new RegExp(`--chart-${hue}:`, "g"))).toHaveLength(2)
})
