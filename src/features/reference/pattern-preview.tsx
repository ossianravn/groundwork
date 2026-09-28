import { useState } from "react"
import { RotateCcw } from "lucide-react"
import { Button } from "@/kit/ui/button"
import type { PatternExample } from "./pattern-catalog"

export function PatternPreview({
  title,
  example,
}: {
  title: string
  example: PatternExample
}) {
  const [open, setOpen] = useState(false)
  const [revision, setRevision] = useState(0)

  return (
    <details
      className="reference-source-details pattern-preview-disclosure"
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary>Preview page</summary>
      {open && (
        <div className="pattern-preview-body">
          <div className="pattern-preview-toolbar">
            <p>
              This page has its own demo session. Closing the preview resets its
              data; appearance preferences are shared.
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRevision((value) => value + 1)}
            >
              <RotateCcw data-icon="inline-start" />
              Reset preview
            </Button>
          </div>
          <iframe
            key={`${example.href}-${revision}`}
            src={example.href}
            title={`${title}: ${example.label} live page`}
            className="pattern-live-frame"
          />
        </div>
      )}
    </details>
  )
}
