import { useEffect, useState } from "react"
import { Play } from "lucide-react"
import { parsePartialJson } from "ai"
import { z } from "zod"
import type { AnswerAction } from "@/kit/answer/answer-context"
import {
  answerNodeList,
  type AnswerNode,
  type AnswerState,
} from "@/kit/answer/answer-library"
import { AnswerRenderer } from "@/kit/answer/answer-renderer"
import { Button } from "@/kit/ui/button"
import { exampleAnswer, exampleLibrary } from "./answer-example-library"

const json = JSON.stringify(exampleAnswer)

const chunk = Math.ceil(json.length / 60)

// A partly written input, read as far as it goes.
const draft = z.object({ nodes: answerNodeList }).catch({ nodes: [] })

export function AnswerExample() {
  const [length, setLength] = useState(0)
  const [nodes, setNodes] = useState<AnswerNode[]>([])
  const [state, setState] = useState<AnswerState>({})
  const [sent, setSent] = useState<AnswerAction>()
  const streaming = length < json.length

  // The input arrives a few characters at a time, like tool-input deltas.
  useEffect(() => {
    if (!streaming) return

    const timer = window.setTimeout(
      () => setLength(Math.min(json.length, length + chunk)),
      50,
    )

    return () => window.clearTimeout(timer)
  }, [length, streaming])

  // What has arrived is parsed after every delta, as the AI SDK does.
  useEffect(() => {
    let current = true

    void parsePartialJson(json.slice(0, length)).then(({ value }) => {
      if (current) setNodes(draft.parse(value).nodes)
    })

    return () => {
      current = false
    }
  }, [length])

  function replay() {
    setLength(0)
    setState({})
    setSent(undefined)
  }

  return (
    <div className="grid w-full max-w-2xl gap-(--section-gap)">
      <div className="flex items-center justify-between gap-3">
        <p className="text-(length:--text-meta) text-muted-foreground">
          {streaming ? "Writing the answer…" : "Answer finished"}
        </p>
        <Button variant="outline" size="sm" onClick={replay}>
          <Play data-icon="inline-start" />
          Replay
        </Button>
      </div>
      <AnswerRenderer
        nodes={nodes}
        library={exampleLibrary}
        streaming={streaming}
        interactive={!streaming}
        state={state}
        onStateChange={setState}
        onAction={setSent}
      />
      <dl className="grid gap-2 border-t border-border pt-3 text-(length:--text-meta)">
        <div className="grid gap-0.5">
          <dt className="text-muted-foreground">Kept with the answer</dt>
          <dd className="font-mono [overflow-wrap:anywhere]">
            {JSON.stringify(state)}
          </dd>
        </div>
        <div className="grid gap-0.5">
          <dt className="text-muted-foreground">Sent as the next message</dt>
          <dd>{sent?.text ?? "Nothing yet. Change the form and send it."}</dd>
        </div>
      </dl>
    </div>
  )
}
