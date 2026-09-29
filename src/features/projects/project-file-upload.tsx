import { useEffect, useRef, useState } from "react"
import { RotateCcw, Upload, X } from "lucide-react"
import { Button } from "@/kit/ui/button"
import { Progress, ProgressLabel, ProgressValue } from "@/kit/ui/progress"
import { fileError } from "@/demo/project-files"

interface Upload {
  id: string
  file: File
  progress: number
  status: "uploading" | "failed" | "rejected"
  message: string
}

const step = 12

const tick = 90

// Drop files or choose them (SETT-15). The demo stands in for a network
// upload with timed progress; failFirst interrupts the first upload so the
// Retry path can be seen. Oversized files are refused before they start.
export function ProjectFileUpload({
  failFirst,
  onUploaded,
}: {
  failFirst: boolean
  onUploaded: (file: File) => void
}) {
  const [uploads, setUploads] = useState<Upload[]>([])
  const [dragging, setDragging] = useState(false)
  const [announcement, setAnnouncement] = useState("")
  const input = useRef<HTMLInputElement>(null)
  const failed = useRef(!failFirst)
  const done = useRef(onUploaded)
  const latest = useRef(uploads)

  useEffect(() => {
    done.current = onUploaded
  })

  // The ref and state change together so a timer tick never works from a
  // stale list.
  function commit(next: Upload[]) {
    latest.current = next
    setUploads(next)
  }

  const running = uploads.some((upload) => upload.status === "uploading")

  // One timer advances every running upload and stops when none remain.
  // Side effects run here, once per tick, outside any state updater.
  useEffect(() => {
    if (!running) return

    const timer = setInterval(() => {
      const finished: Upload[] = []

      const next = latest.current.flatMap((upload): Upload[] => {
        if (upload.status !== "uploading") return [upload]

        const progress = Math.min(100, upload.progress + step)

        if (!failed.current && progress >= 60) {
          failed.current = true
          setAnnouncement(`${upload.file.name} failed to upload.`)

          return [
            {
              ...upload,
              progress,
              status: "failed",
              message: "Upload interrupted. Check your connection and retry.",
            },
          ]
        }

        if (progress < 100) return [{ ...upload, progress }]

        finished.push(upload)

        return []
      })

      latest.current = next
      setUploads(next)

      for (const upload of finished) {
        done.current(upload.file)
        setAnnouncement(`${upload.file.name} uploaded.`)
      }
    }, tick)

    return () => clearInterval(timer)
  }, [running])

  function start(files: FileList | null) {
    const next = [...(files ?? [])].map((file) => {
      const message = fileError(file)

      return {
        id: crypto.randomUUID(),
        file,
        progress: 0,
        status: message ? ("rejected" as const) : ("uploading" as const),
        message,
      }
    })

    commit([...latest.current, ...next])
  }

  function update(id: string, patch: Partial<Upload> | null) {
    commit(
      latest.current.flatMap((upload) =>
        upload.id !== id ? [upload] : patch ? [{ ...upload, ...patch }] : [],
      ),
    )
  }

  return (
    <div className="file-upload">
      <div
        className="file-drop"
        data-dragging={dragging || undefined}
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          start(event.dataTransfer.files)
        }}
      >
        <Upload aria-hidden="true" className="file-drop-icon" />
        <p>Drop files here or</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => input.current?.click()}
        >
          Choose files
        </Button>
        <input
          ref={input}
          type="file"
          multiple
          hidden
          onChange={(event) => {
            start(event.target.files)
            event.target.value = ""
          }}
        />
      </div>
      {uploads.length > 0 && (
        <ul className="file-uploads" aria-label="Uploads">
          {uploads.map((upload) => (
            <li key={upload.id} data-status={upload.status}>
              {upload.status === "rejected" ? (
                <p className="file-upload-name">{upload.file.name}</p>
              ) : (
                <Progress value={upload.progress}>
                  <ProgressLabel className="file-upload-name">
                    {upload.file.name}
                  </ProgressLabel>
                  <ProgressValue />
                </Progress>
              )}
              {upload.message && (
                <p className="file-upload-message" role="alert">
                  {upload.message}
                </p>
              )}
              {upload.status !== "uploading" && (
                <div className="file-upload-actions">
                  {upload.status === "failed" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        update(upload.id, {
                          status: "uploading",
                          progress: 0,
                          message: "",
                        })
                      }
                    >
                      <RotateCcw aria-hidden="true" data-icon="inline-start" />
                      Retry
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => update(upload.id, null)}
                  >
                    <X aria-hidden="true" data-icon="inline-start" />
                    Dismiss
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      <p role="status" className="sr-only">
        {announcement}
      </p>
    </div>
  )
}
