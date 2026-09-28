import { projectStatuses, type Project, type ProjectStatus } from "@/demo/model"

export const queryFields = [
  { value: "name", label: "Project name" },
  { value: "status", label: "Status" },
  { value: "owner", label: "Owner" },
  { value: "dueDate", label: "Due date" },
  { value: "progress", label: "Progress" },
] as const

export type QueryField = (typeof queryFields)[number]["value"]

export const queryOperators = {
  name: [
    { value: "contains", label: "contains" },
    { value: "notContains", label: "does not contain" },
    { value: "equals", label: "is exactly" },
  ],
  status: [
    { value: "is", label: "is" },
    { value: "isNot", label: "is not" },
  ],
  owner: [
    { value: "is", label: "is" },
    { value: "isNot", label: "is not" },
  ],
  dueDate: [
    { value: "on", label: "is on" },
    { value: "before", label: "is before" },
    { value: "after", label: "is after" },
    { value: "onOrBefore", label: "is on or before" },
    { value: "onOrAfter", label: "is on or after" },
  ],
  progress: [
    { value: "equals", label: "is" },
    { value: "atLeast", label: "is at least" },
    { value: "atMost", label: "is at most" },
  ],
} as const

export type ProjectCondition = {
  [Field in QueryField]: {
    field: Field
    operator: (typeof queryOperators)[Field][number]["value"]
    value: Field extends "progress"
      ? number
      : Field extends "status"
        ? ProjectStatus
        : string
  }
}[QueryField]

export interface ProjectQuery {
  match: "all" | "any"
  conditions: ProjectCondition[]
}

function validDate(value: string) {
  const date = new Date(`${value}T00:00:00Z`)

  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  )
}

/* oxlint-disable anti-slop/no-unknown-parameters, anti-slop/no-runtime-typeof -- These parsers own untrusted URL JSON and form values; only validated domain conditions leave this boundary. */
export function parseProjectCondition(
  raw: unknown,
): ProjectCondition | undefined {
  if (
    !raw ||
    typeof raw !== "object" ||
    !("field" in raw) ||
    !("operator" in raw) ||
    !("value" in raw)
  )
    return
  const value = typeof raw.value === "string" ? raw.value.trim() : ""

  switch (raw.field) {
    case "name": {
      const operator = queryOperators.name.find(
        (item) => item.value === raw.operator,
      )?.value

      if (operator && value) return { field: "name", operator, value }
      break
    }

    case "status": {
      const operator = queryOperators.status.find(
        (item) => item.value === raw.operator,
      )?.value

      const status = projectStatuses.find((status) => status === value)

      if (operator && status)
        return { field: "status", operator, value: status }
      break
    }

    case "owner": {
      const operator = queryOperators.owner.find(
        (item) => item.value === raw.operator,
      )?.value

      if (operator && value) return { field: "owner", operator, value }
      break
    }

    case "dueDate": {
      const operator = queryOperators.dueDate.find(
        (item) => item.value === raw.operator,
      )?.value

      if (operator && validDate(value))
        return { field: "dueDate", operator, value }
      break
    }

    case "progress": {
      const operator = queryOperators.progress.find(
        (item) => item.value === raw.operator,
      )?.value

      const progress =
        typeof raw.value === "number" ? raw.value : value ? Number(value) : NaN

      if (
        operator &&
        Number.isFinite(progress) &&
        progress >= 0 &&
        progress <= 100
      )
        return { field: "progress", operator, value: progress }
      break
    }
  }
}

// Decode the entire advanced group, never silently remove a single condition.
export function parseProjectQuery(raw: unknown): ProjectQuery | undefined {
  if (
    !raw ||
    typeof raw !== "object" ||
    !("match" in raw) ||
    !("conditions" in raw)
  )
    return

  if (
    (raw.match !== "all" && raw.match !== "any") ||
    !Array.isArray(raw.conditions) ||
    !raw.conditions.length
  )
    return
  const conditions: ProjectCondition[] = []

  for (const value of raw.conditions) {
    const condition = parseProjectCondition(value)

    if (!condition) return
    conditions.push(condition)
  }

  return { match: raw.match, conditions }
}
/* oxlint-enable anti-slop/no-unknown-parameters, anti-slop/no-runtime-typeof */

function matchesCondition(project: Project, condition: ProjectCondition) {
  switch (condition.field) {
    case "name": {
      const name = project.name.toLocaleLowerCase()
      const value = condition.value.toLocaleLowerCase()

      if (condition.operator === "equals") return name === value

      return condition.operator === "contains"
        ? name.includes(value)
        : !name.includes(value)
    }

    case "status":
    case "owner": {
      const value =
        condition.field === "status" ? project.status : project.ownerId

      return condition.operator === "is"
        ? value === condition.value
        : value !== condition.value
    }

    case "dueDate":
      switch (condition.operator) {
        case "on":
          return project.dueDate === condition.value
        case "before":
          return project.dueDate < condition.value
        case "after":
          return project.dueDate > condition.value
        case "onOrBefore":
          return project.dueDate <= condition.value
        case "onOrAfter":
          return project.dueDate >= condition.value
      }

      break
    case "progress": {
      // Compare the same rounded percentage people see in every project view.
      const progress = project.tasks
        ? Math.round((project.completedTasks / project.tasks) * 100)
        : 0

      if (condition.operator === "atLeast") return progress >= condition.value

      if (condition.operator === "atMost") return progress <= condition.value

      return progress === condition.value
    }
  }
}

export function matchesProjectQuery(project: Project, query?: ProjectQuery) {
  if (!query?.conditions.length) return true

  const matches = (condition: ProjectCondition) =>
    matchesCondition(project, condition)

  return query.match === "all"
    ? query.conditions.every(matches)
    : query.conditions.some(matches)
}
