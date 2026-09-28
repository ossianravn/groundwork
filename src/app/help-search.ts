interface HelpSearchInput {
  q?: unknown
}

export interface HelpSearch {
  q: string
}

export function parseHelpSearch({ q }: HelpSearchInput): HelpSearch {
  try {
    return { q: q == null ? "" : String(q) }
  } catch {
    // Uncoercible query data cannot represent a text search.
    return { q: "" }
  }
}
