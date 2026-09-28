import type { ReactNode, RefObject } from "react"
import { Ellipsis } from "lucide-react"
import { Button } from "@/kit/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@/kit/ui/popover"

export function ProjectBulkMenu({
  children,
  open,
  onOpenChange,
  notice,
}: {
  children: ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
  notice: RefObject<HTMLParagraphElement | null>
}) {
  return (
    <>
      <div className="project-bulk-inline">{children}</div>
      <div className="project-bulk-mobile">
        <Popover open={open} onOpenChange={onOpenChange}>
          <PopoverTrigger
            render={
              <Button variant="outline" className="project-bulk-menu-trigger" />
            }
            aria-label="Actions for selected projects"
            title="Actions for selected projects"
          >
            <span>Actions</span>
            <Ellipsis aria-hidden="true" data-icon="inline-end" />
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="project-bulk-menu"
            finalFocus={() =>
              notice.current?.textContent ? notice.current : true
            }
          >
            <PopoverTitle className="sr-only">
              Selected project actions
            </PopoverTitle>
            {children}
          </PopoverContent>
        </Popover>
      </div>
    </>
  )
}
