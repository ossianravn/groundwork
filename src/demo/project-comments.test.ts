import { expect, it } from "vitest"
import {
  addComment,
  commentText,
  initialComments,
  mentionEntries,
  storedCommentBody,
} from "./project-comments"

const people = [
  { id: "ava", name: "Ava Morgan", initials: "AM" },
  { id: "al", name: "Ava", initials: "A" },
  { id: "leo", name: "Leo Chen", initials: "LC" },
]

it("stores typed mentions as member tokens without one name swallowing another", () => {
  const body = storedCommentBody(
    "  @Ava Morgan and @Ava, see @Leo Chen's note  ",
    people,
  )

  expect(body).toBe("@{ava} and @{al}, see @{leo}'s note")
  expect(commentText(body, people)).toBe(
    "@Ava Morgan and @Ava, see @Leo Chen's note",
  )
  expect(commentText("Hi @{gone}", people)).toBe("Hi @someone")
  expect(storedCommentBody("   ", people)).toBe("")
})

it("turns teammates' mentions of the current user into inbox entries", () => {
  const entries = mentionEntries(initialComments, people, "ava", "2026-09-24")

  expect(
    entries.map((entry) => [entry.id, entry.memberId, entry.read]),
  ).toEqual([
    ["mention-c-brand-1", "leo", true],
    ["mention-c-brand-3", "mia", false],
    ["mention-c-mobile-1", "leo", false],
  ])
  expect(entries[0].posts[0].body).toContain("@Ava Morgan should")
})

it("records a posted comment with its activity event", () => {
  const comment = {
    id: "c1",
    projectId: "brand",
    authorId: "ava",
    date: "2026-09-24",
    body: "Hello @{leo}",
  }

  expect(addComment({ comments: [], activity: [] }, comment, "e1")).toEqual({
    comments: [comment],
    activity: [
      {
        id: "e1",
        projectId: "brand",
        memberId: "ava",
        date: "2026-09-24",
        action: "commented on",
        tasksCompleted: 0,
        kind: "comment",
      },
    ],
  })
})
