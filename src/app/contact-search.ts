import type { ContactScenario } from "@/demo/use-contact"

interface ContactSearchInput {
  scenario?: unknown
}

interface ContactSearch {
  scenario: ContactScenario
}

export function parseContactSearch({
  scenario,
}: ContactSearchInput): ContactSearch {
  return { scenario: scenario === "contact-failure" ? scenario : "normal" }
}
