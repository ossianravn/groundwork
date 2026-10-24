import { useRef, useState } from "react"
import { FolderX, LockKeyhole, ServerCrash } from "lucide-react"
import { Button } from "@/kit/ui/button"
import { Card } from "@/kit/ui/card"
import { Skeleton } from "@/kit/ui/skeleton"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/kit/ui/empty"
import { useWorkspace } from "@/demo/use-workspace"
import { useProjectDrafts } from "@/demo/use-project-drafts"
import { ProjectsTableView } from "@/features/overview/projects-table"
import { initialProjectTableState } from "@/features/overview/project-table-state"
import { ProjectQuickView } from "@/features/projects/project-quick-view"
import { projectRecord } from "@/features/projects/project-record"
import { StateCreateProject } from "./state-create-project"
import type { StateScenario } from "./state-catalog"

const failures = {
  forbidden: {
    title: "You don’t have access to this project",
    description: "Return to the projects available in your workspace.",
    action: "Back to projects",
    Icon: LockKeyhole,
  },
  "not-found": {
    title: "Project not found",
    description: "This project may have been removed or its link changed.",
    action: "Back to projects",
    Icon: FolderX,
  },
  "server-error": {
    title: "Projects couldn’t load",
    description: "Try the request again. Your projects haven’t changed.",
    action: "Try again",
    Icon: ServerCrash,
  },
}

export function StateProjects({ scenario }: { scenario: StateScenario }) {
  const demo = useWorkspace()
  const drafts = useProjectDrafts()
  const [resolved, setResolved] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createdIds, setCreatedIds] = useState<string[]>([])
  const [selected, setSelected] = useState("")

  const [table, setTable] = useState({
    ...initialProjectTableState,
    filters: {
      ...initialProjectTableState.filters,
      query: scenario === "no-results" ? "Untitled expedition" : "",
    },
  })

  const surface = useRef<HTMLDivElement>(null)
  const selectedProject = demo.projects.find((item) => item.id === selected)
  const opener = useRef<HTMLElement | null>(null)

  const projects =
    scenario === "first-use"
      ? demo.projects.filter((project) => createdIds.includes(project.id))
      : demo.projects

  const failure =
    scenario === "forbidden" ||
    scenario === "not-found" ||
    scenario === "server-error"
      ? failures[scenario]
      : null

  function focusResults() {
    requestAnimationFrame(() => surface.current?.focus({ preventScroll: true }))
  }

  function resolve() {
    setResolved(true)
    focusResults()
  }

  return (
    <>
      {scenario === "loading" && (
        <div className="state-simulation-control">
          <span>Request simulation</span>
          <Button
            size="sm"
            variant="outline"
            disabled={resolved}
            onClick={resolve}
          >
            {resolved ? "Resolved" : "Resolve request"}
          </Button>
        </div>
      )}
      <div
        ref={surface}
        tabIndex={-1}
        className="state-results"
        aria-label="Project results"
        aria-busy={scenario === "loading" && !resolved}
      >
        {creating ? (
          <StateCreateProject
            members={demo.workspace.members}
            onCancel={() => {
              setCreating(false)
              focusResults()
            }}
            onSave={(values) => {
              const result = demo.saveProject(
                { kind: "create" },
                values,
                "normal",
              )

              if (result.kind === "saved") {
                setCreatedIds((ids) => [...ids, result.projectId])
                setCreating(false)
                focusResults()
              }

              return result
            }}
          />
        ) : scenario === "loading" && !resolved ? (
          <Card className="state-loading">
            <h3>Projects</h3>
            <span className="sr-only">Loading projects</span>
            <div aria-hidden="true" className="state-loading-rows">
              <Skeleton className="state-loading-search" />
              {[0, 1, 2, 3, 4].map((row) => (
                <div key={row}>
                  <Skeleton />
                  <Skeleton />
                  <Skeleton />
                </div>
              ))}
            </div>
          </Card>
        ) : failure && !resolved ? (
          <Card className="state-message">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <failure.Icon />
                </EmptyMedia>
                <EmptyTitle>{failure.title}</EmptyTitle>
                <EmptyDescription>{failure.description}</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={resolve}>{failure.action}</Button>
              </EmptyContent>
            </Empty>
          </Card>
        ) : (
          <ProjectsTableView
            projects={projects}
            members={demo.workspace.members}
            state={table}
            onChange={setTable}
            onNewProject={() => {
              setCreating(true)
              requestAnimationFrame(() =>
                document.getElementById("edit-project-name")?.focus(),
              )
            }}
            onSelect={(id) => {
              opener.current =
                document.activeElement instanceof HTMLElement
                  ? document.activeElement
                  : null
              setSelected(id)
            }}
          />
        )}
      </div>
      {selectedProject && (
        <ProjectQuickView
          {...projectRecord(demo, drafts, selectedProject)}
          files={null}
          fullPage={null}
          onClose={() => setSelected("")}
          returnFocus={() => opener.current ?? surface.current}
        />
      )}
    </>
  )
}
