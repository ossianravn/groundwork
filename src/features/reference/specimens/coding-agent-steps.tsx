import type { ReactNode } from "react"
import { Bubble, BubbleContent } from "@/kit/ui/bubble"
import { Message, MessageContent } from "@/kit/ui/message"
import { CodeBlock } from "@/kit/ui/code-block"
import { Commit } from "@/kit/ui/commit"
import { StackTrace } from "@/kit/ui/stack-trace"
import { Terminal } from "@/kit/ui/terminal"
import { TestResults } from "@/kit/ui/test-results"
import { MessageResponse } from "@/kit/ai/message-response"
import { Reasoning } from "@/kit/ai/reasoning"
import { Tool, ToolContent, ToolHeader, ToolOutput } from "@/kit/ai/tool"
import { languageOf, type AgentStep, type TestRun } from "@/demo/coding-agent"

function TestRunOutput({
  run,
  running,
  lines,
}: {
  run: TestRun
  running: boolean
  lines: number
}) {
  const failure = run.failure

  return (
    <>
      {!running && (
        <ToolOutput>
          <TestResults
            suites={run.suites}
            duration={run.duration}
            details={(_, test) =>
              failure?.test === test.name && (
                <StackTrace
                  name={failure.name}
                  message={failure.message}
                  frames={failure.frames}
                />
              )
            }
          />
        </ToolOutput>
      )}
      <Terminal
        title={`$ ${run.command}`}
        output={run.output.slice(0, lines).join("\n")}
        streaming={running}
      />
    </>
  )
}

function AgentTool({
  title,
  running,
  children,
}: {
  title: string
  running: boolean
  children: ReactNode
}) {
  return (
    <Tool defaultOpen>
      <ToolHeader
        title={title}
        state={running ? "input-available" : "output-available"}
      />
      {children && <ToolContent>{children}</ToolContent>}
    </Tool>
  )
}

/** One step of the session, as far as it has got. */
export function AgentStepView({
  step,
  running,
  lines,
}: {
  step: AgentStep
  running: boolean
  lines: number
}) {
  switch (step.kind) {
    case "prompt":
      return (
        <Message align="end">
          <MessageContent>
            <Bubble variant="secondary" align="end">
              <BubbleContent>
                <span className="sr-only">You: </span>
                {step.text}
              </BubbleContent>
            </Bubble>
          </MessageContent>
        </Message>
      )
    case "reasoning":
      return <Reasoning streaming={running}>{step.text}</Reasoning>
    case "text":
      return <MessageResponse streaming={running}>{step.text}</MessageResponse>
    case "tests":
      return (
        <AgentTool title="Run tests" running={running}>
          <TestRunOutput run={step.run} running={running} lines={lines} />
        </AgentTool>
      )
    case "read":
      return (
        <AgentTool title={`Read ${step.file.path}`} running={running}>
          {!running && (
            <ToolOutput>
              <CodeBlock
                code={step.file.before}
                filename={step.file.path}
                language={languageOf(step.file.path)}
                lineNumbers
              />
            </ToolOutput>
          )}
        </AgentTool>
      )
    case "edit":
      return (
        <AgentTool title={`Edit ${step.paths.length} files`} running={running}>
          {!running && (
            <ToolOutput>
              <CodeBlock code={step.diff} language="diff" />
            </ToolOutput>
          )}
        </AgentTool>
      )
    case "commit":
      return (
        <AgentTool title="Commit" running={running}>
          {!running && (
            <ToolOutput>
              <Commit {...step.commit} />
            </ToolOutput>
          )}
        </AgentTool>
      )
  }
}
