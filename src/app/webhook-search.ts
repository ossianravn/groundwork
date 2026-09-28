interface WebhookSearch {
  scenario: "normal" | "webhook-failure"
}

export const defaultWebhookSearch: WebhookSearch = { scenario: "normal" }

export function parseWebhookSearch(search: {
  scenario?: unknown
}): WebhookSearch {
  return {
    scenario:
      search.scenario === "webhook-failure" ? "webhook-failure" : "normal",
  }
}
