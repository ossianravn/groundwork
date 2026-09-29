import { textDocument } from "@/kit/rich-text/document"
import { describe, expect, it } from "vitest"
import {
  changeMember,
  initialMemberships,
  invitationError,
  type TeamRecords,
} from "./team"
import type { Project } from "./model"

const project: Project = {
  id: "website",
  name: "Website",
  code: "WE",
  color: "violet",
  description: textDocument(""),
  tags: [],
  links: [],
  ownerId: "leo",
  status: "in-progress",
  dueDate: "2026-10-08",
  tasks: 12,
  completedTasks: 4,
}

const records: TeamRecords = {
  memberships: initialMemberships,
  projects: [project],
  tasks: [],
}

describe("team changes", () => {
  it("keeps the sole owner until another member becomes an owner", () => {
    expect(
      changeMember(records, "ava", { kind: "role", role: "admin" }).result.ok,
    ).toBe(false)
    expect(
      changeMember(records, "ava", { kind: "remove", replacementId: "leo" })
        .result.ok,
    ).toBe(false)

    const promoted = changeMember(records, "leo", {
      kind: "role",
      role: "owner",
    })

    expect(
      changeMember(promoted.records, "ava", { kind: "role", role: "admin" })
        .result.ok,
    ).toBe(true)
  })

  it("requires an active replacement and reassigns all owned projects with membership removal", () => {
    const rejected = changeMember(records, "leo", {
      kind: "remove",
      replacementId: "leo",
    })

    expect(rejected.result.ok).toBe(false)
    expect(rejected.records).toBe(records)

    const removed = changeMember(records, "leo", {
      kind: "remove",
      replacementId: "mia",
    })

    expect(removed.result.ok).toBe(true)
    expect(removed.records.projects).toEqual([{ ...project, ownerId: "mia" }])
    expect(
      removed.records.memberships.find((item) => item.memberId === "leo")
        ?.active,
    ).toBe(false)
    expect(
      changeMember(removed.records, "mia", {
        kind: "remove",
        replacementId: "leo",
      }).result.ok,
    ).toBe(false)
  })

  it("rejects duplicate member and pending-invitation emails regardless of casing or surrounding spaces", () => {
    expect(
      invitationError(" AVA@example.com ", initialMemberships, []),
    ).toContain("already a workspace member")
    expect(
      invitationError(" Robin@example.com ", initialMemberships, [
        { id: "pending", email: "robin@example.com", role: "member" },
      ]),
    ).toContain("already pending")
    expect(
      invitationError("new@example.com", initialMemberships, []),
    ).toBeNull()
  })
})
