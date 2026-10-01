import * as React from "react"
import { cn } from "cn"

/**
 * Text with a light sweeping across it, for short "working" labels such as
 * Thinking…. The default sweeps muted text to full strength; "rainbow"
 * sweeps the theme's categorical hues, for a moment that deserves more
 * presence. The sweep stops when reduced motion is requested; the words
 * carry the meaning either way.
 */
function Shimmer({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"span"> & { variant?: "default" | "rainbow" }) {
  return (
    <span
      data-slot="shimmer"
      data-variant={variant}
      className={cn("shimmer", className)}
      {...props}
    />
  )
}

export { Shimmer }
