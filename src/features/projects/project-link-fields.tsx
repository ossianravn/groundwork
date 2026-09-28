import { useRef } from "react"
import { Plus, X } from "lucide-react"
import { Button } from "@/kit/ui/button"
import { Field, FieldError, FieldLabel } from "@/kit/ui/field"
import { Input } from "@/kit/ui/input"
import type { ProjectLink } from "@/demo/model"

export function ProjectLinkFields({
  links,
  errors,
  onChange,
}: {
  links: ProjectLink[]
  errors?: Record<string, string>
  onChange: (links: ProjectLink[]) => void
}) {
  const group = useRef<HTMLDivElement>(null)
  const addButton = useRef<HTMLButtonElement>(null)

  function update(id: string, field: "url" | "label", value: string) {
    onChange(
      links.map((link) =>
        link.id === id ? { ...link, [field]: value } : link,
      ),
    )
  }

  return (
    <div ref={group} className="project-link-fields">
      <div className="project-links-heading">
        <h3>Related links</h3>
        <Button
          ref={addButton}
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            const id = crypto.randomUUID()
            onChange([...links, { id, url: "", label: "" }])
            requestAnimationFrame(() =>
              group.current
                ?.querySelector<HTMLInputElement>(`#project-link-${id}`)
                ?.focus(),
            )
          }}
        >
          <Plus aria-hidden="true" /> Add link
        </Button>
      </div>
      {links.map((link, index) => (
        <div key={link.id} className="project-link-row">
          <Field data-invalid={!!errors?.[link.id]}>
            <FieldLabel htmlFor={`project-link-${link.id}`}>URL</FieldLabel>
            <Input
              id={`project-link-${link.id}`}
              type="url"
              autoComplete="off"
              placeholder="https://"
              value={link.url}
              onChange={(event) => update(link.id, "url", event.target.value)}
              aria-invalid={!!errors?.[link.id]}
              aria-describedby={
                errors?.[link.id] ? `project-link-error-${link.id}` : undefined
              }
            />
            {errors?.[link.id] && (
              <FieldError id={`project-link-error-${link.id}`}>
                {errors[link.id]}
              </FieldError>
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor={`project-link-label-${link.id}`}>
              Label <span className="text-muted-foreground">(optional)</span>
            </FieldLabel>
            <Input
              id={`project-link-label-${link.id}`}
              value={link.label}
              onChange={(event) => update(link.id, "label", event.target.value)}
            />
          </Field>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="project-link-remove"
            aria-label={`Remove link ${index + 1}`}
            onClick={() => {
              const next = links[index + 1] ?? links[index - 1]

              if (next)
                group.current
                  ?.querySelector<HTMLInputElement>(`#project-link-${next.id}`)
                  ?.focus()
              else addButton.current?.focus()
              onChange(links.filter((item) => item.id !== link.id))
            }}
          >
            <X aria-hidden="true" />
          </Button>
        </div>
      ))}
    </div>
  )
}
