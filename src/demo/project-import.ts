import type { Member } from "./model"
import { parseIsoDate } from "@/kit/lib/iso-date"

export const importFields = [
  {
    key: "name",
    label: "Project name",
    required: true,
    synonyms: ["name", "project", "project name", "title"],
  },
  {
    key: "owner",
    label: "Owner",
    required: false,
    synonyms: ["owner", "lead", "assignee", "owner email"],
  },
  {
    key: "dueDate",
    label: "Due date",
    required: true,
    synonyms: ["due", "due date", "deadline", "end date"],
  },
  {
    key: "description",
    label: "Description",
    required: false,
    synonyms: ["description", "summary", "notes", "details"],
  },
  {
    key: "tags",
    label: "Tags",
    required: false,
    synonyms: ["tags", "labels", "categories"],
  },
] as const

export type ImportField = (typeof importFields)[number]["key"]

/** Which CSV column (by index) fills each field; null leaves it empty. */
export type ColumnMapping = Record<ImportField, number | null>

export interface ImportRow {
  /** The row's line in the file, counting the header as line 1. */
  line: number
  name: string
  ownerId: string
  /** The owner as written in the file; empty means the default owner. */
  ownerText: string
  dueDate: string
  description: string
  tags: string[]
  errors: string[]
}

const normal = (value: string) => value.trim().toLowerCase()

export function guessMapping(headers: string[]): ColumnMapping {
  const find = (key: ImportField) => {
    const field = importFields.find((item) => item.key === key)

    const index = headers.findIndex((header) =>
      field?.synonyms.some((synonym) => normal(header) === synonym),
    )

    return index < 0 ? null : index
  }

  return {
    name: find("name"),
    owner: find("owner"),
    dueDate: find("dueDate"),
    description: find("description"),
    tags: find("tags"),
  }
}

/** YYYY-MM-DD, or DD/MM/YYYY as written in the UK. */
export function importDate(value: string) {
  const uk = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/u.exec(value.trim())

  const iso = uk
    ? `${uk[3]}-${uk[2].padStart(2, "0")}-${uk[1].padStart(2, "0")}`
    : value.trim()

  return parseIsoDate(iso) ? iso : null
}

function findOwner(
  value: string,
  members: Member[],
  emails: Map<string, string>,
) {
  const wanted = normal(value)

  return members.find(
    (member) =>
      normal(member.name) === wanted ||
      emails.get(member.id) === wanted ||
      normal(member.name.split(" ")[0]) === wanted,
  )
}

export function reviewImport(
  rows: string[][],
  mapping: ColumnMapping,
  context: {
    members: Member[]
    emails: Map<string, string>
    defaultOwnerId: string
    existingNames: string[]
  },
): ImportRow[] {
  const taken = new Set(context.existingNames.map(normal))

  const cell = (row: string[], field: ImportField) => {
    const index = mapping[field]

    return index === null ? "" : (row[index] ?? "").trim()
  }

  return rows.map((row, index) => {
    const errors: string[] = []
    const name = cell(row, "name")
    const due = cell(row, "dueDate")
    const owner = cell(row, "owner")
    const dueDate = due ? importDate(due) : null

    const member = owner
      ? findOwner(owner, context.members, context.emails)
      : null

    if (!name) errors.push("Add a project name.")
    else if (taken.has(normal(name)))
      errors.push(`A project called “${name}” already exists.`)

    if (!due) errors.push("Add a due date.")
    else if (!dueDate) errors.push(`“${due}” is not a date. Use YYYY-MM-DD.`)

    if (owner && !member) errors.push(`No active member called “${owner}”.`)

    if (name) taken.add(normal(name))

    return {
      line: index + 2,
      name,
      ownerId: member?.id ?? context.defaultOwnerId,
      ownerText: owner,
      dueDate: dueDate ?? "",
      description: cell(row, "description"),
      tags: [
        ...new Set(
          cell(row, "tags")
            .split(/[;|]/u)
            .map((tag) => tag.trim())
            .filter(Boolean),
        ),
      ],
      errors,
    }
  })
}
