import type { ReactNode } from "react"
import { Button } from "@/kit/ui/button"

// MKT-12: asks for a choice only when a deployment runs optional services.
// It does not block the page; accepting and rejecting carry equal weight,
// and Customize opens the host's preferences.
export function ConsentBanner({
  title,
  children,
  onAccept,
  onReject,
  onCustomize,
}: {
  title: string
  children: ReactNode
  onAccept: () => void
  onReject: () => void
  onCustomize: () => void
}) {
  return (
    <section className="consent-banner" aria-labelledby="consent-title">
      <div className="consent-banner-copy">
        <h2 id="consent-title">{title}</h2>
        <div>{children}</div>
      </div>
      <div className="consent-banner-actions">
        <Button variant="ghost" onClick={onCustomize}>
          Customize
        </Button>
        <Button variant="outline" onClick={onReject}>
          Reject optional
        </Button>
        <Button variant="outline" onClick={onAccept}>
          Accept all
        </Button>
      </div>
    </section>
  )
}
