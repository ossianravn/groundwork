import { z } from "zod"
import type { AnswerNode } from "@/kit/answer/answer-library"
import { chartHues } from "@/kit/ui/chart-colors"

// A plan in an answer: one ProjectPlan or TeamPlan node carries the data,
// and its children (projection, load, projects, changes, apply) show it.
// The children share the plan's state, so editing a change moves the rest.

const planChanges = z.array(
  z.object({
    id: z.string(),
    title: z.string(),
    from: z.string().nullable(),
    moves: z
      .array(z.object({ taskId: z.string(), to: z.string() }))
      .min(1)
      .describe("Each task's new holder, or defer."),
    proposed: z.boolean(),
  }),
)

export const projectPlanProps = z.object({
  projectId: z.string(),
  projectName: z.string(),
  dueDate: z.string().describe("ISO date."),
  referenceDate: z.string().describe("Today, as an ISO date."),
  people: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        pace: z.number().min(0).describe("Tasks completed a day lately."),
        before: z
          .number()
          .int()
          .min(0)
          .describe("Open tasks they reach first, on projects due earlier."),
      }),
    )
    .min(1),
  tasks: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      assigneeId: z.string().nullable(),
    }),
  ),
  history: z
    .array(z.object({ date: z.string(), done: z.number(), scope: z.number() }))
    .describe("The burn-up so far: tasks done and in scope by date."),
  changes: planChanges,
})

export const teamPlanProps = z.object({
  referenceDate: z.string().describe("Today, as an ISO date."),
  people: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        pace: z.number().min(0).describe("Tasks completed a day lately."),
      }),
    )
    .min(1),
  projects: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        dueDate: z.string().describe("ISO date."),
        color: z.enum(chartHues),
        unowned: z
          .number()
          .int()
          .min(0)
          .describe("Open tasks without an owner, left out of the dates."),
      }),
    )
    .min(1)
    .describe("The open projects, in due-date order."),
  tasks: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        projectId: z.string(),
        assigneeId: z.string().nullable(),
      }),
    )
    .describe("Open tasks with an owner, on these projects."),
  changes: planChanges,
})

export const planViewProps = z.object({
  title: z.string().optional(),
})

export const planApplyProps = z.object({
  label: z.string().describe("The action, such as Apply the plan."),
})

export type ProjectPlanProps = z.output<typeof projectPlanProps>

export type TeamPlanProps = z.output<typeof teamPlanProps>

export type PlanViewProps = z.output<typeof planViewProps>

export type PlanApplyProps = z.output<typeof planApplyProps>

function builder<Props>(type: string) {
  return (id: string, props: Props, children?: AnswerNode[]): AnswerNode =>
    children ? { id, type, props, children } : { id, type, props }
}

export const planNode = {
  plan: builder<z.input<typeof projectPlanProps>>("ProjectPlan"),
  team: builder<z.input<typeof teamPlanProps>>("TeamPlan"),
  projection: builder<z.input<typeof planViewProps>>("PlanProjection"),
  load: builder<z.input<typeof planViewProps>>("PlanLoad"),
  projects: builder<z.input<typeof planViewProps>>("PlanProjects"),
  changes: builder<z.input<typeof planViewProps>>("PlanChanges"),
  apply: builder<z.input<typeof planApplyProps>>("PlanApply"),
}
