import type { ReactNode } from "react"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/kit/ui/card"
import { Button } from "@/kit/ui/button"
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/kit/ui/empty"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/kit/ui/table"
import type { CompletionGroup } from "@/demo/analytics"

export function BreakdownCard({
  title,
  nameLabel,
  previous,
  rows,
  children,
  renderName,
  showData,
  onShowDataChange,
}: {
  title: string
  nameLabel: string
  /** Last period's counts by row id, with what to call that period. */
  previous?: { label: string; counts: Record<string, number> }
  rows: CompletionGroup[]
  children: ReactNode
  renderName: (row: CompletionGroup) => ReactNode
  showData: boolean
  onShowDataChange: (show: boolean) => void
}) {
  return (
    <Card className="analytics-breakdown">
      <CardHeader>
        <CardTitle>
          <h3>{title}</h3>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!rows.length ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No completed tasks</EmptyTitle>
              <EmptyDescription>
                Try another period or project.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : showData ? (
          <div
            className="analytics-data"
            role="region"
            aria-label={`${title} data`}
            tabIndex={0}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">{nameLabel}</TableHead>
                  <TableHead scope="col" className="text-right">
                    Completed tasks
                  </TableHead>
                  {previous && (
                    <TableHead scope="col" className="text-right">
                      {previous.label}
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{renderName(row)}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.completed}
                    </TableCell>
                    {previous && (
                      <TableCell className="text-right tabular-nums">
                        {previous.counts[row.id] ?? 0}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          children
        )}
      </CardContent>
      <CardFooter className="overview-card-footer">
        <span className="analytics-legend-row text-xs text-muted-foreground">
          Completed tasks
          {previous && (
            <span className="analytics-previous-bar">
              <span aria-hidden="true" />
              {previous.label}
            </span>
          )}
        </span>
        <Button
          variant="ghost"
          size="sm"
          aria-label={`${showData ? "Show chart" : "Show data"}: ${title}`}
          aria-pressed={showData}
          onClick={() => onShowDataChange(!showData)}
          disabled={!rows.length}
        >
          {showData ? "Show chart" : "Show data"}
        </Button>
      </CardFooter>
    </Card>
  )
}
