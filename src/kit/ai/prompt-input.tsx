import * as React from "react"
import { ArrowUp, Square } from "lucide-react"
import { cn } from "cn"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/kit/ui/input-group"

/** Mirrors the AI SDK's chat status. */
export type PromptStatus = "ready" | "submitted" | "streaming" | "error"

const PromptInputContext = React.createContext<{
  value: string
  setValue: (value: string) => void
  busy: boolean
  textarea: React.RefObject<HTMLTextAreaElement | null>
} | null>(null)

function usePromptInput() {
  const context = React.useContext(PromptInputContext)

  if (!context) throw new Error("Prompt input parts need a PromptInput")

  return context
}

/**
 * The message composer. Enter sends and Shift+Enter adds a line; while the
 * model works, the submit button stops the response instead, and Enter does
 * nothing so a half-written follow-up is never lost.
 */
function PromptInput({
  status,
  onSubmit,
  onStop,
  value: controlled,
  onValueChange,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"form">, "onSubmit"> & {
  status: PromptStatus
  onSubmit: (text: string) => void
  onStop: () => void
  value?: string
  onValueChange?: (value: string) => void
}) {
  const [own, setOwn] = React.useState("")
  const value = controlled ?? own
  const textarea = React.useRef<HTMLTextAreaElement>(null)
  const busy = status === "submitted" || status === "streaming"

  const setValue = React.useCallback(
    (next: string) => {
      setOwn(next)
      onValueChange?.(next)
    },
    [onValueChange],
  )

  return (
    <PromptInputContext value={{ value, setValue, busy, textarea }}>
      <form
        data-slot="prompt-input"
        className={cn("w-full", className)}
        onSubmit={(event) => {
          event.preventDefault()

          if (busy) {
            onStop()
            textarea.current?.focus()
          } else if (value.trim()) {
            onSubmit(value.trim())
            setValue("")
          } else textarea.current?.focus()
        }}
        {...props}
      >
        <InputGroup className="rounded-xl bg-background shadow-xs">
          {children}
        </InputGroup>
      </form>
    </PromptInputContext>
  )
}

function PromptInputTextarea({
  className,
  onKeyDown,
  ...props
}: Omit<React.ComponentProps<"textarea">, "value" | "onChange">) {
  const { value, setValue, busy, textarea } = usePromptInput()

  return (
    <InputGroupTextarea
      ref={textarea}
      name="message"
      rows={1}
      value={value}
      className={cn(
        "max-h-48 min-h-[calc(var(--control-height)+0.5rem)] px-3 pt-3",
        className,
      )}
      onChange={(event) => setValue(event.target.value)}
      onKeyDown={(event) => {
        onKeyDown?.(event)

        if (
          event.defaultPrevented ||
          event.key !== "Enter" ||
          event.shiftKey ||
          event.nativeEvent.isComposing
        )
          return

        event.preventDefault()

        if (!busy) event.currentTarget.form?.requestSubmit()
      }}
      {...props}
    />
  )
}

/** The row under the text: tools at the start, the submit button at the end. */
function PromptInputFooter({
  className,
  ...props
}: React.ComponentProps<typeof InputGroupAddon>) {
  return (
    <InputGroupAddon
      align="block-end"
      className={cn("justify-between gap-2 pe-2", className)}
      {...props}
    />
  )
}

function PromptInputSubmit({
  className,
  ...props
}: Omit<React.ComponentProps<typeof InputGroupButton>, "children">) {
  const { busy } = usePromptInput()

  return (
    <InputGroupButton
      type="submit"
      variant="default"
      size="icon-sm"
      aria-label={busy ? "Stop response" : "Send message"}
      className={cn("ms-auto rounded-full", className)}
      {...props}
    >
      {busy ? (
        <Square className="fill-current" aria-hidden="true" />
      ) : (
        <ArrowUp aria-hidden="true" />
      )}
    </InputGroupButton>
  )
}

export {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
}
