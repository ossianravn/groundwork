import { useState, useId } from "react"
import { useEditorState, type Editor } from "@tiptap/react"
import { Link2, Unlink } from "lucide-react"
import { Button } from "@/kit/ui/button"
import { Input } from "@/kit/ui/input"
import { Field, FieldLabel, FieldError } from "@/kit/ui/field"
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@/kit/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/kit/ui/tooltip"

export function EditorLink({ editor }: { editor: Editor }) {
  const inputId = useId()
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState("")
  const [error, setError] = useState("")

  const linked = useEditorState({
    editor,
    selector: ({ editor }) => editor.isActive("link"),
  })

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) {
          setUrl(String(editor.getAttributes("link").href ?? ""))
          setError("")
        }

        setOpen(next)
      }}
    >
      <Tooltip>
        <TooltipTrigger
          render={
            <PopoverTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Edit link"
                />
              }
            />
          }
        >
          <Link2 aria-hidden="true" />
        </TooltipTrigger>
        <TooltipContent>Edit link</TooltipContent>
      </Tooltip>
      <PopoverContent
        className="editor-link-popover"
        align="start"
        finalFocus={() => {
          editor.commands.focus()

          return false
        }}
      >
        <PopoverTitle>{linked ? "Edit link" : "Add link"}</PopoverTitle>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            const href = url.trim()

            // Tiptap's link extension owns URI validation for typing, paste and commands.
            if (!editor.can().setLink({ href })) {
              setError("Enter a valid link address.")

              return
            }

            const chain = editor.chain().focus().extendMarkRange("link")

            if (editor.state.selection.empty && !linked) {
              chain
                .insertContent({
                  type: "text",
                  text: href,
                  marks: [{ type: "link", attrs: { href } }],
                })
                .run()
            } else chain.setLink({ href }).run()
            setOpen(false)
          }}
        >
          <Field data-invalid={!!error}>
            <FieldLabel htmlFor={inputId}>Link address</FieldLabel>
            <Input
              id={inputId}
              type="url"
              required
              value={url}
              placeholder="https://example.com"
              onChange={(e) => {
                setUrl(e.target.value)
                setError("")
              }}
              aria-invalid={!!error}
              aria-describedby={error ? `${inputId}-error` : undefined}
            />
            {error && <FieldError id={`${inputId}-error`}>{error}</FieldError>}
          </Field>
          <div className="editor-link-actions">
            {linked && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  editor
                    .chain()
                    .focus()
                    .extendMarkRange("link")
                    .unsetLink()
                    .run()
                  setOpen(false)
                }}
              >
                <Unlink data-icon="inline-start" aria-hidden="true" />
                Remove link
              </Button>
            )}
            <Button type="submit">Apply</Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  )
}
