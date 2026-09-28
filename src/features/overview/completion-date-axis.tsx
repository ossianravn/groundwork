import { usePlotArea, XAxis } from "recharts"
import { formatDate } from "@/demo/model"

export function CompletionDateAxis({
  dates,
  fontSize,
  lineHeight,
  labelWidth,
}: {
  dates: readonly string[]
  fontSize: number
  lineHeight: number
  labelWidth: number
}) {
  const plot = usePlotArea()
  // Endpoint labels are centered on their dates, with room for half a label.
  // Choose evenly spaced dates from the end using the rendered font metrics.
  // interval=0 bypasses Recharts' inherited-font-insensitive tick-size cache.
  const available = Math.max(0, (plot?.width ?? 0) - labelWidth)

  const step = available
    ? Math.max(
        1,
        Math.ceil(((dates.length - 1) * (labelWidth + fontSize)) / available),
      )
    : dates.length

  const ticks = dates.filter(
    (_, index) => (dates.length - 1 - index) % step === 0,
  )

  return (
    <XAxis
      dataKey="date"
      height={lineHeight + fontSize}
      fontSize={fontSize}
      tickMargin={fontSize}
      padding={{ left: labelWidth / 2, right: labelWidth / 2 }}
      ticks={ticks}
      interval={0}
      tickLine={false}
      axisLine={false}
      tickFormatter={(value: string) => formatDate(value)}
    />
  )
}
