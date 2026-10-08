import { z } from "zod"

// The generic blocks' props, apart from their components, so a server can
// build and validate answers without React.

export const answerHeadingProps = z.object({
  text: z.string().describe("The result in one sentence, not a topic."),
  detail: z.string().optional().describe("A line of context under it."),
})

export const answerTextProps = z.object({
  markdown: z
    .string()
    .describe("A few sentences of markdown; cite sources as [1](#source:id)."),
})

export const answerFiguresProps = z.object({
  items: z
    .array(
      z.object({
        label: z.string(),
        value: z.string().describe("Formatted for reading, such as 24 of 32."),
        detail: z.string().optional(),
        trend: z
          .array(z.number())
          .optional()
          .describe("Values over time, oldest first, for a trend line."),
        trendLabel: z
          .string()
          .optional()
          .describe("The trend in words, such as Up from 3 to 8 this month."),
      }),
    )
    .min(1)
    .max(4),
})

export const answerSectionProps = z.object({
  title: z.string(),
  description: z.string().optional(),
})

export const answerCalloutProps = z.object({
  tone: z.enum(["note", "attention"]),
  title: z.string(),
  markdown: z.string().optional(),
})

export type AnswerHeadingProps = z.output<typeof answerHeadingProps>

export type AnswerTextProps = z.output<typeof answerTextProps>

export type AnswerFiguresProps = z.output<typeof answerFiguresProps>

export type AnswerSectionProps = z.output<typeof answerSectionProps>

export type AnswerCalloutProps = z.output<typeof answerCalloutProps>

const formOption = z.object({ value: z.string(), label: z.string() })

export const answerFormProps = z.object({
  title: z.string(),
  description: z.string().optional(),
  submitLabel: z
    .string()
    .describe("What sending does, such as Update the plan."),
  fields: z
    .array(
      z.discriminatedUnion("kind", [
        z.object({
          kind: z.literal("choice"),
          name: z.string(),
          label: z.string(),
          options: z.array(formOption).min(2),
          value: z.string().optional(),
        }),
        z.object({
          kind: z.literal("checks"),
          name: z.string(),
          label: z.string(),
          options: z.array(formOption).min(1),
          values: z.array(z.string()).optional(),
        }),
      ]),
    )
    .min(1),
})

export type AnswerFormProps = z.output<typeof answerFormProps>
