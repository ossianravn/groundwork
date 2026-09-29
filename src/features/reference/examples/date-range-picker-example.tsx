import { useState } from "react"
import { DateRangePicker } from "@/kit/ui/date-range-picker"
import { isoRangeDays, type IsoDateRange } from "@/kit/lib/iso-date"

export function DateRangePickerExample() {
  const [range, setRange] = useState<IsoDateRange>({
    from: "2026-09-11",
    to: "2026-09-24",
  })

  return (
    <div className="flex flex-wrap items-center gap-3">
      <DateRangePicker
        label="Reporting dates"
        value={range}
        onValueChange={setRange}
        latest="2026-09-24"
        maxDays={92}
      />
      <span className="text-sm text-muted-foreground">
        {isoRangeDays(range)} days
      </span>
    </div>
  )
}
