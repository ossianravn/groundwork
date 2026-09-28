import { expect, it } from "vitest"
import type { LegendPayload, TooltipPayloadEntry } from "recharts"
import { getPayloadConfigFromPayload } from "./chart-context"

const config = {
  tasks: { label: "Tasks completed", color: "black" },
  desktop: { label: "Desktop", color: "blue" },
}

it("resolves configured series from Recharts tooltip and legend entries", () => {
  const tooltip = {
    name: "tasks",
    value: 7,
    graphicalItemId: "tasks-area",
  } satisfies TooltipPayloadEntry

  const legend = {
    value: "desktop",
    payload: { category: "desktop" },
  } satisfies LegendPayload

  expect(getPayloadConfigFromPayload(config, tooltip, "name")).toBe(
    config.tasks,
  )
  expect(getPayloadConfigFromPayload(config, legend, "category")).toBe(
    config.desktop,
  )
})

it("uses the requested series when dynamic metadata is not a configured series", () => {
  const tooltip = {
    value: 7,
    payload: { tasks: 7 },
    graphicalItemId: "tasks-area",
  } satisfies TooltipPayloadEntry

  expect(getPayloadConfigFromPayload(config, tooltip, "tasks")).toBe(
    config.tasks,
  )
  expect(
    getPayloadConfigFromPayload(config, tooltip, "missing"),
  ).toBeUndefined()
  expect(
    getPayloadConfigFromPayload(config, undefined, "tasks"),
  ).toBeUndefined()
})
