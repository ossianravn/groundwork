export function projectTagKey(tag: string) {
  return tag.trim().toLowerCase()
}

export function canonicalProjectTags(tags: string[], known: string[]) {
  const labels = new Map<string, string>()

  for (const tag of known) {
    const key = projectTagKey(tag)

    if (key && !labels.has(key)) labels.set(key, tag.trim())
  }

  const selected = new Map<string, string>()

  for (const tag of tags) {
    const key = projectTagKey(tag)

    if (key && !selected.has(key))
      selected.set(key, labels.get(key) ?? tag.trim())
  }

  return [...selected.values()]
}
