import { Skeleton } from "@/kit/ui/skeleton"
import { defineAnswerComponent } from "@/kit/answer/answer-library"
import {
  planApplyProps,
  planViewProps,
  projectPlanProps,
} from "@/demo/assistant/plan-schemas"
import { PlanApply } from "./plan-apply"
import { PlanChanges } from "./plan-changes"
import { PlanLoad } from "./plan-load"
import { PlanProjection } from "./plan-projection"
import { ProjectPlan } from "./project-plan"

export const projectPlan = defineAnswerComponent({
  name: "ProjectPlan",
  description:
    "A plan for a project's remaining work: people with their pace and earlier work, the open tasks, the burn-up so far and the proposed changes. Its children (PlanProjection, PlanLoad, PlanChanges, PlanApply) show it and stay linked as the person edits.",
  props: projectPlanProps,
  component: ProjectPlan,
  placeholder: <Skeleton className="h-96" />,
  text: ({ projectName, changes }) =>
    [
      `Plan for ${projectName}:`,
      ...changes
        .filter((change) => change.proposed)
        .map((change) => `- ${change.title}`),
    ].join("\n"),
})

export const planProjection = defineAnswerComponent({
  name: "PlanProjection",
  description:
    "Inside a ProjectPlan: a burn-up with where completions head with the plan and as assigned, against the due date.",
  props: planViewProps,
  component: PlanProjection,
  placeholder: <Skeleton className="h-72" />,
})

export const planLoad = defineAnswerComponent({
  name: "PlanLoad",
  description:
    "Inside a ProjectPlan: each person's tasks with the plan applied and the day they finish them.",
  props: planViewProps,
  component: PlanLoad,
  placeholder: <Skeleton className="h-32" />,
})

export const planChanges = defineAnswerComponent({
  name: "PlanChanges",
  description:
    "Inside a ProjectPlan: the proposed changes to remove or add back, options to add, and each task's holder to change.",
  props: planViewProps,
  component: PlanChanges,
  placeholder: <Skeleton className="h-40" />,
})

export const planApply = defineAnswerComponent({
  name: "PlanApply",
  description:
    "Inside a ProjectPlan: what the plan comes to, and an action that asks the assistant to apply it (it asks for approval first).",
  props: planApplyProps,
  component: PlanApply,
  placeholder: <Skeleton className="h-12" />,
})

export const planComponents = [
  projectPlan,
  planProjection,
  planLoad,
  planChanges,
  planApply,
]
