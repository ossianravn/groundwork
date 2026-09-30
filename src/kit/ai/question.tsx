import * as React from "react"
import { MessageCircleQuestion } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/kit/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/kit/ui/field"
import { Input } from "@/kit/ui/input"
import { RadioGroup, RadioGroupItem } from "@/kit/ui/radio-group"

export interface QuestionOption {
  value: string
  label: string
  description?: string
}

export type QuestionAnswer =
  | { kind: "option"; value: string; label: string }
  | { kind: "other"; text: string }

const other = "__other"

/**
 * The assistant asks the person to choose before it continues: one option,
 * or their own answer when `otherLabel` is given. Once answered it shows the
 * choice instead of the form. It never takes focus, so a question arriving
 * does not interrupt typing.
 */
function Question({
  question,
  options,
  otherLabel,
  submitLabel = "Continue",
  answer,
  onAnswer,
  className,
}: {
  question: string
  options: QuestionOption[]
  /** Offers a free-text answer under this label, such as "Another project". */
  otherLabel?: string
  submitLabel?: string
  /** The recorded answer; the form is replaced by it. */
  answer?: string
  onAnswer: (answer: QuestionAnswer) => void
  className?: string
}) {
  const id = React.useId()
  const [choice, setChoice] = React.useState("")
  const [text, setText] = React.useState("")
  const [error, setError] = React.useState("")
  const group = React.useRef<HTMLDivElement>(null)
  const input = React.useRef<HTMLInputElement>(null)

  const frame = cn(
    "grid min-w-0 grid-cols-[1rem_minmax(0,1fr)] gap-x-2.5 rounded-lg border border-border bg-background p-(--item-padding) ps-3 text-sm",
    className,
  )

  const icon = (
    <MessageCircleQuestion
      className="mt-0.5 size-4 text-muted-foreground"
      aria-hidden="true"
    />
  )

  if (answer !== undefined)
    return (
      <section data-slot="question" className={frame} aria-label={question}>
        {icon}
        <p>
          <span className="text-muted-foreground">{question} </span>
          <span className="font-medium">{answer}</span>
        </p>
      </section>
    )

  function submit(event: React.FormEvent) {
    event.preventDefault()

    const option = options.find((item) => item.value === choice)

    if (option)
      return onAnswer({
        kind: "option",
        value: option.value,
        label: option.label,
      })

    if (choice === other && text.trim())
      return onAnswer({ kind: "other", text: text.trim() })

    if (choice === other) {
      setError("Write your answer, or choose one of the options.")
      input.current?.focus()
    } else {
      setError("Choose an answer to continue.")
      group.current?.querySelector<HTMLElement>("[role=radio]")?.focus()
    }
  }

  return (
    <form data-slot="question" className={frame} onSubmit={submit} noValidate>
      {icon}
      <FieldSet className="min-w-0 gap-3">
        <FieldLegend id={id} variant="label" className="mb-0 font-medium">
          {question}
        </FieldLegend>
        <RadioGroup
          ref={group}
          aria-labelledby={id}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          value={choice}
          onValueChange={(value) => {
            setChoice(String(value))
            setError("")
          }}
          className="gap-2"
        >
          {options.map((option) => (
            <Field key={option.value} orientation="horizontal">
              <RadioGroupItem
                id={`${id}-${option.value}`}
                value={option.value}
              />
              <FieldLabel
                htmlFor={`${id}-${option.value}`}
                className="font-normal"
              >
                {option.label}
                {option.description && (
                  <FieldDescription className="ms-1 inline">
                    {option.description}
                  </FieldDescription>
                )}
              </FieldLabel>
            </Field>
          ))}
          {otherLabel && (
            <Field orientation="horizontal">
              <RadioGroupItem id={`${id}-other`} value={other} />
              <FieldLabel htmlFor={`${id}-other`} className="font-normal">
                {otherLabel}
              </FieldLabel>
            </Field>
          )}
        </RadioGroup>
        {choice === other && (
          <Input
            ref={input}
            aria-label={otherLabel}
            aria-describedby={error ? `${id}-error` : undefined}
            value={text}
            className="max-w-sm"
            onChange={(event) => {
              setText(event.target.value)
              setError("")
            }}
          />
        )}
        {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
        <Button type="submit" size="sm" className="self-start">
          {submitLabel}
        </Button>
      </FieldSet>
    </form>
  )
}

export { Question }
