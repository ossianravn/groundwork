import { describe, expect, it } from "vitest"
import { prepareSetupInvitations, type InvitationDraft } from "./onboarding"

describe("onboarding invitations", () => {
  it("prepares one normalized batch, preserving row identities and roles and ignoring unused rows", () => {
    const rows: InvitationDraft[] = [
      { id: "first", email: " Robin@Example.com ", role: "admin" },
      { id: "empty", email: " ", role: "member" },
      { id: "second", email: "sam@example.com", role: "viewer" },
    ]

    expect(prepareSetupInvitations(rows, "alex@example.com")).toEqual({
      ok: true,
      invitations: [
        { id: "first", email: "robin@example.com", role: "admin" },
        { id: "second", email: "sam@example.com", role: "viewer" },
      ],
    })
    expect(rows[0].email).toBe(" Robin@Example.com ")
  })

  it("returns only row errors when an invite repeats the account or another invite, so nothing partially commits", () => {
    const result = prepareSetupInvitations(
      [
        { id: "first", email: "sam@example.com", role: "member" },
        { id: "duplicate", email: " SAM@example.com ", role: "viewer" },
        { id: "self", email: "alex@example.com", role: "admin" },
      ],
      "Alex@example.com",
    )

    expect(result).toEqual({
      ok: false,
      errors: {
        duplicate: "An invitation is already pending for this email.",
        self: "This person is already a workspace member.",
      },
    })
  })
})
