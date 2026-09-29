import { useState } from "react"
import { Pause, Play } from "lucide-react"
import { Button } from "@/kit/ui/button"
import customers from "@/demo/data/public-customers.json"
import { CustomerMark } from "./customer-mark"

function Logo({ slug, name }: { slug: string; name: string }) {
  return (
    <li className="customer-logo">
      <CustomerMark slug={slug} />
      {name}
    </li>
  )
}

// Fictional sample teams (MKT-03). The marquee variant moves slowly, stops
// on hover or focus, offers Pause, and stays still under reduced motion.
export function CustomerLogos({
  motion = "static",
}: {
  motion?: "static" | "marquee"
}) {
  const [paused, setPaused] = useState(false)
  const teams = customers.teams

  return (
    <section className="customer-logos" aria-labelledby="customer-logos-title">
      <div className="customer-logos-heading">
        <h2 id="customer-logos-title">Teams planning in Tandem</h2>
        <p>Sample teams; the companies are fictional.</p>
        {motion === "marquee" && (
          <Button
            variant="ghost"
            size="sm"
            className="customer-logos-toggle"
            onClick={() => setPaused(!paused)}
          >
            {paused ? (
              <Play aria-hidden="true" data-icon="inline-start" />
            ) : (
              <Pause aria-hidden="true" data-icon="inline-start" />
            )}
            {paused ? "Play" : "Pause"}
            <span className="sr-only"> logo animation</span>
          </Button>
        )}
      </div>
      <div
        className="customer-logos-track"
        data-motion={motion}
        data-paused={paused || undefined}
      >
        <ul>
          {teams.map((team) => (
            <Logo key={team.slug} slug={team.slug} name={team.name} />
          ))}
        </ul>
        {motion === "marquee" && (
          // A second copy makes the loop seamless; it is decoration only.
          <ul aria-hidden="true">
            {teams.map((team) => (
              <Logo key={team.slug} slug={team.slug} name={team.name} />
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
