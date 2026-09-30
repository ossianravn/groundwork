import { Check } from "lucide-react"
import { Button } from "@/kit/ui/button"
import { ProjectProgressBar } from "@/components/project-progress-bar"
import type { Project } from "@/demo/model"

/**
 * Task progress and Mark complete for the project page's title row: the
 * count, a short bar in the project's colour, and the action. Marking
 * complete also completes the remaining tasks; the host's Undo toast is the
 * way back, and the action stays focusable once done.
 */
export function ProjectHeaderProgress({
  project,
  onComplete,
}: {
  project: Project
  onComplete: (id: string) => void
}) {
  const completed = project.status === "completed"

  const percent = project.tasks
    ? Math.round((project.completedTasks / project.tasks) * 100)
    : 0

  return (
    <>
      <div className="project-header-progress">
        <p>
          <strong>{project.completedTasks}</strong> of {project.tasks} tasks
        </p>
        {project.tasks > 0 && (
          <ProjectProgressBar
            color={project.color}
            value={percent}
            label="Completed tasks"
          />
        )}
        <span className="project-header-percent">
          {project.tasks ? `${percent}%` : "No tasks"}
        </span>
      </div>
      <Button
        variant="outline"
        disabled={completed}
        focusableWhenDisabled
        onClick={() => onComplete(project.id)}
      >
        <Check aria-hidden="true" data-icon="inline-start" />
        {completed ? "Completed" : "Mark complete"}
      </Button>
      <p role="status" className="sr-only">
        {completed ? "Project completed. All tasks are complete." : ""}
      </p>
    </>
  )
}
