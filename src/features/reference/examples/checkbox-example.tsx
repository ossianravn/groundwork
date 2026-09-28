import { Checkbox } from "@/kit/ui/checkbox"
import {
  Field,
  FieldSet,
  FieldLegend,
  FieldLabel,
  FieldGroup,
} from "@/kit/ui/field"

export function CheckboxExample() {
  return (
    <FieldSet>
      <FieldLegend>Include in export</FieldLegend>
      <FieldGroup>
        <Field orientation="horizontal">
          <Checkbox id="export-owner" defaultChecked />
          <FieldLabel htmlFor="export-owner">Project owner</FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <Checkbox id="export-due" />
          <FieldLabel htmlFor="export-due">Due date</FieldLabel>
        </Field>
        <Field orientation="horizontal" data-disabled>
          <Checkbox id="export-name" checked disabled />
          <FieldLabel htmlFor="export-name">Project name (required)</FieldLabel>
        </Field>
      </FieldGroup>
    </FieldSet>
  )
}
