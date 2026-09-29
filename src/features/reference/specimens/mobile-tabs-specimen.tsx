import type { ReactNode } from "react"
import { Activity, FolderKanban, Inbox, LayoutDashboard } from "lucide-react"
import { BottomTabBar, type BottomTab } from "@/kit/shell/bottom-tab-bar"
import type { ShellLinkComponent } from "@/kit/shell/shell-link"
import { formatDate, projectStatuses, statusLabels } from "@/demo/model"
import projects from "@/demo/data/projects.json"
import inbox from "@/demo/data/inbox.json"
import activity from "@/demo/data/activity.json"
import workspace from "@/demo/data/workspace.json"

export type SpecimenTab = "overview" | "projects" | "inbox" | "activity"

const unread = inbox.filter((message) => !message.read)

const tabs: BottomTab<SpecimenTab>[] = [
  { destination: "overview", label: "Overview", icon: LayoutDashboard },
  { destination: "projects", label: "Projects", icon: FolderKanban },
  {
    destination: "inbox",
    label: "Inbox",
    icon: Inbox,
    badge: { count: unread.length, label: `${unread.length} unread` },
  },
  { destination: "activity", label: "Activity", icon: Activity },
]

const person = (id: string) =>
  workspace.members.find((member) => member.id === id)?.name ?? "Former member"

const project = (id: string) =>
  projects.find((item) => item.id === id)?.name ?? "a project"

function statusLabel(status: string) {
  const known = projectStatuses.find((item) => item === status)

  return known ? statusLabels[known] : status
}

function Rows({
  items,
}: {
  items: { id: string; title: string; meta: string }[]
}) {
  return (
    <ul className="specimen-rows">
      {items.map((item) => (
        <li key={item.id}>
          <span>{item.title}</span>
          <span>{item.meta}</span>
        </li>
      ))}
    </ul>
  )
}

const pages: Record<SpecimenTab, () => ReactNode> = {
  overview: () => (
    <>
      <p className="specimen-lead">
        {projects.filter((item) => item.status !== "completed").length} active
        projects · {unread.length} unread messages
      </p>
      <h2>Due next</h2>
      <Rows
        items={[...projects]
          .filter((item) => item.status !== "completed")
          .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
          .map((item) => ({
            id: item.id,
            title: item.name,
            meta: formatDate(item.dueDate),
          }))}
      />
    </>
  ),
  projects: () => (
    <Rows
      items={projects.map((item) => ({
        id: item.id,
        title: item.name,
        meta: statusLabel(item.status),
      }))}
    />
  ),
  inbox: () => (
    <Rows
      items={inbox.map((message) => ({
        id: message.id,
        title: message.title,
        meta: person(message.memberId),
      }))}
    />
  ),
  activity: () => (
    <Rows
      items={[...activity]
        .reverse()
        .slice(0, 12)
        .map((event) => ({
          id: event.id,
          title: `${person(event.memberId)} ${event.action} ${project(event.projectId)}`,
          meta: formatDate(event.date),
        }))}
    />
  ),
}

// NAV-07 specimen: the workspace as a phone shell with a bottom tab bar.
// Tabs are links, so Back and deep links work; the demo keeps its sidebar.
export function MobileTabsSpecimen({
  tab,
  LinkComponent,
  note,
}: {
  tab: SpecimenTab
  LinkComponent: ShellLinkComponent<SpecimenTab>
  /** What this specimen is, with a way back to the catalogue. */
  note: ReactNode
}) {
  const title = tabs.find((item) => item.destination === tab)?.label

  return (
    <div className="specimen-phone">
      <div className="specimen-note">{note}</div>
      <header className="specimen-phone-header">
        <p>{workspace.name}</p>
        <h1>{title}</h1>
      </header>
      <main id="main-content" tabIndex={-1} className="specimen-phone-main">
        {pages[tab]()}
      </main>
      <BottomTabBar items={tabs} current={tab} LinkComponent={LinkComponent} />
    </div>
  )
}
