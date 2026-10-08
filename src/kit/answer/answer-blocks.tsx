import { CircleAlert, Info } from "lucide-react"
import { cn } from "cn"
import { MessageResponse } from "@/kit/ai/message-response"
import { Sparkline } from "@/kit/ui/sparkline"
import { useAnswerNode } from "./answer-context"
import type { AnswerComponentProps } from "./answer-library"
import type {
  AnswerCalloutProps,
  AnswerFiguresProps,
  AnswerHeadingProps,
  AnswerSectionProps,
  AnswerTextProps,
} from "./answer-schemas"

/** The answer's result as a heading, with a line of context under it. */
function AnswerHeading({ props }: AnswerComponentProps<AnswerHeadingProps>) {
  return (
    <header data-slot="answer-heading" className="grid gap-1">
      <h2 className="font-heading text-lg leading-snug font-semibold text-balance">
        {props.text}
      </h2>
      {props.detail && (
        <p className="text-(length:--text-meta) text-muted-foreground">
          {props.detail}
        </p>
      )}
    </header>
  )
}

/** Prose in markdown, with citations and links; it renders as it streams. */
function AnswerText({ props }: AnswerComponentProps<AnswerTextProps>) {
  const { open } = useAnswerNode()

  return <MessageResponse streaming={open}>{props.markdown}</MessageResponse>
}

/** A few figures side by side, each with an optional trend line. */
function AnswerFigures({ props }: AnswerComponentProps<AnswerFiguresProps>) {
  return (
    <div data-slot="answer-figures" className="@container">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 @min-[34rem]:grid-cols-4">
        {props.items.map((item) => (
          <div key={item.label} className="grid min-w-0 content-start gap-1">
            <dt className="text-(length:--text-meta) text-muted-foreground">
              {item.label}
            </dt>
            <dd className="font-heading text-xl leading-tight font-semibold tabular-nums">
              {item.value}
            </dd>
            {item.detail && (
              <dd className="text-(length:--text-meta) text-muted-foreground">
                {item.detail}
              </dd>
            )}
            {item.trend && item.trend.length > 1 && (
              <dd>
                <Sparkline
                  values={item.trend}
                  label={item.trendLabel ?? item.label}
                  className="h-7 max-w-36"
                />
              </dd>
            )}
          </div>
        ))}
      </dl>
    </div>
  )
}

/** A titled part of the answer around other components. */
function AnswerSection({
  props,
  children,
}: AnswerComponentProps<AnswerSectionProps>) {
  return (
    <section data-slot="answer-section" className="grid min-w-0 gap-3">
      <header className="grid gap-0.5">
        <h3 className="font-heading text-sm font-semibold">{props.title}</h3>
        {props.description && (
          <p className="text-(length:--text-meta) text-muted-foreground">
            {props.description}
          </p>
        )}
      </header>
      {children}
    </section>
  )
}

/**
 * Something to notice: a note, or something that needs attention. It is
 * part of the answer, not an alert, so it is not announced on its own.
 */
function AnswerCallout({ props }: AnswerComponentProps<AnswerCalloutProps>) {
  const attention = props.tone === "attention"
  const Icon = attention ? CircleAlert : Info

  return (
    <aside
      data-slot="answer-callout"
      data-tone={props.tone}
      className={cn(
        "grid grid-cols-[1rem_minmax(0,1fr)] gap-x-2.5 gap-y-1 rounded-lg border p-(--item-padding) ps-3 text-sm",
        attention
          ? "border-transparent bg-(--warning-soft)"
          : "border-border bg-background",
      )}
    >
      <Icon
        aria-hidden="true"
        className={cn(
          "mt-0.5 size-4",
          attention ? "text-(--warning)" : "text-muted-foreground",
        )}
      />
      <p className="font-medium">{props.title}</p>
      {props.markdown && (
        <MessageResponse className="col-start-2 text-muted-foreground">
          {props.markdown}
        </MessageResponse>
      )}
    </aside>
  )
}

export {
  AnswerHeading,
  AnswerText,
  AnswerFigures,
  AnswerSection,
  AnswerCallout,
}
