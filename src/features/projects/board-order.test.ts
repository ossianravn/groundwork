import { expect, it } from "vitest"
import { initialProjects } from "@/demo/project-fixtures"
import {
  mergeBoardOrder,
  orderBoardProjects,
  placeBoardProject,
} from "./board-order"

it("retains hidden project positions when a filtered or sorted board is reordered", () => {
  const ids = initialProjects.map((project) => project.id)
  const reordered = mergeBoardOrder(ids, ids, ["design-system", "brand"])
  expect(
    reordered.filter((id) => id === "brand" || id === "design-system"),
  ).toEqual(["design-system", "brand"])
  expect(
    reordered.filter((id) => id !== "brand" && id !== "design-system"),
  ).toEqual(ids.filter((id) => id !== "brand" && id !== "design-system"))
  expect(
    orderBoardProjects(initialProjects, reordered).map((project) => project.id),
  ).toEqual(reordered)
  expect(
    mergeBoardOrder(
      reordered,
      [...ids, "new-project"],
      ["brand", "design-system"],
    ),
  ).toEqual([...ids, "new-project"])
})

it("previews an exact lane position without changing saved status or task totals", () => {
  const preview = placeBoardProject(initialProjects, "brand", "mobile")
  const moved = preview.find((project) => project.id === "brand")!
  expect(moved.status).toBe("in-review")
  expect(
    preview
      .filter((project) => project.status === "in-review")
      .map((project) => project.id),
  ).toEqual(["brand", "mobile"])
  expect(
    initialProjects.find((project) => project.id === "brand")?.status,
  ).toBe("in-progress")
  expect(moved.completedTasks).toBe(24)
  expect(
    placeBoardProject(preview, "brand", "mobile", true)
      .filter((project) => project.status === "in-review")
      .map((project) => project.id),
  ).toEqual(["mobile", "brand"])
  expect(
    placeBoardProject(preview, "brand", "completed")
      .filter((project) => project.status === "completed")
      .at(-1)?.id,
  ).toBe("brand")
})
