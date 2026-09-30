import { useEffect, useState } from "react"
import { RotateCcw } from "lucide-react"
import { Button } from "@/kit/ui/button"
import { Reasoning } from "@/kit/ai/reasoning"

const thought =
  "The question is about schedule risk, so I need each open project's due date and how much of its work is still open. I'll compare each due date with today and the share of tasks still open."

const words = thought.match(/\S+\s*/gu) ?? []

export function ReasoningExample() {
  const [count, setCount] = useState(words.length)
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
      <Reasoning streaming={streaming}>
        {words.slice(0, count).join("")}
      </Reasoning>
    </div>
  )
}
