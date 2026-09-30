import * as React from "react"
import { CircleCheck, CircleSlash, ShieldQuestion } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/kit/ui/button"
import type { ToolState } from "@/kit/ai/tool"

type Decision = "pending" | "approved" | "denied"

/** Where an approval stands, from the AI SDK tool part. */
function decisionOf(state: ToolState, approved?: boolean): Decision {
  if (state === "output-denied") return "denied"

  if (state === "approval-responded") return approved ? "approved" : "denied"

  if (state === "output-available" || state === "output-error")
    return "approved"

  return "pending"
}

const icons = {
  pending: ShieldQuestion,
  approved: CircleCheck,
  denied: CircleSlash,
}

/**
 * Asks the person to approve a tool call before it runs (the AI SDK's
 * approval-requested state), then records the decision in place. Pass the
 * part's state and `approval.approved`; the children say what will happen
 * and, afterwards, what did.
 */
function Confirmation({
  state,
  approved,
  title,
  children,
  className,
}: {
  state: ToolState
  approved?: boolean
  /** The question while pending, such as "Add 5 tasks to Mobile app?" */
  title: string
  /** ConfirmationRequest, ConfirmationAccepted and ConfirmationRejected. */
  children: React.ReactNode
  className?: string
}) {
  const decision = decisionOf(state, approved)
  const Icon = icons[decision]
  const id = React.useId()

  return (
    <section
      data-slot="confirmation"
      data-decision={decision}
      aria-labelledby={id}
      className={cn(
        "grid min-w-0 grid-cols-[1rem_minmax(0,1fr)] gap-x-2.5 gap-y-1 rounded-lg border p-(--item-padding) ps-3 text-sm",
        decision === "pending"
          ? "border-border bg-(--brand-soft)"
          : "border-border bg-background",
        className,
      )}
    >
      <Icon
        className={cn(
          "mt-0.5 size-4",
          decision === "pending" ? "text-brand" : "text-muted-foreground",
        )}
        aria-hidden="true"
      />
      <div className="grid min-w-0 gap-2">
        <h3 id={id} className="font-medium">
          {title}
        </h3>
        <DecisionContext value={decision}>{children}</DecisionContext>
      </div>
    </section>
  )
}

const DecisionContext = React.createContext<Decision>("pending")

function Shown({
  when,
  children,
}: {
  when: Decision
  children: React.ReactNode
}) {
  return React.useContext(DecisionContext) === when ? children : null
}

/** What will happen, with the actions; shown only while waiting. */
function ConfirmationRequest({ children }: { children: React.ReactNode }) {
  return <Shown when="pending">{children}</Shown>
}

/** The outcome after approval. */
function ConfirmationAccepted({ children }: { children: React.ReactNode }) {
  return <Shown when="approved">{children}</Shown>
}

/** The outcome after the person declined. */
function ConfirmationRejected({ children }: { children: React.ReactNode }) {
  return <Shown when="denied">{children}</Shown>
}

/** Decline first, approve last: the approving action names what it does. */
function ConfirmationActions({
  approveLabel,
  denyLabel,
  onApprove,
  onDeny,
}: {
  approveLabel: string
  denyLabel: string
  onApprove: () => void
  onDeny: () => void
}) {
  return (
    <div className="flex flex-wrap justify-end gap-(--control-gap)">
      <Button variant="outline" size="sm" onClick={onDeny}>
        {denyLabel}
      </Button>
      <Button size="sm" onClick={onApprove}>
        {approveLabel}
      </Button>
    </div>
  )
}

export {
  Confirmation,
  ConfirmationRequest,
  ConfirmationAccepted,
  ConfirmationRejected,
  ConfirmationActions,
}
