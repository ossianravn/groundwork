import type { AssistantScenario } from "@/demo/assistant/assistant-types"

export interface AssistantSearch {
  scenario: AssistantScenario
}

export const defaultAssistantSearch: AssistantSearch = { scenario: "normal" }

export function parseAssistantSearch(raw: {
  scenario?: unknown
}): AssistantSearch {
  return {
    scenario:
      raw.scenario === "assistant-error" || raw.scenario === "tool-error"
        ? raw.scenario
        : "normal",
  }
}
