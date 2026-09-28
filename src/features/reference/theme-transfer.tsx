import { useRef, useState } from "react"
import { Button } from "@/kit/ui/button"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/kit/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/kit/ui/tabs"
import { Textarea } from "@/kit/ui/textarea"
import { Field, FieldLabel, FieldError } from "@/kit/ui/field"
import { decodePreset, type ThemePreset } from "@/kit/theme/preset"
import { presetCSS } from "@/kit/theme/preset-document"
import { presetRegistryItem } from "@/kit/theme/preset-registry"

const formats = {
  json: { label: "JSON preset", type: "application/json" },
  css: { label: "CSS preset", type: "text/css" },
  registry: { label: "shadcn registry item", type: "application/json" },
} as const

type ExportFormat = keyof typeof formats

export function ThemeTransfer({
  preset,
  ready,
  onImport,
}: {
  preset: ThemePreset
  ready: boolean
  onImport: (preset: ThemePreset) => void
}) {
  const [open, setOpen] = useState(false)
  const [format, setFormat] = useState<ExportFormat | "import">("json")
  const [input, setInput] = useState("")
  const [error, setError] = useState("")
  const [feedback, setFeedback] = useState("")
  const output = useRef<HTMLTextAreaElement>(null)

  const item = presetRegistryItem(preset)

  const source =
    format === "css"
      ? presetCSS(preset)
      : JSON.stringify(format === "registry" ? item : preset, null, 2)

  const filename =
    format === "registry" ? `${item.name}.json` : `groundwork-theme.${format}`

  async function copy() {
    try {
      await navigator.clipboard.writeText(source)
      setFeedback("Copied.")
    } catch {
      output.current?.focus()
      output.current?.select()
      setFeedback("Clipboard access failed. Copy the selected text manually.")
    }
  }

  function download() {
    const url = URL.createObjectURL(
      new Blob([source], {
        type: format === "import" ? "text/plain" : formats[format].type,
      }),
    )

    const link = document.createElement("a")
    link.href = url
    link.download = filename
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  function importPreset() {
    try {
      onImport(decodePreset(input))
      setError("")
      setOpen(false)
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "This preset could not be imported.",
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" />}>
        Import / export
      </DialogTrigger>
      <DialogContent className="theme-transfer">
        <DialogHeader>
          <DialogTitle>Import / export</DialogTitle>
          <DialogDescription>
            JSON preserves both color modes and appearance choices. CSS supplies
            resolved color tokens for the existing Tandem styles; its header
            lists the root attributes to apply. The shadcn registry item
            installs the same colors as a theme file in a project that uses the
            Groundwork kit.
          </DialogDescription>
        </DialogHeader>
        <Tabs
          value={format}
          onValueChange={(value) => {
            if (
              value === "import" ||
              value === "json" ||
              value === "css" ||
              value === "registry"
            ) {
              setFormat(value)
              setFeedback("")
            }
          }}
        >
          <TabsList variant="line" aria-label="Preset transfer">
            <TabsTrigger value="json">JSON</TabsTrigger>
            <TabsTrigger value="css">CSS</TabsTrigger>
            <TabsTrigger value="registry">shadcn</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
          </TabsList>
          {format !== "import" ? (
            <TabsContent value={format}>
              <Field>
                <FieldLabel htmlFor="theme-export">
                  {formats[format].label}
                </FieldLabel>
                <Textarea
                  ref={output}
                  id="theme-export"
                  className="theme-code"
                  value={ready ? source : "Loading preview colors…"}
                  readOnly
                />
              </Field>
              <div className="theme-transfer-actions">
                <Button
                  variant="outline"
                  disabled={!ready}
                  onClick={() => void copy()}
                >
                  Copy
                </Button>
                <Button disabled={!ready} onClick={download}>
                  Download
                </Button>
              </div>
              {format === "registry" && (
                <p className="theme-hint">
                  Save it as <code>{filename}</code> in the project root and run{" "}
                  <code>npx shadcn add ./{filename}</code>. The theme file lands
                  in <code>{item.files[0].target}</code> and loads after the
                  kit&apos;s tokens. Host the file to share it by URL.
                </p>
              )}
              <p role="status" className="theme-hint">
                {feedback}
              </p>
            </TabsContent>
          ) : (
            <TabsContent value="import">
              <Field data-invalid={!!error}>
                <FieldLabel htmlFor="theme-import">Preset JSON</FieldLabel>
                <Textarea
                  id="theme-import"
                  className="theme-code"
                  value={input}
                  onChange={(event) => {
                    setInput(event.target.value)
                    setError("")
                  }}
                  aria-invalid={!!error}
                  aria-describedby={error ? "theme-import-error" : undefined}
                />
                {error && (
                  <FieldError id="theme-import-error" role="alert">
                    {error}
                  </FieldError>
                )}
              </Field>
              <div className="theme-transfer-actions">
                <Button onClick={importPreset}>Import draft</Button>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
