import { expect, it } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { OverviewPage } from "./overview-page"
import workspace from "@/demo/data/workspace.json"
import { initialActivity as activity } from "@/demo/activity-fixtures"
import { initialProjects as projectData } from "@/demo/project-fixtures"
import { initialTasks as tasks } from "@/demo/project-tasks"
import type { Project } from "@/demo/model"

it("renders the reusable page without a router or demo state provider", () => {
  const projects: Project[] = projectData.map((project) => ({
    ...project,
    status: "in-progress",
  }))

  const markup = renderToStaticMarkup(
    <OverviewPage
      projects={projects}
      activity={activity}
      tasks={tasks}
      members={workspace.members}
      referenceDate={workspace.referenceDate}
      period={{ kind: "preset", days: 14 }}
      onPeriodChange={() => undefined}
      onNewProject={() => undefined}
      onSelectProject={() => undefined}
    />,
  )

  expect(markup).toContain("Tasks completed and added")
  expect(markup).toContain("Brand refresh")
})
