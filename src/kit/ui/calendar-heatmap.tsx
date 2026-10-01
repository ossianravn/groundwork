import * as React from "react"
import { cn } from "cn"

export interface HeatmapDay {
  /** ISO date. */
  date: string
  value: number
}

const day = (iso: string) => new Date(`${iso}T00:00:00Z`)

const shift = (iso: string, days: number) => {
  const next = day(iso)

  next.setUTCDate(next.getUTCDate() + days)

  return next.toISOString().slice(0, 10)
}

const short = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
})

const month = new Intl.DateTimeFormat("en-GB", {
  month: "short",
  timeZone: "UTC",
})

/** Five steps of one hue, light to dark; zero stays the empty well. */
const level = (value: number, max: number) =>
  value <= 0 ? 0 : Math.min(4, Math.ceil((value / max) * 4))

const shade = ["0%", "30%", "52%", "76%", "100%"]

/**
 * Activity by day as a calendar: a column per week (Monday first), a cell
 * per day, darker for more (GitHub-style). A grid you can walk with the
 * arrow keys, a day at a time down a week and a week at a time across; the
 * line below names the day in focus or under the pointer.
 */
function CalendarHeatmap({
  days,
  label,
  describe,
  color = "var(--brand)",
  className,
}: {
  /** Consecutive days, oldest first. */
  days: HeatmapDay[]
  label: string
  /** A day's value in words: "5 tasks completed". */
  describe: (value: number) => string
  color?: string
  className?: string
}) {
  const first = days[0]?.date ?? ""
  const offset = first ? (day(first).getUTCDay() + 6) % 7 : 0
  const max = Math.max(1, ...days.map((item) => item.value))
  const [active, setActive] = React.useState(days.at(-1)?.date ?? "")
  const [shown, setShown] = React.useState<string>()
  const grid = React.useRef<HTMLDivElement>(null)
  const byDate = new Map(days.map((item) => [item.date, item.value]))
  const weeks = Math.ceil((offset + days.length) / 7)
  const current = shown ?? active
  // Cells take --heatmap-cell (0.75rem unless the host sets it).
  const columns = `1.75rem repeat(${weeks}, var(--heatmap-cell, 0.75rem))`

  const move = (to: string) => {
    if (!byDate.has(to)) return

    setActive(to)
    setShown(undefined)
    grid.current?.querySelector<HTMLElement>(`[data-date="${to}"]`)?.focus()
  }

  return (
    <figure
      data-slot="calendar-heatmap"
      className={cn("grid w-max max-w-full gap-2", className)}
    >
      <div className="grid w-max max-w-full gap-1 overflow-x-auto pb-1 text-(length:--text-meta) text-muted-foreground">
        {/* Month names above the weeks they start in; the cells name
            their own dates, so this row is for the eye only. */}
        <div
          aria-hidden="true"
          className="grid gap-[3px]"
          style={{ gridTemplateColumns: columns }}
        >
          <span />
          {Array.from({ length: weeks }, (_, week) => {
            const start = shift(first, week * 7 - offset)
            const opens = week === 0 || day(start).getUTCDate() <= 7

            return (
              <span
                key={week}
                className="h-4 overflow-visible whitespace-nowrap"
              >
                {opens ? month.format(day(week === 0 ? first : start)) : ""}
              </span>
            )
          })}
        </div>
        <div
          ref={grid}
          role="grid"
          aria-label={label}
          className="grid gap-[3px]"
          style={{ gridTemplateColumns: columns }}
          onKeyDown={(event) => {
            const step = {
              ArrowUp: -1,
              ArrowDown: 1,
              ArrowLeft: -7,
              ArrowRight: 7,
            }[event.key]

            if (step === undefined) return

            event.preventDefault()
            move(shift(active, step))
          }}
        >
          {["Mon", "", "Wed", "", "Fri", "", ""].map((name, row) => (
            <div key={row} role="row" className="contents">
              <span aria-hidden="true" className="flex items-center pe-1">
                {name}
              </span>
              {Array.from({ length: weeks }, (_, week) => {
                const date = shift(first, week * 7 + row - offset)
                const value = byDate.get(date)

                if (value === undefined)
                  return <span key={week} role="gridcell" aria-hidden="true" />

                return (
                  <span
                    key={week}
                    role="gridcell"
                    data-date={date}
                    tabIndex={date === active ? 0 : -1}
                    aria-label={`${short.format(day(date))}: ${describe(value)}`}
                    onFocus={() => setActive(date)}
                    onPointerEnter={() => setShown(date)}
                    onPointerLeave={() => setShown(undefined)}
                    className="size-(--heatmap-cell,0.75rem) rounded-[3px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    style={{
                      background:
                        level(value, max) === 0
                          ? "var(--muted)"
                          : `color-mix(in oklab, ${color} ${shade[level(value, max)]}, var(--muted))`,
                    }}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>
      <figcaption className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-(length:--text-meta) text-muted-foreground">
        <span>
          {current &&
            `${short.format(day(current))}: ${describe(byDate.get(current) ?? 0)}`}
        </span>
        <span className="flex items-center gap-1" aria-hidden="true">
          Less
          {shade.map((amount, index) => (
            <span
              key={amount}
              className="size-3 rounded-[3px]"
              style={{
                background:
                  index === 0
                    ? "var(--muted)"
                    : `color-mix(in oklab, ${color} ${amount}, var(--muted))`,
              }}
            />
          ))}
          More
        </span>
      </figcaption>
    </figure>
  )
}

export { CalendarHeatmap }
