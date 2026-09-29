import { CircleAlert, CircleCheck } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/kit/ui/table"
import { formatDate, type Member } from "@/demo/model"
import type { ImportRow } from "@/demo/project-import"

/** Every row with its outcome; rows that need attention are skipped. */
export function ImportReview({
  rows,
  members,
}: {
  rows: ImportRow[]
  members: Member[]
}) {
  return (
    <div
      className="import-review"
      role="region"
      aria-label="Rows to import"
      tabIndex={0}
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead scope="col">Line</TableHead>
            <TableHead scope="col">Project</TableHead>
            <TableHead scope="col">Result</TableHead>
            <TableHead scope="col">Owner</TableHead>
            <TableHead scope="col">Due</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.line}
              data-invalid={row.errors.length > 0 || undefined}
            >
              <TableCell className="tabular-nums">{row.line}</TableCell>
              <TableCell>{row.name || "—"}</TableCell>
              <TableCell>
                {row.errors.length === 0 ? (
                  <span className="import-result" data-status="ready">
                    <CircleCheck aria-hidden="true" />
                    <span>
                      Ready
                      {row.notes.length > 0 && (
                        <span className="import-note">
                          {" "}
                          {row.notes.join(" ")}
                        </span>
                      )}
                    </span>
                  </span>
                ) : (
                  <span className="import-result" data-status="skipped">
                    <CircleAlert aria-hidden="true" />
                    <span>Skipped: {row.errors.join(" ")}</span>
                  </span>
                )}
              </TableCell>
              <TableCell>{ownerLabel(row, members)}</TableCell>
              <TableCell>
                {row.dueDate
                  ? formatDate(row.dueDate, { year: "numeric" })
                  : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

/** The matched member, what the file said, or the default owner. */
function ownerLabel(row: ImportRow, members: Member[]) {
  const member = members.find((item) => item.id === row.ownerId)

  if (!row.ownerText) return `${member?.name ?? "You"} (default)`

  return row.notes.length > 0
    ? `${member?.name ?? "You"} (for ${row.ownerText})`
    : (member?.name ?? row.ownerText)
}
