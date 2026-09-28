import { describe, expect, it } from "vitest"
import { consumeProviderAttempt, type ProviderAttempt } from "./provider-access"

const attempt: ProviderAttempt = {
  token: "current",
  provider: "google",
  intent: "sign-up",
  returnTo: "/app/demo/projects?view=board",
  selection: { plan: "business", billing: "annual" },
  profile: { name: "Alex Morgan", email: "alex@example.com" },
  outcome: "success",
}

describe("local provider handoff", () => {
  it("ignores a replaced token and consumes the current request once with its captured context", () => {
    expect(consumeProviderAttempt(attempt, "previous")).toEqual({
      next: attempt,
      result: null,
    })
    const consumed = consumeProviderAttempt(attempt, "current")
    expect(consumed.result).toEqual(attempt)
    expect(consumeProviderAttempt(consumed.next, "current").result).toBeNull()
  })

  it("consumes an unavailable attempt without losing the context needed to retry or change methods", () => {
    const unavailable: ProviderAttempt = { ...attempt, outcome: "unavailable" }
    expect(consumeProviderAttempt(unavailable, "current")).toEqual({
      next: null,
      result: unavailable,
    })
  })
})
