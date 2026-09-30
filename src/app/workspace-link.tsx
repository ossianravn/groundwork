import { Link, useLocation } from "@tanstack/react-router"
import { accessReturnTo } from "./access-search"
import { projectReturnDestination } from "./project-return"
import { returnToOf } from "./workspace-breadcrumbs"
import type { WorkspaceLinkProps } from "@/components/workspace-link"
import { defaultProjectsSearch } from "./projects-search"
import { defaultAnalyticsSearch } from "./analytics-search"
import { defaultInboxSearch } from "./inbox-search"
import { defaultActivitySearch } from "./activity-search"
import { defaultAssistantSearch } from "./assistant-search"

export function WorkspaceLink({ destination, ...props }: WorkspaceLinkProps) {
  const href = useLocation({ select: (location) => location.href })
  const pathname = useLocation({ select: (location) => location.pathname })
  const searchStr = useLocation({ select: (location) => location.searchStr })

  if (destination === "return")
    return (
      <Link {...props} {...projectReturnDestination(returnToOf(searchStr))} />
    )

  if (destination === "project")
    return (
      <Link
        {...props}
        to="/app/demo/projects/$projectId"
        params={{
          projectId: decodeURIComponent(pathname.split("/")[4] ?? ""),
        }}
        search={{ returnTo: returnToOf(searchStr) }}
      />
    )

  if (destination === "activity")
    return (
      <Link {...props} to="/app/demo/activity" search={defaultActivitySearch} />
    )

  if (destination === "analytics")
    return (
      <Link
        {...props}
        to="/app/demo/analytics"
        search={defaultAnalyticsSearch}
      />
    )

  if (destination === "inbox")
    return <Link {...props} to="/app/demo/inbox" search={defaultInboxSearch} />

  if (destination === "assistant")
    return (
      <Link
        {...props}
        to="/app/demo/assistant"
        search={defaultAssistantSearch}
      />
    )

  if (destination === "sign-in") {
    return (
      <Link
        {...props}
        to="/auth/sign-in"
        search={{ returnTo: accessReturnTo(href), token: "" }}
      />
    )
  }

  if (
    destination === "profile" ||
    destination === "appearance" ||
    destination === "notifications" ||
    destination === "workspace"
  ) {
    return <Link {...props} to={`/app/demo/settings/${destination}`} />
  }

  if (destination === "projects") {
    return (
      <Link {...props} to="/app/demo/projects" search={defaultProjectsSearch} />
    )
  }

  return <Link {...props} to="/app/demo/overview" search={{ period: 14 }} />
}
