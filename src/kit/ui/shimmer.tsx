import * as React from "react"
import { cn } from "cn"

/**
 * Text with a light sweeping across it, for short "working" labels such as
 * Thinking…. The sweep stops when reduced motion is requested; the words
 * carry the meaning either way.
 */
function Shimmer({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span data-slot="shimmer" className={cn("shimmer", className)} {...props} />
  )
}

export { Shimmer }
