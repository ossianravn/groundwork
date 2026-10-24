import { RotateCcw } from "lucide-react"
import { Badge } from "@/kit/ui/badge"
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/kit/ai/tool"

const input = { status: ["in-progress", "in-review"], dueWithinDays: 14 }

export function ToolExample() {
  return (
    <div className="grid max-w-xl gap-3">
      <Tool>
        <ToolHeader title="Search projects" state="input-available" />
        <ToolContent>
          <ToolInput input={input} />
        </ToolContent>
      </Tool>
      <Tool defaultOpen>
        <ToolHeader title="Search projects" state="output-available" />
        <ToolContent>
          <ToolInput input={input} />
          <ToolOutput
            output={[
              { name: "Website redesign", due: "2026-10-08", openTasks: 27 },
              { name: "Mobile app", due: "2026-09-30", openTasks: 4 },
            ]}
          />
        </ToolContent>
      </Tool>
      {/* The assistant tried again, so this failure reads as Retried. */}
      <Tool>
        <ToolHeader
          title="Export report"
          state="output-error"
          status={
            <Badge variant="outline" className="shrink-0 gap-(--gap-inline)">
              <RotateCcw className="size-3" aria-hidden="true" />
              Retried
            </Badge>
          }
        />
        <ToolContent>
          <ToolInput input={{ format: "csv" }} />
          <ToolOutput errorText="The export service didn't respond within 10 seconds." />
        </ToolContent>
      </Tool>
      <Tool>
        <ToolHeader title="Export report" state="output-available" />
        <ToolContent>
          <ToolInput input={{ format: "csv", timeoutSeconds: 30 }} />
          <ToolOutput output={{ file: "projects-due.csv", rows: 2 }} />
        </ToolContent>
      </Tool>
    </div>
  )
}
