import { FolderKanban, Plus } from "lucide-react"
import { Card } from "@/kit/ui/card"
import { Button } from "@/kit/ui/button"
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyContent,
  EmptyDescription,
  EmptyMedia,
} from "@/kit/ui/empty"

export function EmptyProjects({ onCreate }: { onCreate: () => void }) {
  return (
    <Card
      id="projects"
      role="region"
      aria-labelledby="projects-heading"
      tabIndex={-1}
    >
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FolderKanban aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>
            <h2 id="projects-heading">No projects yet</h2>
          </EmptyTitle>
          <EmptyDescription>
            A project holds the tasks, files and conversation for one piece of
            work. Start one here, or bring a spreadsheet in with Import.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={onCreate}>
            <Plus aria-hidden="true" />
            Create your first project
          </Button>
        </EmptyContent>
      </Empty>
    </Card>
  )
}
