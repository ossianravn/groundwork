import { useId } from "react"
import { Field, FieldLabel } from "@/kit/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/kit/ui/select"
import { interfaceFonts, type InterfaceFont } from "./fonts"

const items = interfaceFonts.map(({ value, label }) => ({ value, label }))

export function FontSelector({
  value,
  onChange,
}: {
  value: InterfaceFont
  onChange: (font: InterfaceFont) => void
}) {
  const id = useId()

  return (
    <Field>
      <FieldLabel htmlFor={id}>Interface font</FieldLabel>
      <Select
        items={items}
        value={value}
        onValueChange={(font) => {
          if (font) onChange(font)
        }}
      >
        <SelectTrigger id={id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          <SelectGroup>
            {interfaceFonts.map((font) => (
              <SelectItem key={font.value} value={font.value}>
                <span style={{ fontFamily: font.family }}>{font.label}</span>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  )
}
