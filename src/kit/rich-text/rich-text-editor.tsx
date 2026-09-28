import { useEffect } from "react"
import { EditorContent, useEditor } from "@tiptap/react"
import {
  richTextExtensions,
  sameDocument,
  type RichTextDocument,
} from "./document"
import { EditorToolbar } from "./editor-toolbar"

export function RichTextEditor({
  id,
  labelledBy,
  value,
  onChange,
}: {
  id: string
  labelledBy: string
  value: RichTextDocument
  onChange: (value: RichTextDocument) => void
}) {
  const editor = useEditor({
    extensions: richTextExtensions,
    content: value,
    editorProps: {
      attributes: {
        id,
        role: "textbox",
        "aria-multiline": "true",
        "aria-labelledby": labelledBy,
        class: "rich-text-content rich-text-input",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
  })

  useEffect(() => {
    if (editor && !sameDocument(editor.getJSON(), value)) {
      editor.commands.setContent(value, { emitUpdate: false })
    }
  }, [editor, value])

  return (
    <div className="rich-text-editor">
      {editor && <EditorToolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  )
}
