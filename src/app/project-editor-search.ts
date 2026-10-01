import type { ProjectSaveScenario } from "@/demo/project-form"
import { parseProjectReturnSearch } from "./project-return"

interface EditorSearchInput {
  returnTo?: unknown
  scenario?: unknown
  tab?: unknown
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
  /**
   * save-failure rejects the first inline save; upload-failure the first
   * upload; run-failure fails a step of the project's first agent run.
   */
  scenario?: ProjectSaveScenario | "upload-failure" | "run-failure"
  /** The open section; Tasks when absent. */
  tab?: "comments" | "activity" | "agent"
}

export function parseProjectDetailSearch(raw: EditorSearchInput): DetailSearch {
  const search: DetailSearch = parseProjectReturnSearch(raw)

  if (
    raw.scenario === "save-failure" ||
    raw.scenario === "upload-failure" ||
    raw.scenario === "run-failure"
  )
    search.scenario = raw.scenario

  if (raw.tab === "comments" || raw.tab === "activity" || raw.tab === "agent")
    search.tab = raw.tab

  return search
}
