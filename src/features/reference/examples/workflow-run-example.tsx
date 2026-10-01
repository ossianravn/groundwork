import { Button } from "@/kit/ui/button"
import {
  WorkflowRunSummary,
  WorkflowStep,
  WorkflowSteps,
} from "@/kit/ai/workflow-run"

export function WorkflowRunExample() {
  return (
    <div className="grid w-full max-w-xl gap-4">
      <WorkflowRunSummary
        status="failed"
        title="Status report"
        meta="Started 10:42 by you"
        description="A step failed. Try it again, or continue without it."
        progress={{ done: 2, total: 5 }}
        current="Read the comments"
      />
      <WorkflowSteps aria-label="Status report steps" className="-mx-3">
        <WorkflowStep
          status="done"
          label="Read the tasks"
          detail="8 open, 7 done this week"
          meta="0.9s"
        />
        <WorkflowStep status="skipped" label="Read the week's activity" />
        <WorkflowStep
          status="failed"
          label="Read the comments"
          detail="The comments didn't load in time."
        >
          <div className="flex flex-wrap gap-2">
            <Button size="sm">Try again</Button>
            <Button size="sm" variant="outline">
              Continue without comments
            </Button>
          </div>
        </WorkflowStep>
        <WorkflowStep status="pending" label="Write the report" />
        <WorkflowStep status="pending" label="Review the report" />
      </WorkflowSteps>
    </div>
  )
}
