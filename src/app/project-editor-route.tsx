import { textDocument } from "@/kit/rich-text/document"
import { cn } from "cn"
import { Link, useNavigate, useParams, useSearch } from "@tanstack/react-router"
import { buttonVariants } from "@/kit/ui/button"
import { Card } from "@/kit/ui/card"
import { ProjectForm } from "@/features/projects/project-form"
import {
  projectValues,
  projectValuesChanged,
  type ProjectSaveResult,
  type ProjectTarget,
  type ProjectValues,
} from "@/demo/project-form"
import { useDemoWorkspace } from "./workspace-context"
import { useRouteFocus } from "./use-route-focus"
import { ProjectMark } from "@/components/project-identity"
import { nextProjectColor } from "@/demo/project-colors"
import {
  projectReturnDestination,
  projectReturnLabel,
  projectReturnTo,
} from "./project-return"
import { ProjectUnavailable } from "@/features/projects/project-unavailable"
import { parseProjectEditorSearch } from "./project-editor-search"
import { createProjectDraft, refreshProjectDraft } from "@/demo/project-draft"

export function ProjectEditorRoute() {
  const { projectId } = useParams({ strict: false })

  const { returnTo, scenario } = parseProjectEditorSearch(
    useSearch({ strict: false }),
  )

  const { demo, drafts } = useDemoWorkspace()
  const navigate = useNavigate()
  useRouteFocus()
  const project = demo.projects.find((item) => item.id === projectId)
  const origin = projectReturnTo(returnTo ?? "/app/demo/projects")

  const destination = project
    ? {
        to: "/app/demo/projects/$projectId" as const,
        params: { projectId: project.id },
        search: { returnTo: origin },
      }
    : projectReturnDestination(origin)

  const key = projectId ?? "new"

  const target: ProjectTarget = projectId
    ? { kind: "edit", id: projectId }
    : { kind: "create" }

  const initial: ProjectValues = project
    ? projectValues(project)
    : {
        name: "",
        description: textDocument(""),
        ownerId: demo.workspace.currentUserId,
        color: nextProjectColor(demo.projects.length),
        dueDate: "",
        tags: [],
        links: [],
      }

  const draft = refreshProjectDraft(
    drafts.entries[key] ?? createProjectDraft(initial, scenario),
    initial,
  )

  const dirty = projectValuesChanged(draft.values, initial)

  function save(): ProjectSaveResult {
    const result = demo.saveProject(target, draft.values, draft.scenario)

    if (result.kind === "saved") {
      drafts.discard(key)
      void navigate({
        to: "/app/demo/projects/$projectId",
        params: { projectId: result.projectId },
        search: { returnTo: origin },
        replace: true,
      })
    } else if (result.kind === "invalid") {
      drafts.update(key, { ...draft, errors: result.errors })
    } else {
      drafts.update(key, {
        ...draft,
        failure: result.message,
        scenario: "normal",
      })
    }

    return result
  }

  if (projectId && !project)
    return (
      <ProjectUnavailable
        returnLink={
          <Link
            {...projectReturnDestination(origin)}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            {projectReturnLabel(origin)}
          </Link>
        }
      />
    )

  return (
    <main
      id="main-content"
      className="page-content project-editor-page"
      tabIndex={-1}
    >
      <title>
        {`${project ? `Edit ${project.name}` : "New project"} · ${demo.workspace.name}`}
      </title>
      <div className="project-page-heading">
        <div className="project-page-title">
          <ProjectMark color={draft.values.color} />
          <h1>{project ? `Edit ${project.name}` : "New project"}</h1>
        </div>
        <p className="text-muted-foreground">
          Your draft is kept until you save, cancel or reload.
        </p>
      </div>
      <Card className="project-editor-card">
        <ProjectForm
          key={key}
          values={draft.values}
          tagOptions={demo.projects.flatMap((item) => item.tags)}
          members={demo.workspace.members}
          errors={draft.errors}
          failure={draft.failure}
          creating={!project}
          dirty={dirty}
          onChange={(field, value) =>
            drafts.update(key, {
              ...draft,
              values: { ...draft.values, [field]: value },
              errors: { ...draft.errors, [field]: undefined },
            })
          }
          onSave={save}
          onCancel={() => {
            drafts.discard(key)
            void navigate(destination)
          }}
        />
      </Card>
    </main>
  )
}
