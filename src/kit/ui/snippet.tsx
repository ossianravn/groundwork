import * as React from "react"
import { Check, Copy } from "lucide-react"
import { cn } from "cn"
import { useCopy } from "@/kit/lib/use-copy"
import { Button } from "@/kit/ui/button"

/** One line of code or a command, with a copy button. */
function Snippet({
  code,
  prefix,
  label = "command",
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  code: string
  /** A non-copied lead-in such as "$". */
  prefix?: string
  /** Names the copied thing in the button's label: "Copy command". */
  label?: string
}) {
  const { state, copy } = useCopy()
  const codeRef = React.useRef<HTMLElement>(null)

  return (
    <div
      data-slot="snippet"
      className={cn(
        "flex min-h-(--control-height) max-w-full min-w-0 items-center gap-2 rounded-lg border border-border bg-(--syntax-background) ps-3 pe-1 font-mono text-[0.8125rem]",
        className,
      )}
      {...props}
    >
      {prefix && (
        <span aria-hidden="true" className="text-muted-foreground select-none">
          {prefix}
        </span>
      )}
      <code
        ref={codeRef}
        className="min-w-0 flex-1 overflow-x-auto py-(--control-padding-block) whitespace-nowrap"
      >
        {code}
      </code>
      <span className="sr-only" role="status">
        {state === "copied"
          ? `${label[0].toUpperCase()}${label.slice(1)} copied`
          : state === "failed"
            ? `Copying isn't available. The ${label} is selected; copy it with your keyboard.`
            : ""}
      </span>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={state === "copied" ? "Copied" : `Copy ${label}`}
        onClick={() => void copy(code, codeRef.current)}
      >
        {state === "copied" ? (
          <Check aria-hidden="true" />
        ) : (
          <Copy aria-hidden="true" />
        )}
      </Button>
    </div>
  )
}

export { Snippet }
