import { useState } from "react"
import fixtures from "./data/integrations.json"
import { createDemoKey, demoDelivery, type WebhookValues } from "./integrations"

// The usage and delivery histories are read-only samples, outside state.
const initial = {
  keys: fixtures.keys,
  webhooks: fixtures.webhooks,
  deliveries: fixtures.deliveries,
}

export function useIntegrations() {
  const [state, setState] = useState(initial)

  return {
    ...state,
    createKey(name: string, access: string) {
      const result = createDemoKey(name, access, crypto.randomUUID())
      setState((current) => ({
        ...current,
        keys: [...current.keys, result.record],
      }))

      return result.secret
    },
    revokeKey(id: string) {
      setState((current) => ({
        ...current,
        keys: current.keys.map((key) =>
          key.id === id ? { ...key, revoked: true } : key,
        ),
      }))
    },
    saveWebhook(id: string | null, values: WebhookValues) {
      const record = {
        ...values,
        name: values.name.trim(),
        url: values.url.trim(),
        id: id ?? crypto.randomUUID(),
      }

      setState((current) => ({
        ...current,
        webhooks: id
          ? current.webhooks.map((hook) => (hook.id === id ? record : hook))
          : [...current.webhooks, record],
      }))
    },
    testWebhook(id: string, failed: boolean) {
      setState((current) => {
        const webhook = current.webhooks.find((item) => item.id === id)

        if (!webhook) return current

        return {
          ...current,
          deliveries: [demoDelivery(webhook, failed), ...current.deliveries],
        }
      })
    },
    reset: () => setState(initial),
    clear: () => setState({ keys: [], webhooks: [], deliveries: [] }),
  }
}
