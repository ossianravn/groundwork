import { parseSignUpSearch } from "./access-search"
import type { ProviderIntent } from "@/demo/provider-access"

export function parseProviderSearch(
  search: Parameters<typeof parseSignUpSearch>[0] & {
    intent?: unknown
    scenario?: unknown
  },
) {
  const intent: ProviderIntent =
    search.intent === "sign-up" ? "sign-up" : "sign-in"

  return {
    ...parseSignUpSearch(search),
    intent,
    scenario:
      search.scenario === "provider-unavailable"
        ? "provider-unavailable"
        : "normal",
  }
}
