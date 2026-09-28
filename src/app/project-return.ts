import { parseSearchWith } from "@tanstack/react-router"
import { parseProjectsSearch } from "./projects-search"
import { parseAnalyticsSearch } from "./analytics-search"
import { parseInboxSearch } from "./inbox-search"
import { parseActivitySearch } from "./activity-search"

const projectsPath = "/app/demo/projects"

const overviewPath = "/app/demo/overview"

interface ProjectReturnInput {
  returnTo?: unknown
}

export function parseProjectReturnSearch(raw: ProjectReturnInput) {
  try {
    return { returnTo: projectReturnTo(String(raw.returnTo ?? "")) }
  } catch {
    // Uncoercible JSON query values open the default results destination.
    return { returnTo: projectsPath }
  }
}

export function projectReturnTo(value: string): string {
  const path = value.split(/[?#]/)[0]

  if (
    path !== projectsPath &&
    path !== overviewPath &&
    path !== "/app/demo/inbox" &&
    path !== "/app/demo/analytics" &&
    path !== "/app/demo/activity"
  )
    return projectsPath
  const url = new URL(value, "https://workspace.local")
  url.searchParams.delete("inspect")

  if (path === "/app/demo/activity") url.searchParams.delete("event")

  return `${url.pathname}${url.search}${url.hash}`
}

export function projectReturnDestination(value: string) {
  const url = new URL(projectReturnTo(value), "https://workspace.local")
  const search = parseSearchWith(JSON.parse)(url.search)
  const hash = url.hash.slice(1)

  if (url.pathname === "/app/demo/activity") {
    return {
      to: "/app/demo/activity",
      search: parseActivitySearch(search),
      hash,
    } as const
  }

  if (url.pathname === "/app/demo/analytics") {
    return {
      to: "/app/demo/analytics",
      search: parseAnalyticsSearch(search),
      hash,
    } as const
  }

  if (url.pathname === "/app/demo/inbox") {
    return {
      to: "/app/demo/inbox",
      search: parseInboxSearch(search),
      hash,
    } as const
  }

  if (url.pathname === overviewPath) {
    const value = url.searchParams.get("period")
    const period = value === "7" ? 7 : value === "30" ? 30 : 14

    return { to: overviewPath, search: { period }, hash } as const
  }

  return {
    to: projectsPath,
    search: parseProjectsSearch(search),
    hash,
  } as const
}

export function resultsLocationKey(href: string) {
  const destination = projectReturnDestination(href)

  // A Sheet query or section anchor does not create a different results view.
  return JSON.stringify([destination.to, destination.search])
}

export function projectReturnLabel(value: string) {
  const path = projectReturnTo(value).split(/[?#]/)[0]

  return `Back to ${path.split("/").at(-1)}`
}
