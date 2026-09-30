import {
  ChainOfThought,
  ChainOfThoughtResults,
  ChainOfThoughtStep,
} from "@/kit/ai/chain-of-thought"
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/kit/ai/tool"
import { useAutoOpen } from "@/kit/ai/use-auto-open"
import type {
  AssistantMessage,
  ProjectRow,
} from "@/demo/assistant/assistant-types"
import { formatDate } from "@/demo/model"

type Part = AssistantMessage["parts"][number]

type ToolPart = Extract<Part, { type: "tool-searchProjects" }>

type StepPart = Extract<Part, { type: "data-step" }>

/** The search result as the person would read it, rather than JSON. */
function ProjectResults({ rows }: { rows: ProjectRow[] }) {
  return (
    <ul className="assistant-tool-results">
      {rows.map((row) => (
        <li key={row.id}>
          <span className="font-medium">{row.name}</span>
          <span className="text-muted-foreground">
            {row.owner} · due {formatDate(row.dueDate)} · {row.openTasks} of{" "}
            {row.tasks} open
          </span>
        </li>
      ))}
    </ul>
  )
}

/** A tool call; it opens by itself when the call fails, to show why. */
export function AssistantTool({
  part,
  working,
}: {
  part: ToolPart
  /** The reply is still streaming; otherwise an unfinished call was stopped. */
  working: boolean
}) {
  const { open, onOpenChange } = useAutoOpen(part.state === "output-error")

  return (
    <Tool open={open} onOpenChange={onOpenChange}>
      <ToolHeader
        title="Search projects"
        state={part.state}
        interrupted={!working}
      />
      <ToolContent>
        <ToolInput input={part.input} />
        <ToolOutput
          errorText={part.state === "output-error" ? part.errorText : undefined}
        >
          {part.state === "output-available" && (
            <ProjectResults rows={part.output} />
          )}
        </ToolOutput>
      </ToolContent>
    </Tool>
  )
}

/** Progress steps the assistant reported, updated in place by id. */
export function AssistantSteps({
  steps,
  working,
}: {
  steps: StepPart[]
  /** The reply is still streaming. */
  working: boolean
}) {
  const current = steps.find((step) => step.data.status === "active")
  const active = working && !!current

  return (
    <ChainOfThought
      active={active}
      label={
        active && current
          ? `${current.data.label}…`
          : `Worked through ${steps.length} step${steps.length === 1 ? "" : "s"}`
      }
    >
      {steps.map((step) => (
        <ChainOfThoughtStep
          key={step.id}
          status={
            step.data.status === "active" && !working
              ? "pending"
              : step.data.status
          }
          label={step.data.label}
        >
          <ChainOfThoughtResults items={step.data.results} />
        </ChainOfThoughtStep>
      ))}
    </ChainOfThought>
  )
}
