import { Fragment } from "react"
import {
  Confirmation,
  ConfirmationAccepted,
  ConfirmationActions,
  ConfirmationRejected,
  ConfirmationRequest,
} from "@/kit/ai/confirmation"
import { useResponseLink } from "@/kit/ai/response-link"
import type {
  ApplyPlanOutput,
  AssistantMessage,
} from "@/demo/assistant/assistant-types"
import { applyTitle, shareText } from "./assistant-text"

type Part = AssistantMessage["parts"][number]

type ApplyPart = Extract<Part, { type: "tool-applyPlan" }>

const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? "" : "s"}`

/** What applying did, recorded in place of the actions. */
function outcome({ reassigned, deferred }: ApplyPlanOutput) {
  const done = [
    reassigned ? `${plural(reassigned, "task")} reassigned` : "",
    deferred ? `${plural(deferred, "deferred task")} posted as a comment` : "",
  ].filter((item) => item !== "")

  return done.length ? `${done.join("; ")}.` : "Nothing was applied."
}

/**
 * Asks before a plan changes any records: it names the change, lists who
 * takes what and what waits, and records the outcome in place of the
 * actions. Like every approval, it never takes focus when it appears.
 */
export function AssistantApplyPlan({
  part,
  actionable,
  onDecide,
}: {
  part: ApplyPart
  actionable: boolean
  onDecide: (approvalId: string, approved: boolean) => void
}) {
  const renderLink = useResponseLink()

  if (part.state === "input-streaming") return null

  const approval = "approval" in part ? part.approval : undefined
  const pending = part.state === "approval-requested"
  const output = part.state === "output-available" ? part.output : undefined
  const moves = part.input?.moves ?? []
  const waiting = part.input?.deferred ?? []

  return (
    <Confirmation
      state={part.state}
      approved={approval?.approved}
      title={applyTitle(part)}
    >
      <ConfirmationRequest>
        <ul className="grid gap-1 text-muted-foreground">
          {moves.length > 0 && (
            <li>
              Reassign {plural(moves.length, "task")}: {shareText(moves)}.
            </li>
          )}
          {waiting.length > 0 && (
            <li>
              Post the {plural(waiting.length, "deferred task")} as a comment;
              they stay in the project.
            </li>
          )}
        </ul>
        {pending && approval && actionable ? (
          <ConfirmationActions
            denyLabel="Don't apply"
            approveLabel="Apply the plan"
            onDeny={() => onDecide(approval.id, false)}
            onApprove={() => onDecide(approval.id, true)}
          />
        ) : (
          <p className="text-muted-foreground">Not decided.</p>
        )}
      </ConfirmationRequest>
      <ConfirmationAccepted>
        <p className="text-muted-foreground">
          {output ? `${outcome(output)} ` : "Approved. Applying the plan…"}
          {output?.projects.map((project, index) => (
            <Fragment key={project.id}>
              {index > 0 && " · "}
              {renderLink({
                href: project.url,
                className:
                  "font-medium text-brand underline-offset-[0.2em] hover:underline",
                children: `Open ${project.name}`,
              })}
            </Fragment>
          ))}
        </p>
      </ConfirmationAccepted>
      <ConfirmationRejected>
        <p className="text-muted-foreground">
          You chose not to apply it. Nothing changed.
        </p>
      </ConfirmationRejected>
    </Confirmation>
  )
}
