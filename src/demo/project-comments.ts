import commentData from "./data/comments.json"
import type { InboxEntry } from "./inbox"
import type { Activity, Member, ProjectComment } from "./model"
import { dateOffset } from "./report-period"

export const initialComments: ProjectComment[] = commentData

const token = /@\{([\w-]+)\}/gu

/** Member ids mentioned in a stored comment body. */
export function mentionedIds(body: string) {
  return [...new Set([...body.matchAll(token)].map((match) => match[1]))]
}

/** Text and mention parts for rendering a stored body. */
export function commentParts(body: string, people: Member[]) {
  return body.split(/(@\{[\w-]+\})/u).flatMap((part) => {
    const id = /^@\{([\w-]+)\}$/u.exec(part)?.[1]

    if (!id) return part ? [{ kind: "text" as const, text: part }] : []

    const person = people.find((item) => item.id === id)

    return [
      person
        ? { kind: "mention" as const, text: `@${person.name}`, id }
        : { kind: "text" as const, text: "@someone" },
    ]
  })
}

/** Plain text with names, e.g. for an inbox preview. */
export function commentText(body: string, people: Member[]) {
  return commentParts(body, people)
    .map((part) => part.text)
    .join("")
}

/**
 * The composer shows "@Leo Chen"; stored bodies use @{leo}. Longer names are
 * replaced first so one name cannot swallow another that starts the same way.
 */
export function storedCommentBody(text: string, members: Member[]) {
  return [...members]
    .sort((a, b) => b.name.length - a.name.length)
    .reduce(
      (body, member) => body.split(`@${member.name}`).join(`@{${member.id}}`),
      text.trim(),
    )
}

/**
 * Teammates' comments that mention the current user become inbox entries,
 * so the comments stay the single source. Older than a day reads as read.
 */
export function mentionEntries(
  comments: ProjectComment[],
  people: Member[],
  currentUserId: string,
  referenceDate: string,
): InboxEntry[] {
  return comments.flatMap((comment) =>
    comment.authorId !== currentUserId &&
    mentionedIds(comment.body).includes(currentUserId)
      ? [
          {
            id: `mention-${comment.id}`,
            projectId: comment.projectId,
            memberId: comment.authorId,
            title: "Mentioned you in a comment",
            read: comment.date < dateOffset(referenceDate, -1),
            posts: [
              {
                id: `mention-${comment.id}`,
                memberId: comment.authorId,
                body: commentText(comment.body, people),
                date: comment.date,
              },
            ],
          },
        ]
      : [],
  )
}

export interface CommentRecords {
  comments: ProjectComment[]
  activity: Activity[]
}

/** Posting records the comment and a "commented on" event together. */
export function addComment(
  records: CommentRecords,
  comment: ProjectComment,
  eventId: string,
): CommentRecords {
  return {
    comments: [...records.comments, comment],
    activity: [
      ...records.activity,
      {
        id: eventId,
        projectId: comment.projectId,
        memberId: comment.authorId,
        date: comment.date,
        action: "commented on",
        tasksCompleted: 0,
        kind: "comment",
      },
    ],
  }
}
