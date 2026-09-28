import type { InboxFilter, InboxScenario } from "@/demo/use-inbox"

interface InboxSearchInput {
  message?: unknown
  filter?: unknown
  scenario?: unknown
}

export interface InboxSearch {
  message: string
  filter: InboxFilter
  scenario: InboxScenario
}

export const defaultInboxSearch: InboxSearch = {
  message: "",
  filter: "all",
  scenario: "normal",
}

export function parseInboxSearch(raw: InboxSearchInput): InboxSearch {
  try {
    return {
      message: String(raw.message ?? ""),
      filter: raw.filter === "unread" ? "unread" : "all",
      scenario: raw.scenario === "inbox-failure" ? "inbox-failure" : "normal",
    }
  } catch {
    // Uncoercible query values cannot identify an inbox message.
    return defaultInboxSearch
  }
}
