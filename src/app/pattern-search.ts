import {
  defaultPatternFilters,
  patternCategories,
  patternSurfaces,
  patternAvailability,
} from "@/features/reference/pattern-catalog"

export { defaultPatternFilters }

export function parsePatternSearch(raw: {
  q?: unknown
  category?: unknown
  surface?: unknown
  availability?: unknown
}) {
  return {
    q: typeof raw.q === "string" ? raw.q : "",
    category: patternCategories.find((value) => value === raw.category) ?? "",
    surface: patternSurfaces.find((value) => value === raw.surface) ?? "",
    availability:
      patternAvailability.find((value) => value === raw.availability) ?? "all",
  }
}

export function parsePatternDetailSearch(
  raw: Parameters<typeof parsePatternSearch>[0] & { example?: unknown },
) {
  const example = Number(raw.example)
  return {
    ...parsePatternSearch(raw),
    example: Number.isInteger(example) && example >= 0 ? example : 0,
  }
}
