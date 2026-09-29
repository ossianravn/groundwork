import { useState } from "react"
import { Button } from "@/kit/ui/button"
import { Progress, ProgressLabel, ProgressValue } from "@/kit/ui/progress"

export function ProgressExample() {
  const [done, setDone] = useState(7)
  const total = 12

  return (
    <div className="grid max-w-sm gap-4">
      <Progress value={Math.round((done / total) * 100)}>
        <ProgressLabel>Launch checklist</ProgressLabel>
        <ProgressValue>{() => `${done} of ${total} tasks`}</ProgressValue>
      </Progress>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={done === total}
          onClick={() => setDone(done + 1)}
        >
          Complete a task
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setDone(7)}>
          Reset
        </Button>
      </div>
    </div>
  )
}
