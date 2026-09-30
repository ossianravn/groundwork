import { ProjectProgressBar } from "@/components/project-progress-bar"
import { Check } from "lucide-react"
import { Button } from "@/kit/ui/button"
import type { Project } from "@/demo/model"

export function ProjectProgress({
  project,
  onComplete,
}: {
  project: Project
  onComplete: (id: string) => void
}) {
  const percent = project.tasks
    ? Math.round((project.completedTasks / project.tasks) * 100)
    : 0

  return (
    <section
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
        <ProjectProgressBar
          color={project.color}
          value={percent}
          label="Completed tasks"
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
    </section>
  )
}
