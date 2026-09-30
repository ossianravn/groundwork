import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/kit/ui/button"

/**
 * Moves between versions of a reply, such as those Regenerate produced:
 * previous, "2 / 3", next. The count is announced as the version changes.
 */
function MessageBranch({
  index,
  count,
  onSelect,
  className,
}: {
  /** The version shown, from 0. */
  index: number
  count: number
  onSelect: (index: number) => void
  className?: string
}) {
  if (count < 2) return null

  return (
    <div
      data-slot="message-branch"
      role="group"
      aria-label="Reply versions"
      className={cn(
        "flex items-center text-xs text-muted-foreground",
        className,
      )}
    >
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Previous version"
        disabled={index === 0}
        focusableWhenDisabled
        onClick={() => onSelect(index - 1)}
      >
        <ChevronLeft aria-hidden="true" />
      </Button>
      <span className="min-w-8 text-center tabular-nums" aria-live="polite">
        <span aria-hidden="true">
          {index + 1} / {count}
        </span>
        <span className="sr-only">
          Version {index + 1} of {count}
        </span>
      </span>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Next version"
        disabled={index === count - 1}
        focusableWhenDisabled
        onClick={() => onSelect(index + 1)}
      >
        <ChevronRight aria-hidden="true" />
      </Button>
    </div>
  )
}

export { MessageBranch }
