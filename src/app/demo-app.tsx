import { useCallback, useRef, useState } from "react"
import {
  Outlet,
  useLocation,
  useNavigate,
  useSearch,
} from "@tanstack/react-router"
import { DemoWorkspaceShell } from "./demo-workspace-shell"
import { ProjectDetails } from "@/features/projects/project-details"
import { ProjectSearch } from "@/features/projects/project-search"
import { ThemePanel } from "@/kit/theme/theme-panel"
import { WorkspaceContext } from "./workspace-context"
import { MissingProject } from "@/features/projects/missing-project"
import { parseProjectsSearch } from "./projects-search"
import { ArrowUpRight } from "lucide-react"
import { buttonVariants } from "@/kit/ui/button"
import { ProjectDetailLink, ProjectEditLink } from "./project-detail-link"
import { useDemoState } from "./demo-state"
import { useProjectUndo } from "./use-project-undo"
import { projectReturnTo } from "./project-return"
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
  } = useDemoState()

  const undo = useProjectUndo()
  const navigate = useNavigate()
  const pathname = useLocation({ select: (location) => location.pathname })
  const { inspect } = useSearch({ strict: false })
  const [themeOpen, setThemeOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const projectOpener = useRef<HTMLElement | null>(null)

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

  const selectProject = useCallback(
    (id: string) => {
      rememberProjectOpener()
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

          const returnTo = projectReturnTo(
            window.location.pathname + window.location.search,
          )

          results.rememberFocus(returnTo, projectOpener.current)
          void navigate({
            to: "/app/demo/projects/new",
            search: { returnTo, scenario: "normal" },
          })
        },
      }}
    >
      <DemoWorkspaceShell
        notifications={<Notifications />}
        onCustomize={() => setThemeOpen(true)}
        onSearch={showSearch}
        onHelp={help.show}
        onReset={() => {
          demo.reset()
          access.reset()
          contact.reset()
          drafts.reset()
          files.reset()
          assistant.reset()
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
      <ProjectDetails
        project={selectedProject}
        created={
          inspect === demo.saveNotice?.projectId &&
          demo.saveNotice?.message === "Project created."
        }
        members={demo.workspace.members}
        onClose={() => openInspection(undefined, true)}
        onComplete={undo.completeProject}
        returnFocus={projectReturnFocus}
        detailLink={
          selectedProject && (
            <div className="project-sheet-actions">
              <ProjectDetailLink
                projectId={selectedProject.id}
                className={buttonVariants({ variant: "outline" })}
              >
                Open project
                <ArrowUpRight aria-hidden="true" />
              </ProjectDetailLink>
              <ProjectEditLink
                projectId={selectedProject.id}
                className={buttonVariants({ variant: "outline" })}
              >
                Edit project
              </ProjectEditLink>
            </div>
          )
        }
      />
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
      <ProjectSearch
        open={searchOpen}
        onOpenChange={setSearchOpen}
        projects={demo.projects}
        finalFocus={inspect ? false : undefined}
        onSelect={(id) => {
          openInspection(id)
        }}
        onSearchAll={(q) =>
          void navigate({ to: "/app/demo/search", search: { q, type: "" } })
        }
      />
    </WorkspaceContext>
  )
}
