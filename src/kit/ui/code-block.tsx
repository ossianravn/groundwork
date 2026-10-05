import * as React from "react"
import { Check, Copy } from "lucide-react"
import type { ThemedToken } from "shiki/core"
import { cn } from "cn"
import { useCopy } from "@/kit/lib/use-copy"
import { Button } from "@/kit/ui/button"
import {
  codeLanguage,
  highlightCode,
  type CodeLanguage,
} from "@/kit/ui/code-block-highlight"

const languageLabels = {
  bash: "Shell",
  css: "CSS",
  diff: "Diff",
  html: "HTML",
  javascript: "JavaScript",
  json: "JSON",
  tsx: "TSX",
  typescript: "TypeScript",
} satisfies Record<CodeLanguage, string>

function useHighlight(code: string, language: string | undefined) {
  const [result, setResult] = React.useState<{
    code: string
    tokens: ThemedToken[][]
  }>()

  React.useEffect(() => {
    let current = true

    highlightCode(code, language).then(
      (tokens) => {
        if (current && tokens) setResult({ code, tokens })
      },
      // A language that fails to load keeps the plain rendering.
      () => undefined,
    )

    return () => {
      current = false
    }
  }, [code, language])

  // Stale tokens would show old text, so only matching results render.
  return result?.code === code ? result.tokens : undefined
}

function CodeBlock({
  code,
  language,
  filename,
  lineNumbers = false,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  code: string
  /** A shiki language name or common alias (ts, sh, js). */
  language?: string
  /** Shown in the header instead of the language name. */
  filename?: string
  lineNumbers?: boolean
}) {
  const tokens = useHighlight(code, language)
  const { state, copy } = useCopy()
  const codeRef = React.useRef<HTMLElement>(null)
  const lang = codeLanguage(language)
  const label = filename ?? (lang ? languageLabels[lang] : language) ?? "Code"

  const lines: Pick<ThemedToken, "content" | "color" | "fontStyle">[][] =
    tokens ?? code.split("\n").map((content) => [{ content }])

  return (
    <div
      data-slot="code-block"
      data-language={lang}
      className={cn(
        "flex min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-(--syntax-background) text-(--syntax-foreground)",
        className,
      )}
      {...props}
    >
      <div
        data-slot="code-block-header"
        className="flex min-h-(--control-height-sm) items-center justify-between gap-2 border-b border-border py-(--control-padding-block) ps-3 pe-1 text-xs text-muted-foreground"
      >
        <span className={cn("truncate", filename && "font-mono")}>{label}</span>
        <span className="sr-only" role="status">
          {state === "copied"
            ? "Code copied"
            : state === "failed"
              ? "Copying isn't available. The code is selected; copy it with your keyboard."
              : ""}
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={state === "copied" ? "Copied" : `Copy ${label}`}
          onClick={() => void copy(code, codeRef.current)}
        >
          {state === "copied" ? (
            <Check aria-hidden="true" />
          ) : (
            <Copy aria-hidden="true" />
          )}
        </Button>
      </div>
      <pre
        data-slot="code-block-body"
        // Scrollable regions need keyboard access when code overflows; the
        // region role lets its label name it.
        tabIndex={0}
        role="region"
        aria-label={label}
        className="overflow-x-auto p-3 font-mono text-[0.8125rem] leading-relaxed outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset"
      >
        <code
          ref={codeRef}
          className={cn(
            "block min-w-max",
            lineNumbers && "[counter-reset:line]",
          )}
        >
          {lines.map((line, index) => (
            <span
              key={index}
              className={cn(
                "block min-h-[1lh]",
                lineNumbers &&
                  "before:me-4 before:inline-block before:w-[2ch] before:text-end before:text-muted-foreground before:content-[counter(line)] before:select-none before:[counter-increment:line]",
              )}
            >
              {line.map((token, part) => (
                <span
                  key={part}
                  style={token.color ? { color: token.color } : undefined}
                  className={token.fontStyle === 1 ? "italic" : undefined}
                >
                  {token.content}
                </span>
              ))}
            </span>
          ))}
        </code>
      </pre>
    </div>
  )
}

export { CodeBlock }
