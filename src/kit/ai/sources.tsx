import { ChevronDown, FileText } from "lucide-react"
import { cn } from "cn"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/kit/ui/collapsible"
import { useResponseLink } from "@/kit/ai/response-link"

export interface SourceItem {
  href: string
  title: string
  /** A short line saying what the source is, such as its status. */
  description?: string
}

/**
 * The sources a reply drew on, folded behind "Used 4 sources". Every source
 * an inline citation names is listed here too, so the list is the complete,
 * keyboard-reachable record.
 */
function Sources({
  sources,
  className,
}: {
  sources: SourceItem[]
  className?: string
}) {
  const renderLink = useResponseLink()

  if (!sources.length) return null

  return (
    <Collapsible data-slot="sources" className={cn("min-w-0", className)}>
      <CollapsibleTrigger className="group/sources -ms-1 inline-flex min-h-(--control-height-sm) items-center gap-1 rounded-md px-1 text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50">
        Used {sources.length} source{sources.length === 1 ? "" : "s"}
        <ChevronDown
          className="size-4 transition-transform group-data-panel-open/sources:rotate-180"
          aria-hidden="true"
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ol className="mt-1 grid gap-1">
          {sources.map((source, index) => (
            <li key={source.href} className="flex min-w-0 gap-2 text-sm">
              <span className="w-4 shrink-0 text-end text-muted-foreground tabular-nums">
                {index + 1}
              </span>
              <FileText
                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <span className="min-w-0">
                {renderLink({
                  href: source.href,
                  className:
                    "font-medium text-brand underline-offset-[0.2em] hover:underline",
                  children: source.title,
                })}
                {source.description && (
                  <span className="text-muted-foreground">
                    {" "}
                    · {source.description}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ol>
      </CollapsibleContent>
    </Collapsible>
  )
}

export { Sources }
