import { useId, useState } from "react"
import { CalendarDays } from "lucide-react"
import { enGB } from "date-fns/locale"
import type { Locale, Matcher } from "react-day-picker"
import { cn } from "cn"
import { formatIsoDate, parseIsoDate, toIsoDate } from "@/kit/lib/iso-date"
import { Button } from "@/kit/ui/button"
import { Calendar } from "@/kit/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/kit/ui/popover"

// A single calendar date (KIT-04). The value is an ISO date string; a hidden
// input carries it when the picker sits in a form. The trigger's accessible
// name combines the field label (labelledBy) with the chosen date, so the
// value is announced as well as the field.
function DatePicker({
  id,
  name,
  value,
  onValueChange,
  labelledBy,
  placeholder = "Choose a date",
  locale = enGB,
  disabled,
  invalid,
  className,
  "aria-describedby": describedBy,
}: {
  id?: string
  name?: string
  value: string
  onValueChange: (value: string) => void
  labelledBy?: string
  placeholder?: string
  locale?: Locale
  /** Days that cannot be chosen, in react-day-picker's matcher format. */
  disabled?: Matcher | Matcher[]
  invalid?: boolean
  className?: string
  "aria-describedby"?: string
}) {
  const [open, setOpen] = useState(false)
  const valueId = useId()
  const selected = parseIsoDate(value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            variant="outline"
            data-slot="date-picker-trigger"
            aria-labelledby={
              labelledBy ? `${labelledBy} ${valueId}` : undefined
            }
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            className={cn(
              "w-fit justify-start gap-2 font-normal tabular-nums",
              !selected && "text-muted-foreground",
              className,
            )}
          />
        }
      >
        <CalendarDays aria-hidden="true" data-icon="inline-start" />
        <span id={valueId}>
          {selected
            ? formatIsoDate(value, locale.code, {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : placeholder}
        </span>
      </PopoverTrigger>
      {name && <input type="hidden" name={name} value={value} />}
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          required
          autoFocus
          locale={locale}
          selected={selected}
          defaultMonth={selected}
          disabled={disabled}
          onSelect={(date) => {
            onValueChange(toIsoDate(date))
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker }
