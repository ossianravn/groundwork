import { Skeleton } from "@/kit/ui/skeleton"
import { defineAnswerComponent } from "@/kit/answer/answer-library"
import {
  planApplyProps,
  planViewProps,
  projectPlanProps,
  teamPlanProps,
} from "@/demo/assistant/plan-schemas"
import { PlanApply } from "./plan-apply"
import { PlanChanges } from "./plan-changes"
import { PlanLoad } from "./plan-load"
import { PlanProjection } from "./plan-projection"
import { PlanProjects } from "./plan-projects"
import { ProjectPlan } from "./project-plan"
import { TeamPlan } from "./team-plan"

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

export const teamPlan = defineAnswerComponent({
  name: "TeamPlan",
  description:
    "A plan across the team's open projects: people with their pace, the projects with due dates, the open tasks with an owner and the proposed moves. Its children (PlanLoad, PlanProjects, PlanChanges, PlanApply) show it and stay linked as the person edits.",
  props: teamPlanProps,
  component: TeamPlan,
  placeholder: <Skeleton className="h-96" />,
  text: ({ changes }) =>
    [
      "Plan for the team:",
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
    "Inside a ProjectPlan or TeamPlan: each person's tasks with the plan applied and the day they finish them; across the team, stacked by project.",
  props: planViewProps,
  component: PlanLoad,
  placeholder: <Skeleton className="h-32" />,
})

export const planProjects = defineAnswerComponent({
  name: "PlanProjects",
  description:
    "Inside a TeamPlan: when each project lands with the plan, against its due date.",
  props: planViewProps,
  component: PlanProjects,
  placeholder: <Skeleton className="h-32" />,
})

export const planChanges = defineAnswerComponent({
  name: "PlanChanges",
  description:
    "Inside a ProjectPlan or TeamPlan: the proposed changes to remove or add back, options to add, and each task's holder to change.",
  props: planViewProps,
  component: PlanChanges,
  placeholder: <Skeleton className="h-40" />,
})

export const planApply = defineAnswerComponent({
  name: "PlanApply",
  description:
    "Inside a ProjectPlan or TeamPlan: what the plan comes to, and an action that asks the assistant to apply it (it asks for approval first).",
  props: planApplyProps,
  component: PlanApply,
  placeholder: <Skeleton className="h-12" />,
})

export const planComponents = [
  projectPlan,
  teamPlan,
  planProjection,
  planLoad,
  planProjects,
  planChanges,
  planApply,
]
