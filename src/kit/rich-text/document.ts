import { generateText, type JSONContent } from "@tiptap/core"
import StarterKit from "@tiptap/starter-kit"

export type RichTextDocument = JSONContent

// Editing, paste and rendering share one schema; unsupported formatting is stripped.
export const richTextExtensions = [
  StarterKit.configure({
    heading: false,
    blockquote: false,
    code: false,
    codeBlock: false,
    horizontalRule: false,
    strike: false,
    underline: false,
    trailingNode: false,
    link: { openOnClick: false, defaultProtocol: "https" },
  }),
]

export function textDocument(text: string): RichTextDocument {
  return {
    type: "doc",
    content: text.split(/\r?\n/).map((line) => {
      const paragraph: JSONContent = { type: "paragraph" }

      if (line) paragraph.content = [{ type: "text", text: line }]

      return paragraph
    }),
  }
}

export function documentText(document: RichTextDocument) {
  return generateText(document, richTextExtensions, {
    blockSeparator: "\n",
  }).trim()
}

export function sameDocument(a: RichTextDocument, b: RichTextDocument) {
  return JSON.stringify(a) === JSON.stringify(b)
}
