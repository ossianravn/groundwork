import type { ReactNode } from "react"
import { Link, getRouteApi } from "@tanstack/react-router"
import { searchGuides } from "@/features/resources/content"
import {
  SearchResults,
  type ResultGroup,
  type ResultItem,
} from "@/features/search/search-results"
import { searchKinds, searchWorkspace } from "@/demo/workspace-search"
import { useDemoWorkspace } from "./workspace-context"
import { useRouteFocus } from "./use-route-focus"
import { ProjectDetailLink } from "./project-detail-link"
import { defaultInboxSearch } from "./inbox-search"

const route = getRouteApi("/app/demo/search")

export function SearchRoute() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { demo } = useDemoWorkspace()
  useRouteFocus()

  const hits = searchWorkspace(search.q, {
    projects: demo.projects,
    tasks: demo.tasks,
    comments: demo.comments,
    messages: demo.inbox.entries,
    people: demo.workspace.people.map((person) => ({
      ...person,
      email: demo.memberships.find((item) => item.memberId === person.id)
        ?.email,
    })),
  })

  const guides = search.q.trim() ? searchGuides(search.q) : []

  const groups: ResultGroup[] = [
    ...Object.entries(searchKinds).map(([kind, label]) => ({
      kind,
      label,
      items: hits.filter((hit) => hit.kind === kind),
    })),
    {
      kind: "help",
      label: "Help",
      items: guides.map((guide) => ({
        id: guide.slug,
        title: guide.title,
        detail: guide.summary,
      })),
    },
  ]

  function title(group: ResultGroup, item: ResultItem, label: ReactNode) {
    const hit = hits.find((entry) => entry.id === item.id)
    const className = "search-result-title"

    if (group.kind === "help")
      return (
        <Link to="/help/$slug" params={{ slug: item.id }} className={className}>
          {label}
        </Link>
      )

    if (group.kind === "message")
      return (
        <Link
          to="/app/demo/inbox"
          search={{ ...defaultInboxSearch, message: item.id }}
          className={className}
        >
          {label}
        </Link>
      )

    if (group.kind === "person")
      return (
        <Link to="/app/demo/settings/team" className={className}>
          {label}
        </Link>
      )

    return (
      <ProjectDetailLink
        projectId={hit?.projectId ?? item.id}
        className={className}
        hash={group.kind === "comment" ? `comment-${item.id}` : undefined}
      >
        {label}
      </ProjectDetailLink>
    )
  }

  return (
    <main id="main-content" className="page-content search-page" tabIndex={-1}>
      <title>{`Search · ${demo.workspace.name}`}</title>
      <h1 className="sr-only">Search</h1>
      <SearchResults
        query={search.q}
        kind={search.type}
        groups={groups}
        renderTitle={title}
        onQueryChange={(q) =>
          void navigate({
            search: (previous) => ({ ...previous, q }),
            replace: true,
          })
        }
        onKindChange={(type) =>
          void navigate({ search: (previous) => ({ ...previous, type }) })
        }
      />
    </main>
  )
}
