import { useState, type ReactNode } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/kit/ui/card"
import { Button } from "@/kit/ui/button"
import { ChartHeader } from "@/kit/ui/chart-header"
import { ChartState } from "@/kit/ui/chart-state"

/**
 * One Analytics chart: the kit ChartHeader (its name, key figure, takeaway
 * and scope controls), the chart (or its table, in the same space) and a
 * footer with the legend and Show data.
 */
export function AnalyticsChartCard({
  label,
  title = label,
  figure,
  description,
  controls,
  legend,
  table,
  children,
  empty = false,
  className,
}: {
  /** Names the chart: its title, and Show data's accessible label. */
  label: string
  /** A shorter visible title, when controls name the rest. */
  title?: ReactNode
  /** The key figure, usually a ChartTotal. */
  figure?: ReactNode
  /** The takeaway, in one line. */
  description?: ReactNode
  /** Scope controls, such as which project it shows, at the header's end. */
  controls?: ReactNode
  legend?: ReactNode
  table: ReactNode
  children: ReactNode
  /** Nothing happened in the period: say so instead of drawing zeros. */
  empty?: boolean
  className?: string
}) {
  const [showData, setShowData] = useState(false)

  return (
    <Card className={["analytics-chart", className].filter(Boolean).join(" ")}>
      <CardHeader>
        <ChartHeader title={title} figure={figure} description={description}>
          {controls}
        </ChartHeader>
      </CardHeader>
      <CardContent className="chart-body text-xs">
        {empty ? (
          <ChartState
            status="empty"
            description="Try a longer period or another project."
          />
        ) : showData ? (
          table
        ) : (
          children
        )}
      </CardContent>
      <CardFooter className="overview-card-footer">
        {(!empty && legend) || <span />}
        <Button
          variant="ghost"
          size="sm"
          aria-label={`${showData ? "Show chart" : "Show data"}: ${label}`}
          aria-pressed={showData}
          onClick={() => setShowData(!showData)}
          disabled={empty}
        >
          {showData ? "Show chart" : "Show data"}
        </Button>
      </CardFooter>
    </Card>
  )
}
