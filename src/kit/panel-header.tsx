import type { ReactNode } from "react"
import { X } from "lucide-react"
import { Button } from "@/kit/ui/button"
import {
  SheetClose,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/kit/ui/sheet"

export function PanelHeader({
  title,
  description,
  leading,
}: {
  title: string
  description?: string
  /** Decorative mark shown before the title, such as a record's colour. */
  leading?: ReactNode
}) {
  return (
    <SheetHeader className="panel-header">
      <div className="panel-heading">
        <SheetTitle>
          {leading}
          {title}
        </SheetTitle>
        <SheetClose render={<Button variant="ghost" size="icon" />}>
          <X aria-hidden="true" />
          <span className="sr-only">Close</span>
        </SheetClose>
      </div>
      {description && <SheetDescription>{description}</SheetDescription>}
    </SheetHeader>
  )
}
