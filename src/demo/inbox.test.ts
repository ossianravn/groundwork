import { expect, it } from "vitest"
import {
  emptyMessageDraft,
  inboxMessages,
  inboxReducer,
  inboxState,
} from "./inbox"

const context = {
  id: "sent-message",
  authorId: "ava",
  date: "2026-09-27T12:00:00Z",
  memberIds: ["ava", "mia", "leo", "noah"],
  projectIds: ["mobile"],
}

const draft = {
  recipientId: "mia",
  projectId: "",
  subject: "  Review tomorrow  ",
  body: "  Can we review this together?  ",
}

it("starts a conversation atomically without adding an unread notification for its author", () => {
  const state = inboxReducer(inboxState(), { type: "compose", patch: draft })
  const sent = inboxReducer(state, { type: "send-new", context })
  const conversation = sent.entries[0]

  expect(conversation).toMatchObject({
    id: context.id,
    memberId: "mia",
    projectId: "",
    title: "Review tomorrow",
    read: true,
    posts: [{ memberId: "ava", body: "Can we review this together?" }],
  })
  expect(sent.entries.filter((entry) => !entry.read)).toHaveLength(
    inboxState().entries.filter((entry) => !entry.read).length,
  )
  expect(sent.compose).toEqual(emptyMessageDraft)
  expect(sent.composeOpen).toBe(false)
  expect(sent.createdId).toBe(context.id)
  expect(inboxMessages(sent.entries, [], [], "ava")[0]).toMatchObject({
    fromSelf: true,
    preview: "Can we review this together?",
  })
})

it("retains drafts on dismissal or an invalid send, but discards them explicitly and on reset", () => {
  let state = inboxReducer(inboxState(), { type: "compose", patch: draft })
  state = inboxReducer(state, { type: "compose-open", open: false })
  expect(state.compose).toEqual(draft)

  const rejected = inboxReducer(state, {
    type: "send-new",
    context: { ...context, memberIds: ["ava"] },
  })

  expect(rejected.compose).toEqual(draft)
  expect(rejected.entries).toBe(state.entries)
  expect(rejected.sendError).toBe("Choose a current workspace member.")
  expect(inboxReducer(rejected, { type: "discard-compose" }).compose).toEqual(
    emptyMessageDraft,
  )
  expect(inboxReducer(rejected, { type: "reset" })).toEqual(inboxState())
})

it("appends a reply, moves its conversation to the top and updates its preview and read state together", () => {
  const state = inboxState()
  const thread = state.entries[2]

  const draftState = inboxReducer(state, {
    type: "reply-draft",
    id: thread.id,
    body: "Thanks.\nReady to review.",
  })

  const sent = inboxReducer(draftState, {
    type: "send-reply",
    threadId: thread.id,
    context,
  })

  expect(sent.entries).toHaveLength(state.entries.length)
  expect(sent.entries[0].id).toBe(thread.id)
  expect(sent.entries[0].posts).toEqual([
    ...thread.posts,
    {
      id: context.id,
      memberId: "ava",
      date: context.date,
      body: "Thanks.\nReady to review.",
    },
  ])
  expect(sent.entries[0].read).toBe(true)
  expect(sent.replies[thread.id]).toBe("")
  expect(inboxMessages(sent.entries, [], [], "ava")[0].preview).toBe(
    "Thanks. Ready to review.",
  )
  expect(thread.posts).toHaveLength(1)
})

it("preserves read flags on a rejected update and applies retry without touching a reply draft", () => {
  const state = inboxReducer(inboxState(), {
    type: "reply-draft",
    id: "mobile-review",
    body: "Keep this draft",
  })

  const action = {
    type: "read" as const,
    ids: [state.entries[0].id],
    read: true,
    scenario: "inbox-failure" as const,
  }

  const rejected = inboxReducer(state, action)

  expect(rejected.entries).toBe(state.entries)
  expect(rejected.failure).toEqual({ ids: action.ids, read: true })
  const retried = inboxReducer(rejected, action)

  expect(retried.entries[0].read).toBe(true)
  expect(retried.failure).toBeNull()
  expect(retried.replies).toEqual(state.replies)
  expect(inboxReducer(retried, { type: "clear" }).replies).toEqual({})
})
