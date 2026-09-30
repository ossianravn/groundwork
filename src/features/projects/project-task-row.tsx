import { useState } from "react"
import { AlignLeft, Ellipsis } from "lucide-react"
import { Button } from "@/kit/ui/button"
import { Checkbox } from "@/kit/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/kit/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/kit/ui/select"
import { MemberAvatar } from "@/kit/member-avatar"
import type { RichTextDocument } from "@/kit/rich-text/document"
import type { Member, ProjectTask } from "@/demo/model"
import { ProjectTaskDescription } from "./project-task-description"

const unassigned = "unassigned"

export function ProjectTaskRow({
  task,
  members,
  people,
  readOnly,
  first,
  last,
  onToggle,
  onAssign,
  onMove,
  onRemove,
  onDescribe,
}: {
  task: ProjectTask
  /** Who can be assigned: active workspace members. */
  members: Member[]
  /** Everyone who may appear on a task, including former members. */
  people: Member[]
  readOnly: boolean
  first: boolean
  last: boolean
  onToggle: () => void
  onAssign: (memberId: string | null) => void
  onMove: (offset: -1 | 1) => void
  onRemove: () => void
  onDescribe: (description: RichTextDocument) => void
}) {
  const [open, setOpen] = useState(false)
  const id = `task-${task.id}`
  const assignee = people.find((person) => person.id === task.assigneeId)

  const items = [
    { value: unassigned, label: "Unassigned" },
    ...members.map((member) => ({ value: member.id, label: member.name })),
  ]

  return (
    <li
      className="task-row"
      data-task-id={task.id}
      data-done={task.done || undefined}
      data-open={open || undefined}
    >
      {/* Only the checkbox completes a task. The title names it and opens
          the task's description; it is not the checkbox's label. */}
      <Checkbox
        id={id}
        aria-labelledby={`${id}-title`}
        checked={task.done}
        disabled={readOnly}
        onCheckedChange={onToggle}
      />
      <button
        type="button"
        id={`${id}-title`}
        className="task-title"
        aria-expanded={open}
        aria-controls={`${id}-details`}
        onClick={() => setOpen(!open)}
      >
        {task.title}
        {task.description && (
          <AlignLeft className="task-has-description" aria-hidden="true" />
        )}
      </button>
      {readOnly ? (
        assignee && <MemberAvatar member={assignee} size="sm" />
      ) : (
        <Select
          items={items}
          value={task.assigneeId ?? unassigned}
          onValueChange={(value) =>
            onAssign(!value || value === unassigned ? null : value)
          }
        >
          <SelectTrigger
            size="sm"
            className="task-assignee"
            aria-label={`Assignee for ${task.title}: ${assignee?.name ?? "Unassigned"}`}
          >
            {/* Name first, so avatars line up at the column's edge. */}
            {assignee ? (
              <>
                <span className="task-assignee-name">
                  {assignee.name.split(" ")[0]}
                </span>
                <MemberAvatar member={assignee} size="sm" />
              </>
            ) : (
              <>
                <span className="task-assignee-name text-muted-foreground">
                  Unassigned
                </span>
                <span className="task-assignee-empty" aria-hidden="true" />
              </>
            )}
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false} align="end">
            <SelectGroup>
              {items.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      )}
      {!readOnly && (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon-sm" />}
            aria-label={`Actions for ${task.title}`}
          >
            <Ellipsis aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem disabled={first} onClick={() => onMove(-1)}>
                Move up
              </DropdownMenuItem>
              <DropdownMenuItem disabled={last} onClick={() => onMove(1)}>
                Move down
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="text-destructive" onClick={onRemove}>
                Delete task
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {open && (
        <ProjectTaskDescription
          id={`${id}-details`}
          task={task}
          readOnly={readOnly}
          onSave={onDescribe}
        />
      )}
    </li>
  )
}
