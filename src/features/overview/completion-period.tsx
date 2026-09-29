import { useState } from "react"
import { DateRangePicker } from "@/kit/ui/date-range-picker"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/kit/ui/select"
import {
  maxReportDays,
  reportWindow,
  type ReportPeriod,
} from "@/demo/report-period"

const presets: ReportPeriod[] = [
  { kind: "preset", days: 7 },
  { kind: "preset", days: 14 },
  { kind: "preset", days: 30 },
]

const options = [
  ...presets.map((period) => ({
    value: optionValue(period),
    label: optionLabel(period),
    period,
  })),
  { value: "custom", label: "Custom range", period: undefined },
]

function optionValue(period: ReportPeriod) {
  return period.kind === "preset" ? String(period.days) : "custom"
}

function optionLabel(period: ReportPeriod) {
  return period.kind === "preset" ? `Last ${period.days} days` : "Custom range"
}

// The shown dates open the range calendar; the Select offers presets and a
// Custom range entry that opens the same calendar (DVIZ-05, KIT-05).
export function CompletionPeriod({
  period,
  referenceDate,
  onChange,
}: {
  period: ReportPeriod
  referenceDate: string
  onChange: (period: ReportPeriod) => void
}) {
  const [rangeOpen, setRangeOpen] = useState(false)
  const dates = reportWindow(referenceDate, period)

  return (
    <div className="completion-period">
      <DateRangePicker
        label="Reporting dates"
        variant="ghost"
        className="completion-range"
        value={{ from: dates.start, to: dates.end }}
        latest={referenceDate}
        maxDays={maxReportDays}
        open={rangeOpen}
        onOpenChange={setRangeOpen}
        onValueChange={(range) => onChange({ kind: "custom", ...range })}
      />
      <Select
        items={options}
        value={optionValue(period)}
        onValueChange={(value) => {
          const option = options.find((item) => item.value === value)

          if (option?.period) onChange(option.period)
          else if (option) setRangeOpen(true)
        }}
      >
        <SelectTrigger aria-label="Task completion period">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
