import { Check, Circle, CircleDot } from "lucide-react"
import { Badge } from "@/kit/ui/badge"
import { statusLabels, type ProjectStatus as Status } from "@/demo/model"

export function ProjectStatus({ status }: { status: Status }) {
  const Icon =
    status === "completed" ? Check : status === "in-review" ? CircleDot : Circle

  return (
    <Badge variant="secondary" className="status-badge" data-status={status}>
      <Icon data-icon="inline-start" aria-hidden="true" />
      {statusLabels[status]}
    </Badge>
  )
}
