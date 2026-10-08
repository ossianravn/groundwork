import { useResponseLink } from "@/kit/ai/response-link"
import type { AnswerComponentProps } from "@/kit/answer/answer-library"
import type { ActivityDigestProps } from "@/demo/assistant/answer-schemas"

const link =
  "font-medium text-foreground underline decoration-border underline-offset-[0.2em] hover:decoration-current"

/** Recent events on one project, newest first, with who did what. */
export function AnswerActivityDigest({
  props,
}: AnswerComponentProps<ActivityDigestProps>) {
  const renderLink = useResponseLink()

  return (
    <div className="grid gap-2">
      <ol className="grid">
        {props.items.map((item, index) => (
          <li
            key={`${item.date}-${index}`}
            className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-3 border-b border-border py-2 text-sm last:border-b-0"
          >
            <span className="text-(length:--text-meta) leading-5 text-muted-foreground tabular-nums">
              {item.date}
            </span>
            <p className="min-w-0">
              {item.personHref
                ? renderLink({
                    href: item.personHref,
                    className: link,
                    children: item.person,
                  })
                : item.person}{" "}
              <span className="text-muted-foreground">{item.action}</span>
              {item.detail && (
                <span className="text-muted-foreground"> · {item.detail}</span>
              )}
            </p>
          </li>
        ))}
      </ol>
      {props.href &&
        renderLink({
          href: props.href,
          className: `${link} justify-self-start text-sm`,
          children: "All activity",
        })}
    </div>
  )
}
