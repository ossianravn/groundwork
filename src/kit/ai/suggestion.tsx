import * as React from "react"
import { cn } from "cn"
import { Button } from "@/kit/ui/button"

/** A wrapping row of prompts the person can send with one click. */
function Suggestions({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="suggestions"
      className={cn("flex flex-wrap gap-2", className)}
      {...props}
    />
  )
}

function Suggestion({
  suggestion,
  onSelect,
  children,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "onSelect"> & {
  suggestion: string
  onSelect: (suggestion: string) => void
}) {
  return (
    <li className="min-w-0">
      <Button
        data-slot="suggestion"
        type="button"
        variant="outline"
        size="sm"
        className={cn(
          "h-auto max-w-full rounded-full py-1 text-start whitespace-normal",
          className,
        )}
        onClick={() => onSelect(suggestion)}
        {...props}
      >
        {children ?? suggestion}
      </Button>
    </li>
  )
}

export { Suggestions, Suggestion }
