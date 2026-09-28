import { describe, expect, it } from "vitest"
import { articles, guides, releases, questions, searchGuides } from "./content"

describe("resource content", () => {
  it("keeps related destinations and section anchors resolvable", () => {
    for (const collection of [articles, guides]) {
      const slugs = collection.map((entry) => entry.slug)
      expect(new Set(slugs).size).toBe(slugs.length)

      for (const entry of collection) {
        expect(entry.related.every((slug) => slugs.includes(slug))).toBe(true)
      }
    }

    for (const entry of [...articles, ...guides, ...releases]) {
      const anchors = entry.sections.map((section) => section.id)
      expect(new Set(anchors).size).toBe(anchors.length)
    }

    const helpSlugs = guides.map((guide) => guide.slug)
    expect(
      [...questions, ...releases].every((entry) =>
        helpSlugs.includes(entry.guide),
      ),
    ).toBe(true)
  })

  it("finds all query terms in guide bodies without case or spacing sensitivity", () => {
    expect(searchGuides("  CANCEL  draft ").map((guide) => guide.slug)).toEqual(
      ["create-and-edit-projects"],
    )
    expect(searchGuides("unfindable-example")).toEqual([])
    expect(searchGuides("   ")).toEqual(guides)
  })
})
