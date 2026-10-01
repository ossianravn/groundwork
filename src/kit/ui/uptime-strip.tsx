import * as React from "react"
import { cn } from "cn"

export interface UptimeDay {
  /** ISO date. */
  date: string
  /** What went wrong that day; absent on a good day. */
  incident?: string
}

const short = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
})

const named = (iso: string) => short.format(new Date(`${iso}T00:00:00Z`))

/**
 * A service's recent days as a strip of bars, oldest first: good days in
 * the success colour, incident days in the warning colour. Hovering a day
 * names it in the line below; the uptime and any incident days are also
 * given in words, so nothing depends on the pointer.
 */
function UptimeStrip({
  days,
  label,
  className,
}: {
  days: UptimeDay[]
  /** What the strip covers, such as "API". */
  label: string
  className?: string
}) {
  const [shown, setShown] = React.useState<UptimeDay>()
  const incidents = days.filter((day) => day.incident)

  const uptime = (
    ((days.length - incidents.length) / (days.length || 1)) *
    100
  ).toFixed(2)

  const summary = `${label}: ${uptime}% uptime over ${days.length} days${
    incidents.length
      ? `; incidents on ${incidents.map((day) => named(day.date)).join(", ")}`
      : ""
  }.`

  return (
    <figure data-slot="uptime-strip" className={cn("grid gap-1.5", className)}>
      <p className="sr-only">{summary}</p>
      <ol
        aria-hidden="true"
        className="grid h-8 gap-px sm:gap-[2px]"
        style={{
          gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))`,
        }}
        onPointerLeave={() => setShown(undefined)}
      >
        {days.map((day) => (
          <li
            key={day.date}
            data-incident={day.incident ? "" : undefined}
            onPointerEnter={() => setShown(day)}
            className={cn(
              "rounded-[1px] transition-opacity",
              day.incident
                ? "bg-(--warning)"
                : "bg-[color-mix(in_oklab,var(--success)_70%,var(--card))]",
              shown && shown !== day && "opacity-60",
            )}
          />
        ))}
      </ol>
      <figcaption
        aria-hidden="true"
        className="flex justify-between gap-2 text-(length:--text-meta) text-muted-foreground"
      >
        <span>{days.length} days ago</span>
        <span className="text-foreground">
          {shown
            ? `${named(shown.date)}: ${shown.incident ?? "No incidents"}`
            : `${uptime}% uptime`}
        </span>
        <span>Today</span>
      </figcaption>
    </figure>
  )
}

export { UptimeStrip }
