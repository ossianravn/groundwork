import { describe, expect, it } from "vitest"
import { components, searchComponents } from "./catalog"
import { referenceExamples } from "@/app/reference-examples"
import { parseComponentSearch } from "@/app/reference-search"

describe("reference catalogue", () => {
  it("pairs every documented component with a real example and its exact source", () => {
    expect(new Set(components.map((item) => item.id)).size).toBe(
      components.length,
    )
    expect(referenceExamples.map((item) => item.id).sort()).toEqual(
      components.map((item) => item.id).sort(),
    )

    for (const example of referenceExamples) {
      expect(example.source).toContain(
        `export function ${example.Component.name}`,
      )
      expect(example.source).toContain("@/kit/ui/")
    }
  })

  it("combines task or pattern search with category and preserves it on code links", () => {
    expect(
      searchComponents(" sett-13 ", "Forms").map((item) => item.id),
    ).toEqual(["input", "select"])
    expect(
      searchComponents("choose one", "Forms").map((item) => item.id),
    ).toEqual(["select", "radio-group"])
    expect(searchComponents("unmatched", "")).toEqual([])
    expect(
      parseComponentSearch({ q: "SETT-13", category: "Forms", panel: "code" }),
    ).toEqual({ q: "SETT-13", category: "Forms", panel: "code" })
    expect(
      parseComponentSearch({ category: "unavailable", panel: "invalid" }),
    ).toEqual({ q: "", category: "", panel: "preview" })
  })
})
