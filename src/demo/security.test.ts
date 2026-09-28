import { describe, expect, it } from "vitest"
import { beginSignIn, initialSecurity, verifySignIn } from "./security"

const at = "2026-09-27T10:00:00Z"

const enabled = {
  ...initialSecurity(),
  enabled: true,
  recoveryCodes: ["ABCD-1234", "EFGH-5678"],
}

describe("demo MFA handoff", () => {
  it("only verifies the active attempt, once, preserving its destination", () => {
    expect(
      beginSignIn(initialSecurity(), "/first", "first").challenge,
    ).toBeNull()
    const original = beginSignIn(enabled, "/first", "first")

    const latest = beginSignIn(
      original,
      "/app/demo/projects?view=board",
      "latest",
    )

    expect(
      verifySignIn(latest, "first", "123456", "authenticator", at).destination,
    ).toBeNull()
    expect(
      verifySignIn(latest, "latest", "111111", "authenticator", at).state,
    ).toBe(latest)
    const result = verifySignIn(latest, "latest", "123456", "authenticator", at)
    expect(result.destination).toBe("/app/demo/projects?view=board")
    expect(result.state.challenge).toBeNull()
    expect(result.state.recoveryCodes).toEqual(enabled.recoveryCodes)
    expect(
      verifySignIn(result.state, "latest", "123456", "authenticator", at)
        .destination,
    ).toBeNull()
  })

  it("consumes only the recovery code used and rejects its reuse on another attempt", () => {
    const first = beginSignIn(enabled, "/first", "first")
    expect(
      verifySignIn(first, "first", "unavailable", "recovery", at).state,
    ).toBe(first)
    const used = verifySignIn(first, "first", " abcd-1234 ", "recovery", at)
    expect(used.destination).toBe("/first")
    expect(used.state.recoveryCodes).toEqual(["EFGH-5678"])
    expect(used.state.events[0].label).toBe("Signed in with a recovery code")
    const next = beginSignIn(used.state, "/next", "next")
    expect(
      verifySignIn(next, "next", "ABCD-1234", "recovery", at).destination,
    ).toBeNull()
    expect(
      verifySignIn(next, "next", "EFGH-5678", "recovery", at).destination,
    ).toBe("/next")
  })
})
