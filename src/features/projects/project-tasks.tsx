import { useState } from "react"
import { Button } from "@/kit/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/kit/ui/toggle-group"
import { useToast } from "@/kit/ui/use-toast"
import type { Member, Project, ProjectTask } from "@/demo/model"
import type { TaskChange } from "@/demo/project-tasks"
import { ProjectTaskDialog, type TaskDraft } from "./project-task-dialog"
import { ProjectTaskRow } from "./project-task-row"

/** Tasks shown before "Show all"; the rest stay one action away. */
const listLimit = 10

type TaskStatus = "open" | "completed"

const isStatus = (value: unknown): value is TaskStatus =>
  value === "open" || value === "completed"

// The checkbox's focusable element carries a generated id (the task id is on
// its hidden input), so rows are found by their task id instead.
const checkboxOf = (row: Element | null | undefined) =>
  row?.querySelector<HTMLElement>('[data-slot="checkbox"]')

const taskRow = (taskId: string) =>
  document.querySelector(`[data-task-id="${taskId}"]`)

// The project's task list (TABL-12): Open or Completed, one list at a time.
// A task ticked or unticked here stays in the list, in its new state, until
// the view changes, so several can be worked through without the list
// shifting. Add task opens a dialog; deleting offers Undo.
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
  const [status, setStatus] = useState<TaskStatus>("open")
  const [kept, setKept] = useState<string[]>([])
  const [showAll, setShowAll] = useState(false)
  const [announcement, setAnnouncement] = useState("")
  const readOnly = project.status === "completed"
  const openCount = tasks.filter((task) => !task.done).length

  const list = tasks.filter(
    (task) => task.done === (status === "completed") || kept.includes(task.id),
  )

  const visible = showAll ? list : list.slice(0, listLimit)

  function show(next: TaskStatus) {
    setStatus(next)
    setKept([])
    setShowAll(false)
  }

  function toggle(task: ProjectTask) {
    setKept((ids) => (ids.includes(task.id) ? ids : [...ids, task.id]))
    onChange({ kind: "toggle", taskId: task.id })
    setAnnouncement(`${task.title} ${task.done ? "reopened" : "completed"}.`)
  }

  function remove(task: ProjectTask) {
    const index = visible.indexOf(task)
    const next = visible[index + 1] ?? visible[index - 1]

    // The last task gone, focus returns to the status switch.
    requestAnimationFrame(() =>
      (next
        ? checkboxOf(taskRow(next.id))
        : document.querySelector<HTMLElement>(
            '.project-tasks-toolbar [aria-pressed="true"]',
          )
      )?.focus(),
    )

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

  function add(draft: TaskDraft) {
    onChange({ kind: "add", projectId: project.id, ...draft })
    // A new task is open, so the Open list shows it in full.
    show("open")
    setShowAll(true)
    setAnnouncement(`${draft.title.trim()} added.`)
  }

  return (
    <section className="project-tasks" aria-label="Tasks">
      <div className="project-tasks-toolbar">
        <ToggleGroup
          aria-label="Task status"
          variant="outline"
          size="sm"
          spacing={0}
          value={[status]}
          onValueChange={(values) => {
            if (isStatus(values[0])) show(values[0])
          }}
        >
          <ToggleGroupItem value="open">
            Open <span className="task-status-count">{openCount}</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="completed">
            Completed{" "}
            <span className="task-status-count">
              {tasks.length - openCount}
            </span>
          </ToggleGroupItem>
        </ToggleGroup>
        {!readOnly && <ProjectTaskDialog members={members} onAdd={add} />}
      </div>
      {readOnly && (
        <p className="text-muted-foreground">
          This project is complete. Reopen it to change its tasks.
        </p>
      )}
      {list.length > 0 ? (
        <ul
          className="task-list"
          aria-label={status === "open" ? "Open tasks" : "Completed tasks"}
        >
          {visible.map((task, index) => (
            <ProjectTaskRow
              key={task.id}
              task={task}
              members={members}
              people={people}
              readOnly={readOnly}
              first={index === 0}
              last={index === visible.length - 1}
              onToggle={() => toggle(task)}
              onAssign={(assigneeId) => {
                onChange({ kind: "assign", taskId: task.id, assigneeId })
                setAnnouncement(
                  `${task.title} assigned to ${
                    people.find((person) => person.id === assigneeId)?.name ??
                    "no one"
                  }.`,
                )
              }}
              onMove={(offset) =>
                onChange({ kind: "move", taskId: task.id, offset })
              }
              onRemove={() => remove(task)}
              onDescribe={(description) => {
                onChange({ kind: "describe", taskId: task.id, description })
                setAnnouncement(`Description of ${task.title} saved.`)
              }}
            />
          ))}
        </ul>
      ) : (
        <p className="task-empty text-muted-foreground">
          {status === "open"
            ? "No open tasks. Add one, or reopen a completed task."
            : "No completed tasks yet."}
        </p>
      )}
      {list.length > visible.length && (
        <Button
          variant="ghost"
          size="sm"
          className="task-show-all"
          onClick={() => setShowAll(true)}
        >
          Show all {list.length} {status} tasks
        </Button>
      )}
      <p role="status" className="sr-only">
        {announcement}
      </p>
    </section>
  )
}
