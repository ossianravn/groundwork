import * as React from "react"
import { z } from "zod"
import { Button } from "@/kit/ui/button"
import { Checkbox } from "@/kit/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/kit/ui/field"
import { RadioGroup, RadioGroupItem } from "@/kit/ui/radio-group"
import { useAnswer, useAnswerAction, useAnswerState } from "./answer-context"
import type { AnswerComponentProps } from "./answer-library"
import type { AnswerFormProps } from "./answer-schemas"

type FormField = AnswerFormProps["fields"][number]

const formValues = z.record(
  z.string(),
  z.union([z.string(), z.array(z.string())]),
)

/** A field's value: the person's choice, or the answer's default. */
function valueOf(
  field: FormField,
  values: z.output<typeof formValues>,
): string | string[] {
  const chosen = values[field.name]

  if (field.kind === "choice")
    return chosen === undefined || Array.isArray(chosen)
      ? (field.value ?? "")
      : chosen

  return Array.isArray(chosen) ? chosen : (field.values ?? [])
}

/** The choices in words, for the message the form sends. */
function summary(fields: FormField[], values: z.output<typeof formValues>) {
  return fields
    .map((field) => {
      const value = valueOf(field, values)

      const label = (option: string) =>
        field.options.find((item) => item.value === option)?.label ?? option

      return Array.isArray(value)
        ? `${field.label}: ${value.map(label).join(", ") || "none"}`
        : label(value)
    })
    .join("; ")
}

/**
 * Choices the person makes inside an answer, sent back as their next
 * message: the bubble reads as a sentence (Update the plan: Hit 8 Oct;
 * Who can help: Ava, Mia) and the values travel with it. Choices are kept
 * with the answer; it never takes focus when it appears.
 */
export function AnswerForm({
  props,
  nodeId,
}: AnswerComponentProps<AnswerFormProps>) {
  const id = React.useId()
  const { interactive, streaming } = useAnswer()
  const act = useAnswerAction()
  const [values, setValues] = useAnswerState(`form:${nodeId}`, formValues, {})
  const disabled = !interactive || streaming

  const set = (name: string, value: string | string[]) =>
    setValues({ ...values, [name]: value })

  return (
    <form
      data-slot="answer-form"
      className="grid gap-4 rounded-lg border border-border bg-background p-(--item-padding) ps-3 text-sm"
      onSubmit={(event) => {
        event.preventDefault()

        act?.({
          type: "send",
          text: `${props.submitLabel}: ${summary(props.fields, values)}`,
          values: Object.fromEntries(
            props.fields.map((field) => [field.name, valueOf(field, values)]),
          ),
          nodeId,
        })
      }}
    >
      <header className="grid gap-0.5">
        <h3 className="font-heading font-semibold">{props.title}</h3>
        {props.description && (
          <p className="text-(length:--text-meta) text-muted-foreground">
            {props.description}
          </p>
        )}
      </header>
      {props.fields.map((field) => {
        const legend = `${id}-${field.name}`
        const value = valueOf(field, values)

        return (
          <FieldSet key={field.name} className="min-w-0 gap-2">
            <FieldLegend id={legend} variant="label" className="mb-0">
              {field.label}
            </FieldLegend>
            {field.kind === "choice" ? (
              <RadioGroup
                aria-labelledby={legend}
                value={Array.isArray(value) ? "" : value}
                onValueChange={(next) => set(field.name, String(next))}
                disabled={disabled}
                className="flex flex-wrap gap-x-5 gap-y-2"
              >
                {field.options.map((option) => (
                  <Field
                    key={option.value}
                    orientation="horizontal"
                    className="w-auto"
                  >
                    <RadioGroupItem
                      id={`${legend}-${option.value}`}
                      value={option.value}
                    />
                    <FieldLabel
                      htmlFor={`${legend}-${option.value}`}
                      className="font-normal"
                    >
                      {option.label}
                    </FieldLabel>
                  </Field>
                ))}
              </RadioGroup>
            ) : (
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {field.options.map((option) => {
                  const checked = Array.isArray(value)
                    ? value.includes(option.value)
                    : false

                  return (
                    <Field
                      key={option.value}
                      orientation="horizontal"
                      className="w-auto"
                    >
                      <Checkbox
                        id={`${legend}-${option.value}`}
                        checked={checked}
                        disabled={disabled}
                        onCheckedChange={(on) => {
                          const list = Array.isArray(value) ? value : []

                          set(
                            field.name,
                            on
                              ? [...list, option.value]
                              : list.filter((item) => item !== option.value),
                          )
                        }}
                      />
                      <FieldLabel
                        htmlFor={`${legend}-${option.value}`}
                        className="font-normal"
                      >
                        {option.label}
                      </FieldLabel>
                    </Field>
                  )
                })}
              </div>
            )}
          </FieldSet>
        )
      })}
      {!interactive && !streaming && (
        <FieldDescription>
          Only the latest answer takes changes.
        </FieldDescription>
      )}
      <Button
        type="submit"
        size="sm"
        className="justify-self-start"
        disabled={disabled || !act}
      >
        {props.submitLabel}
      </Button>
    </form>
  )
}
