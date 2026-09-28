import { Check } from "lucide-react"
import { projectColorStyle } from "@/components/project-color"
import { Button } from "@/kit/ui/button"
import { Card } from "@/kit/ui/card"
import type { Project } from "@/demo/model"

export function ProjectProgress({
  project,
  onComplete,
  standalone = false,
}: {
  project: Project
  onComplete: (id: string) => void
  standalone?: boolean
}) {
  const percent = project.tasks
    ? Math.round((project.completedTasks / project.tasks) * 100)
    : 0

  const Surface = standalone ? Card : "section"

  return (
    <Surface
      className="project-progress"
      role="region"
      aria-label="Task progress"
    >
      <div className="project-progress-heading">
        <div>
          <p className="project-progress-count">
            {project.completedTasks}
            <span> / {project.tasks}</span>
          </p>
          <p className="text-muted-foreground">tasks completed</p>
        </div>
        <span className="project-progress-percent">
          {project.tasks ? `${percent}%` : "No tasks"}
        </span>
      </div>
      {project.tasks > 0 && (
        <progress
          value={percent}
          max={100}
          aria-label="Completed tasks"
          style={projectColorStyle(project.color)}
        />
      )}
      <div className="project-completion">
        <p role="status" className="panel-feedback">
          {project.status === "completed"
            ? "Project completed. All tasks are complete."
            : "Marking complete also completes any remaining tasks."}
        </p>
        <Button
          disabled={project.status === "completed"}
          focusableWhenDisabled
          onClick={() => onComplete(project.id)}
        >
          <Check data-icon="inline-start" aria-hidden="true" />
          {project.status === "completed"
            ? "Project completed"
            : "Mark complete"}
        </Button>
      </div>
    </Surface>
  )
}
