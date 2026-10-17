import { useRef, useState } from "react"
import { FileSpreadsheet, Upload } from "lucide-react"
import { Button } from "@/kit/ui/button"

/**
 * The Upload step: a drop zone sized to its content that lights up as the
 * drop target while a file is dragged over it, with Choose CSV file and the
 * sample as the one alternative. The sample's download is a link in the
 * guidance, for editing it first.
 */
export function ImportDrop({
  sampleUrl,
  onFile,
  onSample,
}: {
  sampleUrl: string
  onFile: (name: string, text: string) => void
  onSample: () => void
}) {
  const input = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  function read(file: File | undefined) {
    if (file) void file.text().then((text) => onFile(file.name, text))
  }

  return (
    <div
      className="import-drop"
      data-dragging={dragging || undefined}
      onDragOver={(event) => {
        event.preventDefault()
        setDragging(true)
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null))
          setDragging(false)
      }}
      onDrop={(event) => {
        event.preventDefault()
        setDragging(false)
        read(event.dataTransfer.files[0])
      }}
    >
      <FileSpreadsheet aria-hidden="true" />
      <div className="import-drop-text">
        <p className="import-drop-title">
          {dragging ? "Drop the file to import it" : "Drop a CSV file here"}
        </p>
        <p>
          One project per row, with a header row. Name and due date are
          required; owner, description and tags are optional.{" "}
          <a href={sampleUrl} download className="import-sample-link">
            Download the sample
          </a>{" "}
          to see the format.
        </p>
      </div>
      <div className="import-actions">
        <Button onClick={() => input.current?.click()}>
          <Upload aria-hidden="true" data-icon="inline-start" />
          Choose CSV file
        </Button>
        <Button variant="outline" onClick={onSample}>
          Use the sample file
        </Button>
      </div>
      <input
        ref={input}
        type="file"
        accept=".csv,text/csv"
        hidden
        onChange={(event) => {
          read(event.target.files?.[0])
          event.target.value = ""
        }}
      />
    </div>
  )
}
