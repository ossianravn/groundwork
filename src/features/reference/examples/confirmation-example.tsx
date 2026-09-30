import { useState } from "react"
import {
  Confirmation,
  ConfirmationAccepted,
  ConfirmationActions,
  ConfirmationRejected,
  ConfirmationRequest,
} from "@/kit/ai/confirmation"
import type { ToolState } from "@/kit/ai/tool"

export function ConfirmationExample() {
  // Stands in for the tool part: approval-requested until a decision.
  const [state, setState] = useState<ToolState>("approval-requested")
  const [approved, setApproved] = useState<boolean>()

  function decide(value: boolean) {
    setApproved(value)
    setState(value ? "output-available" : "output-denied")
  }

  return (
    <Confirmation
      className="max-w-xl"
      state={state}
      approved={approved}
      title="Archive 3 completed projects?"
    >
      <ConfirmationRequest>
        <p className="text-muted-foreground">
          They move to the archive, where you can restore them. Nothing changes
          until you choose.
        </p>
        <ConfirmationActions
          denyLabel="Keep them"
          approveLabel="Archive projects"
          onDeny={() => decide(false)}
          onApprove={() => decide(true)}
        />
      </ConfirmationRequest>
      <ConfirmationAccepted>
        <p className="text-muted-foreground">Archived 3 projects.</p>
      </ConfirmationAccepted>
      <ConfirmationRejected>
        <p className="text-muted-foreground">You kept them. Nothing changed.</p>
      </ConfirmationRejected>
    </Confirmation>
  )
}
