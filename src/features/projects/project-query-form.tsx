import { useRef, useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/kit/ui/button"
import { DialogFooter } from "@/kit/ui/dialog"
import { FieldGroup } from "@/kit/ui/field"
import type { Member } from "@/demo/model"
import {
  parseProjectCondition,
  type ProjectCondition,
  type ProjectQuery,
} from "./project-query"
import { QueryCondition, type DraftCondition } from "./query-condition"
import { QuerySelect } from "./query-select"

const matchOptions = [
  { value: "all", label: "all" },
  { value: "any", label: "any" },
] as const

function blankCondition(): DraftCondition {
  return {
    id: `query-${crypto.randomUUID()}`,
    field: "name",
    operator: "contains",
    value: "",
  }
}

export function ProjectQueryForm({
  value,
  members,
  onApply,
  onCancel,
}: {
  value?: ProjectQuery
  members: Member[]
  onApply: (query: ProjectQuery | undefined) => void
  onCancel: () => void
}) {
  const [match, setMatch] = useState(value?.match ?? "all")

  const [conditions, setConditions] = useState<DraftCondition[]>(
    () =>
      value?.conditions.map((item) => ({
        ...item,
        id: `query-${crypto.randomUUID()}`,
        value: String(item.value),
      })) ?? [blankCondition()],
  )

  const [errors, setErrors] = useState<Record<string, string>>({})
  const form = useRef<HTMLFormElement>(null)
  const add = useRef<HTMLButtonElement>(null)

  function focusCondition(id?: string) {
    if (id) form.current?.querySelector<HTMLElement>(`#${id}-field`)?.focus()
    else add.current?.focus()
  }

  return (
    <form
      ref={form}
      className="project-query-form"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        const nextErrors: Record<string, string> = {}
        const parsed: ProjectCondition[] = []

        for (const condition of conditions) {
          const item = parseProjectCondition(condition)

          if (item) parsed.push(item)
          else
            nextErrors[condition.id] =
              condition.field === "progress"
                ? "Enter a percentage from 0 to 100."
                : condition.field === "dueDate"
                  ? "Choose a valid date."
                  : "Enter or choose a value."
        }

        setErrors(nextErrors)
        const first = conditions.find((condition) => nextErrors[condition.id])

        if (first)
          form.current
            ?.querySelector<HTMLElement>(`#${first.id}-value`)
            ?.focus()
        else onApply(parsed.length ? { match, conditions: parsed } : undefined)
      }}
    >
      <div className="project-query-body">
        <div className="query-match">
          <span>Match</span>
          <QuerySelect
            label="Match conditions"
            value={match}
            options={matchOptions}
            onChange={setMatch}
          />
          <span>of these conditions</span>
        </div>
        <FieldGroup className="query-conditions">
          {conditions.map((condition, index) => (
            <QueryCondition
              key={condition.id}
              condition={condition}
              index={index}
              members={members}
              error={errors[condition.id]}
              onChange={(next) => {
                setConditions(
                  conditions.map((item) =>
                    item.id === condition.id ? next : item,
                  ),
                )
                setErrors((current) => ({ ...current, [condition.id]: "" }))
              }}
              onRemove={() => {
                // Move focus before unmounting the active row so the dialog
                // does not need to recover focus from a removed element.
                focusCondition(
                  conditions[index + 1]?.id ?? conditions[index - 1]?.id,
                )
                setConditions(
                  conditions.filter((item) => item.id !== condition.id),
                )
              }}
            />
          ))}
        </FieldGroup>
        <div className="query-add-actions">
          <Button
            ref={add}
            type="button"
            variant="outline"
            onClick={() => {
              const next = blankCondition()

              setConditions([...conditions, next])
              requestAnimationFrame(() => focusCondition(next.id))
            }}
          >
            <Plus aria-hidden="true" data-icon="inline-start" />
            Add condition
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={!conditions.length}
            onClick={() => {
              focusCondition()
              setConditions([])
              setErrors({})
            }}
          >
            Clear conditions
          </Button>
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Apply filters</Button>
      </DialogFooter>
    </form>
  )
}
