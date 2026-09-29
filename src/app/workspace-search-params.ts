export interface WorkspaceSearch {
  q: string
  /** "" for every kind of result. */
  type: string
}

export const defaultWorkspaceSearch: WorkspaceSearch = { q: "", type: "" }

const types = ["project", "task", "comment", "message", "person", "help"]

export function parseWorkspaceSearch(raw: {
  q?: unknown
  type?: unknown
}): WorkspaceSearch {
  try {
    const type = String(raw.type ?? "")

    return {
      q: String(raw.q ?? ""),
      type: types.includes(type) ? type : "",
    }
  } catch {
    // Uncoercible query values start an empty search.
    return defaultWorkspaceSearch
  }
}
