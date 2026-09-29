import { useState } from "react"
import { CalendarDays } from "lucide-react"
import { addDays, subDays, subMonths } from "date-fns"
import { enGB } from "date-fns/locale"
import type { Locale, Matcher } from "react-day-picker"
import { cn } from "cn"
import {
  formatIsoRange,
  parseIsoDate,
  toIsoDate,
  type IsoDateRange,
} from "@/kit/lib/iso-date"
import { Button } from "@/kit/ui/button"
import { Calendar } from "@/kit/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/kit/ui/popover"

// A first and last date (KIT-05). Each opening starts a fresh choice: the
// first click sets the start, the second sets the end and applies. Escape or
// dismissal keeps the current range. maxDays limits the span while choosing.
function DateRangePicker({
  value,
  onValueChange,
  open: controlledOpen,
  onOpenChange,
  label,
  maxDays,
  latest,
  locale = enGB,
  variant = "outline",
  className,
  "aria-describedby": describedBy,
}: {
  value: IsoDateRange
  onValueChange: (value: IsoDateRange) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Accessible name before the range, e.g. "Reporting period". */
  label: string
  maxDays?: number
  /** The last date that can be chosen (ISO). */
  latest?: string
  locale?: Locale
  variant?: "outline" | "ghost"
  className?: string
  "aria-describedby"?: string
}) {
  const [ownOpen, setOwnOpen] = useState(false)
  const [start, setStart] = useState<Date>()
  const open = controlledOpen ?? ownOpen
  const from = parseIsoDate(value.from)
  const to = parseIsoDate(value.to)
  const last = parseIsoDate(latest)
  const text = formatIsoRange(value, locale.code)

  function setOpen(next: boolean) {
    setStart(undefined)
    setOwnOpen(next)
    onOpenChange?.(next)
  }

  const disabled: Matcher[] = []

  if (last) disabled.push({ after: last })

  if (start && maxDays) {
    disabled.push({ before: subDays(start, maxDays - 1) })
    disabled.push({ after: addDays(start, maxDays - 1) })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant={variant}
            data-slot="date-range-trigger"
            aria-label={`${label}: ${text}`}
            aria-describedby={describedBy}
            className={cn(
              "w-fit justify-start gap-2 font-normal tabular-nums",
              className,
            )}
          />
        }
      >
        <CalendarDays aria-hidden="true" data-icon="inline-start" />
        {text}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          mode="range"
          autoFocus
          locale={locale}
          numberOfMonths={2}
          endMonth={last}
          defaultMonth={subMonths(to ?? new Date(), 1)}
          selected={start ? { from: start, to: undefined } : { from, to }}
          disabled={disabled}
          onSelect={(_, day) => {
            if (!start) {
              setStart(day)

              return
            }

            const [first, second] = day < start ? [day, start] : [start, day]

            onValueChange({ from: toIsoDate(first), to: toIsoDate(second) })
            setOpen(false)
          }}
          footer={
            <p className="px-2 pt-2 text-xs text-muted-foreground">
              {start
                ? "Choose the last day."
                : maxDays
                  ? `Choose the first day. Ranges up to ${maxDays} days.`
                  : "Choose the first day."}
            </p>
          }
        />
      </PopoverContent>
    </Popover>
  )
}

export { DateRangePicker }
