import * as React from "react"
import type { LegendPayload, TooltipPayloadEntry } from "recharts"

export const THEMES = [
  { name: "light", selector: "" },
  { name: "dark", selector: ".dark" },
] as const

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<(typeof THEMES)[number]["name"], string> }
  )
>

type ChartContextProps = {
  config: ChartConfig
}

export const ChartContext = React.createContext<ChartContextProps | null>(null)

export function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

export function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: LegendPayload | TooltipPayloadEntry | undefined,
  key: string,
) {
  if (!payload) return undefined

  // Recharts owns the entry. Resolve dynamic values only against our declared
  // series names, so arbitrary payload values never become asserted keys.
  const direct = Object.entries(payload).find(([field]) => field === key)?.[1]

  const nested = Object.entries(payload.payload ?? {}).find(
    ([field]) => field === key,
  )?.[1]

  const entries = Object.entries(config)

  return (
    entries.find(([name]) => name === direct)?.[1] ??
    entries.find(([name]) => name === nested)?.[1] ??
    config[key]
  )
}
