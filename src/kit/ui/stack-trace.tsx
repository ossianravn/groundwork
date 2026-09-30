import { ChevronDown, CircleAlert } from "lucide-react"
import { cn } from "cn"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/kit/ui/collapsible"

export interface StackFrame {
  /** The function, such as "formatDue" or "<anonymous>". */
  name: string
  file: string
  line: number
  column?: number
  /** Library or runtime code, folded away by default. */
  internal?: boolean
}

function Frame({ frame }: { frame: StackFrame }) {
  return (
    <li className="grid min-w-0 gap-0.5 py-1">
      <span className={cn(frame.internal && "text-muted-foreground")}>
        {frame.name}
      </span>
      <span className="text-xs break-all text-muted-foreground">
        {frame.file}:{frame.line}
        {frame.column ? `:${frame.column}` : ""}
      </span>
    </li>
  )
}

/**
 * An error and where it happened. The first frames of your own code lead;
 * library and runtime frames fold behind a count, so the useful line is
 * never buried.
 */
function StackTrace({
  name,
  message,
  frames,
  className,
}: {
  name: string
  message: string
  frames: StackFrame[]
  className?: string
}) {
  const own = frames.filter((frame) => !frame.internal)
  const internal = frames.filter((frame) => frame.internal)

  return (
    <div
      data-slot="stack-trace"
      className={cn(
        "grid min-w-0 gap-2 rounded-lg border border-border bg-(--syntax-background) p-3 font-mono text-[0.8125rem]",
        className,
      )}
    >
      <p className="flex min-w-0 items-start gap-2 text-destructive">
        <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <span className="min-w-0 wrap-break-word">
          <span className="font-semibold">{name}:</span> {message}
        </span>
      </p>
      <ol className="grid border-s-2 border-border ps-3" aria-label="Stack">
        {own.map((frame, index) => (
          <Frame key={index} frame={frame} />
        ))}
      </ol>
      {internal.length > 0 && (
        <Collapsible>
          <CollapsibleTrigger className="group/frames inline-flex items-center gap-1 rounded-md font-sans text-xs text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50">
            {internal.length} library frame{internal.length === 1 ? "" : "s"}
            <ChevronDown
              className="size-3.5 transition-transform group-data-panel-open/frames:rotate-180"
              aria-hidden="true"
            />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ol className="mt-1 grid border-s-2 border-border ps-3">
              {internal.map((frame, index) => (
                <Frame key={index} frame={frame} />
              ))}
            </ol>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  )
}

export { StackTrace }
