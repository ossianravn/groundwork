import { getRouteApi, Link } from "@tanstack/react-router"
import { buttonVariants } from "@/kit/ui/button"

import { ProjectPage } from "@/features/projects/project-page"
import { useDemoWorkspace } from "./workspace-context"
import { projectReturnDestination, projectReturnLabel } from "./project-return"
import { useRouteFocus } from "./use-route-focus"
import { useProjectUndo } from "./use-project-undo"
import { useDemoState } from "./demo-state"
import { ProjectFiles } from "@/features/projects/project-files"

import { ProjectUnavailable } from "@/features/projects/project-unavailable"
import { ProjectEditLink } from "./project-detail-link"
import { projectInlineEditing } from "@/features/projects/project-inline-editing"

const route = getRouteApi("/app/demo/projects/$projectId")

export function ProjectDetailRoute() {
  const { projectId } = route.useParams()
  const { returnTo, scenario, tab } = route.useSearch()
  const navigate = route.useNavigate()
  const { demo, drafts } = useDemoWorkspace()
  const { files } = useDemoState()
  const undo = useProjectUndo()
  const project = demo.projects.find((item) => item.id === projectId)
  const destination = projectReturnDestination(returnTo)
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
        <ProjectPage
          key={project.id}
          editing={projectInlineEditing(
            project,
            drafts,
            (target, values, mode) =>
              demo.saveProject(target, values, mode, false),
            scenario === "save-failure" ? "save-failure" : "normal",
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
          tab={tab ?? "tasks"}
          onTabChange={(next) =>
            void navigate({
              search: (search) => ({
                ...search,
                tab: next === "tasks" ? undefined : next,
              }),
              replace: true,
            })
          }
          tagOptions={[
            ...new Set(demo.projects.flatMap((item) => item.tags)),
          ].sort()}
          onComplete={undo.completeProject}
          tasks={demo.tasks.filter((task) => task.projectId === project.id)}
          comments={demo.comments.filter(
            (comment) => comment.projectId === project.id,
          )}
          onPostComment={(text) => demo.postComment(project.id, text)}
          files={
            <ProjectFiles
              files={files.files.filter(
                (file) => file.projectId === project.id,
              )}
              people={demo.workspace.people}
              failFirstUpload={scenario === "upload-failure"}
              onRemove={files.remove}
              onUploaded={(file) =>
                files.add({
                  id: crypto.randomUUID(),
                  projectId: project.id,
                  name: file.name,
                  type: file.type || "application/octet-stream",
                  size: file.size,
                  url: URL.createObjectURL(file),
                  uploadedBy: demo.workspace.currentUserId,
                  date: demo.workspace.referenceDate,
                })
              }
            />
          }
          onTaskChange={(change) => {
            const reversal = demo.changeTask(change)

            return reversal ? () => demo.undoProjectChange(reversal) : undefined
          }}
        />
      ) : (
        <ProjectUnavailable returnLink={returnLink} />
      )}
    </>
  )
}
