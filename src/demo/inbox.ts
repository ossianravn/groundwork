import data from "./data/inbox.json"
import workspace from "./data/workspace.json"
import type { Member, Project } from "./model"
import { initialComments, mentionEntries } from "./project-comments"

export type InboxFilter = "all" | "unread"

export type InboxScenario = "normal" | "inbox-failure"

export interface InboxPost {
  id: string
  memberId: string
  body: string
  date: string
}

export interface InboxEntry {
  id: string
  projectId: string
  memberId: string
  title: string
  read: boolean
  posts: InboxPost[]
}

export interface MessageDraft {
  recipientId: string
  projectId: string
  subject: string
  body: string
}

export const emptyMessageDraft: MessageDraft = {
  recipientId: "",
  projectId: "",
  subject: "",
  body: "",
}

const messages: InboxEntry[] = data.map(
  ({ id, projectId, memberId, title, read, body, date }) => ({
    id,
    projectId,
    memberId,
    title,
    read,
    posts: [{ id, memberId, body: body.join("\n\n"), date }],
  }),
)

const mentions = mentionEntries(
  initialComments,
  workspace.members,
  workspace.currentUserId,
  workspace.referenceDate,
)

const latest = (entry: InboxEntry) => entry.posts[entry.posts.length - 1].date

export const initialInbox = [...messages, ...mentions].sort((a, b) =>
  latest(b).localeCompare(latest(a)),
)

export type InboxMessage = InboxEntry & {
  sender: Member | undefined
  project: Project | undefined
  preview: string
  date: string
  fromSelf: boolean
}

export function inboxMessages(
  entries: InboxEntry[],
  people: Member[],
  projects: Project[],
  currentUserId: string,
): InboxMessage[] {
  return entries.map((entry) => {
    const latest = entry.posts[entry.posts.length - 1]

    return {
      ...entry,
      sender: people.find((person) => person.id === entry.memberId),
      project: projects.find((project) => project.id === entry.projectId),
      preview: latest.body.replace(/\s+/g, " "),
      date: latest.date,
      fromSelf: latest.memberId === currentUserId,
    }
  })
}

export interface InboxState {
  entries: InboxEntry[]
  compose: MessageDraft
  composeOpen: boolean
  replies: Record<string, string>
  sendError: string
  createdId: string | null
  failedOnce: boolean
  failure: { ids: string[]; read: boolean } | null
}

export function inboxState(entries = initialInbox): InboxState {
  return {
    entries,
    compose: emptyMessageDraft,
    composeOpen: false,
    replies: {},
    sendError: "",
    createdId: null,
    failedOnce: false,
    failure: null,
  }
}

interface SendContext {
  id: string
  authorId: string
  date: string
  memberIds: string[]
  projectIds: string[]
}

function messageDraftError(draft: MessageDraft, context: SendContext) {
  if (
    !context.memberIds.includes(draft.recipientId) ||
    draft.recipientId === context.authorId
  )
    return "Choose a current workspace member."

  if (draft.projectId && !context.projectIds.includes(draft.projectId))
    return "Choose an available project or remove the project."

  if (!draft.subject.trim()) return "Add a subject."

  if (!draft.body.trim()) return "Write a message."

  return ""
}

export type InboxAction =
  | { type: "compose-open"; open: boolean }
  | { type: "compose"; patch: Partial<MessageDraft> }
  | { type: "discard-compose" }
  | { type: "reply-draft"; id: string; body: string }
  | { type: "send-new"; context: SendContext }
  | { type: "send-reply"; threadId: string; context: SendContext }
  | { type: "created" }
  | { type: "clear-send-error" }
  | { type: "read"; ids: string[]; read: boolean; scenario: InboxScenario }
  | { type: "clear-failure" }
  | { type: "reset" | "clear" }

export function inboxReducer(
  state: InboxState,
  action: InboxAction,
): InboxState {
  switch (action.type) {
    case "compose-open":
      return { ...state, composeOpen: action.open, sendError: "" }
    case "compose":
      return {
        ...state,
        compose: { ...state.compose, ...action.patch },
        sendError: "",
      }
    case "discard-compose":
      return {
        ...state,
        compose: emptyMessageDraft,
        composeOpen: false,
        sendError: "",
      }
    case "reply-draft":
      return {
        ...state,
        replies: { ...state.replies, [action.id]: action.body },
        sendError: "",
      }
    case "created":
      return { ...state, createdId: null }
    case "clear-send-error":
      return { ...state, sendError: "" }
    case "clear-failure":
      return { ...state, failure: null }
    case "reset":
      return inboxState()
    case "clear":
      return inboxState([])
    case "read": {
      if (action.scenario === "inbox-failure" && !state.failedOnce)
        return {
          ...state,
          failedOnce: true,
          failure: { ids: action.ids, read: action.read },
        }

      return {
        ...state,
        failure: null,
        entries: state.entries.map((entry) =>
          action.ids.includes(entry.id)
            ? { ...entry, read: action.read }
            : entry,
        ),
      }
    }

    case "send-new": {
      const { context } = action
      const draft = state.compose

      const error = messageDraftError(draft, context)

      if (error) return { ...state, sendError: error }

      const entry: InboxEntry = {
        id: context.id,
        projectId: draft.projectId,
        memberId: draft.recipientId,
        title: draft.subject.trim(),
        read: true,
        posts: [
          {
            id: context.id,
            memberId: context.authorId,
            body: draft.body.trim(),
            date: context.date,
          },
        ],
      }

      return {
        ...state,
        entries: [entry, ...state.entries],
        compose: emptyMessageDraft,
        composeOpen: false,
        sendError: "",
        createdId: entry.id,
      }
    }

    case "send-reply": {
      const entry = state.entries.find((item) => item.id === action.threadId)
      const body = state.replies[action.threadId]?.trim()

      if (!entry)
        return {
          ...state,
          sendError: "This conversation is no longer available.",
        }

      if (!action.context.memberIds.includes(entry.memberId))
        return {
          ...state,
          sendError: "This member is no longer in the workspace.",
        }

      if (!body) return { ...state, sendError: "Write a reply." }

      const post = {
        id: action.context.id,
        memberId: action.context.authorId,
        body,
        date: action.context.date,
      }

      return {
        ...state,
        sendError: "",
        replies: { ...state.replies, [entry.id]: "" },
        entries: [
          { ...entry, read: true, posts: [...entry.posts, post] },
          ...state.entries.filter((item) => item.id !== entry.id),
        ],
      }
    }
  }
}
