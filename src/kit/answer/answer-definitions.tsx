import { Skeleton } from "@/kit/ui/skeleton"
import {
  AnswerCallout,
  AnswerFigures,
  AnswerHeading,
  AnswerSection,
  AnswerText,
} from "./answer-blocks"
import { AnswerForm } from "./answer-form"
import { defineAnswerComponent } from "./answer-library"
import {
  answerCalloutProps,
  answerFiguresProps,
  answerFormProps,
  answerHeadingProps,
  answerSectionProps,
  answerTextProps,
} from "./answer-schemas"

export const headingBlock = defineAnswerComponent({
  name: "Heading",
  description:
    "Opens an answer: the result as a sentence (Brand refresh is on track for 28 Sept), with an optional line of context.",
  props: answerHeadingProps,
  component: AnswerHeading,
  streams: true,
  text: ({ text, detail }) => (detail ? `${text}\n${detail}` : text),
})

export const textBlock = defineAnswerComponent({
  name: "Text",
  description:
    "A few sentences of markdown explaining the result, with citations to the sources.",
  props: answerTextProps,
  component: AnswerText,
  streams: true,
  text: ({ markdown }) => markdown,
})

export const figuresBlock = defineAnswerComponent({
  name: "Figures",
  description:
    "Two to four key figures side by side, each with a label, a formatted value, an optional detail and an optional trend line.",
  props: answerFiguresProps,
  component: AnswerFigures,
  placeholder: <Skeleton className="h-20" />,
  text: ({ items }) =>
    items
      .map(
        (item) =>
          `${item.label}: ${item.value}${item.detail ? ` (${item.detail})` : ""}`,
      )
      .join("\n"),
})

export const sectionBlock = defineAnswerComponent({
  name: "Section",
  description:
    "A titled part of the answer that holds other components as children.",
  props: answerSectionProps,
  component: AnswerSection,
  placeholder: <Skeleton className="h-5 w-40" />,
  text: ({ title }) => `### ${title}`,
})

export const calloutBlock = defineAnswerComponent({
  name: "Callout",
  description:
    "A note, or something that needs the person's attention (tone attention), with a short title and optional markdown.",
  props: answerCalloutProps,
  component: AnswerCallout,
  placeholder: <Skeleton className="h-14" />,
  text: ({ title, markdown }) => (markdown ? `${title}\n${markdown}` : title),
})

export const formBlock = defineAnswerComponent({
  name: "Form",
  description:
    "Choices the person makes and sends back as their next message: a title, fields (a choice of one option, or checks for several) and what sending does (submitLabel).",
  props: answerFormProps,
  component: AnswerForm,
  placeholder: <Skeleton className="h-40" />,
  text: ({ title, fields }) =>
    [
      title,
      ...fields.map(
        (field) =>
          `${field.label}: ${field.options.map((option) => option.label).join(" / ")}`,
      ),
    ].join("\n"),
})

/** The generic blocks, to include in a library beside your own components. */
export const answerBlocks = [
  headingBlock,
  textBlock,
  figuresBlock,
  sectionBlock,
  calloutBlock,
  formBlock,
]
