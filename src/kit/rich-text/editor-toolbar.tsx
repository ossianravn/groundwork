import { type Editor, useEditorState } from "@tiptap/react"
import { Bold, Italic, List, ListOrdered, Undo2, Redo2 } from "lucide-react"
import { Button } from "@/kit/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/kit/ui/toggle-group"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/kit/ui/tooltip"
import { EditorLink } from "./editor-link"

const formats = [
  { id: "bold", label: "Bold", Icon: Bold },
  { id: "italic", label: "Italic", Icon: Italic },
  { id: "bulletList", label: "Bullet list", Icon: List },
  { id: "orderedList", label: "Numbered list", Icon: ListOrdered },
] as const

export function EditorToolbar({ editor }: { editor: Editor }) {
  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      active: formats.flatMap((format) =>
        editor.isActive(format.id) ? [format.id] : [],
      ),
      undo: editor.can().undo(),
      redo: editor.can().redo(),
    }),
  })

  return (
    <div
      className="rich-text-toolbar"
      role="group"
      aria-label="Text formatting"
    >
      <ToggleGroup
        multiple
        size="sm"
        spacing={0}
        value={state.active}
        onValueChange={(next) => {
          const changed = formats.find(
            ({ id }) => next.includes(id) !== state.active.includes(id),
          )

          if (!changed) return
          const chain = editor.chain().focus()

          switch (changed.id) {
            case "bold":
              chain.toggleBold().run()
              break
            case "italic":
              chain.toggleItalic().run()
              break
            case "bulletList":
              chain.toggleBulletList().run()
              break
            case "orderedList":
              chain.toggleOrderedList().run()
              break
          }
        }}
      >
        {formats.map(({ id, label, Icon }) => (
          <Tooltip key={id}>
            <TooltipTrigger
              render={<ToggleGroupItem value={id} aria-label={label} />}
            >
              <Icon aria-hidden="true" />
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        ))}
      </ToggleGroup>
      <EditorLink editor={editor} />
      <div className="rich-text-history">
        {[
          {
            label: "Undo",
            Icon: Undo2,
            enabled: state.undo,
            action: () => editor.chain().focus().undo().run(),
          },
          {
            label: "Redo",
            Icon: Redo2,
            enabled: state.redo,
            action: () => editor.chain().focus().redo().run(),
          },
        ].map(({ label, Icon, enabled, action }) => (
          <Tooltip key={label}>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  disabled={!enabled}
                  aria-label={label}
                  onClick={action}
                />
              }
            >
              <Icon aria-hidden="true" />
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  )
}
