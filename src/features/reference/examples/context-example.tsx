import { Context } from "@/kit/ai/context"

export function ContextExample() {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">Open the ring for details</span>
      <Context
        used={48_600}
        max={200_000}
        breakdown={[
          { label: "Last input", tokens: 46_900 },
          { label: "Last output", tokens: 1_700 },
        ]}
        cost="$0.17"
      />
    </div>
  )
}
