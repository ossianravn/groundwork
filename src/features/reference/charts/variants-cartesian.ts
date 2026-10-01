// Area, bar and line variants; each links to where Tandem uses it.
import type { ChartVariant } from "./gallery-frame"
import {
  AreaExpanded,
  AreaGradient,
  AreaStacked,
  AreaStep,
} from "./area-charts"
import {
  BarActive,
  BarGrouped,
  BarHorizontal,
  BarInteractive,
} from "./bar-charts"
import { BarNegative, BarOutcome, BarStacked } from "./bar-charts-more"
import { LineBurnUp, LineDots, LineLabels } from "./line-charts"

export const areaVariants: ChartVariant[] = [
  {
    id: "area-gradient",
    title: "Two series with gradients and a toggle legend",
    description:
      "Compare two flows over time. The legend shows and hides each, keeping one on.",
    usedIn: { label: "Analytics › Delivery", href: "/app/demo/analytics" },
    Component: AreaGradient,
  },
  {
    id: "area-expanded",
    title: "Expanded (100%) stack",
    description:
      "Each part's share over time, when the total matters less than the mix.",
    usedIn: {
      label: "Analytics › Projects",
      href: "/app/demo/analytics#analytics-projects",
    },
    Component: AreaExpanded,
  },
  {
    id: "area-step",
    title: "Step",
    description: "Counts that change in jumps, such as requests per day.",
    usedIn: {
      label: "Settings › API keys",
      href: "/app/demo/settings/api-keys",
    },
    Component: AreaStep,
  },
  {
    id: "area-stacked",
    title: "Stacked",
    description:
      "Parts adding up to a total over time. Order stacks by the palette so neighbours stay apart.",
    Component: AreaStacked,
  },
]

export const barVariants: ChartVariant[] = [
  {
    id: "bar-active",
    title: "Bars with one day emphasised",
    description:
      "Amounts per day; earlier days recede so the latest reads first.",
    usedIn: { label: "Overview", href: "/app/demo/overview" },
    Component: BarActive,
  },
  {
    id: "bar-interactive",
    title: "Totals that choose the series",
    description:
      "The heading's totals are pressed-state buttons that switch what the bars show.",
    usedIn: { label: "Overview", href: "/app/demo/overview" },
    Component: BarInteractive,
  },
  {
    id: "bar-horizontal",
    title: "Horizontal with value labels",
    description:
      "Ranked categories with long names; values on the bars, no hover needed.",
    usedIn: {
      label: "Analytics › Projects",
      href: "/app/demo/analytics#analytics-projects",
    },
    Component: BarHorizontal,
  },
  {
    id: "bar-grouped",
    title: "Grouped with the previous period",
    description: "This period beside the one before, the earlier bar quieter.",
    usedIn: {
      label: "Analytics, comparing",
      href: "/app/demo/analytics?compare=true#analytics-projects",
    },
    Component: BarGrouped,
  },
]

export const moreBarVariants: ChartVariant[] = [
  {
    id: "bar-stacked",
    title: "Stacked horizontal",
    description:
      "A total and what makes it up, per row; hues follow each project.",
    usedIn: {
      label: "Analytics › Workload",
      href: "/app/demo/analytics#analytics-workload",
    },
    Component: BarStacked,
  },
  {
    id: "bar-negative",
    title: "Above and below zero",
    description:
      "Change in both directions, in two poles no other series uses.",
    usedIn: { label: "Analytics › Delivery", href: "/app/demo/analytics" },
    Component: BarNegative,
  },
  {
    id: "bar-outcome",
    title: "Stacked outcomes",
    description:
      "Two outcomes per day in one bar; status colours when the outcome is a state.",
    usedIn: {
      label: "Settings › Webhooks",
      href: "/app/demo/settings/webhooks",
    },
    Component: BarOutcome,
  },
]

export const lineVariants: ChartVariant[] = [
  {
    id: "line-labels",
    title: "Values on the points",
    description: "A trend whose numbers matter, readable without hovering.",
    usedIn: { label: "Analytics › Delivery", href: "/app/demo/analytics" },
    Component: LineLabels,
  },
  {
    id: "line-burn-up",
    title: "Burn-up with a projection and due line",
    description:
      "Scope as steps, work done rising toward it, and where it is heading.",
    usedIn: {
      label: "Project › Activity",
      href: "/app/demo/projects/website?tab=activity",
    },
    Component: LineBurnUp,
  },
  {
    id: "line-dots",
    title: "Dots that carry a second fact",
    description:
      "Filled where a condition holds (the backlog shrank that week); say so in the label.",
    Component: LineDots,
  },
]
