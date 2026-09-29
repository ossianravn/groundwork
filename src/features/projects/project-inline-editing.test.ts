import { expect, it } from "vitest"
import { initialProjects } from "@/demo/project-fixtures"
import {
  createProjectDraft,
  refreshProjectDraft,
  type ProjectDraftStore,
} from "@/demo/project-draft"
import { projectValues } from "@/demo/project-form"
import { applyProjectSave, type ProjectRecords } from "@/demo/project-save"
import { projectInlineEditing } from "./project-inline-editing"

it("saves only the selected field and preserves other drafts through save, cancel and full-editor refresh", () => {
  const project = initialProjects[0]
  const saved = projectValues(project)
  let records: ProjectRecords = { projects: [project], activity: [], tasks: [] }

  const drafts: ProjectDraftStore = {
    entries: {
      [project.id]: {
        ...createProjectDraft(saved),
        values: { ...saved, name: "", ownerId: "leo" },
      },
    },
    update: (key, draft) => {
      drafts.entries[key] = draft
    },
    discard: (key) => {
      delete drafts.entries[key]
    },
  }

  function editor() {
    return projectInlineEditing(
      records.projects[0],
      drafts,
      (target, values) => {
        records = applyProjectSave(records, target, values, {
          projectId: project.id,
          eventId: "inline-save",
          memberId: "ava",
          date: "2026-09-27",
        })

        return { kind: "saved", projectId: project.id }
      },
      "normal",
    )
  }

  expect(editor().save("ownerId").kind).toBe("saved")
  expect(records.projects[0]).toEqual({ ...project, ownerId: "leo" })
  expect(records.activity[0].changes).toEqual([
    { field: "ownerId", before: saved.ownerId, after: "leo" },
  ])
  expect(drafts.entries[project.id]?.values.name).toBe("")

  editor().change("dueDate", "2026-10-10")
  editor().cancel("dueDate")
  const retained = drafts.entries[project.id]

  if (!retained) throw new Error("The unfinished name draft must survive")
  expect(
    refreshProjectDraft(retained, projectValues(records.projects[0])).values,
  ).toEqual({ ...saved, ownerId: "leo", name: "" })
  editor().cancel("name")
  expect(drafts.entries[project.id]).toBeUndefined()
  expect(records.activity).toHaveLength(1)
})

it("refreshes untouched saved fields without losing pending input", () => {
  const saved = projectValues(initialProjects[0])

  const draft = {
    ...createProjectDraft(saved),
    values: { ...saved, name: "Launch refresh" },
  }

  const latest = { ...saved, ownerId: "mia", tags: ["New tag"] }
  const refreshed = refreshProjectDraft(draft, latest)
  expect(refreshed.base).toEqual(latest)
  expect(refreshed.values).toEqual({ ...latest, name: "Launch refresh" })
})
