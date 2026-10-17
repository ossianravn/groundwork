import { useEffect, useState } from "react"
import { RotateCcw } from "lucide-react"
import { Button } from "@/kit/ui/button"
import { Reasoning } from "@/kit/ai/reasoning"

const thought =
  "The question is about schedule risk, so I need each open project's due date and how much of its work is still open. I'll compare each due date with today and the share of tasks still open."

const words = thought.match(/\S+\s*/gu) ?? []

// An earlier reply, restored from history. Timing only runs while reasoning
// streams, so the host stored the duration; it also keeps whether the
// reasoning is open, and lists the summary's steps itself.
const restored = {
  seconds: 14,
  steps: [
    "Listed the projects due in the next two weeks.",
    "Compared each due date with the share of tasks still open.",
    "Mobile app leads: 4 of 16 tasks open, due in 6 days.",
  ],
}

export function ReasoningExample() {
  const [count, setCount] = useState(words.length)
  const [restoredOpen, setRestoredOpen] = useState(true)
  const streaming = count < words.length

  // Streams a word at a time; the block opens, then folds away when done.
  useEffect(() => {
    if (!streaming) return

    const timer = setTimeout(() => setCount((value) => value + 1), 60)

    return () => clearTimeout(timer)
  }, [count, streaming])

  return (
    <div className="grid max-w-xl gap-3">
      <Button
        variant="outline"
        size="sm"
        className="justify-self-start"
        onClick={() => setCount(0)}
      >
        <RotateCcw data-icon="inline-start" aria-hidden="true" />
        Replay reasoning
      </Button>
      <Reasoning
        open={restoredOpen}
        onOpenChange={setRestoredOpen}
        label={`Thought for ${restored.seconds} seconds`}
      >
        <ol className="list-decimal ps-5 text-sm leading-relaxed [&_li+li]:mt-1">
          {restored.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </Reasoning>
      <Reasoning streaming={streaming}>
        {words.slice(0, count).join("")}
      </Reasoning>
    </div>
  )
}
