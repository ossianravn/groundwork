/**
 * Chart colours. Series take the categorical tokens in a fixed order, the
 * order the palette validator passed for colour-blind separation, and never
 * cycle: a chart with more series than colours folds the rest into Other.
 * A record with its own hue (a project) keeps that hue as a chart mark.
 */
export const chartHues = [
  "violet",
  "teal",
  "amber",
  "rose",
  "sky",
  "green",
] as const

export type ChartHue = (typeof chartHues)[number]

/** Series available before the rest must fold into Other. */
export const maxSeries = chartHues.length

/** The colour of the series at index (0-based) in a categorical chart. */
export function seriesColor(index: number) {
  if (index < 0 || index >= maxSeries || !Number.isInteger(index))
    throw new RangeError(
      `Series ${index} has no colour; fold series past ${maxSeries} into Other`,
    )

  // The five shadcn tokens stay editable in themes; the sixth is green.
  return index < 5 ? `var(--chart-${index + 1})` : "var(--chart-green)"
}

/** A record's own hue as a chart mark, with dark mode's chart step. */
export const hueColor = (hue: ChartHue) => `var(--chart-${hue})`
