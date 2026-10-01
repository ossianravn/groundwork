import { TaskPlan } from "@/kit/ai/task-plan"

export function TaskPlanExample() {
  return (
    <div className="grid w-full max-w-xl">
      <TaskPlan
        defaultOpen
        className="mx-5"
        title="Draft a status update for Mobile app"
        note="The assistant's plan for this request"
        tasks={[
          { id: "read", label: "Read the project's week", status: "done" },
          { id: "next", label: "Pick the next open tasks", status: "doing" },
          { id: "write", label: "Write the update", status: "todo" },
          {
            id: "chart",
            label: "Add a burndown chart",
            status: "dropped",
            note: "Charts aren't available in drafts yet",
          },
        ]}
      />
      <div className="h-12 rounded-[calc(var(--radius)*2.25)] border border-border bg-background" />
    </div>
  )
}
