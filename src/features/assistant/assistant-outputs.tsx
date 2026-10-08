import {
  Check,
  Copy,
  Download,
  FileText,
  ListChecks,
  PanelsTopLeft,
  type LucideIcon,
} from "lucide-react"
import { Fragment } from "react"
import { Badge } from "@/kit/ui/badge"
import { Button } from "@/kit/ui/button"
import { useCopy } from "@/kit/lib/use-copy"
import type { RenderResponseLink } from "@/kit/ai/response-link"
import { downloadMarkdown } from "./download-markdown"
import type { WorkOutput, WorkSource } from "./inspector-outputs"

const stateLabels = {
  writing: "Writing…",
  draft: "Draft",
  posted: "Posted",
  waiting: "Waiting for approval",
  added: "Added",
  applied: "Applied",
  declined: "Declined",
} satisfies Record<NonNullable<WorkOutput["state"]>, string>

const icons = {
  answer: PanelsTopLeft,
  draft: FileText,
  tasks: ListChecks,
} satisfies Record<WorkOutput["kind"], LucideIcon>

function OutputRow({
  output,
  renderLink,
  onShow,
}: {
  output: WorkOutput
  renderLink: RenderResponseLink
  onShow: (messageId: string) => void
}) {
  const { state, copy } = useCopy()
  const Icon = icons[output.kind]
  const { markdown } = output

  return (
    <li className="assistant-output" data-state={output.state}>
      <Icon className="assistant-output-icon" aria-hidden="true" />
      <div className="assistant-output-body">
        <p className="assistant-output-title">
          {output.title}
          {output.state && (
            <Badge variant="secondary">{stateLabels[output.state]}</Badge>
          )}
        </p>
        {output.detail && (
          <p className="assistant-output-detail">{output.detail}</p>
        )}
        <div className="assistant-output-actions">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onShow(output.messageId)}
          >
            Show in conversation
          </Button>
          {output.links?.map((link) => (
            <Fragment key={link.url}>
              {renderLink({
                href: link.url,
                className: "assistant-output-link",
                children: link.label,
              })}
            </Fragment>
          ))}
          {markdown && output.state !== "writing" && (
            <>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={
                  state === "copied"
                    ? "Copied"
                    : state === "failed"
                      ? "Copying isn't available here"
                      : "Copy as markdown"
                }
                onClick={() => void copy(markdown, null)}
              >
                {state === "copied" ? (
                  <Check aria-hidden="true" />
                ) : (
                  <Copy aria-hidden="true" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Download as markdown"
                onClick={() => downloadMarkdown(`${output.id}.md`, markdown)}
              >
                <Download aria-hidden="true" />
              </Button>
            </>
          )}
        </div>
      </div>
    </li>
  )
}

/** Answers, drafts and changes the conversation produced, newest first. */
export function AssistantOutputs({
  outputs,
  renderLink,
  onShow,
}: {
  outputs: WorkOutput[]
  renderLink: RenderResponseLink
  onShow: (messageId: string) => void
}) {
  if (!outputs.length)
    return (
      <p className="assistant-inspector-empty">
        Answers, drafts and changes the assistant makes appear here.
      </p>
    )

  return (
    <ul className="assistant-outputs">
      {outputs.map((output) => (
        <OutputRow
          key={output.id}
          output={output}
          renderLink={renderLink}
          onShow={onShow}
        />
      ))}
    </ul>
  )
}

/** The pages the replies drew on, once each. */
export function AssistantSources({
  sources,
  renderLink,
}: {
  sources: WorkSource[]
  renderLink: RenderResponseLink
}) {
  if (!sources.length)
    return (
      <p className="assistant-inspector-empty">
        Projects and guides the replies cite appear here.
      </p>
    )

  return (
    <ul className="assistant-sources-list">
      {sources.map((source) => (
        <li key={source.url}>
          {renderLink({ href: source.url, children: source.title })}
          {source.description && <p>{source.description}</p>}
          {source.count > 1 && (
            <p className="assistant-source-count">
              Cited in {source.count} replies
            </p>
          )}
        </li>
      ))}
    </ul>
  )
}
