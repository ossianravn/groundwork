import metadata from "./components.json"

export const components = metadata

export type ReferenceComponent = (typeof components)[number]

export const componentCategories = [
  ...new Set(components.map((item) => item.category)),
]

export function searchComponents(query: string, category: string) {
  const terms = query.trim().toLowerCase().split(/\s+/u).filter(Boolean)

  return components.filter((item) => {
    const text = [
      item.name,
      item.category,
      item.purpose,
      item.context,
      ...item.patterns,
    ]
      .join(" ")
      .toLowerCase()

    return (
      (!category || item.category === category) &&
      terms.every((term) => text.includes(term))
    )
  })
}
