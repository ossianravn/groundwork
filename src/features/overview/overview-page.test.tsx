import { expect, it } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { OverviewPage } from "./overview-page"
import workspace from "@/demo/data/workspace.json"
import { initialActivity as activity } from "@/demo/activity-fixtures"
import { initialProjects as projectData } from "@/demo/project-fixtures"
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
      members={workspace.members}
      referenceDate={workspace.referenceDate}
      period={14}
      onPeriodChange={() => undefined}
      onNewProject={() => undefined}
      onSelectProject={() => undefined}
    />,
  )

  expect(markup).toContain("Task completion")
  expect(markup).toContain("Brand refresh")
})
