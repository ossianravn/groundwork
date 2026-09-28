import { useState } from "react"
import { Check, Bookmark } from "lucide-react"
import { Button } from "@/kit/ui/button"

export function ButtonExample() {
  const [saved, setSaved] = useState(false)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button onClick={() => setSaved(!saved)} aria-pressed={saved}>
        {saved ? (
          <Check data-icon="inline-start" />
        ) : (
          <Bookmark data-icon="inline-start" />
        )}
        {saved ? "Saved" : "Save project"}
      </Button>
      <Button variant="outline" onClick={() => setSaved(false)}>
        Reset
      </Button>
      <Button variant="secondary" disabled>
        Archive
      </Button>
    </div>
  )
}
