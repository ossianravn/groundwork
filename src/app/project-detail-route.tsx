import { getRouteApi, Link } from "@tanstack/react-router"
import { buttonVariants } from "@/kit/ui/button"

import { ProjectPage } from "@/features/projects/project-page"
import { useDemoWorkspace } from "./workspace-context"
import { projectReturnDestination, projectReturnLabel } from "./project-return"
import { useRouteFocus } from "./use-route-focus"
import { useDemoState } from "./demo-state"
import { useProjectRecord } from "./use-project-record"

import { ProjectUnavailable } from "@/features/projects/project-unavailable"
import {
  ProjectAgent,
  type AgentContext,
} from "@/features/projects/project-agent"
import { dateOffset } from "@/demo/report-period"
import { isActiveRun } from "@/demo/agent-runs"
import { startRun } from "@/demo/agent-run-plans"
import type { Project } from "@/demo/model"

const route = getRouteApi("/app/demo/projects/$projectId")

export function ProjectDetailRoute() {
  const { projectId } = route.useParams()
  const { returnTo, scenario, tab } = route.useSearch()
  const navigate = route.useNavigate()
  const { demo } = useDemoWorkspace()
  const project = demo.projects.find((item) => item.id === projectId)
  const destination = projectReturnDestination(returnTo)

  const showTab = (next: "tasks" | "comments" | "activity" | "agent") =>
    void navigate({
      search: (search) => ({
        ...search,
        tab: next === "tasks" ? undefined : next,
      }),
      replace: true,
    })

  useRouteFocus()

  // The breadcrumb returns to the origin; a missing project offers it too.
  const returnLink = (
    <Link {...destination} className={buttonVariants({ variant: "outline" })}>
      {projectReturnLabel(returnTo)}
    </Link>
  )

  return (
    <>
      <title>
        {`${project?.name ?? "Project unavailable"} · ${demo.workspace.name}`}
      </title>
      {project ? (
        <ProjectRecordPage
          key={project.id}
          project={project}
          scenario={scenario}
          tab={tab ?? "tasks"}
          onTabChange={showTab}
        />
      ) : (
        <ProjectUnavailable returnLink={returnLink} />
      )}
    </>
  )
}

type Tab = "tasks" | "comments" | "activity" | "agent"

function ProjectRecordPage({
  project,
  scenario,
  tab,
  onTabChange,
}: {
  project: Project
  scenario?: string
  tab: Tab
  onTabChange: (tab: Tab) => void
}) {
  const { demo } = useDemoWorkspace()
  const { files, runs } = useDemoState()
  const record = useProjectRecord(project, scenario)
  const projectRuns = runs.runs.filter((run) => run.projectId === project.id)

  return (
    <ProjectPage
      {...record}
      notice={
        demo.saveNotice?.projectId === project.id
          ? demo.saveNotice.message
          : undefined
      }
      tab={tab}
      onTabChange={onTabChange}
      agent={{
        runs: projectRuns.length,
        alert: projectRuns.some(
          (run) => isActiveRun(run) && run.status !== "running",
        ),
        panel: (
          <ProjectAgent
            project={project}
            runs={projectRuns}
            context={agentContext(record, demo.workspace.referenceDate)}
            nameOf={(id) =>
              id === demo.workspace.currentUserId
                ? "you"
                : (demo.workspace.people.find((person) => person.id === id)
                    ?.name ?? "a former member")
            }
            actions={runs}
            onShowResult={(run) =>
              onTabChange(
                run.workflow === "status-report" ? "comments" : "tasks",
              )
            }
            onStart={(workflow) =>
              runs.start(
                startRun(
                  workflow,
                  project,
                  {
                    projects: demo.projects,
                    tasks: demo.tasks,
                    activity: demo.activity,
                    comments: demo.comments,
                    people: demo.workspace.people,
                    files: files.files,
                    referenceDate: demo.workspace.referenceDate,
                    currentUserId: demo.workspace.currentUserId,
                  },
                  Date.now(),
                  scenario === "run-failure" && !projectRuns.length,
                ),
              )
            }
          />
        ),
      }}
    />
  )
}

/** What the project's agents read, counted from its records this week. */
function agentContext(
  record: ReturnType<typeof useProjectRecord>,
  referenceDate: string,
): AgentContext {
  const weekStart = dateOffset(referenceDate, -6)
  const done = record.tasks.filter((task) => task.done)

  return {
    openTasks: record.tasks.length - done.length,
    doneTasks: done.length,
    doneThisWeek: done.filter((task) => (task.completedAt ?? "") >= weekStart)
      .length,
    comments: record.comments.length,
    eventsThisWeek: record.activity.filter(
      (event) =>
        event.projectId === record.project.id && event.date >= weekStart,
    ).length,
  }
}
