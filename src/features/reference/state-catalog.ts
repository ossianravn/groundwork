import scenarios from "@/demo/data/scenarios.json"

export type StateScenario = keyof typeof scenarios.gallery

export const stateScenarios = scenarios.gallery

export const stateGroups = ["Results", "Connectivity", "Editing"]

export function isStateScenario(value: string): value is StateScenario {
  return Object.hasOwn(stateScenarios, value)
}

export function stateSource(scenario: StateScenario) {
  if (scenario === "destructive-action") return "state-team"

  if (stateScenarios[scenario].group === "Results") return "state-projects"

  return "state-editor"
}
