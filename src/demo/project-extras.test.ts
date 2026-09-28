import { expect, it } from "vitest"
import { initialProjects } from "./project-fixtures"
import {
  projectValues,
  projectValuesChanged,
  validateProjectValues,
} from "./project-form"
import { applyProjectSave } from "./project-save"
import { canonicalProjectTags } from "./project-tags"

it("reuses saved tag spelling and saves each trimmed tag once with the project and history", () => {
  const original = initialProjects[0]
  const draftTags = [" design ", "DESIGN", " Research ", "research", "  "]
  expect(canonicalProjectTags(draftTags, original.tags)).toEqual([
    "Design",
    "Research",
  ])

  const result = applyProjectSave(
    { projects: initialProjects, activity: [] },
    { kind: "edit", id: original.id },
    { ...projectValues(original), tags: draftTags },
    {
      projectId: original.id,
      eventId: "tags",
      memberId: original.ownerId,
      date: "2026-09-27",
    },
  )

  expect(result.projects[0].tags).toEqual(["Design", "Research"])
  expect(result.activity[0].changes).toEqual([
    { field: "tags", before: original.tags, after: ["Design", "Research"] },
  ])
  expect(
    canonicalProjectTags(
      ["RESEARCH"],
      result.projects.flatMap((item) => item.tags),
    ),
  ).toEqual(["Research"])
  expect(original.tags).toEqual(["Design", "Marketing"])
})

const project = initialProjects.find((item) => item.id === "design-system")!

const members = [{ id: project.ownerId, name: "Noah Williams", initials: "NW" }]

it("ignores empty link rows and associates incomplete or non-web URLs with their own row", () => {
  const values = projectValues(project)

  const links = [
    { id: "blank", url: "  ", label: "" },
    { id: "missing", url: "", label: "Design file" },
    { id: "invalid", url: "not a url", label: "" },
    { id: "unsafe", url: "javascript:alert(1)", label: "" },
    { id: "valid", url: " https://example.com/design ", label: "Design file" },
  ]

  expect(
    Object.keys(validateProjectValues({ ...values, links }, members).links!),
  ).toEqual(["missing", "invalid", "unsafe"])
  expect(
    projectValuesChanged(values, {
      ...values,
      links: [...values.links, links[0]],
    }),
  ).toBe(false)
  expect(
    validateProjectValues({ ...values, links: [links[0], links[4]] }, members)
      .links,
  ).toBeUndefined()
})

it("saves tags and normalized links together with before/after history, preserving other projects", () => {
  const values = {
    ...projectValues(project),
    tags: ["Engineering", "Product"],
    links: [
      {
        id: "new-link",
        url: " https://example.com/spec ",
        label: " Specification ",
      },
      { id: "blank", url: "", label: "" },
    ],
  }

  expect(projectValuesChanged(projectValues(project), values)).toBe(true)

  const result = applyProjectSave(
    { projects: initialProjects, activity: [] },
    { kind: "edit", id: project.id },
    values,
    {
      projectId: project.id,
      eventId: "extras",
      memberId: project.ownerId,
      date: "2026-09-27",
    },
  )

  const saved = result.projects.find((item) => item.id === project.id)!
  expect(saved.tags).toEqual(values.tags)
  expect(saved.links).toEqual([
    { id: "new-link", url: "https://example.com/spec", label: "Specification" },
  ])
  expect(result.activity[0].changes).toEqual([
    { field: "tags", before: project.tags, after: saved.tags },
    { field: "links", before: project.links, after: saved.links },
  ])
  expect(result.projects[0]).toBe(initialProjects[0])
  expect(
    projectValuesChanged(projectValues(saved), {
      ...values,
      links: values.links.map((link) => ({ ...link, id: `draft-${link.id}` })),
    }),
  ).toBe(false)
})
