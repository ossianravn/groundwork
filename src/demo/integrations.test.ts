import { describe, expect, it } from "vitest"
import { createDemoKey, webhookErrors, demoDelivery } from "./integrations"

describe("local integration contracts", () => {
  it("returns a clearly dummy secret separately from retained key metadata", () => {
    const { record, secret } = createDemoKey(
      " Reporting ",
      "Read projects",
      "sample-1234",
    )

    expect(secret).toBe("tandem_demo_not_a_real_key_sample-1234")
    expect(record.name).toBe("Reporting")
    expect(record.suffix).toBe("demo_1234")
    expect(JSON.stringify(record)).not.toContain(secret)
  })

  it("rejects incomplete endpoint configuration and snapshots each simulated attempt", () => {
    expect(
      webhookErrors({ name: " ", url: "file:///tmp/test", events: [] }),
    ).toEqual({
      name: "Enter a name.",
      url: "Enter an HTTP or HTTPS endpoint.",
      events: "Choose at least one event.",
    })

    const webhook = {
      id: "test",
      name: "Reporting",
      url: "https://example.com/hook",
      events: ["project.completed"],
    }

    expect(webhookErrors(webhook)).toEqual({ name: "", url: "", events: "" })
    const failed = demoDelivery(webhook, true)

    const retry = demoDelivery(
      { ...webhook, url: "https://example.com/new" },
      false,
    )

    expect(failed.status).toBe(500)
    expect(failed.url).toBe(webhook.url)
    expect(retry.status).toBe(200)
    expect(retry.url).toBe("https://example.com/new")
    expect(retry.event).toBe("project.completed")
  })
})
