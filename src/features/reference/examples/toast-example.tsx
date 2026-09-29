import { useState } from "react"
import { Button } from "@/kit/ui/button"
import { useToast } from "@/kit/ui/use-toast"

export function ToastExample() {
  const toast = useToast()
  const [archived, setArchived] = useState(false)

  function archive() {
    setArchived(true)
    toast.add({
      title: "Brand refresh archived",
      description: "It no longer appears in active projects.",
      type: "success",
      actionProps: { children: "Undo", onClick: () => setArchived(false) },
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="outline" disabled={archived} onClick={archive}>
        Archive project
      </Button>
      <Button
        variant="ghost"
        onClick={() =>
          toast.add({
            title: "Couldn’t reach the server",
            description: "Your changes are kept; try again in a moment.",
            type: "error",
          })
        }
      >
        Show an error
      </Button>
      <span className="text-sm text-muted-foreground">
        {archived ? "Archived" : "Active"}
      </span>
    </div>
  )
}
