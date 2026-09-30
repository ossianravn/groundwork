import { parseSearchWith } from "@tanstack/react-router"
import type { Breadcrumb } from "@/kit/shell/workspace-shell"
import type { WorkspaceDestination } from "@/components/workspace-link"
import { parseProjectReturnSearch, projectReturnPage } from "./project-return"

const settingsPages = new Map([
  ["profile", "Profile"],
  ["appearance", "Appearance"],
  ["notifications", "Notifications"],
  ["security", "Security"],
  ["workspace", "Workspace"],
  ["team", "Team"],
  ["assistant", "Assistant"],
  ["api-keys", "API keys"],
  ["webhooks", "Webhooks"],
  ["billing", "Billing"],
])

const sectionPages = new Map([
  ["/app/demo/analytics", "Analytics"],
  ["/app/demo/inbox", "Inbox"],
  ["/app/demo/assistant", "Assistant"],
  ["/app/demo/activity", "Activity"],
  ["/app/demo/search", "Search"],
])

/** The sidebar section a location belongs to and the top bar's trail. */
export interface WorkspaceLocation {
  page: string
  breadcrumbs: Breadcrumb<WorkspaceDestination>[]
}

/** Where a project page, editor or new project was opened from. */
export function returnToOf(searchStr: string) {
  return parseProjectReturnSearch(parseSearchWith(JSON.parse)(searchStr))
    .returnTo
}

/**
 * The section the sidebar marks, and the trail the top bar shows. Project
 * records replace the old in-page back links: their parent crumb names the
 * page they were opened from (the Projects list, or Overview, Inbox, the
 * Assistant…) and returns to it exactly, and the editor's trail links back
 * to the project.
 */
export function workspaceLocation({
  pathname,
  searchStr,
  workspaceName,
  projectName,
}: {
  pathname: string
  searchStr: string
  workspaceName: string
  projectName: (path: string) => string
}): WorkspaceLocation {
  const root = { label: workspaceName }

  if (pathname.startsWith("/app/demo/settings")) {
    const item = settingsPages.get(pathname.split("/").at(-1) ?? "")

    return {
      page: "Settings",
      breadcrumbs: [
        root,
        { label: "Settings", destination: "profile" },
        ...(item ? [{ label: item }] : []),
      ],
    }
  }

  if (pathname.startsWith("/app/demo/projects")) {
    const projects = { label: "Projects", destination: "projects" } as const
    const record = pathname.slice("/app/demo/projects".length)

    if (!record || record === "/import")
      return {
        page: "Projects",
        breadcrumbs: record
          ? [root, projects, { label: "Import" }]
          : [root, projects],
      }

    const origin = {
      label: projectReturnPage(returnToOf(searchStr)),
      destination: "return",
    } as const

    if (record === "/new")
      return {
        page: "Projects",
        breadcrumbs: [root, origin, { label: "New project" }],
      }

    const name = projectName(pathname)

    return {
      page: "Projects",
      breadcrumbs: record.endsWith("/edit")
        ? [
            root,
            origin,
            { label: name, destination: "project" },
            { label: "Edit" },
          ]
        : [root, origin, { label: name }],
    }
  }

  const page = sectionPages.get(pathname) ?? "Overview"

  return {
    page,
    breadcrumbs: [root, { label: page, destination: "projects" }],
  }
}
