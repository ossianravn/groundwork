import { renderToReactElement } from "@tiptap/static-renderer/pm/react"
import { richTextExtensions, type RichTextDocument } from "./document"

export function RichText({ value }: { value: RichTextDocument }) {
  return (
    <div className="rich-text-content">
      {renderToReactElement({ extensions: richTextExtensions, content: value })}
    </div>
  )
}
