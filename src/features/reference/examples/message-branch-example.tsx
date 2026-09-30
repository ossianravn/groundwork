import { useState } from "react"
import { MessageActions } from "@/kit/ai/message-actions"
import { MessageBranch } from "@/kit/ai/message-branch"

const versions = [
  "Website redesign is the most urgent: 27 open tasks and two weeks to go.",
  "One project needs attention: Website redesign still has 27 of 48 tasks open.",
  "Website redesign is at risk; the other three active projects are on track.",
]

export function MessageBranchExample() {
  const [index, setIndex] = useState(versions.length - 1)

  return (
    <div className="grid max-w-xl gap-2 text-sm">
      <p>{versions[index]}</p>
      <MessageActions aria-label="Reply actions">
        <MessageBranch
          index={index}
          count={versions.length}
          onSelect={setIndex}
        />
      </MessageActions>
    </div>
  )
}
