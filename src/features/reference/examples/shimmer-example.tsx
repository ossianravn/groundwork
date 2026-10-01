import { Brain, Sparkles } from "lucide-react"
import { Shimmer } from "@/kit/ui/shimmer"

export function ShimmerExample() {
  return (
    <div className="grid gap-4 text-sm">
      <p className="flex items-center gap-1.5 text-muted-foreground">
        <Brain className="size-4" aria-hidden="true" />
        <Shimmer>Thinking…</Shimmer>
      </p>
      <p className="flex items-center gap-1.5">
        <Sparkles className="size-4 text-muted-foreground" aria-hidden="true" />
        <Shimmer variant="rainbow">Drafting your status update…</Shimmer>
      </p>
    </div>
  )
}
