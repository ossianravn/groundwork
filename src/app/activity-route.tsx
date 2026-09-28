import { useNavigate, useSearch } from "@tanstack/react-router"
import { Button, buttonVariants } from "@/kit/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/kit/ui/card"
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/kit/ui/empty"
import { filterActivity } from "@/demo/activity"
import { ActivityFilters } from "@/features/activity/activity-filters"
import { ActivityTimeline } from "@/features/activity/activity-timeline"
import { ActivityDetail } from "@/features/activity/activity-detail"
import { useDemoWorkspace } from "./workspace-context"
import { useRouteFocus } from "./use-route-focus"
import { ProjectDetailLink } from "./project-detail-link"
import { defaultActivitySearch } from "./activity-search"

export function ActivityRoute() {
  const { demo, rememberProjectOpener } = useDemoWorkspace()
  const search = useSearch({ from: "/app/demo/activity" })
  const navigate = useNavigate()
  useRouteFocus()

  const events = filterActivity(
    demo.activity,
    demo.projects,
    demo.workspace.people,
    search,
    demo.workspace.referenceDate,
  )

  const visible = events.slice(0, search.page * 10)
  const event = demo.activity.find((item) => item.id === search.event)
  const project = demo.projects.find((item) => item.id === event?.projectId)
  const filtered = !!(search.q || search.member || search.kind || search.period)

  function clear() {
    document.getElementById("activity-query")?.focus()
    void navigate({
      to: "/app/demo/activity",
      search: defaultActivitySearch,
      resetScroll: false,
    })
  }

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="page-content activity-page"
    >
      <title>{`Activity · ${demo.workspace.name}`}</title>
      <h1 className="sr-only">Activity</h1>
      <Card className="activity-feed-card">
        <CardHeader className="activity-feed-toolbar">
          <ActivityFilters
            value={search}
            people={demo.workspace.people}
            onChange={(filters) => {
              void navigate({
                to: "/app/demo/activity",
                search: { ...filters, page: 1, event: "" },
                replace: true,
                resetScroll: false,
              })
            }}
          />
          <CardAction>
            <span className="count-chip" role="status">
              {events.length} {events.length === 1 ? "event" : "events"}
            </span>
          </CardAction>
        </CardHeader>
        <CardContent>
          {events.length ? (
            <ActivityTimeline
              events={visible}
              people={demo.workspace.people}
              projects={demo.projects}
              renderProject={(project, eventId) => (
                <ProjectDetailLink
                  id={`activity-link-${eventId}`}
                  projectId={project.id}
                  className="activity-project-link"
                >
                  {project.name}
                </ProjectDetailLink>
              )}
              onDetails={(event) => {
                rememberProjectOpener()
                void navigate({
                  to: "/app/demo/activity",
                  search: { ...search, event: event.id },
                  resetScroll: false,
                })
              }}
            />
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>
                  {filtered ? "No matching events" : "No activity yet"}
                </EmptyTitle>
                <EmptyDescription>
                  {filtered
                    ? "Try another filter or search."
                    : "Project changes will appear here."}
                </EmptyDescription>
              </EmptyHeader>
              {filtered && (
                <EmptyContent>
                  <Button variant="outline" onClick={clear}>
                    Clear filters
                  </Button>
                </EmptyContent>
              )}
            </Empty>
          )}
        </CardContent>
        {visible.length < events.length && (
          <CardFooter className="justify-center">
            <Button
              variant="ghost"
              onClick={() => {
                void navigate({
                  to: "/app/demo/activity",
                  search: { ...search, page: search.page + 1 },
                  resetScroll: false,
                })
              }}
            >
              Load more
            </Button>
          </CardFooter>
        )}
      </Card>
      <ActivityDetail
        event={event}
        open={!!search.event}
        people={demo.workspace.people}
        projectName={project?.name ?? "an unavailable project"}
        projectLink={
          project && (
            <ProjectDetailLink
              projectId={project.id}
              className={buttonVariants({ variant: "outline" })}
            >
              Open project
            </ProjectDetailLink>
          )
        }
        onClose={() => {
          void navigate({
            to: "/app/demo/activity",
            search: { ...search, event: "" },
            replace: true,
            resetScroll: false,
          })
        }}
      />
    </main>
  )
}
