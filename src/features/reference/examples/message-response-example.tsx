import { useEffect, useState } from "react"
import { RotateCcw } from "lucide-react"
import { Button } from "@/kit/ui/button"
import { Shimmer } from "@/kit/ui/shimmer"
import { MessageResponse } from "@/kit/ai/message-response"

const reply = `Two projects are due within a week:

| Project | Due | Open tasks |
| --- | --- | --- |
| Brand refresh | 28 Sep | 4 of 20 |
| Mobile app | 30 Sep | 2 of 16 |

Both are on track. Filter the list with \`status:in-progress\`, or read the [help centre](/help).

\`\`\`bash
curl "https://api.tandem.example/v1/projects?due=7d"
\`\`\``

const words = reply.match(/\s*\S+\s*/gu) ?? []

export function MessageResponseExample() {
  const [count, setCount] = useState(words.length)
  const streaming = count < words.length

  // Reveals two words at a time, as a model's stream would.
  useEffect(() => {
    if (!streaming) return

    const timer = setTimeout(() => setCount((value) => value + 2), 40)

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
        Replay the stream
      </Button>
      {count === 0 ? (
        <Shimmer className="text-sm">Thinking…</Shimmer>
      ) : (
        <MessageResponse streaming={streaming}>
          {words.slice(0, count).join("")}
        </MessageResponse>
      )}
    </div>
  )
}
