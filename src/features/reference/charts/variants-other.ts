// Pie, radar, radial, small and tooltip variants.
import type { ChartVariant } from "./gallery-frame"
import {
  PieDonut,
  PieLabels,
  RadarCircle,
  RadarLines,
  RadarMultiple,
} from "./pie-radar-charts"
import {
  RadialRing,
  RadialStacked,
  SmallHeatmap,
  SmallSparkline,
  SmallUptime,
} from "./small-charts"
import { TooltipDot, TooltipFormatter, TooltipLine } from "./tooltip-charts"

export const pieVariants: ChartVariant[] = [
  {
    id: "pie-donut",
    title: "Donut with the total in the centre",
    description:
      "A few parts of one whole, with the total where the eye lands; counts beside it.",
    usedIn: {
      label: "Analytics › Workload",
      href: "/app/demo/analytics#analytics-workload",
    },
    Component: PieDonut,
  },
  {
    id: "pie-labels",
    title: "Pie with labels on the slices",
    description:
      "For three or four parts at most; status takes the status colours.",
    Component: PieLabels,
  },
]

export const radarVariants: ChartVariant[] = [
  {
    id: "radar-multiple",
    title: "Two profiles",
    description:
      "How two series spread across a few dimensions; compare shapes, not totals.",
    usedIn: {
      label: "Analytics › Workload",
      href: "/app/demo/analytics#analytics-workload",
    },
    Component: RadarMultiple,
  },
  {
    id: "radar-circle",
    title: "Circular grid",
    description: "A softer grid for a single profile.",
    Component: RadarCircle,
  },
  {
    id: "radar-lines",
    title: "Outlines only",
    description:
      "Two outlines without fills, the second dashed, so overlaps stay readable.",
    Component: RadarLines,
  },
]

export const radialVariants: ChartVariant[] = [
  {
    id: "radial-ring",
    title: "Progress ring with the figure inside",
    description:
      "How far toward done, as a meter; the number is in the ring and in its label.",
    usedIn: { label: "Projects › grid", href: "/app/demo/projects?view=grid" },
    Component: RadialRing,
  },
  {
    id: "radial-stacked",
    title: "Concentric rings",
    description:
      "Several progress values at once; give the names in a legend or table.",
    Component: RadialStacked,
  },
]

export const smallVariants: ChartVariant[] = [
  {
    id: "small-sparkline",
    title: "Sparkline beside a figure",
    description: "A trend at a glance, named by its trend in words.",
    usedIn: { label: "Overview", href: "/app/demo/overview" },
    Component: SmallSparkline,
  },
  {
    id: "small-heatmap",
    title: "Calendar heatmap",
    description:
      "Rhythm across many days, in one hue; walk it with the arrow keys.",
    usedIn: { label: "Activity", href: "/app/demo/activity" },
    Component: SmallHeatmap,
  },
  {
    id: "small-uptime",
    title: "Uptime strip",
    description:
      "A service's days as good or incident, with the day under the pointer named.",
    usedIn: { label: "Status", href: "/status" },
    Component: SmallUptime,
  },
]

export const tooltipVariants: ChartVariant[] = [
  {
    id: "tooltip-dot",
    title: "Dot indicator",
    description: "The default: a swatch per series, the label on top.",
    usedIn: {
      label: "Analytics › Workload",
      href: "/app/demo/analytics#analytics-workload",
    },
    Component: TooltipDot,
  },
  {
    id: "tooltip-line",
    title: "Line indicator",
    description: "A bar beside each value; suits line and area charts.",
    usedIn: { label: "Analytics › Delivery", href: "/app/demo/analytics" },
    Component: TooltipLine,
  },
  {
    id: "tooltip-formatter",
    title: "Formatted label and values",
    description:
      "Say what the numbers are: a label formatter and a value formatter with units.",
    usedIn: { label: "Analytics › Delivery", href: "/app/demo/analytics" },
    Component: TooltipFormatter,
  },
]
