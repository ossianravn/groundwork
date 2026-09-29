import { useRef, useState } from "react"
import { Download, FileText, Trash2 } from "lucide-react"
import { Button, buttonVariants } from "@/kit/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/kit/ui/dialog"
import { useToast } from "@/kit/ui/use-toast"
import { formatDate, type Member, type ProjectFile } from "@/demo/model"
import { formatBytes, isImageFile } from "@/demo/project-files"
import { ProjectFileUpload } from "./project-file-upload"

// Project attachments (SETT-15), beside progress. Images show a thumbnail
// and open a larger preview; sample files without content say so.
export function ProjectFiles({
  files,
  people,
  failFirstUpload,
  onUploaded,
  onRemove,
}: {
  files: ProjectFile[]
  people: Member[]
  failFirstUpload: boolean
  onUploaded: (file: File) => void
  /** Removes a file; returns a function that restores it. */
  onRemove: (id: string) => (() => void) | undefined
}) {
  const toast = useToast()
  const [open, setOpen] = useState<ProjectFile | null>(null)
  const opened = useRef("")
  const heading = useRef<HTMLHeadingElement>(null)
  const title = useRef<HTMLHeadingElement>(null)

  function remove(file: ProjectFile) {
    setOpen(null)
    const restore = onRemove(file.id)

    if (!restore) return

    const id = toast.add({
      title: `Removed ${file.name}`,
      type: "success",
      actionProps: {
        children: "Undo",
        onClick: () => {
          restore()
          toast.close(id)
        },
      },
    })
  }

  return (
    <section className="project-files" aria-labelledby="project-files-title">
      <header className="project-files-heading">
        <h2 id="project-files-title" ref={heading} tabIndex={-1}>
          Files
        </h2>
        <p className="project-tasks-count">{files.length}</p>
      </header>
      {files.length > 0 && (
        <ul className="file-list">
          {files.map((file) => (
            <li key={file.id}>
              <button
                type="button"
                id={`file-${file.id}`}
                className="file-item"
                onClick={() => {
                  opened.current = file.id
                  setOpen(file)
                }}
              >
                {isImageFile(file) && file.url ? (
                  <img src={file.url} alt="" className="file-thumb" />
                ) : (
                  <span className="file-thumb" aria-hidden="true">
                    <FileText />
                  </span>
                )}
                <span className="file-text">
                  <span className="file-name">{file.name}</span>
                  <span className="file-meta">
                    {formatBytes(file.size)} · {formatDate(file.date)}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <ProjectFileUpload failFirst={failFirstUpload} onUploaded={onUploaded} />
      <Dialog open={!!open} onOpenChange={(next) => !next && setOpen(null)}>
        {open && (
          <DialogContent
            className="file-preview-dialog"
            // A removed file has no button left; return to the heading.
            // Start on the title, not on Remove, so Enter cannot delete.
            initialFocus={title}
            finalFocus={() =>
              document.getElementById(`file-${opened.current}`) ??
              heading.current
            }
          >
            <DialogHeader>
              <DialogTitle ref={title} tabIndex={-1}>
                {open.name}
              </DialogTitle>
              <DialogDescription>
                {formatBytes(open.size)} · Added by{" "}
                {people.find((person) => person.id === open.uploadedBy)?.name ??
                  "a former member"}{" "}
                on {formatDate(open.date, { year: "numeric" })}
              </DialogDescription>
            </DialogHeader>
            {isImageFile(open) && open.url ? (
              <img src={open.url} alt={open.name} className="file-preview" />
            ) : (
              <p className="file-preview-empty">
                {open.url
                  ? "No preview for this file type."
                  : "This is a sample file; the demo has no contents to show."}
              </p>
            )}
            <DialogFooter>
              <Button variant="ghost" onClick={() => remove(open)}>
                <Trash2 aria-hidden="true" data-icon="inline-start" />
                Remove
              </Button>
              {open.url && (
                <a
                  href={open.url}
                  download={open.name}
                  className={buttonVariants({ variant: "outline" })}
                >
                  <Download aria-hidden="true" data-icon="inline-start" />
                  Download
                </a>
              )}
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </section>
  )
}
