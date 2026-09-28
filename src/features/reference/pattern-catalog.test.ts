import coverage from "../../../docs/coverage.md?raw"
import { describe, expect, it } from "vitest"
import {
  patterns,
  findPatterns,
  defaultPatternFilters,
} from "./pattern-catalog"
import { readPatternSource } from "@/app/pattern-sources"
import { parsePatternDetailSearch } from "@/app/pattern-search"

describe("pattern catalogue", () => {
  it("preserves inventory IDs and resolves each advertised source to its actual file", async () => {
    const ids = [
      ...new Set(
        [...coverage.matchAll(/\| ([A-Z]+-\d+) \|/gu)].map((match) => match[1]),
      ),
    ]

    expect(patterns.map((item) => item.id).sort()).toEqual(ids.sort())
    expect(new Set(patterns.map((item) => item.id)).size).toBe(patterns.length)

    for (const item of patterns) {
      expect(item.sources.length > 0).toBe(item.examples.length > 0)

      if (item.examples.length) expect(item.implemented).not.toBe("")
    }

    const paths = [...new Set(patterns.flatMap((item) => item.sources))]
    await Promise.all(
      paths.map(async (path) => {
        expect(await readPatternSource(path)).toContain("export ")
      }),
    )
  })

  it("combines inventory search, category, surface and availability in shareable detail state", () => {
    const filters = {
      ...defaultPatternFilters,
      q: "tabl-09",
      category: "Data views",
      surface: "Workspace",
      availability: "example" as const,
    }

    expect(findPatterns(filters).map((item) => item.id)).toEqual(["TABL-09"])
    expect(findPatterns({ ...filters, availability: "planned" })).toEqual([])
    expect(parsePatternDetailSearch({ ...filters, example: "1" })).toEqual({
      ...filters,
      example: 1,
    })
    expect(
      parsePatternDetailSearch({
        category: "unknown",
        availability: "complete",
        example: "invalid",
      }),
    ).toEqual({ ...defaultPatternFilters, example: 0 })
  })
})
