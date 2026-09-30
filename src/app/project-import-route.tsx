import { Link } from "@tanstack/react-router"
import { buttonVariants } from "@/kit/ui/button"
import { textDocument } from "@/kit/rich-text/document"
import { ProjectImport } from "@/features/projects/project-import"
import { nextProjectColor } from "@/demo/project-colors"
import { useDemoWorkspace } from "./workspace-context"
import { useRouteFocus } from "./use-route-focus"
import { defaultProjectsSearch } from "./projects-search"

export function ProjectImportRoute() {
  const { demo } = useDemoWorkspace()
  useRouteFocus()

  const emails = new Map(
    demo.memberships.map((member) => [
      member.memberId,
      member.email.toLowerCase(),
    ]),
  )

  return (
    <main
      id="main-content"
      className="page-content project-import-page"
      tabIndex={-1}
    >
      <title>{`Import projects · ${demo.workspace.name}`}</title>
      <div className="project-page-heading">
        <div className="project-page-title">
          <h1>Import projects</h1>
        </div>
      </div>
      <ProjectImport
        members={demo.workspace.members}
        emails={emails}
        defaultOwnerId={demo.workspace.currentUserId}
        existingNames={demo.projects.map((project) => project.name)}
        sample={{
          url: "/samples/projects-import.csv",
          name: "projects-import.csv",
        }}
        // Each ready row goes through the editor's own save, so validation,
        // tags and the Created activity match a project made by hand.
        onImport={(rows) =>
          rows.filter(
            (row, index) =>
              demo.saveProject(
                { kind: "create" },
                {
                  name: row.name,
                  description: textDocument(row.description),
                  ownerId: row.ownerId,
                  dueDate: row.dueDate,
                  color: nextProjectColor(demo.projects.length + index),
                  tags: row.tags,
                  links: [],
                },
                "normal",
                false,
              ).kind === "saved",
          ).length
        }
        projectsLink={
          <Link
            to="/app/demo/projects"
            search={defaultProjectsSearch}
            className={buttonVariants()}
          >
            View projects
          </Link>
        }
      />
    </main>
  )
}
