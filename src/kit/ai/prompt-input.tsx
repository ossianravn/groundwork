import * as React from "react"
import { ArrowUp, Square } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/kit/ui/button"
import { Kbd } from "@/kit/ui/kbd"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/kit/ui/tooltip"
import {
  PromptInputContext,
  usePromptInput,
  type PromptStatus,
  type PromptSubmission,
} from "@/kit/ai/prompt-input-context"
import {
  usePromptAttachments,
  type AttachmentLimits,
} from "@/kit/ai/use-prompt-attachments"

export type { PromptStatus, PromptSubmission }

const defaultLimits: AttachmentLimits = {
  accept: "image/*,application/pdf,text/*,.csv,.md",
  maxFiles: 5,
  maxFileSize: 10 * 1024 * 1024,
}

/**
 * The message composer: a rounded surface with the text, attachments and a
 * row of tools. Enter sends and Shift+Enter adds a line. While the model
 * works, the submit button stops it; Enter queues the text when `onQueue`
 * is given (and nothing is attached), so a follow-up is never lost. Files
 * can be picked, dropped or pasted.
 */
function PromptInput({
  status,
  onSubmit,
  onStop,
  onQueue,
  value: controlled,
  onValueChange,
  limits = defaultLimits,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"form">, "onSubmit"> & {
  status: PromptStatus
  onSubmit: (submission: PromptSubmission) => void
  onStop: () => void
  /** Keeps a message written during a reply, to send after it. */
  onQueue?: (text: string) => void
  value?: string
  onValueChange?: (value: string) => void
  limits?: AttachmentLimits
}) {
  const [own, setOwn] = React.useState("")
  const [dragging, setDragging] = React.useState(false)
  const value = controlled ?? own
  const textarea = React.useRef<HTMLTextAreaElement>(null)
  const fileInput = React.useRef<HTMLInputElement>(null)
  const attachments = usePromptAttachments(limits)
  const busy = status === "submitted" || status === "streaming"

  const setValue = React.useCallback(
    (next: string) => {
      setOwn(next)
      onValueChange?.(next)
    },
    [onValueChange],
  )

  function submit(event: React.FormEvent) {
    event.preventDefault()

    if (busy) {
      onStop()
      textarea.current?.focus()

      return
    }

    if (!value.trim() && !attachments.items.length)
      return textarea.current?.focus()

    onSubmit({
      text: value.trim(),
      files: attachments.items.flatMap((item) =>
        item.kind === "file" ? item.file : [],
      ),
      references: attachments.items.flatMap((item) =>
        item.kind === "reference"
          ? { value: item.value, label: item.label }
          : [],
      ),
    })
    setValue("")
    attachments.clear()
  }

  const hasFiles = (event: React.DragEvent) =>
    event.dataTransfer.types.includes("Files")

  return (
    <PromptInputContext
      value={{
        value,
        setValue,
        busy,
        textarea,
        attachments,
        openFilePicker: () => fileInput.current?.click(),
        queue:
          onQueue &&
          (() => {
            if (!value.trim() || attachments.items.length) return

            onQueue(value.trim())
            setValue("")
          }),
      }}
    >
      <form
        data-slot="prompt-input"
        className={cn(
          "relative flex w-full flex-col rounded-[calc(var(--radius)*2.25)] border border-border bg-card text-card-foreground shadow-sm transition-[border-color,box-shadow] duration-(--motion-fast) has-[textarea:focus-visible]:border-ring/50 has-[textarea:focus-visible]:ring-3 has-[textarea:focus-visible]:ring-ring/15",
          className,
        )}
        onSubmit={submit}
        onDragOver={(event) => {
          if (!hasFiles(event)) return

          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={(event) => {
          const next = event.relatedTarget

          // Leaving for a child is not leaving the composer.
          if (!(next instanceof Node) || !event.currentTarget.contains(next))
            setDragging(false)
        }}
        onDrop={(event) => {
          if (!hasFiles(event)) return

          event.preventDefault()
          setDragging(false)
          attachments.addFiles(event.dataTransfer.files)
          textarea.current?.focus()
        }}
        {...props}
      >
        <input
          ref={fileInput}
          type="file"
          multiple
          accept={limits.accept}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(event) => {
            if (event.target.files) attachments.addFiles(event.target.files)

            event.target.value = ""
            textarea.current?.focus()
          }}
        />
        {children}
        {attachments.error && (
          <p role="alert" className="px-4 pb-2 text-xs text-destructive">
            {attachments.error}
          </p>
        )}
        {dragging && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-[inherit] border-2 border-dashed border-ring bg-card/90 text-sm font-medium text-muted-foreground"
          >
            Drop files to attach
          </div>
        )}
      </form>
    </PromptInputContext>
  )
}

function PromptInputTextarea({
  className,
  onKeyDown,
  onPaste,
  ...props
}: Omit<React.ComponentProps<"textarea">, "value" | "onChange">) {
  const { value, setValue, busy, queue, attachments, textarea } =
    usePromptInput()

  return (
    <textarea
      ref={textarea}
      name="message"
      rows={1}
      value={value}
      data-slot="prompt-input-textarea"
      className={cn(
        "field-sizing-content max-h-60 min-h-12 w-full resize-none bg-transparent px-4 pt-3.5 pb-1 text-(length:--control-font-size) leading-(--leading-body) outline-none placeholder:text-muted-foreground",
        className,
      )}
      onChange={(event) => setValue(event.target.value)}
      onPaste={(event) => {
        onPaste?.(event)

        if (event.clipboardData.files.length) {
          event.preventDefault()
          attachments.addFiles(event.clipboardData.files)
        }
      }}
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
        else queue?.()
      }}
      {...props}
    />
  )
}

/** The row under the text. Put tools first and the submit button last. */
function PromptInputFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="prompt-input-footer"
      className={cn("flex min-w-0 items-center gap-1 px-2 pb-2", className)}
      {...props}
    />
  )
}

/** Stop while the model works; otherwise send, with the keys in its tooltip. */
function PromptInputSubmit({
  className,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "children">) {
  const { busy } = usePromptInput()

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="submit"
            size="icon"
            aria-label={busy ? "Stop response" : "Send message"}
            aria-keyshortcuts={busy ? undefined : "Enter"}
            className={cn("rounded-full", className)}
            {...props}
          />
        }
      >
        {busy ? (
          <Square className="size-3.5 fill-current" aria-hidden="true" />
        ) : (
          <ArrowUp aria-hidden="true" />
        )}
      </TooltipTrigger>
      <TooltipContent className="grid gap-1">
        {busy ? (
          "Stop the reply"
        ) : (
          <>
            <span>
              Send <Kbd>Enter</Kbd>
            </span>
            <span>
              New line <Kbd>Shift+Enter</Kbd>
            </span>
          </>
        )}
      </TooltipContent>
    </Tooltip>
  )
}

export {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
}
