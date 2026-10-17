import { useRef, useState, type ReactNode } from "react"
import { Button } from "@/kit/ui/button"
import type { Member } from "@/demo/model"
import { parseCsv } from "@/demo/csv"
import {
  guessMapping,
  importFields,
  reviewImport,
  type ColumnMapping,
  type ImportRow,
} from "@/demo/project-import"
import { ImportDrop } from "./import-drop"
import { ImportMapping } from "./import-mapping"
import { ImportReview } from "./import-review"

const steps = ["Upload", "Map columns", "Review", "Done"] as const

type Step = (typeof steps)[number]

// Import projects from a spreadsheet (SETT-16): upload, map columns, review
// every row, then create the ready ones. Rows with problems are skipped and
// say why, so the file can be fixed and imported again.
export function ProjectImport({
  members,
  emails,
  defaultOwnerId,
  existingNames,
  sample,
  onImport,
  projectsLink,
}: {
  members: Member[]
  emails: Map<string, string>
  defaultOwnerId: string
  existingNames: string[]
  sample: { url: string; name: string }
  /** Creates the ready rows; returns how many were created. */
  onImport: (rows: ImportRow[]) => number
  projectsLink: ReactNode
}) {
  const [step, setStep] = useState<Step>("Upload")
  const [file, setFile] = useState("")
  const [table, setTable] = useState<string[][]>([])
  const [mapping, setMapping] = useState<ColumnMapping>(guessMapping([]))
  const [error, setError] = useState("")
  const [imported, setImported] = useState(0)
  const heading = useRef<HTMLHeadingElement>(null)
  const [headers = [], ...data] = table

  const rows =
    step === "Review" || step === "Done"
      ? reviewImport(data, mapping, {
          members,
          emails,
          defaultOwnerId,
          existingNames,
        })
      : []

  const ready = rows.filter((row) => row.errors.length === 0)

  const missing = importFields.filter(
    (field) => field.required && mapping[field.key] === null,
  )

  function go(next: Step) {
    setStep(next)
    requestAnimationFrame(() => heading.current?.focus())
  }

  function load(name: string, text: string) {
    const parsed = parseCsv(text)

    if (parsed.length < 2) {
      setError(`${name} has no rows to import. Check that it is a CSV file.`)

      return
    }

    setError("")
    setFile(name)
    setTable(parsed)
    setMapping(guessMapping(parsed[0]))
    go("Map columns")
  }

  return (
    <div className="project-import" data-page-zone="content">
      <ol className="import-steps" aria-label="Import steps">
        {steps.map((item) => (
          <li key={item} aria-current={item === step ? "step" : undefined}>
            {item}
          </li>
        ))}
      </ol>
      <h2 ref={heading} tabIndex={-1} className="import-heading">
        {step === "Upload"
          ? "Choose a CSV file"
          : step === "Map columns"
            ? `Match the columns in ${file}`
            : step === "Review"
              ? `${ready.length} of ${rows.length} rows are ready`
              : `Imported ${imported} ${imported === 1 ? "project" : "projects"}`}
      </h2>
      {step === "Upload" && (
        <>
          <ImportDrop
            sampleUrl={sample.url}
            onFile={load}
            onSample={() =>
              void fetch(sample.url)
                .then((response) => response.text())
                .then((text) => load(sample.name, text))
                .catch(() =>
                  setError("The sample file could not be loaded. Try again."),
                )
            }
          />
          {error && (
            <p role="alert" className="import-error">
              {error}
            </p>
          )}
        </>
      )}
      {step === "Map columns" && (
        <>
          <ImportMapping
            headers={headers}
            example={data[0] ?? []}
            mapping={mapping}
            onChange={setMapping}
          />
          {missing.length > 0 && (
            <p className="import-error" role="status">
              Choose a column for{" "}
              {missing.map((field) => field.label).join(" and ")}.
            </p>
          )}
          <div className="import-actions">
            <Button variant="outline" onClick={() => go("Upload")}>
              Back
            </Button>
            <Button disabled={missing.length > 0} onClick={() => go("Review")}>
              Review rows
            </Button>
          </div>
        </>
      )}
      {step === "Review" && (
        <>
          <p className="text-muted-foreground">
            Imported projects start In progress with no tasks. Rows marked
            Skipped are left out; fix them in the file and import it again.
          </p>
          <ImportReview rows={rows} members={members} />
          <div className="import-actions">
            <Button variant="outline" onClick={() => go("Map columns")}>
              Back
            </Button>
            <Button
              disabled={ready.length === 0}
              onClick={() => {
                setImported(onImport(ready))
                go("Done")
              }}
            >
              Import {ready.length}{" "}
              {ready.length === 1 ? "project" : "projects"}
            </Button>
          </div>
        </>
      )}
      {step === "Done" && (
        <div className="import-actions">
          {projectsLink}
          <Button variant="outline" onClick={() => go("Upload")}>
            Import another file
          </Button>
        </div>
      )}
    </div>
  )
}
