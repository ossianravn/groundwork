import { useEffect, useState } from "react"
import { Check, Bookmark } from "lucide-react"
import { Button } from "@/kit/ui/button"

export function ButtonExample() {
  const [saved, setSaved] = useState(false)
  const [publishing, setPublishing] = useState(false)

  // Stands in for a request; the button keeps its width while it runs.
  useEffect(() => {
    if (!publishing) return

    const timer = setTimeout(() => setPublishing(false), 1500)

    return () => clearTimeout(timer)
  }, [publishing])

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
      <Button
        variant="outline"
        loading={publishing}
        loadingLabel="Publishing"
        onClick={() => setPublishing(true)}
      >
        Publish update
      </Button>
      <Button variant="secondary" disabled>
        Archive
      </Button>
    </div>
  )
}
