import { useState } from "react"
import { TextHint } from "@/kit/ui/text-hint"
import { Button } from "@/kit/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/kit/ui/tooltip"
import { Bookmark, BookmarkCheck } from "lucide-react"

export function TooltipExample() {
  const [saved, setSaved] = useState(false)
  const label = saved ? "Remove bookmark" : "Bookmark example"

  return (
    <div className="flex flex-wrap items-center gap-6">
      <TextHint description="A project is active while its status is In progress or In review. Completed tasks stay completed when a project is reopened.">
        Active projects
      </TextHint>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="outline"
              size="icon"
              aria-label={label}
              aria-pressed={saved}
              onClick={() => setSaved(!saved)}
            />
          }
        >
          {saved ? (
            <BookmarkCheck aria-hidden="true" />
          ) : (
            <Bookmark aria-hidden="true" />
          )}
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </div>
  )
}
