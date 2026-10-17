import { textDocument } from "@/kit/rich-text/document"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { Card } from "@/kit/ui/card"
import { ProjectForm } from "@/features/projects/project-form"
import {
  projectValuesChanged,
  type ProjectSaveResult,
  type ProjectValues,
} from "@/demo/project-form"
import { useDemoWorkspace } from "./workspace-context"
import { useRouteFocus } from "./use-route-focus"
import { ProjectMark } from "@/components/project-identity"
import { nextProjectColor } from "@/demo/project-colors"
import { projectReturnDestination, projectReturnTo } from "./project-return"
import { parseProjectEditorSearch } from "./project-editor-search"
import { createProjectDraft, refreshProjectDraft } from "@/demo/project-draft"

/**
 * New project. Existing projects are edited in place on their page and in
 * the quick view; /projects/:id/edit redirects there.
 */
export function ProjectEditorRoute() {
  const { returnTo, scenario } = parseProjectEditorSearch(
    useSearch({ strict: false }),
  )

  const { demo, drafts } = useDemoWorkspace()
  const navigate = useNavigate()
  useRouteFocus()
  const origin = projectReturnTo(returnTo ?? "/app/demo/projects")
  const destination = projectReturnDestination(origin)
  const key = "new"

  const initial: ProjectValues = {
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
    const result = demo.saveProject(
      { kind: "create" },
      draft.values,
      draft.scenario,
    )

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

  return (
    <main
      id="main-content"
      className="page-content project-editor-page"
      tabIndex={-1}
    >
      <title>{`New project · ${demo.workspace.name}`}</title>
      <div className="project-page-heading">
        <div className="project-page-title">
          <ProjectMark color={draft.values.color} />
          <h1>New project</h1>
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
          creating
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
