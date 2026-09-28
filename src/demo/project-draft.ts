import {
  projectValuesChanged,
  type ProjectFieldErrors,
  type ProjectSaveScenario,
  type ProjectValues,
} from "./project-form"

export type InlineProjectField = "name" | "ownerId" | "dueDate"

export interface ProjectDraft {
  base: ProjectValues
  values: ProjectValues
  errors: ProjectFieldErrors
  failure: string
  scenario: ProjectSaveScenario
}

export interface ProjectDraftStore {
  entries: Partial<Record<string, ProjectDraft>>
  update: (key: string, draft: ProjectDraft) => void
  discard: (key: string) => void
}

export function createProjectDraft(
  base: ProjectValues,
  scenario: ProjectSaveScenario = "normal",
): ProjectDraft {
  return { base, values: base, errors: {}, failure: "", scenario }
}

export function projectFieldChanged<K extends keyof ProjectValues>(
  field: K,
  values: ProjectValues,
  base: ProjectValues,
) {
  return projectValuesChanged({ ...base, [field]: values[field] }, base)
}

// Keep pending fields, but take newer saved values for fields the person did not edit.
export function refreshProjectDraft(
  draft: ProjectDraft,
  saved: ProjectValues,
): ProjectDraft {
  function value<K extends keyof ProjectValues>(field: K): ProjectValues[K] {
    return projectFieldChanged(field, draft.values, draft.base)
      ? draft.values[field]
      : saved[field]
  }

  return {
    ...draft,
    base: saved,
    values: {
      name: value("name"),
      description: value("description"),
      ownerId: value("ownerId"),
      dueDate: value("dueDate"),
      tags: value("tags"),
      links: value("links"),
    },
  }
}

export function finishProjectField(
  draft: ProjectDraft,
  saved: ProjectValues,
  field: InlineProjectField,
): ProjectDraft {
  const next = refreshProjectDraft(draft, saved)

  return {
    ...next,
    values: { ...next.values, [field]: saved[field] },
    errors: { ...next.errors, [field]: undefined },
    failure: "",
    scenario: "normal",
  }
}
