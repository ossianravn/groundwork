import { useState } from "react"
import { FolderKanban } from "lucide-react"
import { Attachment, Attachments } from "@/kit/ai/attachments"

const initial = [
  {
    id: "notes",
    name: "launch-notes.pdf",
    mediaType: "application/pdf",
    size: 482_000,
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

  return (
    <div className="grid max-w-xl gap-2">
      <Attachments aria-label="Attached">
        {items.map((item) => (
          <Attachment
            key={item.id}
            item={item}
            onRemove={() =>
              setItems((list) => list.filter((entry) => entry.id !== item.id))
            }
          />
        ))}
      </Attachments>
      {!items.length && (
        <p className="text-sm text-muted-foreground">Nothing attached.</p>
      )}
    </div>
  )
}
