export const chartFamilies = [
  "area",
  "bar",
  "line",
  "pie",
  "radar",
  "radial",
  "small",
  "tooltip",
] as const

export type ChartFamilyId = (typeof chartFamilies)[number]

/** A family from the URL, or Area for anything unknown. */
export const chartFamilyOf = (value: string): ChartFamilyId =>
  chartFamilies.find((family) => family === value) ?? "area"
