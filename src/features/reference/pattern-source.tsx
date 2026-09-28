import { useEffect, useRef, useState } from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@/kit/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/kit/ui/alert"

type SourceState =
  | { status: "loading" }
  | { status: "ready"; text: string }
  | { status: "error" }

function SourceFile({
  path,
  readSource,
}: {
  path: string
  readSource: (path: string) => Promise<string>
}) {
  const [state, setState] = useState<SourceState>({ status: "loading" })
  const [attempt, setAttempt] = useState(0)
  const [copy, setCopy] = useState<"idle" | "copied" | "failed">("idle")
  const code = useRef<HTMLElement>(null)

  useEffect(() => {
    let current = true
    readSource(path)
      .then((text) => {
        if (current) setState({ status: "ready", text })
      })
      .catch(() => {
        if (current) setState({ status: "error" })
      })

    return () => {
      current = false
    }
  }, [path, readSource, attempt])

  async function copyCode(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopy("copied")
    } catch {
      setCopy("failed")
      code.current?.focus({ preventScroll: true })

      if (code.current) {
        const range = document.createRange()
        range.selectNodeContents(code.current)
        window.getSelection()?.removeAllRanges()
        window.getSelection()?.addRange(range)
      }
    }
  }

  if (state.status === "loading") return <p role="status">Loading source…</p>
  if (state.status === "error")
    return (
      <Alert variant="destructive">
        <AlertTitle>Source could not load</AlertTitle>
        <AlertDescription>
          Your preview is still available.
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setState({ status: "loading" })
              setAttempt((value) => value + 1)
            }}
          >
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    )

  return (
    <>
      <div className="pattern-source-toolbar">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => void copyCode(state.text)}
        >
          {copy === "copied" ? (
            <Check data-icon="inline-start" />
          ) : (
            <Copy data-icon="inline-start" />
          )}
          {copy === "copied" ? "Copied" : "Copy file"}
        </Button>
      </div>
      <pre className="reference-code">
        <code ref={code} tabIndex={0} aria-label={`${path} source`}>
          {state.text}
        </code>
      </pre>
      <p
        className={copy === "failed" ? "reference-copy-error" : "sr-only"}
        role="status"
      >
        {copy === "failed"
          ? "Clipboard access failed. The source is selected; copy it manually."
          : copy === "copied"
            ? "Source copied."
            : ""}
      </p>
    </>
  )
}

function SourceDisclosure({
  path,
  readSource,
}: {
  path: string
  readSource: (path: string) => Promise<string>
}) {
  const [open, setOpen] = useState(false)

  return (
    <details
      className="pattern-source-file"
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary>
        <code>{path}</code>
      </summary>
      {open && <SourceFile path={path} readSource={readSource} />}
    </details>
  )
}

export function PatternSource({
  paths,
  readSource,
}: {
  paths: string[]
  readSource: (path: string) => Promise<string>
}) {
  return (
    <section aria-labelledby="pattern-source-title" className="pattern-sources">
      <h2 id="pattern-source-title">Implementation</h2>
      <p>
        The actual files used by the demo. Imports reference shared primitives,
        styles and data in this repository.
      </p>
      {paths.map((path) => (
        <SourceDisclosure key={path} path={path} readSource={readSource} />
      ))}
    </section>
  )
}
