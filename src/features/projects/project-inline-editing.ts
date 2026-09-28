import type { Project } from "@/demo/model"
import {
  createProjectDraft,
  finishProjectField,
  projectFieldChanged,
  refreshProjectDraft,
  type InlineProjectField,
  type ProjectDraftStore,
} from "@/demo/project-draft"
import {
  projectValues,
  projectValuesChanged,
  type ProjectSaveResult,
  type ProjectSaveScenario,
  type ProjectTarget,
  type ProjectValues,
} from "@/demo/project-form"

export function projectInlineEditing(
  project: Project,
  drafts: ProjectDraftStore,
  saveProject: (
    target: ProjectTarget,
    values: ProjectValues,
    scenario: ProjectSaveScenario,
  ) => ProjectSaveResult,
  scenario: ProjectSaveScenario,
) {
  const saved = projectValues(project)

  const draft = refreshProjectDraft(
    drafts.entries[project.id] ?? createProjectDraft(saved, scenario),
    saved,
  )

  function finish(field: InlineProjectField, values: ProjectValues) {
    const next = finishProjectField(draft, values, field)

    if (projectValuesChanged(next.values, values))
      drafts.update(project.id, next)
    else drafts.discard(project.id)
  }

  return {
    values: draft.values,
    dirty: (field: InlineProjectField) =>
      projectFieldChanged(field, draft.values, saved),
    change: (field: InlineProjectField, value: string) =>
      drafts.update(project.id, {
        ...draft,
        values: { ...draft.values, [field]: value },
        errors: { ...draft.errors, [field]: undefined },
      }),
    cancel: (field: InlineProjectField) => finish(field, saved),
    save: (field: InlineProjectField): ProjectSaveResult => {
      const values = { ...saved, [field]: draft.values[field] }

      if (field === "name") values.name = values.name.trim()

      if (!projectValuesChanged(values, saved)) {
        finish(field, saved)

        return { kind: "saved", projectId: project.id }
      }

      const result = saveProject(
        { kind: "edit", id: project.id },
        values,
        draft.scenario,
      )

      if (result.kind === "saved") finish(field, values)
      else
        drafts.update(project.id, {
          ...draft,
          errors: result.kind === "invalid" ? result.errors : draft.errors,
          failure: result.kind === "rejected" ? result.message : "",
          scenario: result.kind === "rejected" ? "normal" : draft.scenario,
        })

      return result
    },
  }
}

export type ProjectInlineEditing = ReturnType<typeof projectInlineEditing>
