import type { ChartFamily } from "./chart-gallery"
import {
  areaVariants,
  barVariants,
  lineVariants,
  moreBarVariants,
} from "./variants-cartesian"
import {
  pieVariants,
  radarVariants,
  radialVariants,
  smallVariants,
  tooltipVariants,
} from "./variants-other"
import areaChartsSource from "./area-charts?raw"
import barChartsSource from "./bar-charts?raw"
import barChartsMoreSource from "./bar-charts-more?raw"
import lineChartsSource from "./line-charts?raw"
import pieRadarChartsSource from "./pie-radar-charts?raw"
import smallChartsSource from "./small-charts?raw"
import tooltipChartsSource from "./tooltip-charts?raw"

export const chartFamilies: ChartFamily[] = [
  {
    id: "area",
    name: "Area",
    summary: "Change over time, when the volume under the line matters.",
    variants: areaVariants,
    source: areaChartsSource,
  },
  {
    id: "bar",
    name: "Bar",
    summary:
      "Comparing amounts: per day, per project, or above and below zero.",
    variants: [...barVariants, ...moreBarVariants],
    source: barChartsSource + barChartsMoreSource,
  },
  {
    id: "line",
    name: "Line",
    summary:
      "A trend, a target, or a projection, where the shape matters most.",
    variants: lineVariants,
    source: lineChartsSource,
  },
  {
    id: "pie",
    name: "Pie",
    summary: "A few parts of one whole. Past four parts, use bars.",
    variants: pieVariants,
    source: pieRadarChartsSource,
  },
  {
    id: "radar",
    name: "Radar",
    summary: "Profiles across a few dimensions; use sparingly, with a table.",
    variants: radarVariants,
    source: pieRadarChartsSource,
  },
  {
    id: "radial",
    name: "Radial",
    summary: "Progress toward a goal.",
    variants: radialVariants,
    source: smallChartsSource,
  },
  {
    id: "small",
    name: "Small charts",
    summary:
      "Charts that sit inside something else: a metric, a page header, a status row.",
    variants: smallVariants,
    source: smallChartsSource,
  },
  {
    id: "tooltip",
    name: "Tooltip",
    summary: "One tooltip, with indicator and formatting options.",
    variants: tooltipVariants,
    source: tooltipChartsSource,
  },
]
