import { useState } from "react"
import { documentText, textDocument } from "@/kit/rich-text/document"
import { Card } from "@/kit/ui/card"
import { ProjectForm } from "@/features/projects/project-form"
import type { Member } from "@/demo/model"
import type {
  ProjectValues,
  ProjectFieldErrors,
  ProjectSaveResult,
} from "@/demo/project-form"

export function StateCreateProject({
  members,
  onSave,
  onCancel,
}: {
  members: Member[]
  onSave: (values: ProjectValues) => ProjectSaveResult
  onCancel: () => void
}) {
  const [values, setValues] = useState<ProjectValues>({
    name: "",
    description: textDocument(""),
    ownerId: members[0]?.id ?? "",
    dueDate: "",
    tags: [],
    links: [],
  })

  const [errors, setErrors] = useState<ProjectFieldErrors>({})
  const [failure, setFailure] = useState("")

  return (
    <div className="state-editor">
      <h3>New project</h3>
      <Card className="project-editor-card">
        <ProjectForm
          tagOptions={[]}
          values={values}
          members={members}
          errors={errors}
          failure={failure}
          dirty={
            !!values.name ||
            !!documentText(values.description) ||
            !!values.dueDate ||
            values.tags.length > 0 ||
            values.links.length > 0
          }
          creating
          onCancel={onCancel}
          onChange={(field, value) => {
            setValues((current) => ({ ...current, [field]: value }))
            setErrors((current) => ({ ...current, [field]: undefined }))
          }}
          onSave={() => {
            const result = onSave(values)
            setErrors(result.kind === "invalid" ? result.errors : {})
            setFailure(result.kind === "rejected" ? result.message : "")

            return result
          }}
        />
      </Card>
    </div>
  )
}
