import { useRef, useState } from "react"
import { Check, X } from "lucide-react"
import type { DataTable } from "@/kit/data-table/table-features"
import { Button } from "@/kit/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/kit/ui/select"
import type { Member, Project } from "@/demo/model"
import type {
  ProjectBulkAction,
  ProjectBulkHandler,
  ProjectBulkResult,
} from "@/demo/project-bulk"
import { ProjectBulkMenu } from "./project-bulk-menu"

export function ProjectBulkActions({
  table,
  members,
  onApply,
}: {
  table: DataTable<Project>
  members: Member[]
  onApply: ProjectBulkHandler
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  const [outcome, setOutcome] = useState<{
    action: ProjectBulkAction
    result: ProjectBulkResult
    selectionKey: string
  } | null>(null)

  const notice = useRef<HTMLParagraphElement>(null)

  const selected = table
    .getPrePaginatedRowModel()
    .rows.flatMap((row) => (row.getIsSelected() ? [row.original] : []))

  const selectionKey = JSON.stringify(selected.map(({ id }) => id).sort())

  if (outcome && outcome.selectionKey !== selectionKey) setOutcome(null)

  const activeCount = selected.filter(
    (project) => project.status !== "completed",
  ).length

  const tasks = selected.reduce(
    (sum, project) => sum + project.tasks - project.completedTasks,
    0,
  )

  const items = members.map((member) => ({
    value: member.id,
    label: member.name,
  }))

  function apply(ids: string[], action: ProjectBulkAction, retry = false) {
    setMenuOpen(false)
    const result = onApply(ids, action, retry)
    table.setRowSelection(
      Object.fromEntries(result.failed.map(({ id }) => [id, true])),
    )
    setOutcome({
      action,
      result,
      selectionKey: JSON.stringify(result.failed.map(({ id }) => id).sort()),
    })
    requestAnimationFrame(() => notice.current?.focus())
  }

  const action = outcome?.action

  const recipient =
    action?.kind === "assign"
      ? members.find((member) => member.id === action.ownerId)?.name
      : undefined

  const updatedLabel = `${outcome?.result.updated.length ?? 0} ${outcome?.result.updated.length === 1 ? "project" : "projects"}`

  return (
    <div
      className="project-bulk"
      role="group"
      aria-label="Bulk project actions"
    >
      {selected.length > 0 && (
        <>
          <span role="status" className="sr-only">
            {selected.length} projects selected
          </span>
          <ProjectBulkMenu
            open={menuOpen}
            onOpenChange={setMenuOpen}
            notice={notice}
          >
            <div className="project-bulk-controls">
              <Select
                items={items}
                value={null}
                onValueChange={(ownerId) => {
                  if (ownerId)
                    apply(
                      selected.map((project) => project.id),
                      { kind: "assign", ownerId },
                    )
                }}
              >
                <SelectTrigger aria-label="Assign owner to selected projects">
                  <SelectValue placeholder="Assign owner" />
                </SelectTrigger>
                <SelectContent
                  align="start"
                  alignItemWithTrigger={false}
                  finalFocus={() =>
                    notice.current?.textContent ? notice.current : true
                  }
                >
                  <SelectGroup>
                    {items.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                disabled={activeCount === 0}
                aria-label={
                  tasks
                    ? `Complete selected projects and ${tasks} remaining tasks`
                    : "Mark complete"
                }
                onClick={() =>
                  apply(
                    selected.map((project) => project.id),
                    { kind: "complete" },
                  )
                }
              >
                <Check aria-hidden="true" data-icon="inline-start" />
                {tasks ? "Complete projects & tasks" : "Mark complete"}
              </Button>
            </div>
          </ProjectBulkMenu>
          <Button
            variant="ghost"
            className="project-selection-clear"
            aria-label="Clear selection"
            onClick={() => {
              table.resetRowSelection(true)
              document.getElementById("project-selection-trigger")?.focus()
            }}
          >
            <X aria-hidden="true" data-icon="inline-start" />
            Clear
          </Button>
        </>
      )}
      <p
        className="project-bulk-notice"
        ref={notice}
        tabIndex={-1}
        role="status"
      >
        {outcome && (
          <>
            {outcome.action.kind === "assign"
              ? `Assigned ${recipient} to ${updatedLabel}.`
              : `Completed ${updatedLabel}.`}
            {outcome.result.unchanged.length > 0 &&
              ` ${outcome.result.unchanged.length} already up to date.`}
            {outcome.result.failed.length > 0 &&
              ` ${outcome.result.failed.length} could not be updated.`}
          </>
        )}
      </p>
      {outcome && outcome.result.failed.length > 0 && (
        <div className="project-bulk-failures">
          <ul>
            {outcome.result.failed.map((failure) => (
              <li key={failure.id}>
                {failure.name}: {failure.message}
              </li>
            ))}
          </ul>
          <Button
            variant="outline"
            onClick={() =>
              apply(
                outcome.result.failed.map(({ id }) => id),
                outcome.action,
                true,
              )
            }
          >
            Retry failed
          </Button>
        </div>
      )}
    </div>
  )
}
