import { useRef } from "react"
import { Check, Copy, Download, Send } from "lucide-react"
import { useCopy } from "@/kit/lib/use-copy"
import { downloadMarkdown } from "./download-markdown"
import { Button } from "@/kit/ui/button"
import {
  Artifact,
  ArtifactActions,
  ArtifactContent,
  ArtifactFooter,
  ArtifactHeader,
} from "@/kit/ai/artifact"
import { MessageAction } from "@/kit/ai/message-actions"
import { MessageResponse } from "@/kit/ai/message-response"
import { useResponseLink } from "@/kit/ai/response-link"
import type { AssistantMessage } from "@/demo/assistant/assistant-types"

type ArtifactPart = Extract<
  AssistantMessage["parts"][number],
  { type: "data-artifact" }
>

/**
 * A drafted status update. Copy and Download keep it as markdown; Post adds
 * it to the project as a comment, once, and says where it went.
 */
export function AssistantArtifact({
  part,
  working,
  posted,
  onPost,
}: {
  part: ArtifactPart
  /** The reply is still streaming. */
  working: boolean
  posted: boolean
  onPost: (artifactId: string, projectId: string, markdown: string) => void
}) {
  const { title, projectId, projectName, url, content, complete } = part.data
  const ready = complete || !working
  const { state, copy } = useCopy()
  const renderLink = useResponseLink()
  const footer = useRef<HTMLElement>(null)
  const id = part.id ?? projectId

  return (
    <Artifact aria-label={title}>
      <ArtifactHeader
        title={title}
        description={posted ? `Posted to ${projectName}` : "Draft"}
        streaming={!ready}
      >
        {ready && (
          <ArtifactActions>
            <MessageAction
              label={state === "copied" ? "Copied" : "Copy markdown"}
              onClick={() => void copy(content)}
            >
              {state === "copied" ? (
                <Check aria-hidden="true" />
              ) : (
                <Copy aria-hidden="true" />
              )}
            </MessageAction>
            <MessageAction
              label="Download as markdown"
              onClick={() =>
                downloadMarkdown(`status-update-${projectId}.md`, content)
              }
            >
              <Download aria-hidden="true" />
            </MessageAction>
            {!posted && (
              <Button
                variant="outline"
                size="sm"
                className="ms-1"
                onClick={() => {
                  onPost(id, projectId, content)
                  // The button goes; its outcome, with a link, takes focus.
                  requestAnimationFrame(() =>
                    footer.current?.querySelector<HTMLElement>("a")?.focus(),
                  )
                }}
              >
                <Send data-icon="inline-start" aria-hidden="true" />
                Post to project
              </Button>
            )}
          </ArtifactActions>
        )}
      </ArtifactHeader>
      <ArtifactContent aria-label={`${title}, content`}>
        <MessageResponse streaming={!ready}>{content}</MessageResponse>
      </ArtifactContent>
      {posted && (
        <ArtifactFooter ref={footer}>
          <Check className="size-3.5" aria-hidden="true" />
          <span role="status">Posted to {projectName} as a comment.</span>
          {renderLink({
            href: url,
            className: "font-medium text-brand hover:underline",
            children: `Open ${projectName}`,
          })}
        </ArtifactFooter>
      )}
      <span className="sr-only" role="status">
        {state === "copied" ? "Update copied" : ""}
      </span>
    </Artifact>
  )
}
