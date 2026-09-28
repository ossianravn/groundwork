import { componentCategories } from "@/features/reference/catalog"

export const defaultReferenceSearch = { q: "", category: "" }

export function parseReferenceSearch(raw: { q?: unknown; category?: unknown }) {
  return {
    q: String(raw.q ?? ""),
    category: componentCategories.find((value) => value === raw.category) ?? "",
  }
}

export function parseComponentSearch(raw: {
  q?: unknown
  category?: unknown
  panel?: unknown
}) {
  return {
    ...parseReferenceSearch(raw),
    panel: raw.panel === "code" ? ("code" as const) : ("preview" as const),
  }
}
