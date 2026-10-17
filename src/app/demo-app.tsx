import { useCallback, useRef, useState } from "react"
import {
  Outlet,
  useLocation,
  useNavigate,
  useSearch,
} from "@tanstack/react-router"
import { DemoWorkspaceShell } from "./demo-workspace-shell"
import { WorkspaceCommandHost } from "./workspace-command-host"
import { projectReturnTo } from "./project-return"
import { ThemePanel } from "@/kit/theme/theme-panel"
import { WorkspaceContext } from "./workspace-context"
import { MissingProject } from "@/features/projects/missing-project"
import { parseProjectsSearch } from "./projects-search"
import { useDemoState } from "./demo-state"
import { ProjectQuickViewHost } from "./project-quick-view-host"
import { quickViewList } from "./quick-view-list"
import { NewProjectHost } from "./new-project-host"
import { Notifications } from "./notifications"
import { WorkspaceHelp } from "@/features/help/workspace-help"
import { useWorkspaceHelp } from "./use-workspace-help"
import { WorkspaceHelpLink } from "./workspace-help-link"

export function DemoApp() {
  const {
    demo,
    access,
    contact,
    appearance,
    results,
    drafts,
    files,
    assistant,
    runs,
  } = useDemoState()

  const navigate = useNavigate()
  const pathname = useLocation({ select: (location) => location.pathname })
  const { inspect, create } = useSearch({ strict: false })
  const [themeOpen, setThemeOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  // The list a project was opened from, for J and K in its quick view.
  const [quickOrder, setQuickOrder] = useState<string[]>([])
  const projectOpener = useRef<HTMLElement | null>(null)

  // Projects opened on their page or in a card's quick view, most recent
  // first, for the command menu.
  const [recent, setRecent] = useState<{ last?: string; ids: string[] }>({
    ids: [],
  })

  const page = /^\/app\/demo\/projects\/([^/]+)$/u.exec(pathname)?.[1]
  const viewed = inspect ?? (page === "import" ? undefined : page)

  if (viewed && viewed !== recent.last)
    setRecent({
      last: viewed,
      ids: [viewed, ...recent.ids.filter((id) => id !== viewed)].slice(0, 5),
    })

  const rememberProjectOpener = useCallback(() => {
    projectOpener.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
  }, [])

  const showSearch = useCallback(() => {
    rememberProjectOpener()
    setSearchOpen(true)
  }, [rememberProjectOpener])

  const help = useWorkspaceHelp(showSearch)

  const openInspection = useCallback(
    (id?: string, replace = false) => {
      void navigate({
        to: ".",
        search: (previous) => ({ ...previous, inspect: id }),
        resetScroll: false,
        replace,
      })
    },
    [navigate],
  )

  // A project's page, returning to where it was opened from.
  const openProjectPage = useCallback(
    (id: string, replace = false) => {
      void navigate({
        to: "/app/demo/projects/$projectId",
        params: { projectId: id },
        search: {
          returnTo: projectReturnTo(
            window.location.pathname + window.location.search,
          ),
        },
        replace,
      })
    },
    [navigate],
  )

  const selectProject = useCallback(
    (id: string) => {
      rememberProjectOpener()
      setQuickOrder(quickViewList())
      openInspection(id)
    },
    [rememberProjectOpener, openInspection],
  )

  function projectReturnFocus() {
    return projectOpener.current?.isConnected
      ? projectOpener.current
      : (results.getFocus(window.location.pathname + window.location.search) ??
          document.getElementById("projects") ??
          document.getElementById("main-content"))
  }

  const selectedProject = demo.projects.find(
    (project) => project.id === inspect,
  )

  return (
    <WorkspaceContext
      value={{
        demo,
        appearance,
        onSelectProject: selectProject,
        rememberProjectOpener,
        results,
        drafts,
        onOpenDetail: (returnTo) => {
          const source = document.querySelector('[role="dialog"]')
            ? projectOpener.current
            : document.activeElement instanceof HTMLElement
              ? document.activeElement
              : null

          if (
            [
              "/app/demo/projects",
              "/app/demo/overview",
              "/app/demo/inbox",
              "/app/demo/analytics",
              "/app/demo/activity",
            ].includes(pathname)
          ) {
            results.rememberFocus(returnTo, source)
          }
        },
        onNewProject: () => {
          rememberProjectOpener()
          void navigate({
            to: ".",
            search: (previous) => ({ ...previous, create: "project" }),
            resetScroll: false,
          })
        },
      }}
    >
      <DemoWorkspaceShell
        search={
          <WorkspaceCommandHost
            open={searchOpen}
            onOpenChange={(open) =>
              open ? showSearch() : setSearchOpen(false)
            }
            recentProjectIds={recent.ids}
            onOpenProject={openProjectPage}
            onShortcuts={() => {
              help.setView("shortcuts")
              help.setOpen(true)
            }}
          />
        }
        notifications={<Notifications />}
        onCustomize={() => setThemeOpen(true)}
        onHelp={help.show}
        onReset={() => {
          demo.reset()
          access.reset()
          contact.reset()
          drafts.reset()
          files.reset()
          assistant.reset()
          runs.reset()
          openInspection(undefined, true)
        }}
      >
        <Outlet />
      </DemoWorkspaceShell>
      <WorkspaceHelp
        open={help.open}
        onOpenChange={help.setOpen}
        view={help.view}
        onViewChange={help.setView}
        pathname={pathname}
        LinkComponent={WorkspaceHelpLink}
      />
      <ThemePanel
        open={themeOpen}
        onOpenChange={setThemeOpen}
        theme={appearance.theme}
        saved={appearance.saved}
        feedback={appearance.feedback}
        onRestore={appearance.restoreDefaults}
        onChange={appearance.updateTheme}
      />
      {create && (
        <NewProjectHost
          demo={demo}
          drafts={drafts}
          scenario={create === "save-failure" ? "save-failure" : "normal"}
          onClose={() =>
            void navigate({
              to: ".",
              search: (previous) => ({ ...previous, create: undefined }),
              resetScroll: false,
              replace: true,
            })
          }
          onCreated={(projectId) => openProjectPage(projectId, true)}
          returnFocus={projectReturnFocus}
        />
      )}
      {selectedProject && (
        <ProjectQuickViewHost
          project={selectedProject}
          order={
            quickOrder.includes(selectedProject.id)
              ? quickOrder
              : demo.projects.map((project) => project.id)
          }
          created={
            inspect === demo.saveNotice?.projectId &&
            demo.saveNotice?.message === "Project created."
          }
          onOpen={(id) => {
            // Closing returns to the project last shown, where it is listed.
            projectOpener.current =
              document.querySelector<HTMLElement>(
                `#main-content [data-quick-view-id="${CSS.escape(id)}"]`,
              ) ?? projectOpener.current
            openInspection(id, true)
          }}
          onClose={() => openInspection(undefined, true)}
          returnFocus={projectReturnFocus}
        />
      )}
      {inspect && !selectedProject && (
        <MissingProject
          onClose={() => openInspection(undefined, true)}
          onReturn={() => {
            void navigate({
              to: "/app/demo/projects",
              search: (previous) => parseProjectsSearch(previous),
              replace: true,
            })
          }}
          returnFocus={projectReturnFocus}
        />
      )}
    </WorkspaceContext>
  )
}
