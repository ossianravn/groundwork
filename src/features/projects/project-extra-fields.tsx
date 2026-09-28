import { ChevronDown } from "lucide-react"
import { Button } from "@/kit/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/kit/ui/collapsible"
import type { ProjectFieldErrors, ProjectValues } from "@/demo/project-form"
import { ProjectLinkFields } from "./project-link-fields"
import { ProjectTagField } from "./project-tag-field"

export function ProjectExtraFields({
  values,
  tagOptions,
  errors,
  open,
  onOpenChange,
  onChange,
}: {
  values: ProjectValues
  tagOptions: string[]
  errors: ProjectFieldErrors
  open: boolean
  onOpenChange: (open: boolean) => void
  onChange: <K extends keyof ProjectValues>(
    field: K,
    value: ProjectValues[K],
  ) => void
}) {
  return (
    <Collapsible
      open={open}
      onOpenChange={onOpenChange}
      className="project-extra-fields"
    >
      <CollapsibleTrigger
        render={<Button variant="ghost" type="button" />}
        className="project-extras-trigger"
      >
        <ChevronDown aria-hidden="true" /> Tags and links
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="project-extras-content">
          <ProjectTagField
            tags={values.tags}
            options={tagOptions}
            onChange={(tags) => onChange("tags", tags)}
          />
          <ProjectLinkFields
            links={values.links}
            errors={errors.links}
            onChange={(links) => onChange("links", links)}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
