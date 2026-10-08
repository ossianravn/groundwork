import * as React from "react"
import { cn } from "cn"
import { Skeleton } from "@/kit/ui/skeleton"
import {
  AnswerContext,
  AnswerNodeContext,
  type AnswerAction,
  type AnswerContextValue,
} from "./answer-context"
import {
  answerNodeList,
  lastNodeId,
  type AnswerLibrary,
  type AnswerNode,
  type AnswerNodeDraft,
  type AnswerState,
  type AnswerValue,
} from "./answer-library"

/**
 * A node that fails to render shows a quiet note instead of breaking the
 * answer, and tries again once its props change.
 */
class AnswerNodeBoundary extends React.Component<
  { signature: string; children: React.ReactNode },
  { failed: boolean }
> {
  override state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  override componentDidUpdate(previous: { signature: string }) {
    if (this.state.failed && previous.signature !== this.props.signature)
      this.setState({ failed: false })
  }

  override render() {
    return this.state.failed ? (
      <p className="text-(length:--text-meta) text-muted-foreground">
        This part of the answer couldn't be shown.
      </p>
    ) : (
      this.props.children
    )
  }
}

function AnswerNodeView({
  node,
  library,
  openId,
}: {
  node: AnswerNode
  library: AnswerLibrary
  openId?: string
}) {
  const component = library.get(node.type)

  // A component the library doesn't know is left out, as a model's mistake.
  if (!component) return null

  const open = node.id === openId
  const placeholder = component.placeholder ?? <Skeleton className="h-10" />

  if (open && !component.streams) return placeholder

  const children = node.children?.map((child, index) => (
    <AnswerNodeView
      key={`${child.id}-${index}`}
      node={child}
      library={library}
      openId={openId}
    />
  ))

  const result = component.render(node, children)

  // Until its props are complete a node holds its place; a finished node
  // with invalid props is left out.
  if ("issue" in result) return open ? placeholder : null

  return (
    <AnswerNodeContext value={{ id: node.id, open }}>
      <AnswerNodeBoundary signature={JSON.stringify(node.props ?? null)}>
        {result.element}
      </AnswerNodeBoundary>
    </AnswerNodeContext>
  )
}

const empty: AnswerState = {}

/**
 * Renders an answer the model composed from a library of components. The
 * nodes may be unfinished while they stream: the node being written shows a
 * placeholder unless it reads well partly written (text), and nodes without
 * a known component or valid props are left out. State changes inside the
 * answer go to the host (`state`, `onStateChange`), or stay in the answer
 * when the host keeps none.
 */
function AnswerRenderer({
  nodes,
  library,
  streaming = false,
  interactive = false,
  state,
  onStateChange,
  onAction,
  className,
}: {
  /** The answer's nodes as written so far: a tool's partial input works. */
  nodes?: (AnswerNodeDraft | undefined)[]
  library: AnswerLibrary
  streaming?: boolean
  /** The answer takes edits and actions; usually only the latest one. */
  interactive?: boolean
  state?: AnswerState
  onStateChange?: (state: AnswerState) => void
  onAction?: (action: AnswerAction) => void
  className?: string
}) {
  const [own, setOwn] = React.useState(empty)
  const current = state ?? own

  const setState = React.useCallback(
    (key: string, value: AnswerValue) => {
      const next = { ...current, [key]: value }

      onStateChange?.(next)

      if (!state) setOwn(next)
    },
    [current, onStateChange, state],
  )

  const context = React.useMemo<AnswerContextValue>(
    () => ({
      streaming,
      interactive,
      state: current,
      setState,
      act: onAction,
    }),
    [streaming, interactive, current, setState, onAction],
  )

  const list = answerNodeList.parse(nodes)
  const openId = streaming ? lastNodeId(list) : undefined

  return (
    <AnswerContext value={context}>
      <div
        data-slot="answer"
        aria-busy={streaming || undefined}
        className={cn("grid min-w-0 gap-(--section-gap)", className)}
      >
        {list.map((node, index) => (
          <AnswerNodeView
            key={`${node.id}-${index}`}
            node={node}
            library={library}
            openId={openId}
          />
        ))}
      </div>
    </AnswerContext>
  )
}

export { AnswerRenderer }
