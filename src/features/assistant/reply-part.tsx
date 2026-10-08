import { MessageResponse } from "@/kit/ai/message-response"
import { Reasoning } from "@/kit/ai/reasoning"
import type { AnswerAction } from "@/kit/answer/answer-context"
import type { AnswerState } from "@/kit/answer/answer-library"
import { AnswerRenderer } from "@/kit/answer/answer-renderer"
import type {
  AnswerStates,
  AssistantMessage,
} from "@/demo/assistant/assistant-types"
import { AssistantApplyPlan } from "./assistant-apply"
import { AssistantSteps, AssistantTool } from "./assistant-activity"
import { AssistantArtifact } from "./assistant-artifact"
import {
  AssistantApproval,
  AssistantPlan,
  AssistantQuestion,
} from "./assistant-decisions"
import { tandemAnswers } from "./answers/tandem-answers"

type Part = AssistantMessage["parts"][number]

type StepPart = Extract<Part, { type: "data-step" }>

/** Where answers keep their edits and send their actions: the host. */
export interface AnswerHost {
  states: AnswerStates
  onStateChange: (answerId: string, state: AnswerState) => void
  onAction: (answerId: string, action: AnswerAction) => void
}

/**
 * One part of a reply, drawn by the component that shows it. Parts shown
 * elsewhere (the working plan docks on the composer; sources follow the
 * reply) draw nothing here; so do steps after the first, which shows them
 * all.
 */
export function ReplyPart({
  part,
  firstStep,
  steps,
  incomplete,
  latest,
  posted,
  answers,
  onAnswer,
  onDecide,
  onPost,
  onOpenWork,
}: {
  part: Part
  /** This is the reply's first step, which draws every step. */
  firstStep: boolean
  steps: StepPart[]
  incomplete: boolean
  latest: boolean
  posted: string[]
  answers: AnswerHost
  onAnswer: (toolCallId: string, projectId: string) => void
  onDecide: (approvalId: string, approved: boolean) => void
  onPost: (artifactId: string, projectId: string, markdown: string) => void
  onOpenWork: () => void
}) {
  if (part.type === "reasoning")
    return (
      <Reasoning
        streaming={incomplete && part.state === "streaming"}
        onOpenDetails={onOpenWork}
        detailsLabel="open in the conversation panel"
      >
        {part.text}
      </Reasoning>
    )

  if (part.type === "data-step")
    return firstStep ? (
      <AssistantSteps steps={steps} working={incomplete} />
    ) : null

  if (part.type === "tool-searchProjects")
    return <AssistantTool part={part} working={incomplete} />

  if (part.type === "tool-chooseProject")
    return (
      <AssistantQuestion part={part} actionable={latest} onAnswer={onAnswer} />
    )

  if (part.type === "tool-showAnswer")
    return (
      <AnswerRenderer
        className="assistant-answer"
        nodes={part.input?.nodes}
        library={tandemAnswers}
        streaming={incomplete && part.state === "input-streaming"}
        interactive={latest}
        state={answers.states[part.toolCallId]}
        onStateChange={(state) => answers.onStateChange(part.toolCallId, state)}
        onAction={(action) => answers.onAction(part.toolCallId, action)}
      />
    )

  if (part.type === "tool-applyPlan")
    return (
      <AssistantApplyPlan part={part} actionable={latest} onDecide={onDecide} />
    )

  if (part.type === "data-artifact")
    return (
      <AssistantArtifact
        part={part}
        working={incomplete}
        posted={posted.includes(part.id ?? part.data.projectId)}
        onPost={onPost}
      />
    )

  if (part.type === "data-plan") return <AssistantPlan part={part} />

  if (part.type === "tool-createTasks")
    return (
      <AssistantApproval part={part} actionable={latest} onDecide={onDecide} />
    )

  if (part.type === "text")
    return <MessageResponse streaming={incomplete}>{part.text}</MessageResponse>

  return null
}
