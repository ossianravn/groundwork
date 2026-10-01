import * as React from "react"
import {
  ChevronUp,
  Circle,
  CircleAlert,
  CircleCheck,
  CircleSlash,
  ListChecks,
} from "lucide-react"
import { cn } from "cn"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/kit/ui/collapsible"
import { Spinner } from "@/kit/ui/spinner"

export type TaskPlanStatus = "todo" | "doing" | "done" | "dropped" | "blocked"

export interface TaskPlanTask {
  id: string
  label: string
  status: TaskPlanStatus
  /** A short note under the task, such as why it was dropped. */
  note?: string
}

const statuses = {
  todo: { label: "To do", icon: Circle, tone: "text-muted-foreground" },
  doing: { label: "In progress", icon: null, tone: "text-brand" },
  done: { label: "Done", icon: CircleCheck, tone: "text-(--success)" },
  dropped: {
    label: "Dropped",
    icon: CircleSlash,
    tone: "text-muted-foreground",
  },
  blocked: { label: "Blocked", icon: CircleAlert, tone: "text-destructive" },
} satisfies Record<
  TaskPlanStatus,
  { label: string; icon: typeof Circle | null; tone: string }
>

function TaskStatusIcon({ status }: { status: TaskPlanStatus }) {
  const { icon: Icon, tone } = statuses[status]

  return Icon ? (
    <Icon className={cn("size-4 shrink-0", tone)} aria-hidden="true" />
  ) : (
    <Spinner
      className={cn("size-4 shrink-0", tone)}
      role="presentation"
      aria-hidden="true"
    />
  )
}

/**
 * The agent's own plan for the current request, docked above the composer:
 * a bar with the title and progress that opens upward into the task list.
 * Each task's status is shown by icon and spoken in words. Collapsed by
 * default, so it reports progress without taking the conversation's room.
 */
function TaskPlan({
  title,
  tasks,
  note,
  defaultOpen = false,
  className,
}: {
  title: string
  tasks: TaskPlanTask[]
  /** A line under the list, such as what the plan covers. */
  note?: React.ReactNode
  defaultOpen?: boolean
  className?: string
}) {
  const finished = tasks.filter(
    (task) => task.status === "done" || task.status === "dropped",
  ).length

  return (
    <Collapsible
      data-slot="task-plan"
      defaultOpen={defaultOpen}
      className={cn(
        "min-w-0 rounded-t-xl border border-b-0 border-border bg-card text-sm",
        className,
      )}
    >
      <CollapsibleTrigger className="group/task-plan flex min-h-(--control-height) w-full items-center gap-2 rounded-t-xl px-3 text-start outline-none hover:bg-accent/50 focus-visible:ring-3 focus-visible:ring-ring/50">
        <ListChecks
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        <span className="min-w-0 flex-1 truncate font-medium">{title}</span>
        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
          {finished}/{tasks.length}
          <span className="sr-only"> done</span>
        </span>
        <ChevronUp
          className="size-4 shrink-0 text-muted-foreground transition-transform group-data-panel-open/task-plan:rotate-180"
          aria-hidden="true"
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="max-h-[45vh] overflow-y-auto px-3 pb-3">
        <ul className="grid gap-1.5" aria-label={title}>
          {tasks.map((task) => (
            <li
              key={task.id}
              data-status={task.status}
              className="flex min-w-0 items-start gap-2"
            >
              <span className="mt-0.5">
                <TaskStatusIcon status={task.status} />
              </span>
              <span className="min-w-0">
                <span
                  className={cn(
                    task.status === "dropped" &&
                      "text-muted-foreground line-through",
                  )}
                >
                  {task.label}
                </span>
                <span className="sr-only">
                  {`, ${statuses[task.status].label}`}
                </span>
                {task.note && (
                  <span className="block text-xs text-muted-foreground">
                    {task.note}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
        {note && <p className="mt-2 text-xs text-muted-foreground">{note}</p>}
      </CollapsibleContent>
    </Collapsible>
  )
}

export { TaskPlan, TaskStatusIcon }
