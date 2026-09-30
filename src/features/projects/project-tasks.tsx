import { useEffect, useRef, useState, type FormEvent } from "react"
import { ChevronRight, Plus } from "lucide-react"
import { Button } from "@/kit/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/kit/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/kit/ui/collapsible"
import { Input } from "@/kit/ui/input"
import { useToast } from "@/kit/ui/use-toast"
import type { Member, Project, ProjectTask } from "@/demo/model"
import type { TaskChange } from "@/demo/project-tasks"
import { ProjectTaskRow } from "./project-task-row"

/** Open tasks shown before "Show all"; the rest stay one action away. */
const openLimit = 8

/** How long a task just completed stays in place, ticked, before it moves. */
const settleMs = 1600

// The checkbox's focusable element carries a generated id (the task id is on
// its hidden input), so rows are found by their task id instead.
const checkboxOf = (row: Element | null | undefined) =>
  row?.querySelector<HTMLElement>('[data-slot="checkbox"]')

const taskRow = (taskId: string) =>
  document.querySelector(`[data-task-id="${taskId}"]`)

// The project's task list (TABL-12). A task completed here stays in place,
// ticked and struck through, for a moment (unticking it then keeps it
// open), then fades into the collapsed Completed list; if its checkbox had
// focus, focus moves to the neighbouring task. Deleting offers Undo.
export function ProjectTasks({
  project,
  tasks,
  members,
  people,
  onChange,
}: {
  project: Project
  /** This project's tasks, in order. */
  tasks: ProjectTask[]
  members: Member[]
  people: Member[]
  /** Applies a change; returns a function that reverses it, when possible. */
  onChange: (change: TaskChange) => (() => void) | undefined
}) {
  const toast = useToast()
  const [title, setTitle] = useState("")
  const [showAll, setShowAll] = useState(false)
  const [announcement, setAnnouncement] = useState("")
  const input = useRef<HTMLInputElement>(null)
  const [settling, setSettling] = useState<string[]>([])
  const timers = useRef(new Map<string, number>())
  const readOnly = project.status === "completed"
  const openCount = tasks.filter((task) => !task.done).length
  const open = tasks.filter((task) => !task.done || settling.includes(task.id))
  const done = tasks.filter((task) => task.done && !settling.includes(task.id))
  const visible = showAll ? open : open.slice(0, openLimit)

  function focusAfter(list: ProjectTask[], task: ProjectTask) {
    const index = list.indexOf(task)
    const next = list[index + 1] ?? list[index - 1]

    requestAnimationFrame(() =>
      (next ? checkboxOf(taskRow(next.id)) : input.current)?.focus(),
    )
  }

  useEffect(() => {
    const pending = timers.current

    return () => pending.forEach((timer) => window.clearTimeout(timer))
  }, [])

  function settle(taskId: string) {
    timers.current.delete(taskId)

    const item = taskRow(taskId)

    if (item?.contains(document.activeElement)) {
      const neighbour = checkboxOf(
        item.nextElementSibling ?? item.previousElementSibling,
      )

      ;(neighbour ?? input.current)?.focus()
    }

    setSettling((ids) => ids.filter((id) => id !== taskId))
  }

  function toggle(task: ProjectTask) {
    const timer = timers.current.get(task.id)

    // Unticked before it settled: it simply stays open where it is.
    if (timer !== undefined) {
      window.clearTimeout(timer)
      timers.current.delete(task.id)
      setSettling((ids) => ids.filter((id) => id !== task.id))
    } else if (task.done) {
      setShowAll(true)
      requestAnimationFrame(() => checkboxOf(taskRow(task.id))?.focus())
    } else {
      setSettling((ids) => [...ids, task.id])
      timers.current.set(
        task.id,
        window.setTimeout(() => settle(task.id), settleMs),
      )
    }

    onChange({ kind: "toggle", taskId: task.id })
    setAnnouncement(`${task.title} ${task.done ? "reopened" : "completed"}.`)
  }

  function remove(task: ProjectTask) {
    focusAfter(task.done ? done : visible, task)
    const undo = onChange({ kind: "remove", taskId: task.id })

    setAnnouncement(`${task.title} deleted.`)

    if (!undo) return

    const id = toast.add({
      title: `Deleted “${task.title}”`,
      type: "success",
      actionProps: {
        children: "Undo",
        onClick: () => {
          undo()
          toast.close(id)
        },
      },
    })
  }

  function add(event: FormEvent) {
    event.preventDefault()

    if (!title.trim()) {
      setAnnouncement("Enter a task title to add it.")
      input.current?.focus()

      return
    }

    onChange({ kind: "add", projectId: project.id, title, assigneeId: null })
    setAnnouncement(`${title.trim()} added.`)
    setTitle("")
    setShowAll(true)
  }

  const row = (task: ProjectTask, list: ProjectTask[], index: number) => (
    <ProjectTaskRow
      key={task.id}
      task={task}
      members={members}
      people={people}
      readOnly={readOnly}
      settling={settling.includes(task.id)}
      first={index === 0}
      last={index === list.length - 1}
      onToggle={() => toggle(task)}
      onAssign={(assigneeId) => {
        onChange({ kind: "assign", taskId: task.id, assigneeId })
        setAnnouncement(
          `${task.title} assigned to ${
            people.find((person) => person.id === assigneeId)?.name ?? "no one"
          }.`,
        )
      }}
      onMove={(offset) => onChange({ kind: "move", taskId: task.id, offset })}
      onRemove={() => remove(task)}
    />
  )

  return (
    <Card className="project-tasks">
      <CardHeader className="project-tasks-heading">
        <CardTitle>
          <h2>Tasks</h2>
        </CardTitle>
        <p className="project-tasks-count">
          {openCount} open · {tasks.length - openCount} done
        </p>
      </CardHeader>
      <CardContent className="project-tasks-content">
        {readOnly && (
          <p className="text-muted-foreground">
            This project is complete. Reopen it to change its tasks.
          </p>
        )}
        {open.length > 0 && (
          <ul className="task-list" aria-label="Open tasks">
            {visible.map((task, index) => row(task, open, index))}
          </ul>
        )}
        {open.length > visible.length && (
          <Button
            variant="ghost"
            size="sm"
            className="task-show-all"
            onClick={() => setShowAll(true)}
          >
            Show all {open.length} open tasks
          </Button>
        )}
        {!readOnly && (
          <form className="task-add" onSubmit={add}>
            <Input
              ref={input}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Add a task"
              aria-label="New task"
              autoComplete="off"
            />
            <Button type="submit" variant="outline">
              <Plus aria-hidden="true" data-icon="inline-start" />
              Add
            </Button>
          </form>
        )}
        {done.length > 0 && (
          <Collapsible className="task-completed" defaultOpen={readOnly}>
            <CollapsibleTrigger
              render={<Button variant="ghost" size="sm" />}
              className="task-completed-trigger"
            >
              <ChevronRight aria-hidden="true" data-icon="inline-start" />
              Completed ({done.length})
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ul className="task-list" aria-label="Completed tasks">
                {done.map((task, index) => row(task, done, index))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        )}
        <p role="status" className="sr-only">
          {announcement}
        </p>
      </CardContent>
    </Card>
  )
}
