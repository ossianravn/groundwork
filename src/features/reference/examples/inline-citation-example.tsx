import { Separator } from "@/kit/ui/separator"
import { InlineCitation } from "@/kit/ai/inline-citation"
import { Sources } from "@/kit/ai/sources"

const sources = [
  {
    href: "/app/demo/projects/website",
    title: "Website redesign",
    description: "In progress · due 8 Oct · 27 of 48 tasks open",
  },
  {
    href: "/app/demo/projects/brand",
    title: "Brand refresh",
    description: "In progress · due 28 Sept · 8 of 32 tasks open",
  },
  {
    href: "/app/demo/projects/mobile",
    title: "Mobile app",
    description: "In review · due 30 Sept · 4 of 40 tasks open",
  },
]

export function InlineCitationExample() {
  return (
    <div className="grid max-w-xl gap-3 text-sm leading-relaxed">
      <p>
        Website redesign is the most urgent, with 27 open tasks.
        <InlineCitation label="1" sources={sources.slice(0, 1)} /> The other
        projects are on track.
        <InlineCitation label="2–3" sources={sources.slice(1)} />
      </p>
      <Separator />
      <Sources sources={sources} />
    </div>
  )
}
