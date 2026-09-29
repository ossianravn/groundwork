import { expect, it } from "vitest"
import { initialProjects } from "./project-fixtures"
import { initialTasks } from "./project-tasks"
import { initialComments } from "./project-comments"
import { initialInbox } from "./inbox"
import workspace from "./data/workspace.json"
import { searchWorkspace } from "./workspace-search"

const sources = {
  projects: initialProjects,
  tasks: initialTasks,
  comments: initialComments,
  messages: initialInbox,
  people: workspace.members,
}

it("finds matches across kinds and ranks title matches first", () => {
  const hits = searchWorkspace("brand", sources)
  const kinds = new Set(hits.map((hit) => hit.kind))

  expect(hits[0]).toMatchObject({ kind: "project", id: "brand" })
  expect(kinds).toEqual(new Set(["project", "task", "message"]))
  expect(
    hits.find(
      (hit) => hit.kind === "task" && hit.title.includes("Brand launch"),
    ),
  ).toMatchObject({ projectId: "brand", detail: "Brand refresh · Open" })
})

it("requires every term, reads mentions as names and ignores empty queries", () => {
  expect(searchWorkspace("   ", sources)).toEqual([])
  expect(searchWorkspace("slide deck template", sources)).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ kind: "task", title: "Slide deck template" }),
      expect.objectContaining({ kind: "comment", id: "c-brand-2" }),
    ]),
  )
  expect(
    searchWorkspace("mia davis slide", sources).map((hit) => hit.id),
  ).toEqual(["c-brand-2"])
  expect(
    searchWorkspace("leo", sources).find((hit) => hit.kind === "person"),
  ).toMatchObject({
    kind: "person",
    id: "leo",
  })
})
