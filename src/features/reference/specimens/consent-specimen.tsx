import { useRef, useState, type ReactNode } from "react"
import { ConsentBanner } from "@/kit/shell/consent-banner"
import { Button } from "@/kit/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/kit/ui/dialog"
import { Switch } from "@/kit/ui/switch"

export interface ConsentChoice {
  analytics: boolean
  marketing: boolean
  date: string
}

const categories = [
  {
    key: "analytics",
    title: "Analytics",
    description: "Counts visits and page views so we can see what helps.",
  },
  {
    key: "marketing",
    title: "Marketing",
    description: "Measures which campaigns bring people to the site.",
  },
] as const

function describe(choice: ConsentChoice) {
  const allowed = categories.flatMap((category) =>
    choice[category.key] ? [category.title.toLowerCase()] : [],
  )

  return allowed.length
    ? `Essential and ${allowed.join(" and ")} cookies`
    : "Essential cookies only"
}

// MKT-12 specimen. The host stores the choice; this page shows the banner
// until one exists, and a settings button to change it later.
export function ConsentSpecimen({
  choice,
  onChoose,
  onForget,
  note,
}: {
  choice: ConsentChoice | null
  onChoose: (choice: Omit<ConsentChoice, "date">) => void
  onForget: () => void
  note: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState({ analytics: false, marketing: false })
  const status = useRef<HTMLParagraphElement>(null)

  function choose(next: Omit<ConsentChoice, "date">) {
    setOpen(false)
    onChoose(next)
    // The banner disappears with its buttons; the outcome takes focus.
    requestAnimationFrame(() => status.current?.focus())
  }

  function customize() {
    setDraft({
      analytics: choice?.analytics ?? false,
      marketing: choice?.marketing ?? false,
    })
    setOpen(true)
  }

  return (
    <div className="specimen-page">
      <div className="specimen-note">{note}</div>
      <main id="main-content" tabIndex={-1} className="consent-specimen">
        <h1>Cookie consent</h1>
        <p>
          A deployment that runs optional services, such as analytics, asks
          before using them. Tandem runs none, so the demo never shows this
          banner; this page does, and remembers the choice in this browser.
        </p>
        <p ref={status} tabIndex={-1} role="status" className="consent-status">
          {choice
            ? `Your choice: ${describe(choice)}. Saved ${choice.date}.`
            : "No choice saved yet."}
        </p>
        <div className="consent-specimen-actions">
          <Button variant="outline" onClick={customize}>
            Cookie settings
          </Button>
          <Button
            variant="ghost"
            disabled={!choice}
            focusableWhenDisabled
            onClick={onForget}
          >
            Forget my choice
          </Button>
        </div>
      </main>
      {!choice && !open && (
        <ConsentBanner
          title="Cookies on this site"
          onAccept={() => choose({ analytics: true, marketing: true })}
          onReject={() => choose({ analytics: false, marketing: false })}
          onCustomize={customize}
        >
          We use essential cookies to run the site. With your permission we also
          use analytics and marketing cookies. You can change this at any time
          in Cookie settings.
        </ConsentBanner>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cookie settings</DialogTitle>
            <DialogDescription>
              Essential cookies are always on; the rest are your choice.
            </DialogDescription>
          </DialogHeader>
          <ul className="consent-categories">
            <li>
              <div>
                <p id="consent-essential">Essential</p>
                <p>Keeps you signed in and remembers this choice.</p>
              </div>
              <Switch checked disabled aria-labelledby="consent-essential" />
            </li>
            {categories.map((category) => (
              <li key={category.key}>
                <div>
                  <p id={`consent-${category.key}`}>{category.title}</p>
                  <p>{category.description}</p>
                </div>
                <Switch
                  checked={draft[category.key]}
                  onCheckedChange={(checked) =>
                    setDraft({ ...draft, [category.key]: checked })
                  }
                  aria-labelledby={`consent-${category.key}`}
                />
              </li>
            ))}
          </ul>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => choose({ analytics: false, marketing: false })}
            >
              Reject optional
            </Button>
            <Button onClick={() => choose(draft)}>Save choices</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
