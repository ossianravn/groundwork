import type { AssistantScenario } from "@/demo/assistant/assistant-transport"

export interface AssistantSearch {
  scenario: AssistantScenario
}

export const defaultAssistantSearch: AssistantSearch = { scenario: "normal" }

export function parseAssistantSearch(raw: {
  scenario?: unknown
}): AssistantSearch {
  return {
    scenario: raw.scenario === "assistant-error" ? "assistant-error" : "normal",
  }
}
