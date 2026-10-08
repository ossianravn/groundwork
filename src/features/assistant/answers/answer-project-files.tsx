import { FileText } from "lucide-react"
import { useResponseLink } from "@/kit/ai/response-link"
import type { AnswerComponentProps } from "@/kit/answer/answer-library"
import type { ProjectFilesProps } from "@/demo/assistant/answer-schemas"

/**
 * A project's files as a strip of tiles: images show themselves, other
 * files their kind. The project page, linked below, opens them.
 */
export function AnswerProjectFiles({
  props,
}: AnswerComponentProps<ProjectFilesProps>) {
  const renderLink = useResponseLink()

  return (
    <div className="grid gap-2">
      <div className="@container">
        <ul className="grid grid-cols-2 gap-3 @min-[30rem]:grid-cols-3">
          {props.files.map((file, index) => (
            <li key={`${file.name}-${index}`} className="grid min-w-0 gap-1.5">
              <div className="grid aspect-4/3 place-items-center overflow-hidden rounded-md border border-border bg-muted">
                {file.kind === "image" && file.url ? (
                  <img
                    src={file.url}
                    alt=""
                    loading="lazy"
                    className="size-full object-cover [object-position:0_0]"
                  />
                ) : (
                  <FileText
                    aria-hidden="true"
                    className="size-6 text-muted-foreground"
                  />
                )}
              </div>
              <p className="truncate text-sm font-medium" title={file.name}>
                {file.name}
              </p>
              <p className="text-(length:--text-meta) text-muted-foreground">
                {file.detail}
              </p>
            </li>
          ))}
        </ul>
      </div>
      {props.href &&
        renderLink({
          href: props.href,
          className:
            "justify-self-start text-sm font-medium underline decoration-border underline-offset-[0.2em] hover:decoration-current",
          children: "Open the project's files",
        })}
    </div>
  )
}
