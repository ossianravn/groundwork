import { Field, FieldSet, FieldLegend, FieldLabel } from "@/kit/ui/field"
import { RadioGroup, RadioGroupItem } from "@/kit/ui/radio-group"

export function RadioGroupExample() {
  return (
    <FieldSet>
      <FieldLegend>Billing period</FieldLegend>
      <RadioGroup defaultValue="monthly" aria-label="Billing period">
        <Field orientation="horizontal">
          <RadioGroupItem id="period-monthly" value="monthly" />
          <FieldLabel htmlFor="period-monthly">Monthly</FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <RadioGroupItem id="period-yearly" value="annual" />
          <FieldLabel htmlFor="period-yearly">Yearly</FieldLabel>
        </Field>
      </RadioGroup>
    </FieldSet>
  )
}
