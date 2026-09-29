import { ArrowLeft } from "lucide-react"
import { getRouteApi, Link } from "@tanstack/react-router"
import { buttonVariants } from "@/kit/ui/button"

import { ProjectPage } from "@/features/projects/project-page"
import { useDemoWorkspace } from "./workspace-context"
import { projectReturnDestination, projectReturnLabel } from "./project-return"
import { useRouteFocus } from "./use-route-focus"
import { useProjectUndo } from "./use-project-undo"

import { ProjectUnavailable } from "@/features/projects/project-unavailable"
import { ProjectEditLink } from "./project-detail-link"
import { projectInlineEditing } from "@/features/projects/project-inline-editing"

const route = getRouteApi("/app/demo/projects/$projectId")

export function ProjectDetailRoute() {
  const { projectId } = route.useParams()
  const { returnTo, scenario } = route.useSearch()
  const { demo, drafts } = useDemoWorkspace()
  const undo = useProjectUndo()
  const project = demo.projects.find((item) => item.id === projectId)
  const destination = projectReturnDestination(returnTo)
  useRouteFocus()

  const returnLink = (
    <Link {...destination} className={buttonVariants({ variant: "ghost" })}>
      <ArrowLeft aria-hidden="true" />
      {projectReturnLabel(returnTo)}
    </Link>
  )

  return (
    <>
      <title>
        {`${project?.name ?? "Project unavailable"} · ${demo.workspace.name}`}
      </title>
      {project ? (
        <ProjectPage
          key={project.id}
          editing={projectInlineEditing(
            project,
            drafts,
            (target, values, mode) =>
              demo.saveProject(target, values, mode, false),
            scenario ?? "normal",
          )}
          notice={
            demo.saveNotice?.projectId === project.id
              ? demo.saveNotice.message
              : undefined
          }
          editLink={
            <ProjectEditLink
              projectId={project.id}
              className={buttonVariants({ variant: "outline" })}
            >
              Edit project
            </ProjectEditLink>
          }
          project={project}
          members={demo.workspace.people}
          assignableMembers={demo.workspace.members}
          activity={demo.activity}
          onComplete={undo.completeProject}
          tasks={demo.tasks.filter((task) => task.projectId === project.id)}
          onTaskChange={(change) => {
            const reversal = demo.changeTask(change)

            return reversal ? () => demo.undoProjectChange(reversal) : undefined
          }}
          returnLink={returnLink}
        />
      ) : (
        <ProjectUnavailable returnLink={returnLink} />
      )}
    </>
  )
}
