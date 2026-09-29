import type { ProjectSaveScenario } from "@/demo/project-form"
import { parseProjectReturnSearch } from "./project-return"

interface EditorSearchInput {
  returnTo?: unknown
  scenario?: unknown
}

interface EditorSearch {
  returnTo: string
  scenario: ProjectSaveScenario
}

export function parseProjectEditorSearch(raw: EditorSearchInput): EditorSearch {
  return {
    ...parseProjectReturnSearch(raw),
    scenario: raw.scenario === "save-failure" ? "save-failure" : "normal",
  }
}

interface DetailSearch {
  returnTo: string
  /** save-failure rejects the first inline save; upload-failure the first upload. */
  scenario?: ProjectSaveScenario | "upload-failure"
}

export function parseProjectDetailSearch(raw: EditorSearchInput): DetailSearch {
  const search: DetailSearch = parseProjectReturnSearch(raw)

  if (raw.scenario === "save-failure" || raw.scenario === "upload-failure")
    search.scenario = raw.scenario

  return search
}
