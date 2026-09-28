import records from "./patterns.json"

export const patterns = records

export type Pattern = (typeof patterns)[number]

export type PatternExample = Pattern["examples"][number]

export const patternCategories = [
  ...new Set(patterns.map((item) => item.category)),
]

export const patternSurfaces = ["Public", "Workspace", "Shared"]

export const patternAvailability = ["all", "example", "planned"] as const

export type PatternAvailability = (typeof patternAvailability)[number]

export interface PatternFilters {
  q: string
  category: string
  surface: string
  availability: PatternAvailability
}

export const defaultPatternFilters: PatternFilters = {
  q: "",
  category: "",
  surface: "",
  availability: "all",
}

export function findPatterns(filters: PatternFilters) {
  const terms = filters.q.trim().toLowerCase().split(/\s+/u).filter(Boolean)

  return patterns.filter((item) => {
    const availability = item.examples.length ? "example" : "planned"

    const text = [
      item.id,
      item.title,
      item.originalName,
      item.summary,
      item.category,
    ]
      .join(" ")
      .toLowerCase()

    return (
      (!filters.category || item.category === filters.category) &&
      (!filters.surface || item.surface === filters.surface) &&
      (filters.availability === "all" ||
        filters.availability === availability) &&
      terms.every((term) => text.includes(term))
    )
  })
}
