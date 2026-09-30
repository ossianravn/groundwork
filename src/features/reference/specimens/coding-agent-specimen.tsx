import { useState, type ReactNode } from "react"
import { GitBranch, Play, SkipForward } from "lucide-react"
import { Button } from "@/kit/ui/button"
import { CodeBlock } from "@/kit/ui/code-block"
import { FileTree } from "@/kit/ui/file-tree"
import {
  Conversation,
  ConversationItem,
  ConversationStatus,
} from "@/kit/ai/conversation"
import { agentSession, agentTree, languageOf } from "@/demo/coding-agent"
import { AgentStepView } from "./coding-agent-steps"
import { useReplay } from "./use-replay"

const { steps, files, changed, repository, branch } = agentSession

const editStep = steps.findIndex((step) => step.kind === "edit")

// AI-24 specimen: a recorded coding-agent session. The transcript shows the
// agent's reasoning, tool calls and their rich results; the side panel shows
// the repository, marking files once the agent has edited them.
export function CodingAgentSpecimen({ note }: { note: ReactNode }) {
  const { playing, progress, replay, showAll } = useReplay(steps)
  const [selected, setSelected] = useState(changed[0] ?? "")
  const edit = progress(editStep)
  const edited = edit.visible && !edit.running
  const file = files.find((candidate) => candidate.path === selected)
  const code = (edited ? file?.after : undefined) ?? file?.before ?? ""

  return (
    <div className="specimen-page">
      <div className="specimen-note">{note}</div>
      <main id="main-content" tabIndex={-1} className="agent-specimen">
        <header className="agent-specimen-header">
          <div>
            <h1>Fix the due-date label</h1>
            <p>
              <GitBranch aria-hidden="true" />
              {repository} · {branch}
            </p>
          </div>
          <Button variant="outline" onClick={playing ? showAll : replay}>
            {playing ? (
              <SkipForward aria-hidden="true" />
            ) : (
              <Play aria-hidden="true" />
            )}
            {playing ? "Show all" : "Replay"}
          </Button>
        </header>
        <Conversation className="agent-specimen-transcript" label="Session">
          {steps.map((step, index) => {
            const state = progress(index)

            return (
              state.visible && (
                <ConversationItem key={index} scrollAnchor={index === 0}>
                  <AgentStepView
                    step={step}
                    running={state.running}
                    lines={state.lines}
                  />
                </ConversationItem>
              )
            )
          })}
        </Conversation>
        <ConversationStatus>
          {playing ? "Replaying the session" : "Session complete"}
        </ConversationStatus>
        <aside className="agent-specimen-files" aria-label="Repository">
          <h2>Files</h2>
          <FileTree
            nodes={agentTree(edited ? changed : [])}
            label={`${repository} files`}
            selected={selected}
            onSelect={setSelected}
            defaultExpanded={["src", "src/lib"]}
          />
          <CodeBlock
            code={code}
            filename={selected}
            language={languageOf(selected)}
            lineNumbers
          />
        </aside>
      </main>
    </div>
  )
}
