import { useState } from "react"
import { Download, FolderKanban } from "lucide-react"
import { buttonVariants } from "@/kit/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/kit/ui/dialog"
import {
  Attachment,
  Attachments,
  type AttachmentItem,
} from "@/kit/ai/attachments"

const initial: AttachmentItem[] = [
  {
    id: "palette",
    name: "primary-palette.svg",
    mediaType: "image/svg+xml",
    size: 1_222,
    url: "/images/attachments/primary-palette.svg",
  },
  {
    id: "invoice",
    name: "invoice-september.pdf",
    mediaType: "application/pdf",
    size: 2_242,
    url: "/invoices/sample-2026-09.pdf",
  },
  { id: "budget", name: "budget.csv", mediaType: "text/csv", size: 3_200 },
  {
    id: "mobile",
    name: "Mobile app",
    detail: "Project",
    icon: <FolderKanban className="size-4" aria-hidden="true" />,
  },
]

export function AttachmentsExample() {
  const [items, setItems] = useState(initial)
  const [open, setOpen] = useState(false)
  const [preview, setPreview] = useState<AttachmentItem>()

  return (
    <div className="grid max-w-xl gap-2">
      <Attachments aria-label="Attached">
        {items.map((item) => (
          <Attachment
            key={item.id}
            item={item}
            // Only files with contents open; budget.csv is a name only.
            onOpen={
              item.url
                ? () => {
                    setPreview(item)
                    setOpen(true)
                  }
                : undefined
            }
            onRemove={() =>
              setItems((list) => list.filter((entry) => entry.id !== item.id))
            }
          />
        ))}
      </Attachments>
      {!items.length && (
        <p className="text-sm text-muted-foreground">Nothing attached.</p>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        {preview && (
          <DialogContent className="md:max-w-lg" showCloseButton={false}>
            <DialogHeader showCloseButton>
              <DialogTitle>{preview.name}</DialogTitle>
              <DialogDescription>Attached to your message</DialogDescription>
            </DialogHeader>
            {preview.mediaType?.startsWith("image/") ? (
              <img
                src={preview.url}
                alt={preview.name}
                className="max-h-[60vh] w-full rounded-lg border border-border bg-background object-contain"
              />
            ) : (
              <p className="text-muted-foreground">
                No preview for this file type.
              </p>
            )}
            <DialogFooter>
              <a
                href={preview.url}
                download={preview.name}
                className={buttonVariants({ variant: "outline" })}
              >
                <Download aria-hidden="true" data-icon="inline-start" />
                Download
              </a>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
