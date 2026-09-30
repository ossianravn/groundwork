import * as React from "react"
import { Paperclip, Plus } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/kit/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/kit/ui/dropdown-menu"
import { Attachment, Attachments } from "@/kit/ai/attachments"
import { usePromptInput } from "@/kit/ai/prompt-input-context"

/**
 * What is attached to the message being written. References (records added
 * as context) show `referenceIcon`; files show their thumbnail or type.
 */
function PromptInputAttachments({
  referenceIcon,
  referenceDetail = "Context",
  className,
}: {
  referenceIcon?: (value: string) => React.ReactNode
  referenceDetail?: string
  className?: string
}) {
  const { attachments, textarea } = usePromptInput()

  if (!attachments.items.length) return null

  return (
    <Attachments aria-label="Attached" className={cn("px-3 pt-3", className)}>
      {attachments.items.map((item) => (
        <Attachment
          key={item.id}
          item={
            item.kind === "file"
              ? {
                  id: item.id,
                  name: item.file.name,
                  mediaType: item.file.type,
                  size: item.file.size,
                  url: item.url,
                }
              : {
                  id: item.id,
                  name: item.label,
                  detail: referenceDetail,
                  icon: referenceIcon?.(item.value),
                }
          }
          onRemove={() => {
            attachments.remove(item.id)
            textarea.current?.focus()
          }}
        />
      ))}
    </Attachments>
  )
}

/** The round "+" button and its menu of ways to add to the message. */
function PromptInputActionMenu({
  label = "Add files and more",
  children,
}: {
  label?: string
  /** PromptInputActionItem and PromptInputAddFiles entries. */
  children: React.ReactNode
}) {
  const { textarea } = usePromptInput()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full text-muted-foreground hover:text-foreground"
            aria-label={label}
          />
        }
      >
        <Plus aria-hidden="true" />
      </DropdownMenuTrigger>
      {/* Closing returns to the text, where the message continues. */}
      <DropdownMenuContent
        align="start"
        className="min-w-72"
        finalFocus={textarea}
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** A menu entry with an icon, a name and a quieter description. */
function PromptInputActionItem({
  icon,
  label,
  description,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  description?: string
  onClick: () => void
}) {
  return (
    <DropdownMenuItem onClick={onClick} className="gap-2.5">
      <span className="flex size-4 shrink-0 items-center justify-center text-muted-foreground">
        {icon}
      </span>
      <span className="min-w-0 truncate">{label}</span>
      {description && (
        <span className="ms-auto ps-3 text-xs text-muted-foreground">
          {description}
        </span>
      )}
    </DropdownMenuItem>
  )
}

/** Opens the file picker; the files join the message's attachments. */
function PromptInputAddFiles({
  label = "Add photos & files",
  description = "From your computer",
}: {
  label?: string
  description?: string
}) {
  const { openFilePicker } = usePromptInput()

  return (
    <PromptInputActionItem
      icon={<Paperclip className="size-4" aria-hidden="true" />}
      label={label}
      description={description}
      onClick={openFilePicker}
    />
  )
}

/** Attaches a record, such as a project, as context for the message. */
function PromptInputAddReference({
  value,
  label,
  icon,
  description,
}: {
  value: string
  label: string
  icon: React.ReactNode
  description?: string
}) {
  const { attachments } = usePromptInput()

  return (
    <PromptInputActionItem
      icon={icon}
      label={label}
      description={description}
      onClick={() => attachments.addReference(value, label)}
    />
  )
}

export {
  PromptInputAttachments,
  PromptInputActionMenu,
  PromptInputActionItem,
  PromptInputAddFiles,
  PromptInputAddReference,
}
