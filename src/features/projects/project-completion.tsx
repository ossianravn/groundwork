import { Check, RotateCcw } from "lucide-react"
import { Button } from "@/kit/ui/button"
import type { Project } from "@/demo/model"

/**
 * A project's one completion action: Mark complete, which also completes its
 * remaining tasks, or Reopen once it is complete; the status pill beside the
 * name carries the state. The host's toast offers Undo for both. The button
 * stays in place as its label changes, so focus stays on it.
 */
export function ProjectCompletion({
  project,
  onComplete,
  onReopen,
}: {
  project: Project
  onComplete: (id: string) => void
  onReopen: (id: string) => void
}) {
  const completed = project.status === "completed"

  return (
    <>
      <Button
        variant="outline"
        onClick={() =>
          completed ? onReopen(project.id) : onComplete(project.id)
        }
      >
        {completed ? (
          <RotateCcw aria-hidden="true" data-icon="inline-start" />
        ) : (
          <Check aria-hidden="true" data-icon="inline-start" />
        )}
        {completed ? "Reopen" : "Mark complete"}
      </Button>
      <p role="status" className="sr-only">
        {completed ? "Project completed. All tasks are complete." : ""}
      </p>
    </>
  )
}
