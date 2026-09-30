import { expect, it } from "vitest"
import { workspaceLocation } from "./workspace-breadcrumbs"

const trail = (pathname: string, searchStr = "") =>
  workspaceLocation({
    pathname,
    searchStr,
    workspaceName: "Studio North",
    projectName: () => "Brand refresh",
  }).breadcrumbs

it("names a project's origin as its parent crumb, which links back there", () => {
  expect(trail("/app/demo/projects/brand")).toEqual([
    { label: "Studio North" },
    { label: "Projects", destination: "return" },
    { label: "Brand refresh" },
  ])
  expect(
    trail(
      "/app/demo/projects/brand",
      `?returnTo=${encodeURIComponent("/app/demo/assistant")}`,
    )[1],
  ).toEqual({ label: "Assistant", destination: "return" })
})

it("links the editor back to its project and keeps list pages plain", () => {
  expect(
    trail(
      "/app/demo/projects/brand/edit",
      `?returnTo=${encodeURIComponent("/app/demo/overview?period=30")}`,
    ),
  ).toEqual([
    { label: "Studio North" },
    { label: "Overview", destination: "return" },
    { label: "Brand refresh", destination: "project" },
    { label: "Edit" },
  ])
  expect(trail("/app/demo/projects/import")).toEqual([
    { label: "Studio North" },
    { label: "Projects", destination: "projects" },
    { label: "Import" },
  ])
  expect(trail("/app/demo/projects")).toHaveLength(2)
})
