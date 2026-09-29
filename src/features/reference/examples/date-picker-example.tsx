import { useState } from "react"
import { Field, FieldDescription, FieldLabel } from "@/kit/ui/field"
import { DatePicker } from "@/kit/ui/date-picker"

export function DatePickerExample() {
  const [dueDate, setDueDate] = useState("2026-10-08")

  return (
    <Field className="max-w-xs">
      <FieldLabel id="example-due-label" htmlFor="example-due">
        Due date
      </FieldLabel>
      <DatePicker
        id="example-due"
        labelledBy="example-due-label"
        value={dueDate}
        onValueChange={setDueDate}
      />
      <FieldDescription>Weeks start on Monday.</FieldDescription>
    </Field>
  )
}
