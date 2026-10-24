import { useState, type ReactNode } from "react"
import { Eye, Pencil } from "lucide-react"
import { MessageResponse } from "@/kit/ai/message-response"
import { Button } from "@/kit/ui/button"
import { Textarea } from "@/kit/ui/textarea"
import { plainText } from "@/features/assistant/assistant-text"

/**
 * The status report waiting for approval: formatted as it will read, with
 * Edit to change its text, then Discard and Post report at the end of one
 * footer. Nothing is posted until the person posts it.
 */
export function AgentReportReview({
  report,
  discard,
  onPost,
}: {
  report: string
  /** The run's Discard action. */
  discard: ReactNode
  onPost: (text: string) => void
}) {
  const [draft, setDraft] = useState(report)
  const [editing, setEditing] = useState(false)

  return (
    <form
      className="agent-report"
      onSubmit={(event) => {
        event.preventDefault()
        onPost(plainText(draft))
      }}
    >
      <div className="agent-report-head">
        <span id="agent-report-label">Report</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-pressed={editing}
          onClick={() => setEditing(!editing)}
        >
          {editing ? (
            <Eye aria-hidden="true" data-icon="inline-start" />
          ) : (
            <Pencil aria-hidden="true" data-icon="inline-start" />
          )}
          {editing ? "Preview" : "Edit"}
        </Button>
      </div>
      {editing ? (
        <Textarea
          aria-labelledby="agent-report-label"
          aria-describedby="agent-report-hint"
          required
          rows={12}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
      ) : (
        <div className="agent-report-preview">
          <MessageResponse>{draft}</MessageResponse>
        </div>
      )}
      <p id="agent-report-hint" className="agent-report-hint">
        It's posted to Comments under your name.
      </p>
      <div className="agent-run-actions">
        {discard}
        <Button size="sm" type="submit" disabled={!draft.trim()}>
          Post report
        </Button>
      </div>
    </form>
  )
}
