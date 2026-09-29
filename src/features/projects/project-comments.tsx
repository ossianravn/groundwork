import { useState, type FormEvent } from "react"
import { Button } from "@/kit/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/kit/ui/card"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/kit/ui/field"
import { MemberAvatar } from "@/kit/member-avatar"
import { formatDate, type Member, type ProjectComment } from "@/demo/model"
import { commentParts } from "@/demo/project-comments"
import { MentionTextarea } from "./mention-textarea"

// A project's discussion (TABL-13), oldest first so it reads as a thread.
// Mentions are highlighted; a mention of the current user by a teammate
// also appears in the inbox.
export function ProjectComments({
  comments,
  people,
  members,
  onPost,
}: {
  /** This project's comments, oldest first. */
  comments: ProjectComment[]
  people: Member[]
  /** Who can be mentioned: active workspace members. */
  members: Member[]
  /** Returns false when the comment was empty. */
  onPost: (text: string) => boolean
}) {
  const [draft, setDraft] = useState("")
  const [error, setError] = useState("")
  const [announcement, setAnnouncement] = useState("")

  function post(event?: FormEvent) {
    event?.preventDefault()

    if (!onPost(draft)) {
      setError("Write a comment first.")
      document.getElementById("comment-draft")?.focus()

      return
    }

    setDraft("")
    setError("")
    setAnnouncement("Comment posted.")
  }

  return (
    <Card className="project-comments">
      <CardHeader className="project-comments-heading">
        <CardTitle>
          <h2>Comments</h2>
        </CardTitle>
        <p className="project-tasks-count">{comments.length}</p>
      </CardHeader>
      <CardContent className="project-comments-content">
        {comments.length > 0 ? (
          <ol className="comment-list">
            {comments.map((comment) => {
              const author = people.find(
                (person) => person.id === comment.authorId,
              )

              return (
                <li key={comment.id} id={`comment-${comment.id}`}>
                  {author && <MemberAvatar member={author} size="sm" />}
                  <p className="comment-meta">
                    <strong>{author?.name ?? "Former member"}</strong>
                    <time dateTime={comment.date}>
                      {formatDate(comment.date, { year: "numeric" })}
                    </time>
                  </p>
                  <p className="comment-body">
                    {commentParts(comment.body, people).map((part, index) =>
                      part.kind === "mention" ? (
                        <span key={index} className="comment-mention">
                          {part.text}
                        </span>
                      ) : (
                        part.text
                      ),
                    )}
                  </p>
                </li>
              )
            })}
          </ol>
        ) : (
          <p className="text-muted-foreground">No comments yet.</p>
        )}
        <form className="comment-form" onSubmit={post} noValidate>
          <Field data-invalid={!!error}>
            <FieldLabel htmlFor="comment-draft">Add a comment</FieldLabel>
            <MentionTextarea
              id="comment-draft"
              value={draft}
              onValueChange={(value) => {
                setDraft(value)

                if (error && value.trim()) setError("")
              }}
              members={members}
              onSubmit={() => post()}
              rows={3}
              aria-invalid={!!error}
              aria-describedby={
                error ? "comment-hint comment-error" : "comment-hint"
              }
            />
            <FieldDescription id="comment-hint">
              Type @ to mention a teammate. Ctrl or ⌘ + Enter posts.
            </FieldDescription>
            {error && <FieldError id="comment-error">{error}</FieldError>}
          </Field>
          <Button type="submit" className="comment-submit">
            Comment
          </Button>
        </form>
        <p role="status" className="sr-only">
          {announcement}
        </p>
      </CardContent>
    </Card>
  )
}
