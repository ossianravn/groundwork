import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/kit/ui/select"

export interface SeriesOption {
  value: string
  label: string
  /** The colour this option draws in. */
  color: string
}

function Swatch({ color }: { color: string }) {
  return (
    <span
      aria-hidden="true"
      className="size-2.5 shrink-0 self-center rounded-[3px]"
      style={{ background: color }}
    />
  )
}

/**
 * Chooses who or what a chart draws. The trigger carries the chosen
 * series' colour, so the control is also its legend entry, and each option
 * shows the colour it draws in. Names stay ink; only the swatch is coloured.
 */
export function SeriesSelect({
  label,
  value,
  options,
  onChange,
}: {
  /** Names the control, such as "First person". */
  label: string
  value: string
  options: SeriesOption[]
  onChange: (value: string) => void
}) {
  const current = options.find((option) => option.value === value)

  return (
    <Select
      items={options.map((option) => ({
        value: option.value,
        label: option.label,
      }))}
      value={value}
      onValueChange={(next) => {
        if (next) onChange(next)
      }}
    >
      <SelectTrigger size="sm" aria-label={label}>
        <SelectValue>
          {current && (
            <>
              <Swatch color={current.color} />
              {current.label}
            </>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <Swatch color={option.color} />
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
