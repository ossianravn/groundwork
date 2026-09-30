import * as React from "react"
import { FileText, X } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/kit/ui/button"

export interface AttachmentItem {
  id: string
  name: string
  /** A MIME type; images show as thumbnails. */
  mediaType?: string
  size?: number
  /** Preview address for images (object or data URL). */
  url?: string
  /** Replaces the file icon, such as a project's colour mark. */
  icon?: React.ReactNode
  /** Secondary text instead of the size, such as "Project". */
  detail?: string
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`

  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * One attachment: a thumbnail for images, otherwise a chip with its name and
 * size. With `onRemove` it offers a remove button named after the file.
 */
function Attachment({
  item,
  onRemove,
  className,
}: {
  item: AttachmentItem
  onRemove?: () => void
  className?: string
}) {
  const image = item.mediaType?.startsWith("image/") && item.url
  const detail = item.detail ?? (item.size ? formatSize(item.size) : undefined)

  // On a thumbnail the button sits on the corner; on a chip, at its end.
  const remove = (corner: boolean) =>
    onRemove && (
      <Button
        type="button"
        variant={corner ? "secondary" : "ghost"}
        size="icon-xs"
        className={cn(
          "rounded-full",
          corner
            ? "absolute -end-1.5 -top-1.5 border border-border shadow-xs"
            : "-me-1.5 shrink-0 text-muted-foreground",
        )}
        aria-label={`Remove ${item.name}`}
        onClick={onRemove}
      >
        <X aria-hidden="true" />
      </Button>
    )

  if (image)
    return (
      <li data-slot="attachment" className={cn("relative", className)}>
        <img
          src={item.url}
          alt={item.name}
          className="size-14 rounded-lg border border-border object-cover"
        />
        {remove(true)}
      </li>
    )

  return (
    <li
      data-slot="attachment"
      className={cn(
        "relative flex h-14 max-w-60 min-w-0 items-center gap-2 rounded-lg border border-border bg-muted/50 ps-2.5 pe-3 text-sm",
        className,
      )}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-background text-muted-foreground">
        {item.icon ?? <FileText className="size-4" aria-hidden="true" />}
      </span>
      <span className="grid min-w-0 flex-1">
        <span className="truncate font-medium">{item.name}</span>
        {detail && (
          <span className="truncate text-xs text-muted-foreground">
            {detail}
          </span>
        )}
      </span>
      {remove(false)}
    </li>
  )
}

/** A wrapping row of attachments, in a composer or a sent message. */
function Attachments({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="attachments"
      className={cn("flex flex-wrap gap-2", className)}
      {...props}
    />
  )
}

export { Attachment, Attachments }
