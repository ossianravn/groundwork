import fixtures from "./data/integrations.json"
import scenarios from "./data/scenarios.json"

export type ApiKey = (typeof fixtures.keys)[number]

export type Webhook = (typeof fixtures.webhooks)[number]

export type Delivery = (typeof fixtures.deliveries)[number]

export type WebhookValues = Omit<Webhook, "id">

export const webhookEvents = [
  "project.created",
  "project.updated",
  "project.completed",
] as const

export const keyAccess = ["Read projects", "Read and write projects"]

export function createDemoKey(name: string, access: string, id: string) {
  const secret = `tandem_demo_not_a_real_key_${id}`

  return {
    secret,
    record: {
      id,
      name: name.trim(),
      access,
      suffix: `demo_${id.slice(-4)}`,
      created: new Date().toISOString().slice(0, 10),
      lastUsed: "",
      revoked: false,
    },
  }
}

export function webhookErrors(values: WebhookValues) {
  let url = ""

  try {
    const parsed = new URL(values.url)

    if (!["http:", "https:"].includes(parsed.protocol))
      url = "Enter an HTTP or HTTPS endpoint."
  } catch {
    url = "Enter a complete endpoint URL."
  }

  return {
    name: values.name.trim() ? "" : "Enter a name.",
    url,
    events: values.events.length ? "" : "Choose at least one event.",
  }
}

export function demoDelivery(webhook: Webhook, failed: boolean): Delivery {
  return {
    id: crypto.randomUUID(),
    webhookId: webhook.id,
    event: webhook.events[0],
    url: webhook.url,
    date: new Date().toISOString(),
    status: failed ? scenarios["webhook-failure"].status : 200,
    response: failed
      ? scenarios["webhook-failure"].response
      : '{"received":true}',
  }
}
