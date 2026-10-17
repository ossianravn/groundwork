import { expect, it } from "vitest"
import { Plus, LayoutDashboard } from "lucide-react"
import { commandResults, type CommandSources } from "./command-results"
import { initialProjects } from "@/demo/project-fixtures"
import workspace from "@/demo/data/workspace.json"

const sources: CommandSources = {
  projects: initialProjects,
  recentProjectIds: [],
  tasks: [
    {
      id: "t1",
      title: "Audit current brand touchpoints",
      done: true,
      projectId: "brand",
      projectName: "Brand refresh",
    },
    {
      id: "t2",
      title: "Analytics events",
      done: false,
      projectId: "website",
      projectName: "Website redesign",
    },
  ],
  people: workspace.members,
  pages: [{ id: "Overview", label: "Overview", icon: LayoutDashboard }],
  actions: [
    { id: "new", label: "New project", icon: Plus, keywords: "create" },
  ],
}

it("offers recent projects, actions and pages before anything is typed", () => {
  const empty = commandResults("", sources)

  expect(empty.typed).toBe(false)
  expect(empty.projectsHeading).toBe("Projects")
  expect(empty.actions.map((entry) => entry.id)).toEqual(["new"])
  expect(empty.pages.map((entry) => entry.id)).toEqual(["Overview"])
  expect(empty.tasks).toEqual([])

  const recent = commandResults("", {
    ...sources,
    recentProjectIds: ["website", "gone", "brand"],
  })

  expect(recent.projectsHeading).toBe("Recent")
  expect(recent.projects.map((project) => project.id)).toEqual([
    "website",
    "brand",
  ])
})

it("needs every word, ranks recent projects first and finds keywords", () => {
  const brand = commandResults("brand", {
    ...sources,
    recentProjectIds: ["website"],
  })

  expect(brand.typed).toBe(true)
  expect(brand.projects.map((project) => project.id)).toEqual(["brand"])
  expect(brand.tasks.map((task) => task.id)).toEqual(["t1"])
  expect(commandResults("brand events", sources).tasks).toEqual([])
  expect(
    commandResults("design", sources).projects.map((project) => project.id)[0],
  ).not.toBe("brand")
  expect(commandResults("create", sources).actions[0]?.id).toBe("new")
  expect(commandResults("ava", sources).people[0]?.name).toBe("Ava Morgan")
})
