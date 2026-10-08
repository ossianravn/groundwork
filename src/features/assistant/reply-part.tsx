import { MessageResponse } from "@/kit/ai/message-response"
import { Reasoning } from "@/kit/ai/reasoning"
import { AnswerRenderer } from "@/kit/answer/answer-renderer"
import type { AssistantMessage } from "@/demo/assistant/assistant-types"
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
      />
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
