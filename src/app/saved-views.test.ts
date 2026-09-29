import { expect, it } from "vitest"
import { defaultProjectsSearch } from "./projects-search"
import {
  builtInViews,
  sameView,
  savedViewSearch,
  viewNameError,
} from "./saved-views"

it("matches views by what they show, ignoring page, order of choices and spaces", () => {
  const mine = builtInViews[0].search

  expect(
    sameView(
      savedViewSearch({
        ...defaultProjectsSearch,
        ...mine,
        status: [...mine.status].reverse(),
        page: 3,
        pageSize: 20,
      }),
      mine,
    ),
  ).toBe(true)
  expect(sameView({ ...mine, q: " " }, mine)).toBe(true)
  expect(sameView({ ...mine, view: "board" }, mine)).toBe(false)
  expect(
    sameView(
      { ...defaultProjectsSearch, desc: true },
      savedViewSearch(defaultProjectsSearch),
    ),
  ).toBe(true)
})

it("requires a unique, non-empty name", () => {
  expect(viewNameError("  ", builtInViews)).toBe("Name the view.")
  expect(viewNameError("my open WORK", builtInViews)).toBe(
    "A view with this name already exists.",
  )
  expect(viewNameError("Launch week", builtInViews)).toBe("")
})
