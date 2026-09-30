import { useEffect, useState } from "react"
import { RotateCcw } from "lucide-react"
import { Button } from "@/kit/ui/button"
import {
  ChainOfThought,
  ChainOfThoughtResults,
  ChainOfThoughtStep,
} from "@/kit/ai/chain-of-thought"

const steps = [
  { label: "Read the activity for 18 – 24 Sept", results: ["7 events"] },
  {
    label: "Grouped the events by project",
    results: ["Mobile app", "Brand refresh", "Website redesign"],
  },
  { label: "Counted completed tasks", results: ["38 tasks"] },
]

export function ChainOfThoughtExample() {
  // Steps done so far; each takes 0.8 seconds, as an agent reports progress.
  const [done, setDone] = useState(steps.length)
  const working = done < steps.length

  useEffect(() => {
    if (!working) return

    const timer = setTimeout(() => setDone((value) => value + 1), 800)

    return () => clearTimeout(timer)
  }, [done, working])

  return (
    <div className="grid max-w-xl gap-3">
      <Button
        variant="outline"
        size="sm"
        className="justify-self-start"
        onClick={() => setDone(0)}
      >
        <RotateCcw data-icon="inline-start" aria-hidden="true" />
        Replay the steps
      </Button>
      <ChainOfThought
        active={working}
        label={
          working
            ? `${steps[done].label}…`
            : `Worked through ${steps.length} steps`
        }
      >
        {steps.map((step, index) => (
          <ChainOfThoughtStep
            key={step.label}
            label={step.label}
            status={
              index < done ? "complete" : index === done ? "active" : "pending"
            }
          >
            {index < done && <ChainOfThoughtResults items={step.results} />}
          </ChainOfThoughtStep>
        ))}
      </ChainOfThought>
    </div>
  )
}
