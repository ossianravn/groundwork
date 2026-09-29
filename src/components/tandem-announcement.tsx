import { useState } from "react"
import { ArrowRight } from "lucide-react"
import { AnnouncementBar } from "@/kit/shell/announcement-bar"
import { releases } from "@/features/resources/content"
import type { PublicLinkComponent } from "./public-link"

const storageKey = "tandem.announcement.dismissed"

function dismissedVersion() {
  try {
    return localStorage.getItem(storageKey)
  } catch {
    // Storage can be unavailable (private windows); the bar then shows.
    return null
  }
}

/**
 * Announces the latest release until dismissed. The choice is remembered
 * per release, like other display preferences; a new release shows again.
 */
export function TandemAnnouncement({
  LinkComponent,
}: {
  LinkComponent: PublicLinkComponent
}) {
  const latest = releases[0]

  const [dismissed, setDismissed] = useState(
    () => dismissedVersion() === latest.version,
  )

  if (dismissed) return null

  return (
    <AnnouncementBar
      onDismiss={() => {
        try {
          localStorage.setItem(storageKey, latest.version)
        } catch {
          // Without storage the bar hides for this page only.
        }

        setDismissed(true)
        document.getElementById("main-content")?.focus({ preventScroll: true })
      }}
    >
      <span>
        New in {latest.version}: {latest.title}
      </span>
      <LinkComponent destination="latest-release">
        Read the release notes
        <ArrowRight aria-hidden="true" />
      </LinkComponent>
    </AnnouncementBar>
  )
}
