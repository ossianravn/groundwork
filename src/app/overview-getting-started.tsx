import { Link } from "@tanstack/react-router"
import { buttonVariants } from "@/kit/ui/button"
import { GettingStarted } from "@/features/overview/getting-started"
import { useDemoState } from "./demo-state"

const action = buttonVariants({ variant: "outline", size: "sm" })

/**
 * Shown on Overview after a workspace is created through onboarding, until
 * it is hidden. Each step reads the workspace records, so it ticks itself.
 */
export function OverviewGettingStarted() {
  const { demo, access, results } = useDemoState()

  if (access.onboarding.step !== "complete" || results.gettingStartedHidden)
    return null

  const first = demo.projects.at(-1)

  const teammates =
    demo.invitations.length > 0 ||
    demo.memberships.filter((member) => member.active).length > 1

  const projectLink = (label: string, hash?: string) =>
    first ? (
      <Link
        to="/app/demo/projects/$projectId"
        params={{ projectId: first.id }}
        search={{ returnTo: "/app/demo/overview" }}
        hash={hash}
        className={action}
      >
        {label}
      </Link>
    ) : null

  return (
    <GettingStarted
      onDismiss={() => {
        results.setGettingStartedHidden(true)
        // The Hide button leaves with the list; continue from the page.
        requestAnimationFrame(() =>
          document.getElementById("main-content")?.focus(),
        )
      }}
      steps={[
        {
          id: "project",
          label: "Create your first project",
          description: "Start one by hand or import a spreadsheet.",
          done: demo.projects.length > 0,
          action: (
            <Link
              to="/app/demo/projects/new"
              search={{ returnTo: "/app/demo/overview", scenario: "normal" }}
              className={action}
            >
              New project
            </Link>
          ),
        },
        {
          id: "tasks",
          label: "Break it into tasks",
          description: "Tasks drive the project's progress.",
          done: demo.tasks.length > 0,
          action: projectLink("Add tasks"),
        },
        {
          id: "team",
          label: "Invite your team",
          description: "Owners, admins, members and viewers.",
          done: teammates,
          action: (
            <Link to="/app/demo/settings/team" className={action}>
              Invite people
            </Link>
          ),
        },
        {
          id: "comment",
          label: "Start a conversation",
          description: "Comment on a project and @mention a teammate.",
          done: demo.comments.length > 0,
          action: projectLink("Comment", "comment-draft"),
        },
      ]}
    />
  )
}
