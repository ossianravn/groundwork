import { Skeleton } from "@/kit/ui/skeleton"
import { answerBlocks } from "@/kit/answer/answer-definitions"
import {
  createAnswerLibrary,
  defineAnswerComponent,
} from "@/kit/answer/answer-library"
import {
  activityDigestProps,
  projectFilesProps,
} from "@/demo/assistant/answer-schemas"
import { AnswerActivityDigest } from "./answer-activity-digest"
import { AnswerProjectFiles } from "./answer-project-files"
import { planComponents } from "./plan-definitions"

const activityDigest = defineAnswerComponent({
  name: "ActivityDigest",
  description:
    "Recent events on one project, newest first: date, person, what they did and how many tasks.",
  props: activityDigestProps,
  component: AnswerActivityDigest,
  placeholder: <Skeleton className="h-32" />,
  text: ({ items }) =>
    items
      .map(
        (item) =>
          `${item.date}: ${item.person} ${item.action}${item.detail ? ` (${item.detail})` : ""}`,
      )
      .join("\n"),
})

const projectFiles = defineAnswerComponent({
  name: "ProjectFiles",
  description:
    "Up to six of a project's files as tiles: images show a preview, other files their kind, each with size and date.",
  props: projectFilesProps,
  component: AnswerProjectFiles,
  placeholder: <Skeleton className="h-36" />,
  text: ({ files }) =>
    files.map((file) => `${file.name} (${file.detail})`).join("\n"),
})

/** Everything Tandem's assistant can build an answer from. */
export const tandemAnswers = createAnswerLibrary([
  ...answerBlocks,
  activityDigest,
  projectFiles,
  ...planComponents,
])
