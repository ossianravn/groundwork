import { useState, type ReactNode } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/kit/ui/card"
import { Button } from "@/kit/ui/button"
import { ChartHeader } from "@/kit/ui/chart-header"
import { ChartState } from "@/kit/ui/chart-state"

/**
 * One Analytics chart: the result as its heading (with any controls that
 * set its scope), the chart (or its table, in the same space) and a footer
 * with the legend and Show data.
 */
export function AnalyticsChartCard({
  label,
  heading,
  description,
  controls,
  legend,
  table,
  children,
  empty = false,
  className,
}: {
  /** Names the chart for Show data's accessible label. */
  label: string
  heading: ReactNode
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
        <ChartHeader title={heading} description={description}>
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
