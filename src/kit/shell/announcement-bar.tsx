import type { ReactNode } from "react"
import { X } from "lucide-react"
import { Button } from "@/kit/ui/button"

/** A slim notice above the public header, such as a new release (MKT-25). */
export function AnnouncementBar({
  children,
  onDismiss,
}: {
  children: ReactNode
  onDismiss?: () => void
}) {
  return (
    <div className="announcement-bar" role="region" aria-label="Announcement">
      <div className="public-container announcement-row">
        <p>{children}</p>
        {onDismiss && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="announcement-dismiss"
            aria-label="Dismiss announcement"
            onClick={onDismiss}
          >
            <X aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  )
}
