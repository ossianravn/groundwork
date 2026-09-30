import { useState } from "react"
import { Checkpoint } from "@/kit/ai/checkpoint"

const turns = [
  "Which projects are at risk?",
  "What changed this week?",
  "Add a launch checklist to Mobile app",
]

export function CheckpointExample() {
  const [count, setCount] = useState(turns.length)

  return (
    <div className="grid max-w-xl gap-2 text-sm">
      {turns.slice(0, count).map((turn, index) => (
        <div key={turn} className="grid gap-2">
          {index > 0 && (
            <Checkpoint
              label={`Restore to before “${turn}”`}
              onRestore={() => setCount(index)}
            />
          )}
          <p className="justify-self-end rounded-xl bg-secondary px-3 py-2">
            {turn}
          </p>
        </div>
      ))}
      {count < turns.length && (
        <button
          type="button"
          className="justify-self-start text-brand underline-offset-4 hover:underline"
          onClick={() => setCount(turns.length)}
        >
          Put the conversation back
        </button>
      )}
    </div>
  )
}
