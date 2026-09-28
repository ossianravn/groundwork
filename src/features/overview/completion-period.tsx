import type { Period } from "@/demo/model"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/kit/ui/select"

const periods = [7, 14, 30].map((value) => ({
  value: String(value),
  label: `Last ${value} days`,
}))

export function CompletionPeriod({
  period,
  onChange,
  descriptionId,
}: {
  period: Period
  onChange: (period: Period) => void
  descriptionId?: string
}) {
  return (
    <Select
      items={periods}
      value={String(period)}
      onValueChange={(value) => {
        const next = Number(value)

        if (next === 7 || next === 14 || next === 30) onChange(next)
      }}
    >
      <SelectTrigger
        aria-label="Task completion period"
        aria-describedby={descriptionId}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {periods.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
