import { X } from "lucide-react"
import { Button } from "@/kit/ui/button"
import { Field, FieldError } from "@/kit/ui/field"
import { Input } from "@/kit/ui/input"
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/kit/ui/input-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/kit/ui/tooltip"
import { projectStatuses, statusLabels, type Member } from "@/demo/model"
import { queryFields, queryOperators, type QueryField } from "./project-query"
import { QuerySelect } from "./query-select"

export interface DraftCondition {
  id: string
  field: QueryField
  operator: string
  value: string
}

export function QueryCondition({
  condition,
  index,
  members,
  error,
  onChange,
  onRemove,
}: {
  condition: DraftCondition
  index: number
  members: Member[]
  error?: string
  onChange: (next: DraftCondition) => void
  onRemove: () => void
}) {
  const { id, field, operator, value } = condition
  const label = `${queryFields.find((item) => item.value === field)?.label}, condition ${index + 1}`

  const valueProps = {
    id: `${id}-value`,
    "aria-label": label,
    "aria-invalid": !!error,
    "aria-describedby": error ? `${id}-error` : undefined,
  }

  const options =
    field === "status"
      ? projectStatuses.map((value) => ({ value, label: statusLabels[value] }))
      : members.map((member) => ({ value: member.id, label: member.name }))

  if (
    field === "owner" &&
    value &&
    !members.some((member) => member.id === value)
  )
    options.push({ value, label: "Unavailable member" })

  function setValue(value: string) {
    onChange({ ...condition, value })
  }

  return (
    <Field
      className="query-condition"
      data-field={field}
      data-invalid={!!error}
      aria-label={`Condition ${index + 1}`}
    >
      <QuerySelect
        id={`${id}-field`}
        label={`Field, condition ${index + 1}`}
        value={field}
        options={queryFields}
        onChange={(field) =>
          onChange({
            ...condition,
            field,
            operator: queryOperators[field][0].value,
            value:
              field === "status"
                ? "in-progress"
                : field === "owner"
                  ? (members[0]?.id ?? "")
                  : "",
          })
        }
      />
      <QuerySelect
        label={`Comparison, condition ${index + 1}`}
        value={operator}
        options={queryOperators[field]}
        onChange={(operator) => onChange({ ...condition, operator })}
      />
      <div className="query-value">
        {field === "status" || field === "owner" ? (
          <QuerySelect
            id={valueProps.id}
            label={label}
            invalid={valueProps["aria-invalid"]}
            describedBy={valueProps["aria-describedby"]}
            value={value}
            options={options}
            onChange={setValue}
          />
        ) : field === "progress" ? (
          <InputGroup>
            <InputGroupInput
              {...valueProps}
              type="number"
              min={0}
              max={100}
              step="any"
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
            <InputGroupAddon align="inline-end">%</InputGroupAddon>
          </InputGroup>
        ) : (
          <Input
            {...valueProps}
            type={field === "dueDate" ? "date" : "text"}
            value={value}
            autoComplete="off"
            onChange={(event) => setValue(event.target.value)}
          />
        )}
      </div>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              className="query-remove"
              type="button"
              size="icon"
              variant="ghost"
              aria-label={`Remove condition ${index + 1}`}
              onClick={onRemove}
            />
          }
        >
          <X aria-hidden="true" />
        </TooltipTrigger>
        <TooltipContent>Remove condition</TooltipContent>
      </Tooltip>
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </Field>
  )
}
