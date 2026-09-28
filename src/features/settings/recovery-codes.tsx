import { useRef, useState } from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@/kit/ui/button"
import { Textarea } from "@/kit/ui/textarea"

export function RecoveryCodes({ codes }: { codes: string[] }) {
  const text = useRef<HTMLTextAreaElement>(null)

  const [copyState, setCopyState] = useState<"idle" | "copied" | "blocked">(
    "idle",
  )

  async function copy() {
    try {
      await navigator.clipboard.writeText(codes.join("\n"))
      setCopyState("copied")
    } catch {
      text.current?.focus()
      text.current?.select()
      setCopyState("blocked")
    }
  }

  return (
    <div className="recovery-codes">
      {codes.length ? (
        <>
          <Textarea
            ref={text}
            aria-label="Unused recovery codes"
            readOnly
            value={codes.join("\n")}
            rows={codes.length}
            className="recovery-code-list"
            onFocus={(event) => event.target.select()}
          />
          <Button variant="outline" onClick={() => void copy()}>
            {copyState === "copied" ? <Check /> : <Copy />}
            {copyState === "copied" ? "Copied" : "Copy codes"}
          </Button>
        </>
      ) : (
        <p>No unused codes remain.</p>
      )}
      <p
        role="status"
        className={copyState === "blocked" ? "settings-note" : "sr-only"}
      >
        {copyState === "blocked"
          ? "Copy was blocked. The codes are selected; copy them manually."
          : copyState === "copied"
            ? "Recovery codes copied."
            : ""}
      </p>
    </div>
  )
}
