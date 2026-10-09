import { z } from "zod"
import { answerBlocks } from "@/kit/answer/answer-definitions"
import {
  createAnswerLibrary,
  defineAnswerComponent,
} from "@/kit/answer/answer-library"
import { Skeleton } from "@/kit/ui/skeleton"

// A component of your own joins the kit's blocks: a schema the model
// fills, the component that draws it, and its text for copying.
const taskListProps = z.object({
  items: z
    .array(
      z.object({
        title: z.string(),
        owner: z.string().nullable(),
        due: z.string().describe("A short date, such as 30 Sept."),
      }),
    )
    .min(1),
})

const taskList = defineAnswerComponent({
  name: "TaskList",
  description: "Open tasks, with who has each one and when it is due.",
  props: taskListProps,
  component: ({ props }) => (
    <ul className="grid gap-1.5 text-sm">
      {props.items.map((item) => (
        <li key={item.title} className="flex justify-between gap-3">
          <span className="min-w-0 truncate">{item.title}</span>
          <span className="shrink-0 text-(length:--text-meta) text-muted-foreground">
            {item.owner ?? "No owner"} · {item.due}
          </span>
        </li>
      ))}
    </ul>
  ),
  placeholder: <Skeleton className="h-16" />,
  text: ({ items }) =>
    items
      .map((item) => `- ${item.title} (${item.owner ?? "no owner"})`)
      .join("\n"),
})

/** The components a model may use in an answer. */
export const exampleLibrary = createAnswerLibrary([...answerBlocks, taskList])

/** What a model writes as the display tool's input. */
export const exampleAnswer = {
  title: "Catch-up: Mobile app",
  nodes: [
    {
      id: "heading",
      type: "Heading",
      props: {
        text: "Mobile app is ready for review",
        detail: "In review · due 30 Sept · 3 tasks open",
      },
    },
    {
      id: "summary",
      type: "Text",
      props: {
        markdown:
          "The team finished **9 tasks** this week, the most this month. Three remain, and one of them has no owner yet.",
      },
    },
    {
      id: "figures",
      type: "Figures",
      props: {
        items: [
          { label: "Done", value: "29 of 32", trend: [12, 15, 18, 22, 29] },
          { label: "This week", value: "9", trend: [3, 5, 4, 7, 9] },
          { label: "Due", value: "30 Sept", detail: "in 6 days" },
        ],
      },
    },
    {
      id: "open",
      type: "Section",
      props: { title: "Still open" },
      children: [
        {
          id: "tasks",
          type: "TaskList",
          props: {
            items: [
              { title: "Final QA pass", owner: "Mia Davis", due: "28 Sept" },
              { title: "Release notes", owner: "Ava Morgan", due: "29 Sept" },
              { title: "Store screenshots", owner: null, due: "30 Sept" },
            ],
          },
        },
      ],
    },
    {
      id: "owner",
      type: "Callout",
      props: {
        tone: "attention",
        title: "Store screenshots have no owner",
        markdown: "Assign them today so the review isn't held up.",
      },
    },
    {
      id: "next",
      type: "Form",
      props: {
        title: "What next?",
        submitLabel: "Plan the week",
        fields: [
          {
            kind: "choice",
            name: "focus",
            label: "Focus",
            options: [
              { value: "ship", label: "Ship on 30 Sept" },
              { value: "polish", label: "Polish first" },
            ],
            value: "ship",
          },
          {
            kind: "checks",
            name: "notify",
            label: "Tell",
            options: [
              { value: "ava", label: "Ava Morgan" },
              { value: "mia", label: "Mia Davis" },
            ],
            values: ["mia"],
          },
        ],
      },
    },
  ],
}
