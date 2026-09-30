import { GitCommitHorizontal } from "lucide-react"
import { cn } from "cn"

export interface CommitFile {
  path: string
  additions: number
  deletions: number
}

/**
 * One commit: its message, short hash, author and when, then each changed
 * file with lines added and removed (stated in words for screen readers).
 */
function Commit({
  hash,
  message,
  body,
  author,
  date,
  files,
  className,
}: {
  hash: string
  /** The first line. */
  message: string
  body?: string
  author: string
  /** Already formatted for display. */
  date: string
  files: CommitFile[]
  className?: string
}) {
  const added = files.reduce((sum, file) => sum + file.additions, 0)
  const removed = files.reduce((sum, file) => sum + file.deletions, 0)

  return (
    <section
      data-slot="commit"
      aria-label={`Commit ${hash.slice(0, 7)}`}
      className={cn(
        "grid min-w-0 overflow-hidden rounded-lg border border-border bg-background text-sm",
        className,
      )}
    >
      <header className="grid gap-1 p-3">
        <p className="flex min-w-0 items-start gap-2">
          <GitCommitHorizontal
            className="mt-0.5 size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <span className="min-w-0 flex-1 font-medium">{message}</span>
          <code className="rounded bg-muted px-1.5 font-mono text-xs">
            {hash.slice(0, 7)}
          </code>
        </p>
        {body && (
          <p className="ps-6 whitespace-pre-line text-muted-foreground">
            {body}
          </p>
        )}
        <p className="ps-6 text-xs text-muted-foreground">
          {author} · {date}
        </p>
      </header>
      <div className="border-t border-border px-3 py-2">
        <p className="mb-1 text-xs text-muted-foreground">
          {files.length} file{files.length === 1 ? "" : "s"} changed,{" "}
          <span className="text-(--success)">+{added}</span>{" "}
          <span className="text-destructive">−{removed}</span>
        </p>
        <ul className="grid font-mono text-[0.8125rem]">
          {files.map((file) => (
            <li
              key={file.path}
              className="flex min-w-0 items-center gap-3 py-0.5"
            >
              <span className="min-w-0 flex-1 truncate">{file.path}</span>
              <span className="text-xs tabular-nums">
                <span className="text-(--success)">+{file.additions}</span>{" "}
                <span className="text-destructive">−{file.deletions}</span>
                <span className="sr-only">
                  {`: ${file.additions} lines added, ${file.deletions} removed`}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export { Commit }
