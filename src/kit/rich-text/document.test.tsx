import { expect, it } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { getSchema } from "@tiptap/core"
import { documentText, richTextExtensions, textDocument } from "./document"
import { RichText } from "./rich-text"

it("keeps fixture and empty documents canonical and renders literal text safely", () => {
  const schema = getSchema(richTextExtensions)

  for (const text of ["", "Brief\nNext step", "<script>alert(1)</script>"]) {
    const document = textDocument(text)
    expect(schema.nodeFromJSON(document).toJSON()).toEqual(document)
    expect(documentText(document)).toBe(text)
  }

  expect(
    renderToStaticMarkup(
      <RichText value={textDocument("<script>alert(1)</script>")} />,
    ),
  ).toContain("&lt;script&gt;")
})

it("renders the supported link and list schema without executable link targets", () => {
  const value = {
    type: "doc",
    content: [
      {
        type: "bulletList",
        content: [
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Review the brief",
                    marks: [
                      { type: "bold" },
                      { type: "link", attrs: { href: "javascript:alert(1)" } },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  }

  expect(documentText(value)).toBe("Review the brief")
  const html = renderToStaticMarkup(<RichText value={value} />)
  expect(html).toContain("<ul><li><p>")
  expect(html).toContain("<strong>")
  expect(html).toContain("Review the brief</a></strong>")
  expect(html).not.toContain("javascript:")
})
