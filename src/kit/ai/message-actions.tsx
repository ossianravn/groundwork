import * as React from "react"
import { Check, Copy } from "lucide-react"
import { cn } from "cn"
import { useCopy } from "@/kit/lib/use-copy"
import { Button } from "@/kit/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/kit/ui/tooltip"

/** A quiet row of icon actions under a message. */
function MessageActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="message-actions"
      role="group"
      className={cn("-ms-1.5 flex items-center gap-0.5", className)}
      {...props}
    />
  )
}

/** An icon button whose label is both its accessible name and its tooltip. */
function MessageAction({
  label,
  children,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "aria-label"> & {
  label: string
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-foreground"
            aria-label={label}
            {...props}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

/** Copies a message's text; failure is reported so it can be copied by hand. */
function MessageCopyAction({ text }: { text: string }) {
  const { state, copy } = useCopy()

  return (
    <>
      <MessageAction
        label={state === "copied" ? "Copied" : "Copy"}
        onClick={() => void copy(text)}
      >
        {state === "copied" ? (
          <Check aria-hidden="true" />
        ) : (
          <Copy aria-hidden="true" />
        )}
      </MessageAction>
      <span className="sr-only" role="status">
        {state === "copied"
          ? "Response copied"
          : state === "failed"
            ? "Copying isn't available here. Select the response to copy it."
            : ""}
      </span>
    </>
  )
}

export { MessageActions, MessageAction, MessageCopyAction }
