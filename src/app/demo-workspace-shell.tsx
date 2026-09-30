import type { ReactNode } from "react"
import { useLocation } from "@tanstack/react-router"
import {
  Activity,
  Bell,
  Building2,
  ChartNoAxesCombined,
  Check,
  CircleHelp,
  FolderKanban,
  Inbox,
  Layers2,
  LayoutDashboard,
  LogOut,
  Palette,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  UserRound,
} from "lucide-react"
import { Button } from "@/kit/ui/button"
import { NavigationHint } from "@/kit/shell/navigation-hint"
import { useNavigationCollapsed } from "@/kit/shell/navigation-collapsed"
import type { AccountMenuItem } from "@/kit/shell/account-menu"
import type { WorkspaceNavigationAction } from "@/kit/shell/workspace-navigation"
import { WorkspaceShell } from "@/kit/shell/workspace-shell"
import { tandemBrand } from "@/components/tandem-brand"
import type { WorkspaceDestination } from "@/components/workspace-link"
import { roleLabels } from "@/demo/team"
import { useDemoState } from "./demo-state"
import { useWorkspaceSwitcher } from "./use-workspace-switcher"
import { WorkspaceLink } from "./workspace-link"

const accountItems: AccountMenuItem<WorkspaceDestination>[] = [
  { destination: "profile", label: "Profile", icon: UserRound },
  { destination: "appearance", label: "Appearance", icon: Palette },
  { destination: "notifications", label: "Notifications", icon: Bell },
  {
    destination: "workspace",
    label: "Workspace settings",
    icon: Building2,
    separated: true,
  },
  { destination: "sign-in", label: "Sign out", icon: LogOut, separated: true },
]

// The search shortcut hint follows the visitor's platform.
const modifierKey =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad/.test(navigator.userAgent)
    ? "⌘"
    : "Ctrl"

const settingsPages = new Map([
  ["profile", "Profile"],
  ["appearance", "Appearance"],
  ["notifications", "Notifications"],
  ["security", "Security"],
  ["workspace", "Workspace"],
  ["team", "Team"],
  ["api-keys", "API keys"],
  ["webhooks", "Webhooks"],
  ["billing", "Billing"],
])

function currentLocation(
  pathname: string,
  projectName: (path: string) => string,
) {
  if (pathname.startsWith("/app/demo/settings"))
    return {
      page: "Settings",
      item: settingsPages.get(pathname.split("/").at(-1) ?? ""),
    }

  if (pathname.startsWith("/app/demo/projects"))
    return {
      page: "Projects",
      item:
        pathname === "/app/demo/projects/new"
          ? "New project"
          : pathname === "/app/demo/projects/import"
            ? "Import"
            : pathname.startsWith("/app/demo/projects/")
              ? projectName(pathname)
              : undefined,
    }

  const page = {
    "/app/demo/analytics": "Analytics",
    "/app/demo/inbox": "Inbox",
    "/app/demo/assistant": "Assistant",
    "/app/demo/activity": "Activity",
    "/app/demo/search": "Search",
  }[pathname]

  return { page: page ?? "Overview", item: undefined }
}

export function DemoWorkspaceShell({
  children,
  onCustomize,
  onSearch,
  onHelp,
  onReset,
  notifications,
}: {
  children: ReactNode
  onCustomize: () => void
  onSearch: () => void
  onHelp: () => void
  onReset: () => void
  notifications: ReactNode
}) {
  const { demo } = useDemoState()
  const switcher = useWorkspaceSwitcher(onReset)
  const pathname = useLocation({ select: (location) => location.pathname })

  const member = demo.workspace.members.find(
    (item) => item.id === demo.workspace.currentUserId,
  )

  if (!member) throw new Error("The demo workspace has no current member")

  const { page, item } = currentLocation(
    pathname,
    (path) =>
      demo.projects.find((project) =>
        [
          `/app/demo/projects/${encodeURIComponent(project.id)}`,
          `/app/demo/projects/${encodeURIComponent(project.id)}/edit`,
        ].includes(path),
      )?.name ?? "Project unavailable",
  )

  const projectCount = demo.projects.length
  const unread = demo.inbox.unreadCount

  const actions: WorkspaceNavigationAction[] = [
    { id: "help", label: "Help", icon: CircleHelp, onSelect: onHelp },
    {
      id: "appearance",
      label: "Appearance",
      icon: SlidersHorizontal,
      onSelect: onCustomize,
    },
    {
      id: "source",
      label: "Template source",
      icon: Layers2,
      href: "https://github.com/ossianravn/groundwork",
    },
  ]

  return (
    <>
      {switcher.dialog}
      <WorkspaceShell
        LinkComponent={WorkspaceLink}
        brand={tandemBrand}
        home={{ destination: "overview", label: "Tandem overview" }}
        workspace={{
          name: demo.workspace.name,
          detail: demo.workspace.plan,
          logo: demo.workspace.logo,
          switcher: switcher.options,
        }}
        navigationLabel="Workspace"
        items={[
          {
            id: "Overview",
            destination: "overview",
            label: "Overview",
            icon: LayoutDashboard,
          },
          {
            id: "Projects",
            destination: "projects",
            label: "Projects",
            icon: FolderKanban,
            count: projectCount,
            accessibleLabel: `Projects (${projectCount})`,
          },
          {
            id: "Inbox",
            destination: "inbox",
            label: "Inbox",
            icon: Inbox,
            count: unread || undefined,
            accessibleLabel: `Inbox (${unread} unread)`,
          },
          {
            id: "Assistant",
            destination: "assistant",
            label: "Assistant",
            icon: Sparkles,
          },
          {
            id: "Analytics",
            destination: "analytics",
            label: "Analytics",
            icon: ChartNoAxesCombined,
          },
          {
            id: "Activity",
            destination: "activity",
            label: "Activity",
            icon: Activity,
          },
        ]}
        currentItem={page}
        actions={actions}
        notice={<DemoNotice resetDone={demo.resetDone} onReset={onReset} />}
        account={{
          person: member,
          detail:
            roleLabels[
              demo.memberships.find((entry) => entry.memberId === member.id)
                ?.role ?? "member"
            ],
          items: accountItems,
        }}
        breadcrumbs={[
          { label: demo.workspace.name },
          {
            label: page,
            destination: page === "Settings" ? "profile" : "projects",
          },
          ...(item ? [{ label: item }] : []),
        ]}
        search={{
          label: "Find a project…",
          accessibleLabel: "Find a project",
          keyShortcuts: "Control+k Meta+k",
          hint: [modifierKey, "K"],
          onOpen: onSearch,
        }}
        topbarActions={notifications}
        onCustomize={onCustomize}
      >
        {children}
      </WorkspaceShell>
    </>
  )
}

function DemoNotice({
  resetDone,
  onReset,
}: {
  resetDone: boolean
  onReset: () => void
}) {
  const collapsed = useNavigationCollapsed()

  return (
    <div className="demo-note">
      <span className="demo-indicator navigation-label" aria-hidden="true" />
      <span role="status" className={collapsed ? "sr-only" : undefined}>
        {resetDone ? "Demo data reset" : "Demo data"}
      </span>
      <NavigationHint
        label={
          resetDone
            ? "Demo data reset. Reset again"
            : "Reset demo data. Changes also reset when you reload."
        }
      >
        <Button
          variant="ghost"
          size="xs"
          onClick={onReset}
          aria-label="Reset demo data"
        >
          {collapsed && resetDone ? (
            <Check aria-hidden="true" />
          ) : (
            <RotateCcw data-icon="inline-start" aria-hidden="true" />
          )}
          <span className="navigation-label">Reset</span>
        </Button>
      </NavigationHint>
    </div>
  )
}
