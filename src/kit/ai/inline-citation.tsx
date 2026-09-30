import { cn } from "cn"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/kit/ui/hover-card"
import { useResponseLink } from "@/kit/ai/response-link"
import type { SourceItem } from "@/kit/ai/sources"

/**
 * A numbered citation in running text. It links to its first source and,
 * on hover or keyboard focus, previews every source it stands for. The
 * preview only repeats what the Sources list holds, so nothing in it is
 * interactive.
 */
function InlineCitation({
  label,
  sources,
  className,
}: {
  /** The sources' numbers in the reply's Sources list, such as 1 or 2–4. */
  label: string
  sources: SourceItem[]
  className?: string
}) {
  const renderLink = useResponseLink()
  const [first] = sources

  if (!first) return null

  const name = `${sources.length === 1 ? "Source" : "Sources"} ${label}: ${sources.map((source) => source.title).join(", ")}`

  return (
    <HoverCard>
      <HoverCardTrigger
        delay={200}
        render={(props) =>
          renderLink({
            ...props,
            href: first.href,
            "aria-label": name,
            className: cn(
              "mx-0.5 inline-flex min-w-5 whitespace-nowrap items-center justify-center rounded-sm bg-muted px-1 align-[0.1em] text-[0.6875rem] leading-4 font-medium text-muted-foreground no-underline tabular-nums hover:bg-accent hover:text-foreground",
              className,
            ),
            children: label,
          })
        }
      />
      <HoverCardContent align="start" className="grid w-80 gap-2">
        {sources.map((source) => (
          <div key={source.href} className="grid gap-0.5">
            <p className="font-medium">{source.title}</p>
            {source.description && (
              <p className="text-muted-foreground">{source.description}</p>
            )}
            {/^https?:/u.test(source.href) && (
              <p className="truncate text-xs text-muted-foreground">
                {new URL(source.href).hostname}
              </p>
            )}
          </div>
        ))}
      </HoverCardContent>
    </HoverCard>
  )
}

export { InlineCitation }
