import { useState } from "react"
import { ListFilter } from "lucide-react"
import { Button } from "@/kit/ui/button"
import { Badge } from "@/kit/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/kit/ui/dialog"
import type { Member } from "@/demo/model"
import type { ProjectQuery } from "./project-query"
import { ProjectQueryForm } from "./project-query-form"

export function AdvancedProjectFilters({
  value,
  members,
  onChange,
}: {
  value?: ProjectQuery
  members: Member[]
  onChange: (value: ProjectQuery | undefined) => void
}) {
  const [open, setOpen] = useState(false)
  const count = value?.conditions.length ?? 0

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            className="advanced-filter-trigger"
            aria-label={
              count
                ? `Advanced filters, ${count} ${count === 1 ? "condition" : "conditions"}`
                : "Advanced filters"
            }
          />
        }
      >
        <ListFilter aria-hidden="true" data-icon="inline-start" />
        Advanced
        {count > 0 && (
          <Badge variant="secondary" className="facet-count" aria-hidden="true">
            {count}
          </Badge>
        )}
      </DialogTrigger>
      <DialogContent className="project-query-dialog" showCloseButton={false}>
        <DialogHeader showCloseButton>
          <DialogTitle>Advanced filters</DialogTitle>
          <DialogDescription>
            Combined with your search, Status and Owner filters.
          </DialogDescription>
        </DialogHeader>
        <ProjectQueryForm
          value={value}
          members={members}
          onCancel={() => setOpen(false)}
          onApply={(query) => {
            onChange(query)
            setOpen(false)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
