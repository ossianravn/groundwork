import { useRef, useState } from "react"
import { ArrowUpRight, Plus, X } from "lucide-react"
import { Button } from "@/kit/ui/button"
import { Field, FieldError, FieldLabel } from "@/kit/ui/field"
import { Input } from "@/kit/ui/input"
import type { ProjectLink } from "@/demo/model"
import { projectLinkError } from "@/demo/project-links"

/**
 * A project's links, changed in place: each link opens in a new tab and has
 * its own Remove; Add link opens a small form whose Add saves the link.
 */
export function ProjectLinkEditor({
  links,
  onChange,
}: {
  links: ProjectLink[]
  onChange: (links: ProjectLink[]) => void
}) {
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState({ url: "", label: "" })
  const [error, setError] = useState("")
  const list = useRef<HTMLUListElement>(null)
  const addButton = useRef<HTMLButtonElement>(null)

  function close() {
    setAdding(false)
    setDraft({ url: "", label: "" })
    setError("")
    requestAnimationFrame(() => addButton.current?.focus())
  }

  function remove(index: number) {
    const next = links[index + 1] ?? links[index - 1]

    onChange(links.filter((_, position) => position !== index))
    requestAnimationFrame(() =>
      (next
        ? list.current?.querySelector<HTMLElement>(
            `[data-link="${CSS.escape(next.id)}"] button`,
          )
        : addButton.current
      )?.focus(),
    )
  }

  return (
    <div className="project-link-editor">
      {links.length > 0 && (
        <ul ref={list} className="project-links">
          {links.map((link, index) => (
            <li key={link.id} data-link={link.id}>
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                <span>{link.label || link.url}</span>
                <ArrowUpRight aria-hidden="true" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label={`Remove link ${link.label || link.url}`}
                onClick={() => remove(index)}
              >
                <X aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      )}
      {adding ? (
        <form
          className="project-link-form"
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            const link = { id: crypto.randomUUID(), ...draft }
            const message = projectLinkError(link)

            if (!draft.url.trim() || message) {
              setError(message ?? "Enter a complete HTTP or HTTPS URL.")
              document.getElementById("project-new-link-url")?.focus()

              return
            }

            onChange([...links, { ...link, url: link.url.trim() }])
            close()
          }}
        >
          <Field data-invalid={!!error}>
            <FieldLabel htmlFor="project-new-link-url">URL</FieldLabel>
            <Input
              id="project-new-link-url"
              type="url"
              autoComplete="off"
              placeholder="https://"
              autoFocus
              value={draft.url}
              onChange={(event) => {
                setDraft({ ...draft, url: event.target.value })
                setError("")
              }}
              aria-invalid={!!error}
              aria-describedby={error ? "project-new-link-error" : undefined}
            />
            {error && (
              <FieldError id="project-new-link-error">{error}</FieldError>
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor="project-new-link-label">
              Label <span className="text-muted-foreground">(optional)</span>
            </FieldLabel>
            <Input
              id="project-new-link-label"
              autoComplete="off"
              value={draft.label}
              onChange={(event) =>
                setDraft({ ...draft, label: event.target.value })
              }
            />
          </Field>
          <div className="project-inline-actions">
            <Button type="button" variant="ghost" size="sm" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Add link
            </Button>
          </div>
        </form>
      ) : (
        <Button
          ref={addButton}
          variant="ghost"
          size="sm"
          className="project-link-add"
          onClick={() => setAdding(true)}
        >
          <Plus data-icon="inline-start" aria-hidden="true" />
          Add link
        </Button>
      )}
    </div>
  )
}
