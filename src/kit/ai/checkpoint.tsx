import { History } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/kit/ui/button"

/**
 * A point the conversation can return to, between two turns. It stays quiet
 * until the pointer or keyboard focus reaches it (touch screens always show
 * it), so the transcript keeps reading as a conversation. Restoring removes
 * what came after; offer Undo where you handle it.
 */
function Checkpoint({
  label,
  onRestore,
  className,
}: {
  /** Names the point, such as "Restore to before “What changed…”". */
  label: string
  onRestore: () => void
  className?: string
}) {
  const line =
    "h-px flex-1 bg-border opacity-0 transition-opacity duration-(--motion-fast) group-hover/checkpoint:opacity-100 group-focus-within/checkpoint:opacity-100 pointer-coarse:opacity-100"

  return (
    <div
      data-slot="checkpoint"
      className={cn("group/checkpoint flex items-center gap-2", className)}
    >
      <span className={line} aria-hidden="true" />
      <Button
        variant="ghost"
        size="xs"
        aria-label={label}
        className="text-muted-foreground opacity-0 transition-opacity duration-(--motion-fast) group-hover/checkpoint:opacity-100 focus-visible:opacity-100 pointer-coarse:opacity-100"
        onClick={onRestore}
      >
        <History data-icon="inline-start" aria-hidden="true" />
        Restore
      </Button>
      <span className={line} aria-hidden="true" />
    </div>
  )
}

export { Checkpoint }
