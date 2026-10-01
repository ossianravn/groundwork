import { useEffect, useState } from "react"
import { TaskStatusIcon, type TaskPlanStatus } from "@/kit/ai/task-plan"
import type { WorkState, WorkTurn } from "./inspector-model"

const icons = {
  running: "doing",
  done: "done",
  failed: "blocked",
  waiting: "todo",
  declined: "dropped",
  stopped: "dropped",
} satisfies Record<WorkState, TaskPlanStatus>

const stateLabels = {
  running: "In progress",
  done: "Done",
  failed: "Failed",
  waiting: "Waiting",
  declined: "Declined",
  stopped: "Stopped",
} satisfies Record<WorkState, string>

/**
 * Everything the assistant did, question by question, as a timeline. Each
 * item shows its reply in the transcript; reasoning reads in full here.
 * `focus` scrolls to a reply's work and opens its reasoning.
 */
export function AssistantWork({
  turns,
  focus,
  onShow,
}: {
  turns: WorkTurn[]
  focus?: { messageId: string; key: number }
  onShow: (messageId: string) => void
}) {
  const [expanded, setExpanded] = useState<string[]>([])
  const [focused, setFocused] = useState<number>()

  // A new focus opens that reply's reasoning once; it then folds as usual.
  if (focus && focus.key !== focused) {
    setFocused(focus.key)

    const reasoning = turns.flatMap((turn) =>
      turn.items.flatMap((item) =>
        item.messageId === focus.messageId && item.kind === "reasoning"
          ? [item.id]
          : [],
      ),
    )

    setExpanded((ids) => [...new Set([...ids, ...reasoning])])
  }

  useEffect(() => {
    if (!focus) return

    document
      .querySelector(`[data-work-message="${focus.messageId}"]`)
      ?.scrollIntoView({ block: "start" })
  }, [focus])

  if (!turns.length)
    return (
      <p className="assistant-inspector-empty">
        The assistant's work on each question appears here.
      </p>
    )

  return (
    <div className="assistant-work">
      {turns.map((turn) => (
        <section key={turn.id} aria-label={turn.question}>
          <h3 className="assistant-work-question">{turn.question}</h3>
          <ol className="assistant-work-items">
            {turn.items.map((item) => {
              const open = expanded.includes(item.id)

              return (
                <li
                  key={item.id}
                  data-work-message={item.messageId}
                  data-state={item.state}
                >
                  <TaskStatusIcon status={icons[item.state]} />
                  <div className="assistant-work-body">
                    <button
                      type="button"
                      className="assistant-work-label"
                      onClick={() => onShow(item.messageId)}
                    >
                      {item.label}
                      <span className="sr-only">
                        {`, ${stateLabels[item.state]}. Show in conversation`}
                      </span>
                    </button>
                    {item.detail && (
                      <p className="assistant-work-detail">{item.detail}</p>
                    )}
                    {item.text && (
                      <>
                        <p
                          className="assistant-work-reasoning"
                          data-open={open || undefined}
                        >
                          {item.text}
                        </p>
                        <button
                          type="button"
                          className="assistant-work-more"
                          aria-expanded={open}
                          onClick={() =>
                            setExpanded((ids) =>
                              open
                                ? ids.filter((id) => id !== item.id)
                                : [...ids, item.id],
                            )
                          }
                        >
                          {open ? "Show less" : "Show all"}
                        </button>
                      </>
                    )}
                  </div>
                </li>
              )
            })}
          </ol>
        </section>
      ))}
    </div>
  )
}
