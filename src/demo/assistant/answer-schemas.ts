import { z } from "zod"
import type { AnswerNode } from "@/kit/answer/answer-library"
import type {
  answerCalloutProps,
  answerFiguresProps,
  answerHeadingProps,
  answerSectionProps,
  answerTextProps,
} from "@/kit/answer/answer-schemas"

// Tandem's own answer components' props. The views live in
// features/assistant/answers; answers are built here, as a server would.

export const projectFilesProps = z.object({
  files: z
    .array(
      z.object({
        name: z.string(),
        kind: z.enum(["image", "document"]),
        url: z.string().optional().describe("An image's address, to preview."),
        detail: z.string().describe("Size and date, such as 1 KB · 11 Sept."),
      }),
    )
    .min(1)
    .max(6),
  href: z.string().optional().describe("Where all the project's files are."),
})

export const activityDigestProps = z.object({
  items: z
    .array(
      z.object({
        date: z.string().describe("Formatted, such as 24 Sept."),
        person: z.string(),
        personHref: z.string().optional(),
        action: z.string().describe("What they did, as a phrase."),
        detail: z.string().optional(),
      }),
    )
    .min(1)
    .max(8),
  href: z.string().optional().describe("Where the full activity is."),
})

export type ProjectFilesProps = z.output<typeof projectFilesProps>

export type ActivityDigestProps = z.output<typeof activityDigestProps>

/** A builder for one component's nodes, typed by its props. */
function builder<Props>(type: string) {
  return (id: string, props: Props, children?: AnswerNode[]): AnswerNode =>
    children ? { id, type, props, children } : { id, type, props }
}

export const node = {
  heading: builder<z.input<typeof answerHeadingProps>>("Heading"),
  text: builder<z.input<typeof answerTextProps>>("Text"),
  figures: builder<z.input<typeof answerFiguresProps>>("Figures"),
  section: builder<z.input<typeof answerSectionProps>>("Section"),
  callout: builder<z.input<typeof answerCalloutProps>>("Callout"),
  projectFiles: builder<z.input<typeof projectFilesProps>>("ProjectFiles"),
  activityDigest:
    builder<z.input<typeof activityDigestProps>>("ActivityDigest"),
}
