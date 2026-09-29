import workspace from "@/demo/data/workspace.json"
import { defaultProjectsSearch, type ProjectsSearch } from "./projects-search"

/** What a saved view restores: filters, sort and layout, not the page. */
export type SavedViewSearch = Pick<
  ProjectsSearch,
  "view" | "q" | "status" | "owner" | "sort" | "desc" | "advanced"
>

export interface SavedView {
  id: string
  name: string
  search: SavedViewSearch
  /** Team views that ship with the workspace cannot be deleted. */
  builtIn: boolean
}

export const builtInViews: SavedView[] = [
  {
    id: "my-open-work",
    name: "My open work",
    builtIn: true,
    search: {
      ...defaultProjectsSearch,
      owner: [workspace.currentUserId],
      status: ["in-progress", "in-review"],
      sort: "dueDate",
    },
  },
  {
    id: "in-review",
    name: "Waiting for review",
    builtIn: true,
    search: { ...defaultProjectsSearch, status: ["in-review"], view: "grid" },
  },
  {
    id: "delivery-timeline",
    name: "Delivery timeline",
    builtIn: true,
    search: {
      ...defaultProjectsSearch,
      status: ["in-progress", "in-review"],
      sort: "dueDate",
      view: "timeline",
    },
  },
]

export function savedViewSearch(search: ProjectsSearch): SavedViewSearch {
  const { view, q, status, owner, sort, desc, advanced } = search

  return { view, q, status, owner, sort, desc, advanced }
}

/** Two searches show the same view when their saved parts agree. */
export function sameView(a: SavedViewSearch, b: SavedViewSearch) {
  const key = (search: SavedViewSearch) =>
    JSON.stringify([
      search.view,
      search.q.trim(),
      [...search.status].sort(),
      [...search.owner].sort(),
      search.sort ?? null,
      search.sort ? search.desc : false,
      search.advanced ?? null,
    ])

  return key(a) === key(b)
}

export function viewNameError(name: string, views: SavedView[]) {
  const trimmed = name.trim()

  if (!trimmed) return "Name the view."

  if (views.some((view) => view.name.toLowerCase() === trimmed.toLowerCase()))
    return "A view with this name already exists."

  return ""
}
