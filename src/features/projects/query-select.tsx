import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/kit/ui/select"

export function QuerySelect<Value extends string>({
  id,
  label,
  value,
  options,
  onChange,
  invalid,
  describedBy,
}: {
  id?: string
  label: string
  value: Value
  options: readonly { value: Value; label: string }[]
  onChange: (value: Value) => void
  invalid?: boolean
  describedBy?: string
}) {
  return (
    <Select
      items={options}
      value={value}
      onValueChange={(value) => {
        const option = options.find((option) => option.value === value)

        if (option) onChange(option.value)
      }}
    >
      <SelectTrigger
        id={id}
        aria-label={label}
        aria-invalid={invalid}
        aria-describedby={describedBy}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        <SelectGroup>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
