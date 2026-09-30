import * as React from "react"
import { Check, Copy, SquareTerminal } from "lucide-react"
import { cn } from "cn"
import { useCopy } from "@/kit/lib/use-copy"
import { parseAnsi, type AnsiColor } from "@/kit/ui/ansi"
import { Button } from "@/kit/ui/button"

// Terminal colours are theme roles, so output follows light and dark mode.
const colorClasses: Record<AnsiColor, string> = {
  red: "text-destructive",
  green: "text-(--success)",
  yellow: "text-(--warning)",
  blue: "text-(--syntax-token-function)",
  magenta: "text-(--syntax-token-keyword)",
  cyan: "text-brand",
  gray: "text-muted-foreground",
}

/**
 * Command output with ANSI colour. While `streaming`, it keeps the newest
 * line in view unless the person has scrolled up to read. Copy takes the
 * plain text, without escape codes.
 */
function Terminal({
  output,
  title = "Terminal",
  streaming = false,
  className,
}: {
  /** Text with ANSI escape codes. */
  output: string
  title?: string
  streaming?: boolean
  className?: string
}) {
  const body = React.useRef<HTMLPreElement>(null)
  const pinned = React.useRef(true)
  const { state, copy } = useCopy()
  const spans = parseAnsi(output)
  const plain = spans.map((span) => span.text).join("")

  React.useLayoutEffect(() => {
    const element = body.current

    if (element && streaming && pinned.current)
      element.scrollTop = element.scrollHeight
  }, [output, streaming])

  return (
    <div
      data-slot="terminal"
      className={cn(
        "flex min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-(--syntax-background) text-(--syntax-foreground)",
        className,
      )}
    >
      <div className="flex min-h-(--control-height-sm) items-center gap-2 border-b border-border py-(--control-padding-block) ps-3 pe-1 text-xs text-muted-foreground">
        <SquareTerminal className="size-3.5" aria-hidden="true" />
        <span className="flex-1 truncate">{title}</span>
        <span className="sr-only" role="status">
          {state === "copied" ? "Output copied" : ""}
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={state === "copied" ? "Copied" : "Copy output"}
          onClick={() => void copy(plain, body.current)}
        >
          {state === "copied" ? (
            <Check aria-hidden="true" />
          ) : (
            <Copy aria-hidden="true" />
          )}
        </Button>
      </div>
      <pre
        ref={body}
        tabIndex={0}
        aria-label={`${title} output`}
        aria-busy={streaming || undefined}
        onScroll={(event) => {
          const element = event.currentTarget

          pinned.current =
            element.scrollHeight - element.scrollTop - element.clientHeight < 8
        }}
        className="max-h-96 overflow-auto p-3 font-mono text-[0.8125rem] leading-relaxed outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset"
      >
        {spans.map((span, index) => (
          <span
            key={index}
            className={cn(
              span.color && colorClasses[span.color],
              span.bold && "font-semibold",
              span.dim && "opacity-70",
              span.italic && "italic",
              span.underline && "underline",
            )}
          >
            {span.text}
          </span>
        ))}
        {streaming && (
          <span
            className="ms-0.5 inline-block h-[1lh] w-[0.55em] animate-pulse bg-foreground/60 align-bottom motion-reduce:animate-none"
            aria-hidden="true"
          />
        )}
      </pre>
    </div>
  )
}

export { Terminal }
