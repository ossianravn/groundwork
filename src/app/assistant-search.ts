import type { AssistantScenario } from "@/demo/assistant/assistant-types"

export interface AssistantSearch {
  scenario: AssistantScenario
  /** A question to start with, such as one from a help guide. */
  q: string
}

export const defaultAssistantSearch: AssistantSearch = {
  scenario: "normal",
  q: "",
}

export function parseAssistantSearch(raw: {
  scenario?: unknown
  q?: unknown
}): AssistantSearch {
  return {
    q: String(raw.q ?? "").slice(0, 500),
    scenario:
      raw.scenario === "assistant-error" || raw.scenario === "tool-error"
        ? raw.scenario
        : "normal",
  }
}
