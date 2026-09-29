import type { ProjectStatus } from "@/demo/model"
import workspace from "@/demo/data/workspace.json"
import type { ProjectTableState } from "@/features/overview/project-table-state"
import {
  parseProjectQuery,
  type ProjectQuery,
} from "@/features/projects/project-query"

const sortColumns = ["name", "status", "progress", "owner", "dueDate"] as const

type ProjectSort = (typeof sortColumns)[number]

const statuses: ProjectStatus[] = ["in-progress", "in-review", "completed"]

// Router search input is untrusted. Keep its known keys at this decoding boundary.
interface ProjectSearchInput {
  view?: unknown
  q?: unknown
  status?: unknown
  owner?: unknown
  sort?: unknown
  desc?: unknown
  page?: unknown
  pageSize?: unknown
  bulkScenario?: unknown
  advanced?: unknown
}

export interface ProjectsSearch {
  view: ProjectTableState["view"]
  q: string
  status: ProjectStatus[]
  owner: string[]
  sort?: ProjectSort
  desc: boolean
  page: number
  pageSize: number
  bulkScenario?: "partial-failure"
  advanced?: ProjectQuery
}

export const defaultProjectsSearch: ProjectsSearch = {
  view: "table",
  q: "",
  status: [],
  owner: [],
  sort: undefined,
  desc: false,
  page: 1,
  pageSize: 5,
  advanced: undefined,
}

function choices(value: ProjectSearchInput["status"]) {
  // Support both Router's JSON arrays and readable comma-separated query values.
  return new Set(Array.isArray(value) ? value : String(value ?? "").split(","))
}

export function parseProjectsSearch(raw: ProjectSearchInput): ProjectsSearch {
  try {
    const sort = sortColumns.find((id) => id === raw.sort)
    const page = Number(raw.page)
    const pageSize = Number(raw.pageSize)
    const selectedStatuses = choices(raw.status)
    const selectedOwners = choices(raw.owner)

    const result: ProjectsSearch = {
      view:
        raw.view === "grid" || raw.view === "board" || raw.view === "timeline"
          ? raw.view
          : "table",
      q: String(raw.q ?? ""),
      status: statuses.filter((id) => selectedStatuses.has(id)),
      owner: workspace.members.flatMap((member) =>
        selectedOwners.has(member.id) ? [member.id] : [],
      ),
      sort,
      desc: !!sort && (raw.desc === true || raw.desc === "true"),
      page: Number.isSafeInteger(page) && page > 0 ? page : 1,
      pageSize: [5, 10, 20].includes(pageSize) ? pageSize : 5,
      advanced: parseProjectQuery(raw.advanced),
    }

    if (raw.bulkScenario === "partial-failure")
      result.bulkScenario = raw.bulkScenario

    return result
  } catch {
    // Router can decode arbitrary JSON, including objects that cannot coerce
    // to text/numbers. An invalid shared query opens the default results.
    return defaultProjectsSearch
  }
}

export function projectTableState(search: ProjectsSearch): ProjectTableState {
  return {
    view: search.view,
    filters: {
      query: search.q,
      statuses: search.status,
      owners: search.owner,
      advanced: search.advanced,
    },
    sorting: search.sort ? [{ id: search.sort, desc: search.desc }] : [],
    pagination: { pageIndex: search.page - 1, pageSize: search.pageSize },
    columnVisibility: {},
  }
}

export function projectTableSearch(state: ProjectTableState): ProjectsSearch {
  return parseProjectsSearch({
    view: state.view,
    q: state.filters.query,
    status: state.filters.statuses,
    owner: state.filters.owners,
    advanced: state.filters.advanced,
    sort: state.sorting[0]?.id,
    desc: state.sorting[0]?.desc,
    page: state.pagination.pageIndex + 1,
    pageSize: state.pagination.pageSize,
  })
}
