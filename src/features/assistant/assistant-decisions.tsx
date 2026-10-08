import {
  Confirmation,
  ConfirmationAccepted,
  ConfirmationActions,
  ConfirmationRejected,
  ConfirmationRequest,
} from "@/kit/ai/confirmation"
import { Plan, PlanStep } from "@/kit/ai/plan"
import { Question } from "@/kit/ai/question"
import { useResponseLink } from "@/kit/ai/response-link"
import type { AssistantMessage } from "@/demo/assistant/assistant-types"
import { approvalTitle } from "./assistant-text"

type Part = AssistantMessage["parts"][number]

type QuestionPart = Extract<Part, { type: "tool-chooseProject" }>

type PlanPart = Extract<Part, { type: "data-plan" }>

type ApprovalPart = Extract<Part, { type: "tool-createTasks" }>

/** What answering leads to, by what the question is for. */
const continueLabels = {
  checklist: "Plan the checklist",
  status: "Draft the update",
  catchup: "Catch me up",
} as const

export function AssistantQuestion({
  part,
  actionable,
  onAnswer,
}: {
  part: QuestionPart
  /** Only the latest reply's question can still be answered. */
  actionable: boolean
  onAnswer: (toolCallId: string, projectId: string) => void
}) {
  if (part.state === "input-streaming" || !part.input) return null

  const { question, options, purpose } = part.input

  const answer =
    part.state === "output-available"
      ? (options.find((option) => option.value === part.output.projectId)
          ?.label ?? "a project")
      : actionable
        ? undefined
        : "Not answered"

  return (
    <Question
      question={question}
      options={options}
      submitLabel={continueLabels[purpose]}
      answer={answer}
      onAnswer={(choice) => {
        if (choice.kind === "option") onAnswer(part.toolCallId, choice.value)
      }}
    />
  )
}

export function AssistantPlan({ part }: { part: PlanPart }) {
  const { title, description, tasks, complete } = part.data

  return (
    <Plan title={title} description={description} streaming={!complete}>
      {tasks.map((task) => (
        <PlanStep key={task.title} detail={task.assignee ?? "Unassigned"}>
          {task.title}
        </PlanStep>
      ))}
    </Plan>
  )
}

export function AssistantApproval({
  part,
  actionable,
  onDecide,
}: {
  part: ApprovalPart
  actionable: boolean
  onDecide: (approvalId: string, approved: boolean) => void
}) {
  const renderLink = useResponseLink()

  if (part.state === "input-streaming") return null

  const approval = "approval" in part ? part.approval : undefined
  const pending = part.state === "approval-requested"
  const output = part.state === "output-available" ? part.output : undefined

  return (
    <Confirmation
      state={part.state}
      approved={approval?.approved}
      title={approvalTitle(part)}
    >
      <ConfirmationRequest>
        <p className="text-muted-foreground">
          They go to the end of the project's task list, where you can edit or
          remove them. Nothing changes until you choose.
        </p>
        {pending && approval && actionable ? (
          <ConfirmationActions
            denyLabel="Don't add"
            approveLabel="Add tasks"
            onDeny={() => onDecide(approval.id, false)}
            onApprove={() => onDecide(approval.id, true)}
          />
        ) : (
          <p className="text-muted-foreground">Not decided.</p>
        )}
      </ConfirmationRequest>
      <ConfirmationAccepted>
        <p className="text-muted-foreground">
          {output
            ? `Added ${output.added} task${output.added === 1 ? "" : "s"}. `
            : "Approved. Adding the tasks…"}
          {output?.added
            ? renderLink({
                href: output.url,
                className:
                  "font-medium text-brand underline-offset-[0.2em] hover:underline",
                children: `Open ${output.projectName}`,
              })
            : null}
        </p>
      </ConfirmationAccepted>
      <ConfirmationRejected>
        <p className="text-muted-foreground">
          You chose not to add them. Nothing changed.
        </p>
      </ConfirmationRejected>
    </Confirmation>
  )
}
